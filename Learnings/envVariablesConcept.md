# Environment Variables in Docker Compose

The confusion goes away once you understand one idea:

> **`localhost` means "the machine I'm running on", and a container counts as its own machine.**

---

## 1. Why the URLs differ

| Where your app runs       | Where the DB runs                             | Host to use                                                   |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| Your laptop (`npm start`) | Docker container with a published port        | `localhost:<host port>`                                       |
| Docker container          | Another container in the same compose network | **service name** (e.g. `postgres`) and the **container port** |
| Docker container          | Installed directly on your laptop             | `host.docker.internal`                                        |

**Case 1: npm on host, DB in Docker.** Your laptop reaches the container through the published port:

```
postgresql://user:pass@localhost:5432/mydb
```

**Case 2: everything in Docker.** Inside a container, `localhost` is just that container, so the API would look for Postgres inside itself and fail. Compose puts all services on a shared network where each service name works as a hostname:

```
postgresql://user:pass@postgres:5432/mydb
mongodb://mongo:27017/mydb
```

**Case 3: app in Docker, DB installed on your laptop.** Use `host.docker.internal`. On Linux you also need this on the service:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Port mapping

`ports: "5433:5432"` means `HOST:CONTAINER`.

- From your laptop, use `localhost:5433`.
- From another container, use `postgres:5432`. The host port is irrelevant inside the network.

---

## 2. A working docker-compose.yml

```yaml
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://${PG_USER}:${PG_PASSWORD}@postgres:5432/${PG_DB}
      MONGO_URL: mongodb://mongo:27017/appdb
      USER_SERVICE_URL: http://user-service:4000
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_started

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: ${PG_DB}
    ports:
      - "5432:5432" # only so you can connect from your laptop in dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER} -d ${PG_DB}"]
      interval: 5s
      retries: 5

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db

volumes:
  pgdata:
  mongodata:
```

Service-to-service calls follow the same rule: `http://user-service:4000`, not `http://localhost:4000`.

---

## 3. Three ways to set variables, and what each does

**a) `environment:`** Values go straight into the container. Good for non-secret config.

**b) `env_file:`** Loads a whole file into the container:

```yaml
api:
  env_file:
    - ./api/.env.docker
```

**c) A `.env` file next to docker-compose.yml.** This is used by Compose itself to fill in `${PG_USER}`-style placeholders in the YAML. It does **not** automatically become container env vars unless you reference it in `environment:` or `env_file:`. This trips up many people.

```
# .env  (next to docker-compose.yml)
PG_USER=app
PG_PASSWORD=devpassword
PG_DB=appdb
```

**Precedence (highest wins):**
`docker compose run -e` > `environment:` > `env_file:` > `ENV` in the Dockerfile

---

## 4. The pattern: one variable name, different values per environment

Your Node code should never know where it's running:

```js
const db = new Pool({ connectionString: process.env.DATABASE_URL });
```

Only the value changes:

| Environment         | `DATABASE_URL`                                                                |
| ------------------- | ----------------------------------------------------------------------------- |
| `npm start` locally | `postgresql://app:pw@localhost:5432/appdb`                                    |
| Docker Compose      | `postgresql://app:pw@postgres:5432/appdb`                                     |
| Production          | `postgresql://app:***@mydb.xxxx.rds.amazonaws.com:5432/appdb?sslmode=require` |

Keep a `.env` for local npm (loaded with `dotenv`) and set the Docker values in the compose file. Do not hardcode hosts anywhere in the code.

---

## 5. Gotchas

- **`depends_on` only controls start order, not readiness.** Use `healthcheck` with `condition: service_healthy`, and add DB connection retry logic in the app.
- **`POSTGRES_USER/PASSWORD/DB` only apply on first initialization.** If the volume already exists and you change them, nothing happens. Run `docker compose down -v` (this deletes data) or change the credentials manually.
- **Changed an env var?** Run `docker compose up -d` again to recreate the container. A plain restart won't pick it up.
- **Debugging:** `docker compose config` shows the final resolved YAML with all variables substituted. `docker compose exec api printenv` shows what the container sees.
- **Special characters in passwords** (`@`, `#`, `/`) break connection URLs. URL-encode them (`@` becomes `%40`).
- **Mongo with auth:** `mongodb://user:pass@mongo:27017/appdb?authSource=admin`
- **Your React Native app is not inside the Docker network.** It can't use `api` or `postgres` as hostnames. It talks to your API via your laptop's LAN IP (`http://192.168.x.x:3000`), or `10.0.2.2` on the Android emulator. Also, `EXPO_PUBLIC_*` variables are baked in at build time and visible to anyone, so never put secrets there.

---

## 6. What changes in production

1. **Never commit secrets.** Add `.env` to `.gitignore` and commit a `.env.example` with fake values, so teammates know which variables exist.
2. **Inject secrets from a proper store**, not files in the repo:
   - GitHub Actions: repository or environment _Secrets_
   - AWS: Secrets Manager or SSM Parameter Store, injected at deploy or runtime
   - Never bake secrets into the image with `ENV` or `ARG`. They stay visible in image layers.
3. **Use managed databases** (RDS, MongoDB Atlas) instead of DB containers. Then your URL points to an external host, with TLS (`sslmode=require` for Postgres, `mongodb+srv://` for Atlas).
4. **Don't publish DB ports.** Remove `ports:` from postgres and mongo so they're reachable only inside the network. Only the API (behind NGINX) should be exposed.
5. **Split config by environment** using override files:
   ```
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```
6. **Set `NODE_ENV=production`**, which affects Express performance and error output.
7. **Validate env vars at startup and fail fast.** Use `zod` or `envalid`:
   ```js
   import { z } from "zod";
   const env = z
     .object({
       DATABASE_URL: z.string().url(),
       PORT: z.coerce.number().default(3000),
     })
     .parse(process.env);
   ```
   A missing variable then crashes the service immediately with a clear message, instead of failing mysteriously at the first query.
8. **Give each microservice only the variables it needs.** The auth service shouldn't get the payments key. Also use a least-privilege DB user per service, not the superuser.

---

## 7. Mental checklist when a connection fails

1. Where is the **client** running: host or container?
2. Where is the **server** running: host, container, or remote?
3. Container to container: **service name + container port**. Host to container: **localhost + published port**.
4. Run `docker compose config` and `printenv` to check what the app actually received.

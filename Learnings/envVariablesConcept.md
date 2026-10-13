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

# MongoDB Environment Variables with Docker

The **variable name** doesn't change. The **value** (host and port) changes depending on who is connecting. `MONGO_URL` and `MONGODB_URI` are just names you pick (`MONGODB_URI` is the common convention). Mongo itself doesn't care what you call it.

---

## 1. Same structure, different host

```
mongodb://[user:pass@]HOST:PORT/DBNAME[?options]
```

| Who is connecting                        | Value                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Node app via `npm start` on your laptop  | `mongodb://localhost:27017/appdb`                                                               |
| `mongosh` on your laptop                 | `mongosh "mongodb://localhost:27017/appdb"`                                                     |
| Another container in the compose network | `mongodb://mongo:27017/appdb`                                                                   |
| Shell inside the Mongo container         | `docker compose exec mongo mongosh` (no URL needed, defaults to localhost inside the container) |
| Production on Atlas                      | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/appdb`                                       |

The rule is the same as for Postgres:

- Host to container: `localhost` + the **published** port (left side of `27017:27017`).
- Container to container: the **service name** + the **container** port.

If you map `"27018:27017"`, then from your laptop use `localhost:27018`, but from other containers still use `mongo:27017`.

---

## 2. Two different sets of env vars

People often mix these up.

### a) Variables for the Mongo container itself

Used by the official image to create the root user on first startup:

```yaml
mongo:
  image: mongo:7
  environment:
    MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
```

These names are fixed by the image. As with Postgres, they only apply on first initialization, when the volume is empty.

### b) Variables for your app

The names are your choice, and the value is the connection string:

```yaml
api:
  environment:
    MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/appdb?authSource=admin
```

---

## 3. Full example

```yaml
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/appdb?authSource=admin
    depends_on:
      mongo:
        condition: service_healthy

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    ports:
      - "27017:27017" # dev only, remove in production
    volumes:
      - mongodata:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      retries: 5

volumes:
  mongodata:
```

`.env` next to the compose file:

```
MONGO_USER=admin
MONGO_PASSWORD=devpassword
```

For local `npm start` (app on your laptop, Mongo in Docker):

```
MONGODB_URI=mongodb://admin:devpassword@localhost:27017/appdb?authSource=admin
```

---

## 4. Auth gotcha

Once you set `MONGO_INITDB_ROOT_USERNAME`, auth is enabled. The root user lives in the `admin` database, so your URL needs `?authSource=admin`, even if you're connecting to `appdb`. Without it you get "Authentication failed", one of the most common Mongo and Docker errors.

For real apps, create a separate user scoped to just `appdb` (least privilege) instead of using root everywhere.

---

## 5. Other things worth knowing

- **Replica sets:** if you run Mongo as a replica set (needed for transactions and change streams), the server advertises its own hostname to clients. From your laptop that name may not resolve, so you may need `?directConnection=true`. This confuses many people when moving between local and Docker.
- **Special characters** in the password need URL-encoding (`@` becomes `%40`), same as Postgres.
- **`mongodb+srv://`** is only for DNS-based setups like Atlas. It doesn't take a port and won't work against a plain Docker container.
- **No auth locally?** `mongodb://mongo:27017/appdb` works only if you did not set the `MONGO_INITDB_*` variables. Fine for local dev, never for production.
- **Changed credentials and nothing happened?** The volume already exists. Run `docker compose down -v` (deletes data) or update the user manually.

---

## 6. Production

1. Use a managed service (MongoDB Atlas) instead of a Mongo container.
2. Use `mongodb+srv://` with TLS and a dedicated least-privilege user per service.
3. Remove `ports:` from the mongo service so it is reachable only inside the network.
4. Keep credentials in a secret store (GitHub Actions Secrets, AWS Secrets Manager or SSM), never in the repo or baked into the image.
5. Commit a `.env.example` with fake values, and add `.env` to `.gitignore`.
6. Validate `MONGODB_URI` at startup (`zod` or `envalid`) so a missing value fails fast.

---

## 7. Quick debugging

1. Where is the client running: host or container?
2. Container to container: `mongo:27017`. Host to container: `localhost:<published port>`.
3. `docker compose config` shows the resolved YAML.
4. `docker compose exec api printenv MONGODB_URI` shows what the app actually received.
5. "Authentication failed": check `authSource=admin` and URL-encoded password.

# Kong `strip_path` — explained properly

## The one formula

```
upstream_path = service_path + ( strip_path ? request_path - route_path : request_path )
```

- **request_path**: what the client called, e.g. `/api/drinks/v1/123`
- **route_path**: the `paths:` entry that matched, e.g. `/api/drinks`
- **service_path**: the path inside the service `url`. `http://catalog_service:9000/api` has `/api`. A bare `http://catalog_service:9000` has an empty service path.

---

## Mode A: `strip_path: false` (what the catalog service uses)

Kong forwards the path exactly as typed. Nothing is removed.

```yaml
- name: catalog_service
  url: http://catalog_service:9000       # no service path
  routes:
    - paths: [/api/drinks]
      strip_path: false
```

```
Client  -> /api/drinks/v1/123
Kong    -> /api/drinks/v1/123   (unchanged)
Express -> must serve /api/drinks/v1/:id
```

So the service must serve the full public path:
```ts
app.use("/api/drinks", drinkRouter); // router has /v1 and /v1/:id
```
**Rule:** the path in the browser, the path in Kong, and the path in Express are all the same.

---

## Mode B: `strip_path: true`

Kong deletes the matched route path, then appends the remainder to the service path.

### B1. Service URL has no path
```yaml
url: http://catalog_service:9000
paths: [/api/drinks]
strip_path: true
```
```
Client  -> /api/drinks/v1/123
Kong    -> /v1/123            (/api/drinks removed)
Express -> must serve /v1/:id
```

### B2. Service URL has a path prefix
```yaml
url: http://catalog_service:9000/api
paths: [/api/drinks]
strip_path: true
```
```
Client  -> /api/drinks/v1/123
Kong    -> /api/v1/123        (/api/drinks removed, then /api put in front)
Express -> app.use("/api", router) serves /api/v1/:id
```

---

## Cheat-sheet (route `/api/drinks`, client calls `/api/drinks/v1/123`)

| strip_path | service url | upstream receives |
|---|---|---|
| false | `http://svc:9000` | `/api/drinks/v1/123` |
| false | `http://svc:9000/api` | `/api/api/drinks/v1/123` (usually a mistake) |
| true | `http://svc:9000` | `/v1/123` |
| true | `http://svc:9000/api` | `/api/v1/123` |

---

## What went wrong in this project
| Setup | Upstream got | Express expected | Result |
|---|---|---|---|
| route `/api/drinks/v1`, strip true, no service path | `/<id>` | `/api/v1/<id>` | 404 |
| route `/api/drinks`, strip true, no service path | `/v1/<id>` | `/api/v1/<id>` | 404 |
| **route `/api/drinks`, strip false, Express at `/api/drinks`** | `/api/drinks/v1/<id>` | `/api/drinks/v1/<id>` | 200 |

## Pitfalls
- **Stale config.** `kong.yml` is a single-file bind mount and Kong in DB-less mode only reads it at startup. After editing, run `docker compose up -d --force-recreate kong`. A plain `restart` can keep the old file.
- **Express mount prefix.** `app.use("/api", router)` plus `router.get("/v1")` serves `/api/v1`. The mount prefix counts.
- **A 404 `Cannot GET /x` page** is Express talking, so Kong did route. Look at the path the upstream received.

## Debug checklist
1. `curl -s localhost:8001/routes` shows the live paths and `strip_path`.
2. Call the service directly (`localhost:9000/...`) to see which path it really serves.
3. Apply the formula above and compare the result with step 2.
4. `docker logs kong_gateway --tail 20` shows what Kong received.

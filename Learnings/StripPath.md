Basically : False hi use karna he , strip_path=true is useless

strip_path is a setting on a Kong route. It controls whether Kong removes the matched part of the URL path before forwarding the request to your upstream service.

The simple idea

When a request matches a route by paths, that matched prefix is the part Kong “used” to find your route. strip_path decides whether the upstream sees that prefix or not.

strip_path: true (default): Kong removes the matched prefix
strip_path: false: Kong keeps the full path as it came in
Example
yaml
services:

- name: user-service
  url: http://localhost:3000

  routes:
  - name: user-route
    paths:
    - /users
      strip_path: true

Client calls: GET /users/123

Setting What your upstream (localhost:3000) receives
strip_path: true /123
strip_path: false /users/123
Why people get confused

Usually it’s because of what your backend expects.

Case 1: Backend has routes like /users/:id (Express: app.get('/users/:id'))
→ Use strip_path: false, otherwise the backend gets /123 and returns 404.

Case 2: Backend has routes like /:id or /, and /users is just a gateway prefix you invented
→ Use strip_path: true, so the backend doesn’t need to know about the gateway prefix.

Quick way to decide

Ask yourself: “Does my Express app define this prefix in its own routes?”

Yes → strip_path: false
No (prefix is only for Kong routing) → strip_path: true
One more thing: service.path

If your service URL has its own path, Kong joins it with whatever is left after stripping:

yaml
services:

- name: api
  url: http://localhost:3000/api/v1
  routes:
  - paths: [/users]
    strip_path: true

Request /users/123 → upstream gets /api/v1/123.

With strip_path: false → upstream gets /api/v1/users/123.

Debug tip

If you get unexpected 404s from your backend, log req.originalUrl (or req.url) in Express to see exactly what path Kong is sending. That immediately tells you whether stripping is happening the way you think.

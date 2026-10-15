### 2.Rebuild Without Cache:Core Step.Force Docker to ignore all previously cached layers and execute every instruction in your Dockerfile from scratch.

# docker compose build --no-cache

## docker compose up -d --force-recreate kong

## docker compose up -d --no-deps --force-recreate payment_service , no deps with not restart dependy containers

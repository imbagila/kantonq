#!/usr/bin/env bash
set -euo pipefail

name=kantonq-postgres
image=docker.io/library/postgres:17-alpine

if podman container exists "$name"; then
  podman start "$name" >/dev/null
else
  podman run -d --name "$name" \
    -p 54329:5432 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=kantonq \
    -v kantonq-postgres-data:/var/lib/postgresql/data \
    "$image" >/dev/null
fi

# Checking over TCP skips the socket-only server that runs while a new volume is initialised.
until podman exec "$name" pg_isready -h 127.0.0.1 -U postgres -d kantonq >/dev/null 2>&1; do
  sleep 0.5
done
echo "Postgres is ready at postgres://postgres:postgres@localhost:54329/kantonq"

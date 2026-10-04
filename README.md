# kantonq

A personal and family money manager. What it does is in [`docs/SPEC.md`](docs/SPEC.md), its vocabulary in [`CONTEXT.md`](CONTEXT.md), and the reasons behind larger choices in [`docs/adr/`](docs/adr/).

## Layout

| Path              | Contents                                                             |
| ----------------- | -------------------------------------------------------------------- |
| `apps/web`        | TanStack Start web app with shadcn/ui and Tailwind CSS               |
| `apps/api`        | Hono API on Cloudflare Workers                                       |
| `packages/db`     | Drizzle schema and migrations                                        |
| `packages/shared` | Validation schemas, the money calculations module, language handling |

## Requirements

- [Bun](https://bun.sh) 1.4 or later
- [Podman](https://podman.io), for the local Postgres

## Getting started

```sh
bun install
bun run db:up        # starts Postgres 17 in Podman on localhost:54329
bun run db:migrate   # applies migrations to the local database
```

`db:migrate` uses `DATABASE_URL` when it's set, and the local Podman database otherwise.

## Running the apps

```sh
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun run dev:api      # API on http://localhost:8787
bun run dev:web      # web app on http://localhost:3000
```

The API refuses every request without a valid Supabase access token, so `curl http://localhost:8787/me` answers `401` with the `unauthenticated` error code until sign-in exists. Tokens are checked against the signing keys of the project in `SUPABASE_URL`.

## Checks

```sh
bun run typecheck
bun run lint
bun run format:check   # bun run format to fix
bun run test           # needs the Podman Postgres running
bun run check          # all four, in that order
```

API tests send HTTP requests to the app and assert only on the responses. Each test file gets its own freshly migrated database on the Podman Postgres, which is dropped afterwards. Set `TEST_DATABASE_URL` to point the tests at a different Postgres server.

## Database changes

Edit `packages/db/src/schema.ts`, then generate a migration and apply it:

```sh
bun run --filter @kantonq/db generate
bun run db:migrate
```

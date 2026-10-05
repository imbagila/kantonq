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

`wrangler dev` connects to the local Podman database through the `HYPERDRIVE` binding's `localConnectionString` in `apps/api/wrangler.jsonc`. The API refuses every request without a valid Supabase access token, so `curl http://localhost:8787/me` answers `401` with the `unauthenticated` error code until sign-in exists. Tokens are checked against the signing keys of the project in `SUPABASE_URL`.

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

## Staging

Every push runs type-checking, lint, the format check and all tests in GitHub Actions, against Postgres 17 as a service container. A push to the repository's primary branch (`master`, and `main` if it is renamed) also applies migrations to the staging database and deploys:

| Worker | Name          | Address                                     |
| ------ | ------------- | ------------------------------------------- |
| Web    | `kantonq-web` | `https://kantonq-web.<account>.workers.dev` |
| API    | `kantonq-api` | `https://kantonq-api.<account>.workers.dev` |

`<account>` is the Cloudflare account's `workers.dev` subdomain. The web address serves the placeholder landing page. The API answers `GET /me` once it has a Supabase access token.

Production sign-in is Google only. The staging Supabase project additionally has email-and-password enabled for one Playwright user. That login method is never enabled in production. The user's password stays in the Supabase project and, when the Playwright flows land, in a GitHub secret. It is never committed.

These values are created by a person and stored as GitHub secrets. Nothing in this list belongs in the repository:

| GitHub secret               | Where it comes from                                                                                                               | Where CI puts it                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `CLOUDFLARE_API_TOKEN`      | Cloudflare API token that can edit Workers                                                                                        | the deploy job                        |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account id                                                                                                             | the deploy job                        |
| `STAGING_DATABASE_URL`      | Supabase direct connection string (`db.<ref>.supabase.co`, port 5432, `sslmode=require`). Not the transaction pooler on port 6543 | migrations                            |
| `STAGING_HYPERDRIVE_ID`     | Hyperdrive config whose origin is that same database                                                                              | the API Worker's `HYPERDRIVE` binding |
| `STAGING_SUPABASE_URL`      | Supabase project URL                                                                                                              | `SUPABASE_URL` on both Workers        |
| `STAGING_SUPABASE_ANON_KEY` | Supabase anon (publishable) key                                                                                                   | `SUPABASE_ANON_KEY` on the web Worker |
| `SUPER_ADMIN_EMAIL`         | the Google account that must always be allowed to sign in                                                                         | `SUPER_ADMIN_EMAIL` on the API Worker |

The API verifies tokens with the staging project's published keys at `/auth/v1/.well-known/jwks.json`. It does not use the Supabase service-role key or the legacy JWT secret. Do not store either of those in the repository or on a Worker.

Before the first deploy, a person needs to:

1. Push this repository to GitHub.
2. Create a Supabase project for staging, enable Google sign-in (the provider's redirect URL is `https://<project-ref>.supabase.co/auth/v1/callback`), and enable email-and-password for the single Playwright user.
3. Create a Cloudflare Hyperdrive configuration aimed at the staging database's direct connection string.
4. Add the secrets above to the GitHub repository. The Workers are created by the deploy itself.

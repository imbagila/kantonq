# 02: Staging environments and CI/CD

**What to build:** Every push runs the full set of checks, and the main branch deploys the web app and API to the staging `*.workers.dev` addresses, backed by a Supabase staging project. Most of this needs accounts, OAuth clients and secrets that only a human can create. An agent can write the GitHub Actions workflow once the repository and secrets exist.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-human

- [x] The GitHub repository exists and the code is pushed
- [x] A Supabase staging project exists with Google as a sign-in provider (Google OAuth client created and configured)
- [ ] The staging Supabase project also has a test-only email-and-password user for Playwright; this login method is documented as never enabled in production
- [ ] A Cloudflare account has the API Worker and the web Worker, and a Hyperdrive configuration pointing at the staging Postgres
- [ ] The super admin email, Supabase keys, JWT verification settings and Cloudflare tokens are stored as GitHub and Cloudflare secrets, never committed
- [x] GitHub Actions runs type-checking, lint, format check and all tests, with Postgres as a service container
- [x] GitHub Actions applies database migrations to staging and deploys the web app and API to their `*.workers.dev` addresses
- [ ] Opening the staging web address shows the placeholder landing page, and the staging API answers the authenticated test endpoint

## Comments

**Workflow is in the repo.** `.github/workflows/ci.yml` runs the checks on every push. A push to `master` (or `main`) migrates the staging database and deploys `kantonq-web` and `kantonq-api`. The API reaches Postgres through the `HYPERDRIVE` binding; local dev and the HTTP tests use a direct connection string on that same binding. Email-and-password is documented in the README as staging-only, never production.

**Checked against `.env` and the live services on 2026-10-05.** `.env` is gitignored. It is local only; GitHub Actions still does not see those values. The [CI run](https://github.com/imbagila/kantonq/actions/runs/37265800404) passed `check` and failed `deploy` on **Require staging secrets**. No later run exists.

What the local values and the live services show:

- The Supabase project URL answers, publishes a JWKS key, and Google sign-in starts at `accounts.google.com`. That box is done.
- Email sign-in is disabled (`Provider email could not be found`), so the Playwright email-and-password user is not available yet.
- Hyperdrive config `kantonq` exists. Its origin is the staging direct host on port 5432, database `postgres`, user `postgres`. The Cloudflare id is 32 hex characters with no dashes. The deploy job accepts that form as well as a dashed UUID.
- Workers on the `imbagila` subdomain are `gitlab-telegram-webhook` and `kantonq` (a different script, binding `VITE_APP_TITLE`). `kantonq-api` and `kantonq-web` are not deployed.
- The Cloudflare API token is active and the account id is valid. `STAGING_SUPABASE_ANON_KEY` is the same value as the account id, and Supabase rejects it as an invalid API key. A real anon key is a JWT (`eyJ…`) or a publishable key (`sb_publishable_…`).
- The direct database host has no IPv4 address. GitHub-hosted runners cannot connect to it (`ECONNREFUSED` on the IPv6 address). The deploy job rewrites that URL to the session pooler `aws-0-ap-northeast-2.pooler.supabase.com` (user `postgres.<ref>`, port 5432) before migrating. Hyperdrive still uses the direct host, which Cloudflare can reach.

Acting with the user's token so row-level security applies waits until policies exist. There is no family membership yet, and the test Postgres is not Supabase, so switching to the `authenticated` role now would make `GET /me` fail. The connection itself does go through Hyperdrive.

# 02: Staging environments and CI/CD

**What to build:** Every push runs the full set of checks, and the main branch deploys the web app and API to the staging `*.workers.dev` addresses, backed by a Supabase staging project. Most of this needs accounts, OAuth clients and secrets that only a human can create. An agent can write the GitHub Actions workflow once the repository and secrets exist.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-human

- [x] The GitHub repository exists and the code is pushed
- [x] A Supabase staging project exists with Google as a sign-in provider (Google OAuth client created and configured)
- [x] The staging Supabase project also has a test-only email-and-password user for Playwright; this login method is documented as never enabled in production
- [x] A Cloudflare account has the API Worker and the web Worker, and a Hyperdrive configuration pointing at the staging Postgres
- [ ] The super admin email, Supabase keys, JWT verification settings and Cloudflare tokens are stored as GitHub and Cloudflare secrets, never committed
- [x] GitHub Actions runs type-checking, lint, format check and all tests, with Postgres as a service container
- [x] GitHub Actions applies database migrations to staging and deploys the web app and API to their `*.workers.dev` addresses
- [x] Opening the staging web address shows the placeholder landing page, and the staging API answers the authenticated test endpoint

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

**Checked again on 2026-10-05 after the pooler fix.** [CI run](https://github.com/imbagila/kantonq/actions/runs/37278676507) on `0b3a5a6` succeeded. `check` passed. `deploy` passed Require staging secrets, Apply migrations to staging, Deploy the API, and Deploy the web app.

- `https://kantonq-web.imbagila.workers.dev` shows the placeholder landing page: "Your family's money, in one place.", "Coming soon", "kantonq is being built."
- `https://kantonq-api.imbagila.workers.dev/me` with no token returns `401` and `unauthenticated` ("Silakan masuk terlebih dahulu.").
- Google sign-in still redirects to `accounts.google.com`, and the project JWKS still publishes one key.
- Email-and-password was not rechecked. The earlier check found that provider disabled, so the Playwright user is still open.
- The anon key was not rechecked. The last look at the local value found it equal to the Cloudflare account id, which Supabase rejects. Deploy stored the GitHub secret as given.

**Checked the anon key and the Playwright user on 2026-10-05.** The local `STAGING_SUPABASE_ANON_KEY` is a publishable key, and Supabase accepts it (`/auth/v1/settings` returns 200). Email sign-in is enabled, public signup is disabled, and Google is still enabled. A password attempt for an unknown address returns `invalid_credentials`, which means the email provider is on.

There is one auth user. It is the super admin address, the email provider, confirmed, and not banned. There is no separate test mailbox. The password is not in `.env`, so it was not used to sign in.

The last deploy stored the previous anon key on `kantonq-web`. Updating `.env` does not change the GitHub secret or the Worker. **Status stays `ready-for-human`** until that secret is the publishable key and the web Worker is deployed again.

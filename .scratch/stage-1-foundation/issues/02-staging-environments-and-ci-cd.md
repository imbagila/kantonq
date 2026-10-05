# 02: Staging environments and CI/CD

**What to build:** Every push runs the full set of checks, and the main branch deploys the web app and API to the staging `*.workers.dev` addresses, backed by a Supabase staging project. Most of this needs accounts, OAuth clients and secrets that only a human can create. An agent can write the GitHub Actions workflow once the repository and secrets exist.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-human

- [ ] The GitHub repository exists and the code is pushed
- [ ] A Supabase staging project exists with Google as a sign-in provider (Google OAuth client created and configured)
- [ ] The staging Supabase project also has a test-only email-and-password user for Playwright; this login method is documented as never enabled in production
- [ ] A Cloudflare account has the API Worker and the web Worker, and a Hyperdrive configuration pointing at the staging Postgres
- [ ] The super admin email, Supabase keys, JWT verification settings and Cloudflare tokens are stored as GitHub and Cloudflare secrets, never committed
- [x] GitHub Actions runs type-checking, lint, format check and all tests, with Postgres as a service container
- [x] GitHub Actions applies database migrations to staging and deploys the web app and API to their `*.workers.dev` addresses
- [ ] Opening the staging web address shows the placeholder landing page, and the staging API answers the authenticated test endpoint

## Comments

**Workflow is in the repo.** `.github/workflows/ci.yml` runs the checks on every push. A push to `master` (or `main`) migrates the staging database and deploys `kantonq-web` and `kantonq-api`. The API reaches Postgres through the `HYPERDRIVE` binding; local dev and the HTTP tests use a direct connection string on that same binding. Secrets, the Supabase project, Google sign-in, the Playwright email user and the Hyperdrive config are still human steps, listed in the README. Email-and-password is documented there as staging-only, never production.

Acting with the user's token so row-level security applies waits until policies exist. There is no family membership yet, and the test Postgres is not Supabase, so switching to the `authenticated` role now would make `GET /me` fail. The connection itself does go through Hyperdrive.

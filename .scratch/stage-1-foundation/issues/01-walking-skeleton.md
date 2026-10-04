# 01: Walking skeleton

**What to build:** A runnable, tested end-to-end path through every layer, before any feature exists. A developer can clone the repo, start Postgres in Podman, run the API and web app locally, open `/` and see the placeholder landing page, and run one API test that sends an authenticated HTTP request and gets a response. This sets the patterns every later ticket follows: the monorepo layout, the HTTP test seam, the money calculations seam, bilingual strings, the error shape and the light and dark themes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] A Bun workspaces monorepo holds the web app, the API, the database package and the shared package
- [x] TypeScript strict mode is on everywhere; `oxlint` and `oxfmt` are configured, and one root command each runs type-checking, lint, format check and all tests
- [x] The database package has Drizzle set up with a first migration, and migrations apply to a local Postgres running in Podman
- [x] The API is a Hono app for Cloudflare Workers that verifies a Supabase-style JWT on every request; unauthenticated requests get a stable error code
- [x] The API test harness sends HTTP requests to the Hono app against a real Postgres, with tokens signed by a test key, and asserts only on HTTP responses
- [x] One endpoint that returns the signed-in person (for example "who am I") is covered by passing tests for both the authenticated and the unauthenticated case
- [x] Errors have a stable machine-readable code and a message in Indonesian or English
- [x] The shared package exposes the validation schemas the API uses for request and response bodies, and a money calculations module with its own test setup (it can start with no functions)
- [x] The web app is TanStack Start with shadcn/ui and Tailwind CSS; `/` is rendered on the server as a placeholder landing page
- [x] The web app follows the system's light or dark mode and has an Indonesian and English string setup that later tickets add to
- [x] The web layout is usable at phone width
- [x] A short README explains how to start Postgres, run migrations, run the apps and run the tests

## Comments

**Implemented.** Notes for the tickets that follow:

- **Ticket 02:** the API reads `DATABASE_URL` directly. Adding the Hyperdrive binding and connecting through it (and acting with the user's token so row-level security applies, per ADR 0003) is still to do. `SUPABASE_URL` is the only setting token verification needs; keys are fetched from `/auth/v1/.well-known/jwks.json`.
- **Ticket 03:** `GET /me` creates the person record if it's missing, then returns it. The allowed-email gate belongs right before that insert. It never updates an existing record.
- **Ticket 04:** error messages follow the caller's `Accept-Language` header. Switching them to the member's stored language is still to do.
- **Validation:** responses are typed against the shared schemas. No endpoint takes a request body yet, so the first one that does sets the pattern for runtime validation.
- **Glossary gap:** "Person" (a Google identity) is used in code but isn't in `CONTEXT.md`. Person ids are the Supabase Auth user ids, not UUIDv7. Both are `/domain-modeling` follow-ups.

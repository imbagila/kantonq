# 01: Walking skeleton

**What to build:** A runnable, tested end-to-end path through every layer, before any feature exists. A developer can clone the repo, start Postgres in Podman, run the API and web app locally, open `/` and see the placeholder landing page, and run one API test that sends an authenticated HTTP request and gets a response. This sets the patterns every later ticket follows: the monorepo layout, the HTTP test seam, the money calculations seam, bilingual strings, the error shape and the light and dark themes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A Bun workspaces monorepo holds the web app, the API, the database package and the shared package
- [ ] TypeScript strict mode is on everywhere; `oxlint` and `oxfmt` are configured, and one root command each runs type-checking, lint, format check and all tests
- [ ] The database package has Drizzle set up with a first migration, and migrations apply to a local Postgres running in Podman
- [ ] The API is a Hono app for Cloudflare Workers that verifies a Supabase-style JWT on every request; unauthenticated requests get a stable error code
- [ ] The API test harness sends HTTP requests to the Hono app against a real Postgres, with tokens signed by a test key, and asserts only on HTTP responses
- [ ] One endpoint that returns the signed-in person (for example "who am I") is covered by passing tests for both the authenticated and the unauthenticated case
- [ ] Errors have a stable machine-readable code and a message in Indonesian or English
- [ ] The shared package exposes the validation schemas the API uses for request and response bodies, and a money calculations module with its own test setup (it can start with no functions)
- [ ] The web app is TanStack Start with shadcn/ui and Tailwind CSS; `/` is rendered on the server as a placeholder landing page
- [ ] The web app follows the system's light or dark mode and has an Indonesian and English string setup that later tickets add to
- [ ] The web layout is usable at phone width
- [ ] A short README explains how to start Postgres, run migrations, run the apps and run the tests

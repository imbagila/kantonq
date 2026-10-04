# One TypeScript API for every write

The web app, the Android app, the Telegram bot and the AI captures all create the same records, and rules like "a transfer and its fee succeed or fail together" must hold everywhere. So every write goes through one Hono API on Cloudflare Workers. No client writes to Supabase directly. Supabase is used for Postgres, Google login and file storage only.

## Considered options

- **Clients write to Supabase directly, protected by row-level security.** Rejected: the validation and multi-step rules would be duplicated in TypeScript and Kotlin, or pushed into SQL.
- **The API inside TanStack Start's server routes.** Rejected: the Android app and the bot would depend on the web app's deploys.

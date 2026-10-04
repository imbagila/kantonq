# Drizzle instead of supabase-js in the API

Supabase's JavaScript client goes through PostgREST and can't group several writes into one transaction. That would push transfers with fees, investment buys and sync batches into SQL functions, breaking the rule that backend logic is TypeScript. The API uses Drizzle over Cloudflare Hyperdrive instead, so every multi-step write is one TypeScript-defined Postgres transaction. The API still acts with the user's token, so row-level security remains a second line of protection.

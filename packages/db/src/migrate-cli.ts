import { migrateDatabase } from "./migrate.ts";
import { withSessionPooler } from "./session-pooler.ts";

const localDatabaseUrl = "postgres://postgres:postgres@localhost:54329/kantonq";

const connectionString = withSessionPooler(
  process.env.DATABASE_URL ?? localDatabaseUrl,
  process.env.SUPABASE_SESSION_POOLER_HOST,
);

await migrateDatabase(connectionString);
console.log("Migrations applied");

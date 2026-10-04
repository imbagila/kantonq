import { migrateDatabase } from "./migrate.ts";

const localDatabaseUrl = "postgres://postgres:postgres@localhost:54329/kantonq";

await migrateDatabase(process.env.DATABASE_URL ?? localDatabaseUrl);
console.log("Migrations applied");

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.ts";

export { schema };

export type Database = ReturnType<typeof createDatabase>["db"];

/** Opens a single-connection client, suited to one request on Cloudflare Workers. Call `close` when done. */
export function createDatabase(connectionString: string) {
  const client = postgres(connectionString, { max: 1, fetch_types: false });
  const db = drizzle({ client, schema, casing: "snake_case" });
  return { db, close: () => client.end() };
}

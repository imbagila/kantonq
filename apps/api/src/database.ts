import { createDatabase } from "@kantonq/db";
import { createMiddleware } from "hono/factory";

import type { Env } from "./app.ts";

/** Opens a Hyperdrive connection for the request and closes it afterwards; Workers can't share one across requests. */
export const withDatabase = createMiddleware<Env>(async (c, next) => {
  const { db, close } = createDatabase(c.env.HYPERDRIVE.connectionString);
  c.set("db", db);
  try {
    await next();
  } finally {
    await close();
  }
});

import { schema } from "@kantonq/db";
import type { MeResponse } from "@kantonq/shared/validation";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import type { Env } from "../app.ts";

const { persons } = schema;

export const me = new Hono<Env>().get("/", async (c) => {
  const { personId, email } = c.get("identity");
  const db = c.get("db");

  await db.insert(persons).values({ id: personId, email }).onConflictDoNothing();
  const [person] = await db
    .select({ id: persons.id, email: persons.email, language: persons.language })
    .from(persons)
    .where(eq(persons.id, personId));
  if (!person) throw new Error("The signed-in person has no row after inserting it");

  return c.json({ person } satisfies MeResponse);
});

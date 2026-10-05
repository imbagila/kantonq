import { schema } from "@kantonq/db";
import { updatePersonSchema, type MeResponse } from "@kantonq/shared/validation";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import type { Env } from "../app.ts";
import { ApiError } from "../errors.ts";

const { persons } = schema;

export const me = new Hono<Env>();

me.get("/", (c) => {
  return c.json({ person: c.get("person") } satisfies MeResponse);
});

me.patch("/", async (c) => {
  let json: unknown;
  try {
    json = await c.req.json();
  } catch {
    throw new ApiError("invalid_request");
  }
  const parsed = updatePersonSchema.safeParse(json);
  if (!parsed.success) throw new ApiError("invalid_request");

  const person = c.get("person");
  await c
    .get("db")
    .update(persons)
    .set({ language: parsed.data.language })
    .where(eq(persons.id, person.id));

  return c.json({ person: { ...person, language: parsed.data.language } } satisfies MeResponse);
});

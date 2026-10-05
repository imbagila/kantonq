import { schema, type Database } from "@kantonq/db";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import type { Env } from "./app.ts";
import { normalizeEmail } from "./email.ts";
import { ApiError } from "./errors.ts";

const { persons, allowedEmails } = schema;

const personColumns = { id: persons.id, email: persons.email, language: persons.language };

async function findPerson(db: Database, personId: string) {
  const [person] = await db.select(personColumns).from(persons).where(eq(persons.id, personId));
  return person;
}

/**
 * Creates the person on their first accepted sign-in.
 * Someone who already has a person record stays signed in; later tickets decide what happens
 * when an allowed email is removed after that.
 */
export const requireAllowedPerson = createMiddleware<Env>(async (c, next) => {
  const { personId, email } = c.get("identity");
  const db = c.get("db");
  const normalized = normalizeEmail(email);
  const superAdmin = normalized === normalizeEmail(c.env.SUPER_ADMIN_EMAIL);

  const existing = await findPerson(db, personId);

  if (existing) {
    c.set("person", existing);
    c.set("isSuperAdmin", superAdmin);
    await next();
    return;
  }

  if (!superAdmin) {
    const [allowedEmail] = await db
      .select({ email: allowedEmails.email })
      .from(allowedEmails)
      .where(eq(allowedEmails.email, normalized))
      .limit(1);
    if (!allowedEmail) throw new ApiError("not_allowed_email");
  }

  await db.insert(persons).values({ id: personId, email }).onConflictDoNothing();
  const person = await findPerson(db, personId);
  if (!person) throw new Error("The signed-in person has no row after inserting it");

  c.set("person", person);
  c.set("isSuperAdmin", superAdmin);
  await next();
});

import { schema, type Database } from "@kantonq/db";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import type { Env } from "./app.ts";
import { normalizeEmail } from "./email.ts";
import { ApiError } from "./errors.ts";
import { acceptPendingInvites, hasPendingInvite } from "./invites.ts";

const { persons, allowedEmails } = schema;

const personColumns = { id: persons.id, email: persons.email, language: persons.language };

async function findPerson(db: Pick<Database, "select">, personId: string) {
  const [person] = await db.select(personColumns).from(persons).where(eq(persons.id, personId));
  return person;
}

async function isAllowedEmail(db: Pick<Database, "select">, email: string) {
  const [allowedEmail] = await db
    .select({ email: allowedEmails.email })
    .from(allowedEmails)
    .where(eq(allowedEmails.email, email))
    .limit(1);
  return allowedEmail !== undefined;
}

/**
 * Creates the person on their first accepted sign-in.
 * A pending invite is enough to be accepted, and is turned into membership on this request.
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
    await db.transaction((tx) => acceptPendingInvites(tx, existing));
    c.set("person", existing);
    c.set("isSuperAdmin", superAdmin);
    await next();
    return;
  }

  if (
    !superAdmin &&
    !(await isAllowedEmail(db, normalized)) &&
    !(await hasPendingInvite(db, normalized))
  ) {
    throw new ApiError("not_allowed_email");
  }

  const person = await db.transaction(async (tx) => {
    const allowed = superAdmin || (await isAllowedEmail(tx, normalized));
    await tx.insert(persons).values({ id: personId, email }).onConflictDoNothing();
    const created = await findPerson(tx, personId);
    if (!created) throw new Error("The signed-in person has no row after inserting it");
    const joined = await acceptPendingInvites(tx, created);
    if (!allowed && !joined) throw new ApiError("not_allowed_email");
    return created;
  });

  c.set("person", person);
  c.set("isSuperAdmin", superAdmin);
  await next();
});

import { schema, type Database } from "@kantonq/db";
import { and, eq, isNull } from "drizzle-orm";

import { normalizeEmail } from "./email.ts";
import { uuidv7 } from "./ids.ts";

const { invites, members, persons } = schema;

/** The database, or a transaction already in progress. Callers that write more than the invites own the transaction. */
type Query = Pick<Database, "select" | "insert" | "update">;

/** True when a pending invite is enough for this email to pass the allowed-email gate. */
export async function hasPendingInvite(db: Query, email: string): Promise<boolean> {
  const [invite] = await db
    .select({ id: invites.id })
    .from(invites)
    .where(and(eq(invites.email, normalizeEmail(email)), eq(invites.state, "pending")))
    .limit(1);
  return invite !== undefined;
}

/**
 * Turns every pending invite for this person into a membership.
 * The first family they join becomes their current family when they don't have one yet.
 * Returns whether at least one invite was accepted.
 */
export async function acceptPendingInvites(
  db: Query,
  person: { id: string; email: string },
): Promise<boolean> {
  const email = normalizeEmail(person.email);
  const rows = await db
    .select()
    .from(invites)
    .where(and(eq(invites.email, email), eq(invites.state, "pending")))
    .orderBy(invites.createdAt)
    .for("update");
  if (rows.length === 0) return false;

  let joinedFamilyId: string | undefined;
  for (const invite of rows) {
    await db
      .insert(members)
      .values({
        id: uuidv7(),
        familyId: invite.familyId,
        personId: person.id,
        role: invite.role,
        displayName: person.email,
      })
      .onConflictDoNothing();
    await db.update(invites).set({ state: "accepted" }).where(eq(invites.id, invite.id));
    joinedFamilyId ??= invite.familyId;
  }

  if (!joinedFamilyId) return false;
  await db
    .update(persons)
    .set({ currentFamilyId: joinedFamilyId })
    .where(and(eq(persons.id, person.id), isNull(persons.currentFamilyId)));
  return true;
}

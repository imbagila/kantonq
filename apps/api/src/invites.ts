import { schema, type Database } from "@kantonq/db";
import { and, eq, isNull } from "drizzle-orm";

import { normalizeEmail } from "./email.ts";
import { uuidv7 } from "./ids.ts";

const { invites, members, persons } = schema;

/** True when a pending invite is enough for this email to pass the allowed-email gate. */
export async function hasPendingInvite(db: Database, email: string): Promise<boolean> {
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
 */
export async function acceptPendingInvites(
  db: Database,
  person: { id: string; email: string },
): Promise<void> {
  const email = normalizeEmail(person.email);
  const [pending] = await db
    .select({ id: invites.id })
    .from(invites)
    .where(and(eq(invites.email, email), eq(invites.state, "pending")))
    .limit(1);
  if (!pending) return;

  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(invites)
      .where(and(eq(invites.email, email), eq(invites.state, "pending")))
      .orderBy(invites.createdAt)
      .for("update");

    let joinedFamilyId: string | undefined;
    for (const invite of rows) {
      await tx
        .insert(members)
        .values({
          id: uuidv7(),
          familyId: invite.familyId,
          personId: person.id,
          role: invite.role,
          displayName: person.email,
        })
        .onConflictDoNothing();
      await tx.update(invites).set({ state: "accepted" }).where(eq(invites.id, invite.id));
      joinedFamilyId ??= invite.familyId;
    }

    if (!joinedFamilyId) return;
    await tx
      .update(persons)
      .set({ currentFamilyId: joinedFamilyId })
      .where(and(eq(persons.id, person.id), isNull(persons.currentFamilyId)));
  });
}

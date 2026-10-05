import { schema, type Database } from "@kantonq/db";
import type { MemberRole } from "@kantonq/shared/validation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { ApiError } from "./errors.ts";

const { families, members } = schema;

export type Membership = {
  familyId: string;
  name: string;
  homeTimeZone: string;
  role: MemberRole;
  timeZone: string;
};

/** The caller's active membership in a family, or a not-found error when they have none. */
export async function activeMembership(
  db: Database,
  personId: string,
  familyId: string,
): Promise<Membership> {
  if (!z.uuid().safeParse(familyId).success) throw new ApiError("not_found");

  const [row] = await db
    .select({
      familyId: families.id,
      name: families.name,
      homeTimeZone: families.homeTimeZone,
      role: members.role,
      timeZone: members.timeZone,
    })
    .from(members)
    .innerJoin(families, eq(members.familyId, families.id))
    .where(
      and(eq(families.id, familyId), eq(members.personId, personId), eq(members.active, true)),
    );

  if (!row) throw new ApiError("not_found");
  return row;
}

export function assertOwner(membership: Membership) {
  if (membership.role !== "owner") throw new ApiError("forbidden_role");
}

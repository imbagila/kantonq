import { schema, type Database } from "@kantonq/db";
import { defaultTimeZone } from "@kantonq/shared/time-zone";
import {
  createFamilySchema,
  createInviteSchema,
  updateFamilySchema,
  updateMemberRoleSchema,
  updateMembershipSchema,
  type Budget,
  type BudgetsResponse,
  type CurrentFamilyResponse,
  type FamiliesResponse,
  type Family,
  type FamilyResponse,
  type InviteResponse,
  type MemberResponse,
  type MembersResponse,
} from "@kantonq/shared/validation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { Env } from "../app.ts";
import { normalizeEmail } from "../email.ts";
import { ApiError } from "../errors.ts";
import { uuidv7 } from "../ids.ts";
import { activeMembership, assertOwner, type Membership } from "../membership.ts";

const { families, members, persons, budgets, budgetSubtypes, invites } = schema;

const builtInBudgets: readonly { name: string; subtypes: readonly string[] }[] = [
  { name: "Biaya", subtypes: ["Admin Transfer", "Admin Bulanan", "Biaya Kurs"] },
  { name: "Hutang Piutang", subtypes: [] },
];

export const familyRoutes = new Hono<Env>();

familyRoutes.post("/", async (c) => {
  const parsed = createFamilySchema.safeParse(await readJson(c));
  if (!parsed.success) throw new ApiError("invalid_request");

  const person = c.get("person");
  const family = {
    id: uuidv7(),
    name: parsed.data.name,
    homeTimeZone: defaultTimeZone,
    role: "owner" as const,
    timeZone: defaultTimeZone,
  };

  await c.get("db").transaction(async (tx) => {
    await tx.insert(families).values({
      id: family.id,
      name: family.name,
      homeTimeZone: family.homeTimeZone,
    });
    await tx.insert(members).values({
      id: uuidv7(),
      familyId: family.id,
      personId: person.id,
      role: family.role,
      timeZone: family.timeZone,
      displayName: person.email,
    });
    for (const [position, builtIn] of builtInBudgets.entries()) {
      const budgetId = uuidv7();
      await tx.insert(budgets).values({
        id: budgetId,
        familyId: family.id,
        name: builtIn.name,
        builtIn: true,
        position,
      });
      if (builtIn.subtypes.length === 0) continue;
      await tx.insert(budgetSubtypes).values(
        builtIn.subtypes.map((name, subtypePosition) => ({
          id: uuidv7(),
          budgetId,
          name,
          position: subtypePosition,
        })),
      );
    }
    await tx.update(persons).set({ currentFamilyId: family.id }).where(eq(persons.id, person.id));
  });

  return c.json({ family } satisfies FamilyResponse, 201);
});

familyRoutes.get("/", async (c) => {
  const personId = c.get("person").id;
  const db = c.get("db");
  const rows = await db
    .select({
      id: families.id,
      name: families.name,
      homeTimeZone: families.homeTimeZone,
      role: members.role,
      timeZone: members.timeZone,
    })
    .from(members)
    .innerJoin(families, eq(members.familyId, families.id))
    .where(and(eq(members.personId, personId), eq(members.active, true)))
    .orderBy(families.createdAt);
  const [current] = await db
    .select({ currentFamilyId: persons.currentFamilyId })
    .from(persons)
    .where(eq(persons.id, personId));
  const currentFamilyId = rows.some((family) => family.id === current?.currentFamilyId)
    ? (current?.currentFamilyId ?? null)
    : null;

  return c.json({ families: rows, currentFamilyId } satisfies FamiliesResponse);
});

familyRoutes.post("/:familyId/switch", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  await c
    .get("db")
    .update(persons)
    .set({ currentFamilyId: membership.familyId })
    .where(eq(persons.id, c.get("person").id));
  return c.json({ currentFamilyId: membership.familyId } satisfies CurrentFamilyResponse);
});

familyRoutes.patch("/:familyId/membership", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  const parsed = updateMembershipSchema.safeParse(await readJson(c));
  if (!parsed.success) throw new ApiError("invalid_request");

  await c
    .get("db")
    .update(members)
    .set({ timeZone: parsed.data.timeZone })
    .where(
      and(eq(members.familyId, membership.familyId), eq(members.personId, c.get("person").id)),
    );

  return c.json({
    family: familyView(membership, { timeZone: parsed.data.timeZone }),
  } satisfies FamilyResponse);
});

familyRoutes.patch("/:familyId", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  assertOwner(membership);
  const parsed = updateFamilySchema.safeParse(await readJson(c));
  if (!parsed.success) throw new ApiError("invalid_request");

  await c
    .get("db")
    .update(families)
    .set({ homeTimeZone: parsed.data.homeTimeZone })
    .where(eq(families.id, membership.familyId));

  return c.json({
    family: familyView(membership, { homeTimeZone: parsed.data.homeTimeZone }),
  } satisfies FamilyResponse);
});

familyRoutes.post("/:familyId/invites", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  assertOwner(membership);
  const parsed = createInviteSchema.safeParse(await readJson(c));
  if (!parsed.success) throw new ApiError("invalid_request");

  const email = normalizeEmail(parsed.data.email);
  const db = c.get("db");
  const [alreadyMember] = await db
    .select({ id: members.id })
    .from(members)
    .innerJoin(persons, eq(members.personId, persons.id))
    .where(and(eq(members.familyId, membership.familyId), sql`lower(${persons.email}) = ${email}`))
    .limit(1);
  if (alreadyMember) throw new ApiError("invalid_request");

  const [pendingInvite] = await db
    .select({ id: invites.id })
    .from(invites)
    .where(
      and(
        eq(invites.familyId, membership.familyId),
        eq(invites.email, email),
        eq(invites.state, "pending"),
      ),
    )
    .limit(1);
  if (pendingInvite) throw new ApiError("invalid_request");

  const invite = { id: uuidv7(), email, role: parsed.data.role };
  try {
    await db.insert(invites).values({
      id: invite.id,
      familyId: membership.familyId,
      email,
      role: invite.role,
      invitedByMemberId: membership.memberId,
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new ApiError("invalid_request");
    throw error;
  }

  return c.json({ invite } satisfies InviteResponse, 201);
});

familyRoutes.delete("/:familyId/invites/:inviteId", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  assertOwner(membership);
  const inviteId = c.req.param("inviteId");
  if (!z.uuid().safeParse(inviteId).success) throw new ApiError("not_found");

  const [cancelled] = await c
    .get("db")
    .update(invites)
    .set({ state: "cancelled" })
    .where(
      and(
        eq(invites.id, inviteId),
        eq(invites.familyId, membership.familyId),
        eq(invites.state, "pending"),
      ),
    )
    .returning({ id: invites.id });
  if (!cancelled) throw new ApiError("not_found");
  return c.body(null, 204);
});

familyRoutes.get("/:familyId/members", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  const db = c.get("db");
  const memberRows = await db
    .select({
      id: members.id,
      email: persons.email,
      displayName: members.displayName,
      role: members.role,
    })
    .from(members)
    .innerJoin(persons, eq(members.personId, persons.id))
    .where(and(eq(members.familyId, membership.familyId), eq(members.active, true)))
    .orderBy(members.createdAt);
  const inviteRows = await db
    .select({ id: invites.id, email: invites.email, role: invites.role })
    .from(invites)
    .where(and(eq(invites.familyId, membership.familyId), eq(invites.state, "pending")))
    .orderBy(invites.createdAt);

  return c.json({ members: memberRows, invites: inviteRows } satisfies MembersResponse);
});

familyRoutes.patch("/:familyId/members/:memberId", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  assertOwner(membership);
  const memberId = c.req.param("memberId");
  if (!z.uuid().safeParse(memberId).success) throw new ApiError("not_found");
  const parsed = updateMemberRoleSchema.safeParse(await readJson(c));
  if (!parsed.success) throw new ApiError("invalid_request");

  const [member] = await c
    .get("db")
    .select({
      id: members.id,
      email: persons.email,
      displayName: members.displayName,
      role: members.role,
    })
    .from(members)
    .innerJoin(persons, eq(members.personId, persons.id))
    .where(
      and(
        eq(members.id, memberId),
        eq(members.familyId, membership.familyId),
        eq(members.active, true),
      ),
    );
  if (!member) throw new ApiError("not_found");

  const role = parsed.data.role;
  await c.get("db").transaction(async (tx) => {
    const rows = await tx
      .select({ id: members.id, role: members.role })
      .from(members)
      .where(and(eq(members.familyId, membership.familyId), eq(members.active, true)))
      .for("update");
    const target = rows.find((row) => row.id === member.id);
    const owners = rows.filter((row) => row.role === "owner");
    if (!target) throw new ApiError("not_found");
    if (target.role === "owner" && role !== "owner" && owners.length <= 1) {
      throw new ApiError("last_owner");
    }
    await tx.update(members).set({ role }).where(eq(members.id, member.id));
  });

  return c.json({ member: { ...member, role } } satisfies MemberResponse);
});

familyRoutes.get("/:familyId/budgets", async (c) => {
  const membership = await activeMembership(
    c.get("db"),
    c.get("person").id,
    c.req.param("familyId"),
  );
  const listed = await listBudgets(c.get("db"), membership.familyId);
  return c.json({ budgets: listed } satisfies BudgetsResponse);
});

function familyView(membership: Membership, change: Partial<Family> = {}): Family {
  return {
    id: membership.familyId,
    name: membership.name,
    homeTimeZone: membership.homeTimeZone,
    role: membership.role,
    timeZone: membership.timeZone,
    ...change,
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === "23505") return true;
  if ("cause" in error) return isUniqueViolation(error.cause);
  return false;
}

async function readJson(c: { req: { json: () => Promise<unknown> } }): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw new ApiError("invalid_request");
  }
}

async function listBudgets(db: Database, familyId: string): Promise<Budget[]> {
  const rows = await db
    .select({ id: budgets.id, name: budgets.name, builtIn: budgets.builtIn })
    .from(budgets)
    .where(eq(budgets.familyId, familyId))
    .orderBy(budgets.position);
  if (rows.length === 0) return [];

  const subtypes = await db
    .select({
      id: budgetSubtypes.id,
      budgetId: budgetSubtypes.budgetId,
      name: budgetSubtypes.name,
    })
    .from(budgetSubtypes)
    .where(
      inArray(
        budgetSubtypes.budgetId,
        rows.map((budget) => budget.id),
      ),
    )
    .orderBy(budgetSubtypes.position);

  return rows.map((budget) => ({
    ...budget,
    subtypes: subtypes
      .filter((subtype) => subtype.budgetId === budget.id)
      .map(({ id, name }) => ({ id, name })),
  }));
}

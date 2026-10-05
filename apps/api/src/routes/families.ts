import { schema, type Database } from "@kantonq/db";
import { defaultTimeZone } from "@kantonq/shared/time-zone";
import {
  createFamilySchema,
  updateFamilySchema,
  updateMembershipSchema,
  type Budget,
  type BudgetsResponse,
  type CurrentFamilyResponse,
  type FamiliesResponse,
  type Family,
  type FamilyResponse,
} from "@kantonq/shared/validation";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";

import type { Env } from "../app.ts";
import { ApiError } from "../errors.ts";
import { uuidv7 } from "../ids.ts";
import { activeMembership, assertOwner, type Membership } from "../membership.ts";

const { families, members, persons, budgets, budgetSubtypes } = schema;

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

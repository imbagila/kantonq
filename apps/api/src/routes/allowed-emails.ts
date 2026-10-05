import { schema } from "@kantonq/db";
import {
  allowedEmailSchema,
  type AllowedEmail,
  type AllowedEmailsResponse,
} from "@kantonq/shared/validation";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import type { Env } from "../app.ts";
import { normalizeEmail } from "../email.ts";
import { ApiError } from "../errors.ts";

const { allowedEmails } = schema;

export const allowedEmailRoutes = new Hono<Env>();

allowedEmailRoutes.use(async (c, next) => {
  if (!c.get("isSuperAdmin")) throw new ApiError("forbidden_role");
  await next();
});

allowedEmailRoutes.get("/", async (c) => {
  const rows = await c
    .get("db")
    .select({ email: allowedEmails.email })
    .from(allowedEmails)
    .orderBy(allowedEmails.email);
  return c.json({ allowedEmails: rows } satisfies AllowedEmailsResponse);
});

allowedEmailRoutes.post("/", async (c) => {
  let json: unknown;
  try {
    json = await c.req.json();
  } catch {
    throw new ApiError("invalid_request");
  }
  const parsed = allowedEmailSchema.safeParse(json);
  if (!parsed.success) throw new ApiError("invalid_request");

  const email = normalizeEmail(parsed.data.email);
  await c.get("db").insert(allowedEmails).values({ email }).onConflictDoNothing();
  return c.json({ email } satisfies AllowedEmail, 201);
});

allowedEmailRoutes.delete("/:email", async (c) => {
  const email = normalizeEmail(c.req.param("email"));
  const [removed] = await c
    .get("db")
    .delete(allowedEmails)
    .where(eq(allowedEmails.email, email))
    .returning({ email: allowedEmails.email });
  if (!removed) throw new ApiError("not_found");
  return c.body(null, 204);
});

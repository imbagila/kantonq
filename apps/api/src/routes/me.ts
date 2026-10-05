import type { MeResponse } from "@kantonq/shared/validation";
import { Hono } from "hono";

import type { Env } from "../app.ts";

export const me = new Hono<Env>().get("/", (c) => {
  return c.json({ person: c.get("person") } satisfies MeResponse);
});

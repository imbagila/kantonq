import { createMiddleware } from "hono/factory";
import {
  createLocalJWKSet,
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JSONWebKeySet,
  type JWTVerifyGetKey,
} from "jose";
import { z } from "zod";

import type { Bindings, Env } from "./app.ts";
import { ApiError } from "./errors.ts";

const claimsSchema = z.object({
  sub: z.uuid(),
  email: z.email(),
});

const keySets = new Map<string, JWTVerifyGetKey>();

function keySetFor(env: Bindings): JWTVerifyGetKey {
  const cacheKey = env.SUPABASE_JWKS ?? env.SUPABASE_URL;
  let keySet = keySets.get(cacheKey);
  if (!keySet) {
    keySet = env.SUPABASE_JWKS
      ? createLocalJWKSet(JSON.parse(env.SUPABASE_JWKS) as JSONWebKeySet)
      : createRemoteJWKSet(new URL("/auth/v1/.well-known/jwks.json", env.SUPABASE_URL));
    keySets.set(cacheKey, keySet);
  }
  return keySet;
}

function isRejectedToken(error: unknown): boolean {
  // Failing to fetch the published keys is our outage, not the caller's fault.
  if (error instanceof errors.JWKSTimeout || error instanceof errors.JWKSInvalid) return false;
  return error instanceof errors.JOSEError;
}

/** Refuses every request that doesn't carry a valid Supabase access token, and records who is calling. */
export const requireSignIn = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) throw new ApiError("unauthenticated");

  let payload: unknown;
  try {
    ({ payload } = await jwtVerify(header.slice("Bearer ".length), keySetFor(c.env), {
      issuer: new URL("/auth/v1", c.env.SUPABASE_URL).toString(),
      audience: "authenticated",
    }));
  } catch (error) {
    if (isRejectedToken(error)) throw new ApiError("unauthenticated");
    throw error;
  }

  const claims = claimsSchema.safeParse(payload);
  if (!claims.success) throw new ApiError("unauthenticated");

  c.set("identity", { personId: claims.data.sub, email: claims.data.email });
  await next();
});

import type { Database } from "@kantonq/db";
import { pickLanguage, type Language } from "@kantonq/shared/language";
import type { ErrorCode } from "@kantonq/shared/validation";
import { Hono, type Context } from "hono";

import { requireSignIn } from "./auth.ts";
import { withDatabase } from "./database.ts";
import { ApiError, errorBody, errorStatus } from "./errors.ts";
import { me } from "./routes/me.ts";

export type Bindings = {
  /**
   * Postgres, reached through Cloudflare Hyperdrive.
   * Tests and `wrangler dev` supply a direct connection string on this same binding.
   */
  HYPERDRIVE: { connectionString: string };
  /** The Supabase project URL; tokens must be issued by its Auth server. */
  SUPABASE_URL: string;
  /** A JSON Web Key Set to trust instead of the project's published keys, for tests and local development. */
  SUPABASE_JWKS?: string;
};

export type Env = {
  Bindings: Bindings;
  Variables: {
    /** The language error messages are written in. */
    language: Language;
    /** Who the verified access token belongs to. */
    identity: { personId: string; email: string };
    db: Database;
  };
};

export function createApp() {
  const app = new Hono<Env>();

  app.use(async (c, next) => {
    c.set("language", pickLanguage(c.req.header("accept-language")));
    await next();
  });
  app.use(requireSignIn);
  app.use(withDatabase);

  app.route("/me", me);

  app.notFound((c) => answerWithError(c, "not_found"));

  app.onError((error, c) => {
    if (error instanceof ApiError) return answerWithError(c, error.code);
    console.error(error);
    return answerWithError(c, "internal_error");
  });

  return app;
}

function answerWithError(c: Context<Env>, code: ErrorCode) {
  return c.json(errorBody(code, c.get("language")), errorStatus(code));
}

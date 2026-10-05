import { afterAll, beforeAll } from "bun:test";

import { migrateDatabase } from "@kantonq/db/migrate";
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey } from "jose";
import postgres from "postgres";

import type { Bindings } from "../src/app.ts";
import app from "../src/index.ts";

const serverUrl =
  process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:54329/postgres";
const supabaseUrl = "http://supabase.test";

/** The configured super admin. They can sign in even when the allowed-email list is empty. */
export const superAdminEmail = "super-admin@example.com";

const trustedKey = await generateKeyPair("ES256", { extractable: true });
const untrustedKey = await generateKeyPair("ES256");
const trustedJwks = {
  keys: [{ ...(await exportJWK(trustedKey.publicKey)), kid: "test-key", alg: "ES256" }],
};

export type TestPerson = { id: string; email: string; token: string };

export type TokenOptions = {
  /** Sign with a key the API doesn't trust. */
  untrusted?: boolean;
  /** Seconds from now until the token expires; negative for an already-expired token. */
  expiresIn?: number;
};

/** Signs a Supabase-style access token for a new identity, the way Supabase Auth would after a Google sign-in. */
export async function signIn(
  email = `person-${crypto.randomUUID()}@example.com`,
  options: TokenOptions = {},
): Promise<TestPerson> {
  const id = crypto.randomUUID();
  const key: CryptoKey = options.untrusted ? untrustedKey.privateKey : trustedKey.privateKey;
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    email,
    role: "authenticated",
    aal: "aal1",
    session_id: crypto.randomUUID(),
    is_anonymous: false,
  })
    .setProtectedHeader({ alg: "ES256", kid: "test-key", typ: "JWT" })
    .setSubject(id)
    .setIssuer(`${supabaseUrl}/auth/v1`)
    .setAudience("authenticated")
    .setIssuedAt(now)
    .setExpirationTime(now + (options.expiresIn ?? 3600))
    .sign(key);
  return { id, email, token };
}

export type TestRequest = {
  as?: TestPerson;
  acceptLanguage?: string;
  body?: unknown;
};

/**
 * Gives a test file its own freshly migrated database and a way to send HTTP requests to the API.
 * Tests observe the API only through its HTTP responses.
 */
export function useTestApi() {
  const databaseName = `kantonq_test_${crypto.randomUUID().replaceAll("-", "")}`;
  const databaseUrl = new URL(serverUrl);
  databaseUrl.pathname = `/${databaseName}`;

  beforeAll(async () => {
    await onServer((sql) => sql.unsafe(`create database "${databaseName}"`));
    await migrateDatabase(databaseUrl.toString());
  });

  afterAll(async () => {
    await onServer((sql) => sql.unsafe(`drop database if exists "${databaseName}" with (force)`));
  });

  return requester(databaseUrl.toString());
}

/** An API whose database can't be reached, for observing how unexpected failures are answered. */
export function useApiWithUnreachableDatabase() {
  return requester("postgres://postgres:postgres@127.0.0.1:1/unreachable");
}

function requester(databaseUrl: string) {
  const env: Bindings = {
    HYPERDRIVE: { connectionString: databaseUrl },
    SUPABASE_URL: supabaseUrl,
    SUPABASE_JWKS: JSON.stringify(trustedJwks),
    SUPER_ADMIN_EMAIL: superAdminEmail,
  };

  return {
    get: (path: string, options?: TestRequest) => request("GET", path, options),
    post: (path: string, options?: TestRequest) => request("POST", path, options),
    patch: (path: string, options?: TestRequest) => request("PATCH", path, options),
    delete: (path: string, options?: TestRequest) => request("DELETE", path, options),
  };

  function request(method: string, path: string, options: TestRequest = {}): Promise<Response> {
    const headers = new Headers();
    if (options.as) headers.set("authorization", `Bearer ${options.as.token}`);
    if (options.acceptLanguage) headers.set("accept-language", options.acceptLanguage);
    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(options.body);
    }
    return Promise.resolve(app.request(path, { method, headers, body }, env));
  }
}

async function onServer(run: (sql: postgres.Sql) => Promise<unknown>): Promise<void> {
  const sql = postgres(serverUrl, { max: 1, onnotice: () => {} });
  try {
    await run(sql);
  } finally {
    await sql.end();
  }
}

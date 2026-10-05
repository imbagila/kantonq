import { describe, expect, test } from "bun:test";

import { withSessionPooler } from "./session-pooler.ts";

const poolerHost = "aws-0-ap-northeast-2.pooler.supabase.com";
const direct =
  "postgresql://postgres:p%40ss%3Aword@db.abcdefghijklmnopqrst.supabase.co:5432/postgres?sslmode=require";

describe("withSessionPooler", () => {
  test("rewrites a direct Supabase host to the session pooler", () => {
    const rewritten = withSessionPooler(direct, poolerHost);
    const url = new URL(rewritten);

    expect(url.username).toBe("postgres.abcdefghijklmnopqrst");
    expect(decodeURIComponent(url.password)).toBe("p@ss:word");
    expect(rewritten.includes("%25")).toBe(false);
    expect(url.hostname).toBe(poolerHost);
    expect(url.port).toBe("5432");
    expect(url.pathname).toBe("/postgres");
    expect(url.searchParams.get("sslmode")).toBe("require");
  });

  test("leaves a pooler URL, a local URL, and a missing host unchanged", () => {
    const pooler =
      "postgresql://postgres.abcdefghijklmnopqrst:secret@aws-1-us-east-1.pooler.supabase.com:5432/postgres";
    const local = "postgres://postgres:postgres@localhost:54329/kantonq";

    expect(withSessionPooler(pooler, poolerHost)).toBe(pooler);
    expect(withSessionPooler(local, poolerHost)).toBe(local);
    expect(withSessionPooler(direct, undefined)).toBe(direct);
    expect(withSessionPooler(direct, "  ")).toBe(direct);
  });
});

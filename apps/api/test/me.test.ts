import { describe, expect, test } from "bun:test";

import { signIn, superAdminEmail, useTestApi } from "./harness.ts";

const api = useTestApi();

describe("who am I", () => {
  test("a signed-in person sees who they are, with Indonesian as their language", async () => {
    const admin = await signIn(superAdminEmail);

    const response = await api.get("/me", { as: admin });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      person: { id: admin.id, email: superAdminEmail, language: "id" },
    });
  });

  test("a request without a token is refused, in Indonesian by default", async () => {
    const response = await api.get("/me");

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthenticated", message: "Silakan masuk terlebih dahulu." },
    });
  });

  test("a token signed by a key the API doesn't trust is refused", async () => {
    const forged = await signIn("ani@example.com", { untrusted: true });

    const response = await api.get("/me", { as: forged });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthenticated", message: "Silakan masuk terlebih dahulu." },
    });
  });

  test("an expired token is refused", async () => {
    const expired = await signIn("ani@example.com", { expiresIn: -60 });

    const response = await api.get("/me", { as: expired });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthenticated", message: "Silakan masuk terlebih dahulu." },
    });
  });

  test("the refusal is in English when the caller prefers English", async () => {
    const response = await api.get("/me", { acceptLanguage: "en-US,en;q=0.9,id;q=0.8" });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthenticated", message: "Please sign in first." },
    });
  });
});

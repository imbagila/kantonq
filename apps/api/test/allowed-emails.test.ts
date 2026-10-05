import { describe, expect, test } from "bun:test";

import { signIn, superAdminEmail, useTestApi } from "./harness.ts";

const api = useTestApi();

describe("allowed-email gate", () => {
  test("a person who isn't allowed is rejected on first sign-in", async () => {
    const stranger = await signIn("stranger@example.com");

    const response = await api.get("/me", { as: stranger });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: "not_allowed_email",
        message: "Email ini belum diundang. Minta undangan untuk masuk.",
      },
    });
  });

  test("the rejection is in English when the caller prefers English", async () => {
    const stranger = await signIn("stranger@example.com");

    const response = await api.get("/me", { as: stranger, acceptLanguage: "en" });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: "not_allowed_email",
        message: "This email hasn't been invited. Ask for an invite to sign in.",
      },
    });
  });

  test("an allowed person can sign in, and their person record is created", async () => {
    const admin = await signIn(superAdminEmail);
    const added = await api.post("/allowed-emails", {
      as: admin,
      body: { email: "ani@example.com" },
    });
    expect(added.status).toBe(201);

    const ani = await signIn("ani@example.com");
    const response = await api.get("/me", { as: ani });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      person: { id: ani.id, email: "ani@example.com", language: "id" },
    });
  });

  test("the super admin email match ignores letter case", async () => {
    const admin = await signIn("Super-Admin@Example.com");

    const response = await api.get("/me", { as: admin });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      person: { id: admin.id, email: "Super-Admin@Example.com", language: "id" },
    });
  });

  test("an allowed email has to be an email address", async () => {
    const admin = await signIn(superAdminEmail);

    const response = await api.post("/allowed-emails", {
      as: admin,
      body: { email: "not-an-email" },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });
  });

  test("the super admin can sign in without being on the allowed-email list", async () => {
    const admin = await signIn(superAdminEmail);

    const listed = await api.get("/allowed-emails", { as: admin });
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      allowedEmails: expect.not.arrayContaining([{ email: superAdminEmail }]),
    });

    const response = await api.get("/me", { as: admin });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      person: { id: admin.id, email: superAdminEmail, language: "id" },
    });
  });

  test("the super admin can add, list and remove allowed emails", async () => {
    const admin = await signIn(superAdminEmail);

    const added = await api.post("/allowed-emails", {
      as: admin,
      body: { email: "Budi@Example.com" },
    });
    expect(added.status).toBe(201);
    expect(await added.json()).toEqual({ email: "budi@example.com" });

    const listed = await api.get("/allowed-emails", { as: admin });
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      allowedEmails: expect.arrayContaining([{ email: "budi@example.com" }]),
    });

    const removed = await api.delete(`/allowed-emails/${encodeURIComponent("budi@example.com")}`, {
      as: admin,
    });
    expect(removed.status).toBe(204);

    const after = await api.get("/allowed-emails", { as: admin });
    expect(after.status).toBe(200);
    expect(await after.json()).toEqual({
      allowedEmails: expect.not.arrayContaining([{ email: "budi@example.com" }]),
    });
  });

  test("anyone other than the super admin is refused when managing allowed emails", async () => {
    const admin = await signIn(superAdminEmail);
    const allowed = await api.post("/allowed-emails", {
      as: admin,
      body: { email: "citra@example.com" },
    });
    expect(allowed.status).toBe(201);
    const citra = await signIn("citra@example.com");

    const listed = await api.get("/allowed-emails", { as: citra });
    const added = await api.post("/allowed-emails", {
      as: citra,
      body: { email: "other@example.com" },
    });
    const removed = await api.delete(`/allowed-emails/${encodeURIComponent("citra@example.com")}`, {
      as: citra,
    });

    for (const response of [listed, added, removed]) {
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: {
          code: "forbidden_role",
          message: "Anda tidak memiliki izin untuk melakukan ini.",
        },
      });
    }
  });

  test("removing an allowed email stops a first sign-in, and someone already signed in still can", async () => {
    const admin = await signIn(superAdminEmail);
    const allowed = await api.post("/allowed-emails", {
      as: admin,
      body: { email: "dina@example.com" },
    });
    expect(allowed.status).toBe(201);
    const dina = await signIn("dina@example.com");

    const first = await api.get("/me", { as: dina });
    expect(first.status).toBe(200);

    const removed = await api.delete(`/allowed-emails/${encodeURIComponent("dina@example.com")}`, {
      as: admin,
    });
    expect(removed.status).toBe(204);

    const stillSignedIn = await api.get("/me", { as: dina });
    expect(stillSignedIn.status).toBe(200);
    expect(await stillSignedIn.json()).toEqual({
      person: { id: dina.id, email: "dina@example.com", language: "id" },
    });

    const firstSignIn = await signIn("dina@example.com");
    const rejected = await api.get("/me", { as: firstSignIn });
    expect(rejected.status).toBe(403);
    expect(await rejected.json()).toEqual({
      error: {
        code: "not_allowed_email",
        message: "Email ini belum diundang. Minta undangan untuk masuk.",
      },
    });
  });
});

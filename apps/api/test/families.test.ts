import { describe, expect, test } from "bun:test";

import { familyResponseSchema } from "@kantonq/shared/validation";

import { signIn, superAdminEmail, useTestApi } from "./harness.ts";

const api = useTestApi();

async function allowedPerson(email = `person-${crypto.randomUUID()}@example.com`) {
  const admin = await signIn(superAdminEmail);
  const added = await api.post("/allowed-emails", { as: admin, body: { email } });
  expect(added.status).toBe(201);
  return signIn(email);
}

describe("families", () => {
  test("a signed-in person creates a family and becomes its owner", async () => {
    const ani = await allowedPerson("ani@example.com");

    const created = await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } });

    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({
      family: {
        id: expect.any(String),
        name: "Keluarga Ani",
        homeTimeZone: "Asia/Jakarta",
        role: "owner",
        timeZone: "Asia/Jakarta",
      },
    });
  });

  test("a family needs a name", async () => {
    const ani = await allowedPerson();

    const response = await api.post("/families", { as: ani, body: { name: "   " } });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });
  });

  test("creating a family also creates the built-in budgets", async () => {
    const ani = await allowedPerson();
    const created = await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } });
    const { family } = familyResponseSchema.parse(await created.json());

    const response = await api.get(`/families/${family.id}/budgets`, { as: ani });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      budgets: [
        {
          id: expect.any(String),
          name: "Biaya",
          builtIn: true,
          subtypes: [
            { id: expect.any(String), name: "Admin Transfer" },
            { id: expect.any(String), name: "Admin Bulanan" },
            { id: expect.any(String), name: "Biaya Kurs" },
          ],
        },
        {
          id: expect.any(String),
          name: "Hutang Piutang",
          builtIn: true,
          subtypes: [],
        },
      ],
    });
  });

  test("a person switches families, and the next request still opens the last one", async () => {
    const ani = await allowedPerson();
    const parents = familyResponseSchema.parse(
      await (await api.post("/families", { as: ani, body: { name: "Orang Tua" } })).json(),
    ).family;
    const own = familyResponseSchema.parse(
      await (await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } })).json(),
    ).family;

    const opened = await api.get("/families", { as: ani });
    expect(opened.status).toBe(200);
    expect(await opened.json()).toEqual({
      currentFamilyId: own.id,
      families: [parents, own],
    });

    const switched = await api.post(`/families/${parents.id}/switch`, { as: ani });
    expect(switched.status).toBe(200);
    expect(await switched.json()).toEqual({ currentFamilyId: parents.id });

    const nextVisit = await api.get("/families", { as: ani });
    expect(nextVisit.status).toBe(200);
    expect(await nextVisit.json()).toEqual({
      currentFamilyId: parents.id,
      families: [parents, own],
    });
  });

  test("two families stay separate", async () => {
    const ani = await allowedPerson();
    const budi = await allowedPerson();
    const anis = familyResponseSchema.parse(
      await (await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } })).json(),
    ).family;
    const budis = familyResponseSchema.parse(
      await (await api.post("/families", { as: budi, body: { name: "Keluarga Budi" } })).json(),
    ).family;

    const aniSeesBudi = await api.get(`/families/${budis.id}/budgets`, { as: ani });
    const budiSeesAni = await api.get(`/families/${anis.id}/budgets`, { as: budi });
    const aniSwitches = await api.post(`/families/${budis.id}/switch`, { as: ani });
    const budiSwitches = await api.post(`/families/${anis.id}/switch`, { as: budi });

    for (const response of [aniSeesBudi, budiSeesAni, aniSwitches, budiSwitches]) {
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: { code: "not_found", message: "Tidak ditemukan." },
      });
    }

    expect(await (await api.get("/families", { as: ani })).json()).toEqual({
      currentFamilyId: anis.id,
      families: [anis],
    });
    expect(await (await api.get("/families", { as: budi })).json()).toEqual({
      currentFamilyId: budis.id,
      families: [budis],
    });
  });

  test("a member sets their own time zone and language, and later errors use that language", async () => {
    const ani = await allowedPerson();
    const budi = await allowedPerson();
    const family = familyResponseSchema.parse(
      await (await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } })).json(),
    ).family;

    const timeZone = await api.patch(`/families/${family.id}/membership`, {
      as: ani,
      body: { timeZone: "Asia/Tokyo" },
    });
    expect(timeZone.status).toBe(200);
    expect(await timeZone.json()).toEqual({
      family: { ...family, timeZone: "Asia/Tokyo" },
    });

    const outsider = await api.patch(`/families/${family.id}/membership`, {
      as: budi,
      body: { timeZone: "Europe/London" },
    });
    expect(outsider.status).toBe(404);
    expect(await outsider.json()).toEqual({
      error: { code: "not_found", message: "Tidak ditemukan." },
    });

    const invalid = await api.patch(`/families/${family.id}/membership`, {
      as: ani,
      body: { timeZone: "WIB" },
    });
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });

    const language = await api.patch("/me", { as: ani, body: { language: "en" } });
    expect(language.status).toBe(200);
    expect(await language.json()).toEqual({
      person: { id: ani.id, email: ani.email, language: "en" },
    });

    const refused = await api.get("/no-such-thing", { as: ani, acceptLanguage: "id" });
    expect(refused.status).toBe(404);
    expect(await refused.json()).toEqual({
      error: { code: "not_found", message: "Not found." },
    });

    expect(await (await api.get("/families", { as: ani })).json()).toEqual({
      currentFamilyId: family.id,
      families: [{ ...family, timeZone: "Asia/Tokyo" }],
    });
  });

  test("an owner sets the family's home time zone, and a member of another family cannot", async () => {
    const ani = await allowedPerson();
    const budi = await allowedPerson();
    const anis = familyResponseSchema.parse(
      await (await api.post("/families", { as: ani, body: { name: "Keluarga Ani" } })).json(),
    ).family;
    await api.post("/families", { as: budi, body: { name: "Keluarga Budi" } });

    const updated = await api.patch(`/families/${anis.id}`, {
      as: ani,
      body: { homeTimeZone: "Asia/Makassar" },
    });
    expect(updated.status).toBe(200);
    expect(await updated.json()).toEqual({
      family: { ...anis, homeTimeZone: "Asia/Makassar" },
    });

    const refused = await api.patch(`/families/${anis.id}`, {
      as: budi,
      body: { homeTimeZone: "Europe/London" },
    });
    expect(refused.status).toBe(404);
    expect(await refused.json()).toEqual({
      error: { code: "not_found", message: "Tidak ditemukan." },
    });

    expect(await (await api.get("/families", { as: ani })).json()).toEqual({
      currentFamilyId: anis.id,
      families: [{ ...anis, homeTimeZone: "Asia/Makassar" }],
    });
  });
});

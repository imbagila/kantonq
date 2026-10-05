import {
  createFamilySchema,
  currentFamilyResponseSchema,
  familiesResponseSchema,
  familyResponseSchema,
  meResponseSchema,
  switchFamilySchema,
  updateHomeTimeZoneSchema,
  updateMemberTimeZoneSchema,
  updatePersonSchema,
} from "@kantonq/shared/validation";
import { createServerFn } from "@tanstack/react-start";

async function callApi(path: string, init?: { method?: string; body?: unknown }) {
  const { apiFetch } = await import("@/auth/api.server.ts");
  return apiFetch(path, init);
}

export const listFamilies = createServerFn({ method: "GET" }).handler(async () => {
  const result = await callApi("/families");
  if (!result.ok) throw new Error(result.message);
  return familiesResponseSchema.parse(result.body);
});

export const createFamily = createServerFn({ method: "POST" })
  .validator((input: { name: string }) => createFamilySchema.safeParse(input).data ?? input)
  .handler(async ({ data }) => {
    const result = await callApi("/families", { method: "POST", body: data });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, family: familyResponseSchema.parse(result.body).family };
  });

export const switchFamily = createServerFn({ method: "POST" })
  .validator((input: { familyId: string }) => switchFamilySchema.parse(input))
  .handler(async ({ data }) => {
    const result = await callApi(`/families/${data.familyId}/switch`, { method: "POST" });
    if (!result.ok) return { ok: false as const, message: result.message };
    return {
      ok: true as const,
      currentFamilyId: currentFamilyResponseSchema.parse(result.body).currentFamilyId,
    };
  });

export const updateLanguage = createServerFn({ method: "POST" })
  .validator((input: { language: "id" | "en" }) => updatePersonSchema.parse(input))
  .handler(async ({ data }) => {
    const result = await callApi("/me", { method: "PATCH", body: data });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, person: meResponseSchema.parse(result.body).person };
  });

export const updateTimeZone = createServerFn({ method: "POST" })
  .validator((input: { familyId: string; timeZone: string }) =>
    updateMemberTimeZoneSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const result = await callApi(`/families/${data.familyId}/membership`, {
      method: "PATCH",
      body: { timeZone: data.timeZone },
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, family: familyResponseSchema.parse(result.body).family };
  });

export const updateHomeTimeZone = createServerFn({ method: "POST" })
  .validator((input: { familyId: string; homeTimeZone: string }) =>
    updateHomeTimeZoneSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const result = await callApi(`/families/${data.familyId}`, {
      method: "PATCH",
      body: { homeTimeZone: data.homeTimeZone },
    });
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, family: familyResponseSchema.parse(result.body).family };
  });

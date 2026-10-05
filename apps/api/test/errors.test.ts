import { describe, expect, spyOn, test } from "bun:test";

import { signIn, superAdminEmail, useApiWithUnreachableDatabase, useTestApi } from "./harness.ts";

const api = useTestApi();
const apiWithoutDatabase = useApiWithUnreachableDatabase();

describe("errors", () => {
  test("an unknown path answers with the not_found code", async () => {
    const admin = await signIn(superAdminEmail);

    const response = await api.get("/no-such-thing", { as: admin });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "Tidak ditemukan." },
    });
  });

  test("an unexpected failure answers with the internal_error code and no details", async () => {
    const ani = await signIn();
    const errorLog = spyOn(console, "error").mockImplementation(() => {});

    const response = await apiWithoutDatabase.get("/me", { as: ani, acceptLanguage: "en" });
    errorLog.mockRestore();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: "internal_error", message: "Something went wrong. Please try again." },
    });
  });
});

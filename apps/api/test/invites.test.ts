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

async function createFamily(person: Awaited<ReturnType<typeof signIn>>, name: string) {
  const response = await api.post("/families", { as: person, body: { name } });
  expect(response.status).toBe(201);
  return familyResponseSchema.parse(await response.json()).family;
}

describe("invites and roles", () => {
  test("an owner invites an email with a role, and the family lists that pending invite", async () => {
    const ani = await allowedPerson("ani@example.com");
    const family = await createFamily(ani, "Keluarga Ani");

    const invited = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "Budi@Example.com", role: "editor" },
    });

    expect(invited.status).toBe(201);
    const body = await invited.json();
    expect(body).toEqual({
      invite: { id: expect.any(String), email: "budi@example.com", role: "editor" },
    });

    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      members: [
        {
          id: expect.any(String),
          email: "ani@example.com",
          displayName: "ani@example.com",
          role: "owner",
        },
      ],
      invites: [(body as { invite: { id: string } }).invite],
    });
  });

  test("a pending invite lets that email sign in, and the first sign-in joins the family with the invited role", async () => {
    const ani = await allowedPerson("ani-invite@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    const invited = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "Citra@Example.com", role: "viewer" },
    });
    expect(invited.status).toBe(201);

    const citra = await signIn("citra@example.com");
    const me = await api.get("/me", { as: citra });
    expect(me.status).toBe(200);
    expect(await me.json()).toEqual({
      person: { id: citra.id, email: "citra@example.com", language: "id" },
    });

    const opened = await api.get("/families", { as: citra });
    expect(opened.status).toBe(200);
    expect(await opened.json()).toEqual({
      currentFamilyId: family.id,
      families: [{ ...family, role: "viewer" }],
    });

    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      members: [
        {
          id: expect.any(String),
          email: "ani-invite@example.com",
          displayName: "ani-invite@example.com",
          role: "owner",
        },
        {
          id: expect.any(String),
          email: "citra@example.com",
          displayName: "citra@example.com",
          role: "viewer",
        },
      ],
      invites: [],
    });
  });

  test("editors and viewers can't invite", async () => {
    const ani = await allowedPerson("owner-roles@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "editor-roles@example.com", role: "editor" },
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "viewer-roles@example.com", role: "viewer" },
        })
      ).status,
    ).toBe(201);

    const editor = await signIn("editor-roles@example.com");
    const viewer = await signIn("viewer-roles@example.com");
    expect((await api.get("/me", { as: editor })).status).toBe(200);
    expect((await api.get("/me", { as: viewer })).status).toBe(200);

    const forbidden = {
      error: {
        code: "forbidden_role",
        message: "Anda tidak memiliki izin untuk melakukan ini.",
      },
    };
    const editorInvite = await api.post(`/families/${family.id}/invites`, {
      as: editor,
      body: { email: "new-editor@example.com", role: "editor" },
    });
    expect(editorInvite.status).toBe(403);
    expect(await editorInvite.json()).toEqual(forbidden);

    const viewerInvite = await api.post(`/families/${family.id}/invites`, {
      as: viewer,
      body: { email: "new-viewer@example.com", role: "viewer" },
    });
    expect(viewerInvite.status).toBe(403);
    expect(await viewerInvite.json()).toEqual(forbidden);
  });

  test("an owner can cancel a pending invite, and that email is turned away", async () => {
    const ani = await allowedPerson("owner-cancel@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    const invited = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "mistaken@example.com", role: "editor" },
    });
    expect(invited.status).toBe(201);
    const { invite } = (await invited.json()) as { invite: { id: string } };

    const cancelled = await api.delete(`/families/${family.id}/invites/${invite.id}`, { as: ani });
    expect(cancelled.status).toBe(204);

    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      members: [
        {
          id: expect.any(String),
          email: "owner-cancel@example.com",
          displayName: "owner-cancel@example.com",
          role: "owner",
        },
      ],
      invites: [],
    });

    const mistaken = await signIn("mistaken@example.com");
    const me = await api.get("/me", { as: mistaken });
    expect(me.status).toBe(403);
    expect(await me.json()).toEqual({
      error: {
        code: "not_allowed_email",
        message: "Email ini belum diundang. Minta undangan untuk masuk.",
      },
    });
  });

  test("cancelling an invite does not turn away an email the super admin already allowed, and they do not join", async () => {
    const ani = await allowedPerson("owner-still-allowed@example.com");
    const dina = await allowedPerson("dina-still-allowed@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    const invited = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "dina-still-allowed@example.com", role: "editor" },
    });
    expect(invited.status).toBe(201);
    const { invite } = (await invited.json()) as { invite: { id: string } };

    const cancelled = await api.delete(`/families/${family.id}/invites/${invite.id}`, { as: ani });
    expect(cancelled.status).toBe(204);

    const me = await api.get("/me", { as: dina });
    expect(me.status).toBe(200);
    const opened = await api.get("/families", { as: dina });
    expect(opened.status).toBe(200);
    expect(await opened.json()).toEqual({ currentFamilyId: null, families: [] });
  });

  test("an owner can change roles, and a family can have several owners", async () => {
    const ani = await allowedPerson("owner-several@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "wife-several@example.com", role: "editor" },
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "child-several@example.com", role: "viewer" },
        })
      ).status,
    ).toBe(201);
    const wife = await signIn("wife-several@example.com");
    const child = await signIn("child-several@example.com");
    expect((await api.get("/me", { as: wife })).status).toBe(200);
    expect((await api.get("/me", { as: child })).status).toBe(200);

    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    const { members } = (await listed.json()) as {
      members: { id: string; email: string; displayName: string; role: string }[];
    };
    const wifeMember = members.find((member) => member.email === "wife-several@example.com");
    const childMember = members.find((member) => member.email === "child-several@example.com");
    if (!wifeMember || !childMember) throw new Error("invited members were not listed");

    const promoted = await api.patch(`/families/${family.id}/members/${wifeMember.id}`, {
      as: ani,
      body: { role: "owner" },
    });
    expect(promoted.status).toBe(200);
    expect(await promoted.json()).toEqual({
      member: { ...wifeMember, role: "owner" },
    });

    const demoted = await api.patch(`/families/${family.id}/members/${childMember.id}`, {
      as: ani,
      body: { role: "editor" },
    });
    expect(demoted.status).toBe(200);
    expect(await demoted.json()).toEqual({
      member: { ...childMember, role: "editor" },
    });

    const after = await api.get(`/families/${family.id}/members`, { as: wife });
    expect(after.status).toBe(200);
    expect(await after.json()).toEqual({
      members: [members[0], { ...wifeMember, role: "owner" }, { ...childMember, role: "editor" }],
      invites: [],
    });
  });

  test("the last owner can't be demoted", async () => {
    const ani = await allowedPerson("last-owner@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    const { members } = (await listed.json()) as {
      members: { id: string; email: string; displayName: string; role: string }[];
    };
    const aniMember = members[0];
    if (!aniMember) throw new Error("the owner was not listed");

    const demoted = await api.patch(`/families/${family.id}/members/${aniMember.id}`, {
      as: ani,
      body: { role: "editor" },
    });
    expect(demoted.status).toBe(409);
    expect(await demoted.json()).toEqual({
      error: {
        code: "last_owner",
        message: "Keluarga harus tetap memiliki satu pemilik.",
      },
    });

    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "second-owner@example.com", role: "owner" },
        })
      ).status,
    ).toBe(201);
    const budi = await signIn("second-owner@example.com");
    expect((await api.get("/me", { as: budi })).status).toBe(200);
    const withBoth = await api.get(`/families/${family.id}/members`, { as: ani });
    const both = (
      (await withBoth.json()) as {
        members: { id: string; email: string; displayName: string; role: string }[];
      }
    ).members;
    const budiMember = both.find((member) => member.email === "second-owner@example.com");
    if (!budiMember) throw new Error("the second owner was not listed");

    const aniStepsDown = await api.patch(`/families/${family.id}/members/${aniMember.id}`, {
      as: budi,
      body: { role: "editor" },
    });
    expect(aniStepsDown.status).toBe(200);

    const language = await api.patch("/me", { as: budi, body: { language: "en" } });
    expect(language.status).toBe(200);
    const last = await api.patch(`/families/${family.id}/members/${budiMember.id}`, {
      as: budi,
      body: { role: "viewer" },
    });
    expect(last.status).toBe(409);
    expect(await last.json()).toEqual({
      error: { code: "last_owner", message: "The family must keep one owner." },
    });

    const still = await api.get(`/families/${family.id}/members`, { as: budi });
    expect(await still.json()).toEqual({
      members: [{ ...aniMember, role: "editor" }, budiMember],
      invites: [],
    });
  });

  test("editors and viewers are refused on member, invite and family-setting changes", async () => {
    const ani = await allowedPerson("owner-enforce@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    const invited = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "pending-enforce@example.com", role: "editor" },
    });
    const { invite } = (await invited.json()) as { invite: { id: string } };
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "editor-enforce@example.com", role: "editor" },
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "viewer-enforce@example.com", role: "viewer" },
        })
      ).status,
    ).toBe(201);
    const editor = await signIn("editor-enforce@example.com");
    const viewer = await signIn("viewer-enforce@example.com");
    const outsider = await allowedPerson("outsider-enforce@example.com");
    expect((await api.get("/me", { as: editor })).status).toBe(200);
    expect((await api.get("/me", { as: viewer })).status).toBe(200);
    await createFamily(outsider, "Keluarga Lain");

    const listed = await api.get(`/families/${family.id}/members`, { as: ani });
    const { members } = (await listed.json()) as { members: { id: string; email: string }[] };
    const aniMember = members.find((member) => member.email === "owner-enforce@example.com");
    if (!aniMember) throw new Error("the owner was not listed");

    const forbidden = {
      error: {
        code: "forbidden_role",
        message: "Anda tidak memiliki izin untuk melakukan ini.",
      },
    };
    const hidden = { error: { code: "not_found", message: "Tidak ditemukan." } };

    for (const person of [editor, viewer]) {
      const inviteAttempt = await api.post(`/families/${family.id}/invites`, {
        as: person,
        body: { email: `extra-${person.email}`, role: "viewer" },
      });
      expect(inviteAttempt.status).toBe(403);
      expect(await inviteAttempt.json()).toEqual(forbidden);

      const cancelAttempt = await api.delete(`/families/${family.id}/invites/${invite.id}`, {
        as: person,
      });
      expect(cancelAttempt.status).toBe(403);
      expect(await cancelAttempt.json()).toEqual(forbidden);

      const roleAttempt = await api.patch(`/families/${family.id}/members/${aniMember.id}`, {
        as: person,
        body: { role: "viewer" },
      });
      expect(roleAttempt.status).toBe(403);
      expect(await roleAttempt.json()).toEqual(forbidden);

      const homeTimeZone = await api.patch(`/families/${family.id}`, {
        as: person,
        body: { homeTimeZone: "Asia/Makassar" },
      });
      expect(homeTimeZone.status).toBe(403);
      expect(await homeTimeZone.json()).toEqual(forbidden);
    }

    const outsiderInvite = await api.post(`/families/${family.id}/invites`, {
      as: outsider,
      body: { email: "hidden@example.com", role: "viewer" },
    });
    expect(outsiderInvite.status).toBe(404);
    expect(await outsiderInvite.json()).toEqual(hidden);

    const read = await api.get(`/families/${family.id}/budgets`, { as: viewer });
    expect(read.status).toBe(200);

    const ownTimeZone = await api.patch(`/families/${family.id}/membership`, {
      as: viewer,
      body: { timeZone: "Asia/Tokyo" },
    });
    expect(ownTimeZone.status).toBe(200);
    expect(await ownTimeZone.json()).toEqual({
      family: { ...family, role: "viewer", timeZone: "Asia/Tokyo" },
    });

    const pending = await api.get(`/families/${family.id}/members`, { as: viewer });
    expect(pending.status).toBe(200);
    expect(await pending.json()).toEqual({
      members: [
        {
          id: aniMember.id,
          email: "owner-enforce@example.com",
          displayName: "owner-enforce@example.com",
          role: "owner",
        },
        {
          id: expect.any(String),
          email: "editor-enforce@example.com",
          displayName: "editor-enforce@example.com",
          role: "editor",
        },
        {
          id: expect.any(String),
          email: "viewer-enforce@example.com",
          displayName: "viewer-enforce@example.com",
          role: "viewer",
        },
      ],
      invites: [{ ...invite, email: "pending-enforce@example.com", role: "editor" }],
    });
  });

  test("someone who already has a family joins the inviting family on their next request and keeps the family they were using", async () => {
    const ani = await allowedPerson("ani-later@example.com");
    const budi = await allowedPerson("budi-later@example.com");
    const anis = await createFamily(ani, "Keluarga Ani");
    const budis = await createFamily(budi, "Keluarga Budi");
    expect(
      (
        await api.post(`/families/${anis.id}/invites`, {
          as: ani,
          body: { email: "budi-later@example.com", role: "editor" },
        })
      ).status,
    ).toBe(201);

    const opened = await api.get("/families", { as: budi });
    expect(opened.status).toBe(200);
    expect(await opened.json()).toEqual({
      currentFamilyId: budis.id,
      families: [{ ...anis, role: "editor" }, budis],
    });
  });

  test("an owner can't invite an email that is already invited or already a member", async () => {
    const ani = await allowedPerson("owner-duplicate@example.com");
    const family = await createFamily(ani, "Keluarga Ani");
    expect(
      (
        await api.post(`/families/${family.id}/invites`, {
          as: ani,
          body: { email: "twice@example.com", role: "editor" },
        })
      ).status,
    ).toBe(201);

    const again = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "Twice@Example.com", role: "viewer" },
    });
    expect(again.status).toBe(400);
    expect(await again.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });

    const self = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "owner-duplicate@example.com", role: "owner" },
    });
    expect(self.status).toBe(400);
    expect(await self.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });

    const twice = await signIn("twice@example.com");
    expect((await api.get("/me", { as: twice })).status).toBe(200);
    const memberAgain = await api.post(`/families/${family.id}/invites`, {
      as: ani,
      body: { email: "twice@example.com", role: "owner" },
    });
    expect(memberAgain.status).toBe(400);
    expect(await memberAgain.json()).toEqual({
      error: { code: "invalid_request", message: "Permintaan tidak valid." },
    });
  });
});

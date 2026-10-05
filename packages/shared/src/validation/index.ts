import { z } from "zod";

import { languages } from "../language.ts";
import { isTimeZone } from "../time-zone.ts";

export const languageSchema = z.enum(languages);

export const errorCodes = [
  "unauthenticated",
  "not_allowed_email",
  "forbidden_role",
  "last_owner",
  "invalid_request",
  "not_found",
  "internal_error",
] as const;

export const errorCodeSchema = z.enum(errorCodes);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const personSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  language: languageSchema,
});

export type Person = z.infer<typeof personSchema>;

export const meResponseSchema = z.object({
  person: personSchema,
});

export type MeResponse = z.infer<typeof meResponseSchema>;

export const allowedEmailSchema = z.object({
  email: z.email(),
});

export type AllowedEmail = z.infer<typeof allowedEmailSchema>;

export const allowedEmailsResponseSchema = z.object({
  allowedEmails: z.array(allowedEmailSchema),
});

export type AllowedEmailsResponse = z.infer<typeof allowedEmailsResponseSchema>;

export const memberRoles = ["owner", "editor", "viewer"] as const;

export const memberRoleSchema = z.enum(memberRoles);

export type MemberRole = z.infer<typeof memberRoleSchema>;

export const timeZoneSchema = z.string().refine(isTimeZone);

export const createFamilySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const updateFamilySchema = z.object({
  homeTimeZone: timeZoneSchema,
});

export const updateMembershipSchema = z.object({
  timeZone: timeZoneSchema,
});

export const updatePersonSchema = z.object({
  language: languageSchema,
});

export const switchFamilySchema = z.object({
  familyId: z.uuid(),
});

export const updateMemberTimeZoneSchema = z.object({
  familyId: z.uuid(),
  timeZone: timeZoneSchema,
});

export const updateHomeTimeZoneSchema = z.object({
  familyId: z.uuid(),
  homeTimeZone: timeZoneSchema,
});

export type CreateFamily = z.infer<typeof createFamilySchema>;

export const familySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  homeTimeZone: z.string(),
  role: memberRoleSchema,
  timeZone: z.string(),
});

export type Family = z.infer<typeof familySchema>;

export const familyResponseSchema = z.object({
  family: familySchema,
});

export type FamilyResponse = z.infer<typeof familyResponseSchema>;

export const familiesResponseSchema = z.object({
  currentFamilyId: z.uuid().nullable(),
  families: z.array(familySchema),
});

export type FamiliesResponse = z.infer<typeof familiesResponseSchema>;

export const currentFamilyResponseSchema = z.object({
  currentFamilyId: z.uuid(),
});

export type CurrentFamilyResponse = z.infer<typeof currentFamilyResponseSchema>;

export const budgetSubtypeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type BudgetSubtype = z.infer<typeof budgetSubtypeSchema>;

export const budgetSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  builtIn: z.boolean(),
  subtypes: z.array(budgetSubtypeSchema),
});

export type Budget = z.infer<typeof budgetSchema>;

export const budgetsResponseSchema = z.object({
  budgets: z.array(budgetSchema),
});

export type BudgetsResponse = z.infer<typeof budgetsResponseSchema>;

export const createInviteSchema = z.object({
  email: z.email(),
  role: memberRoleSchema,
});

export const inviteSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: memberRoleSchema,
});

export type Invite = z.infer<typeof inviteSchema>;

export const inviteResponseSchema = z.object({
  invite: inviteSchema,
});

export type InviteResponse = z.infer<typeof inviteResponseSchema>;

export const memberSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string(),
  role: memberRoleSchema,
});

export type Member = z.infer<typeof memberSchema>;

export const membersResponseSchema = z.object({
  members: z.array(memberSchema),
  invites: z.array(inviteSchema),
});

export type MembersResponse = z.infer<typeof membersResponseSchema>;

export const updateMemberRoleSchema = z.object({
  role: memberRoleSchema,
});

export const memberResponseSchema = z.object({
  member: memberSchema,
});

export type MemberResponse = z.infer<typeof memberResponseSchema>;

export const inviteToFamilySchema = createInviteSchema.extend({
  familyId: z.uuid(),
});

export const cancelInviteSchema = z.object({
  familyId: z.uuid(),
  inviteId: z.uuid(),
});

export const changeMemberRoleSchema = updateMemberRoleSchema.extend({
  familyId: z.uuid(),
  memberId: z.uuid(),
});

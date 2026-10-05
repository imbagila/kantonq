import { defaultLanguage, languages } from "@kantonq/shared/language";
import { defaultTimeZone } from "@kantonq/shared/time-zone";
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const language = pgEnum("language", languages);

/** An email the super admin has allowed to sign in. Compared case-insensitively, stored in lowercase. */
export const allowedEmails = pgTable("allowed_emails", {
  email: text().primaryKey(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const memberRole = pgEnum("member_role", ["owner", "editor", "viewer"]);

export const inviteState = pgEnum("invite_state", ["pending", "accepted", "cancelled"]);

/** A group of members who share one set of wallets, budgets and records. */
export const families = pgTable("families", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  homeTimeZone: text().notNull().default(defaultTimeZone),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** A Google identity. Its id is the Supabase Auth user id. */
export const persons = pgTable("persons", {
  id: uuid().primaryKey(),
  email: text().notNull(),
  language: language().notNull().default(defaultLanguage),
  /** The family this person last used. Empty until they create or switch to one. */
  currentFamilyId: uuid().references(() => families.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * A person inside a family.
 * `personId` is empty for a profile, which has no login.
 */
export const members = pgTable(
  "members",
  {
    id: uuid().primaryKey(),
    familyId: uuid()
      .notNull()
      .references(() => families.id),
    personId: uuid().references(() => persons.id),
    role: memberRole().notNull(),
    timeZone: text().notNull().default(defaultTimeZone),
    displayName: text().notNull(),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("members_family_person").on(table.familyId, table.personId)],
);

/** An owner's offer for a Google email to join a family. A pending invite also lets that email sign in. */
export const invites = pgTable(
  "invites",
  {
    id: uuid().primaryKey(),
    familyId: uuid()
      .notNull()
      .references(() => families.id),
    email: text().notNull(),
    role: memberRole().notNull(),
    invitedByMemberId: uuid()
      .notNull()
      .references(() => members.id),
    state: inviteState().notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invites_pending_family_email")
      .on(table.familyId, table.email)
      .where(sql`${table.state} = 'pending'`),
  ],
);

/** An expense category. Built-in budgets are created with the family and cannot be removed. */
export const budgets = pgTable(
  "budgets",
  {
    id: uuid().primaryKey(),
    familyId: uuid()
      .notNull()
      .references(() => families.id),
    name: text().notNull(),
    builtIn: boolean().notNull().default(false),
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("budgets_family_name").on(table.familyId, table.name)],
);

/** A finer label that belongs to exactly one budget. */
export const budgetSubtypes = pgTable(
  "budget_subtypes",
  {
    id: uuid().primaryKey(),
    budgetId: uuid()
      .notNull()
      .references(() => budgets.id),
    name: text().notNull(),
    position: integer().notNull(),
  },
  (table) => [uniqueIndex("budget_subtypes_budget_name").on(table.budgetId, table.name)],
);

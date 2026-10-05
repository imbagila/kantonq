import { defaultLanguage, languages } from "@kantonq/shared/language";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const language = pgEnum("language", languages);

/** An email the super admin has allowed to sign in. Compared case-insensitively, stored in lowercase. */
export const allowedEmails = pgTable("allowed_emails", {
  email: text().primaryKey(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** A Google identity. Its id is the Supabase Auth user id. */
export const persons = pgTable("persons", {
  id: uuid().primaryKey(),
  email: text().notNull(),
  language: language().notNull().default(defaultLanguage),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

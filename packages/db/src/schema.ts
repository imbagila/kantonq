import { defaultLanguage, languages } from "@kantonq/shared/language";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const language = pgEnum("language", languages);

/** A Google identity. Its id is the Supabase Auth user id. */
export const persons = pgTable("persons", {
  id: uuid().primaryKey(),
  email: text().notNull(),
  language: language().notNull().default(defaultLanguage),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

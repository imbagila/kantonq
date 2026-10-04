import { z } from "zod";

import { languages } from "../language.ts";

export const languageSchema = z.enum(languages);

export const errorCodes = ["unauthenticated", "not_found", "internal_error"] as const;

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

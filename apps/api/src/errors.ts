import type { Language } from "@kantonq/shared/language";
import type { ErrorCode, ErrorResponse } from "@kantonq/shared/validation";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const errors: Record<
  ErrorCode,
  { status: ContentfulStatusCode; message: Record<Language, string> }
> = {
  unauthenticated: {
    status: 401,
    message: { id: "Silakan masuk terlebih dahulu.", en: "Please sign in first." },
  },
  not_found: {
    status: 404,
    message: { id: "Tidak ditemukan.", en: "Not found." },
  },
  internal_error: {
    status: 500,
    message: {
      id: "Terjadi kesalahan. Silakan coba lagi.",
      en: "Something went wrong. Please try again.",
    },
  },
};

/** An error the API answers with its stable code, the matching status and a message in the caller's language. */
export class ApiError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code);
    this.name = "ApiError";
  }
}

export function errorStatus(code: ErrorCode): ContentfulStatusCode {
  return errors[code].status;
}

export function errorBody(code: ErrorCode, language: Language): ErrorResponse {
  return { error: { code, message: errors[code].message[language] } };
}

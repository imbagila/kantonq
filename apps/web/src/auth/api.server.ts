import { pickLanguage } from "@kantonq/shared/language";
import { errorResponseSchema, meResponseSchema, type Person } from "@kantonq/shared/validation";
import { createServerClient } from "@supabase/ssr";
import {
  getCookies,
  getRequestHeader,
  getRequestUrl,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";

export type SignInState =
  | { status: "signed_out" }
  | { status: "not_allowed" }
  | { status: "signed_in"; person: Person };

async function webBindings() {
  const { env } = await import("cloudflare:workers");
  return env;
}

/** A Supabase client that keeps the Google session in this request's cookies. */
async function supabase() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await webBindings();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          setResponseHeader(key, value);
        }
      },
    },
  });
}

async function apiOrigin(): Promise<string> {
  const { API_URL } = await webBindings();
  return API_URL;
}

export type ApiResult = { ok: true; body: unknown } | { ok: false; message: string };

function messageFrom(json: unknown): string | undefined {
  const error = errorResponseSchema.safeParse(json);
  return error.success ? error.data.error.message : undefined;
}

/** Used only when the API did not answer with its usual error body. */
function fallbackMessage(): string {
  return pickLanguage(getRequestHeader("accept-language")) === "en"
    ? "Something went wrong. Please try again."
    : "Terjadi kesalahan. Silakan coba lagi.";
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    return messageFrom(await response.json()) ?? fallbackMessage();
  } catch {
    return fallbackMessage();
  }
}

/** Calls the API with the signed-in person's access token. */
export async function apiFetch(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult> {
  const client = await supabase();
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  const origin = await apiOrigin();
  if (!token) {
    const response = await fetch(new URL("/me", origin), {
      headers: { "accept-language": getRequestHeader("accept-language") ?? "" },
    });
    return { ok: false, message: await readErrorMessage(response) };
  }

  const headers = new Headers({ authorization: `Bearer ${token}` });
  let body: string | undefined;
  if (init.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.body);
  }

  const response = await fetch(new URL(path, origin), {
    method: init.method ?? "GET",
    headers,
    ...(body === undefined ? {} : { body }),
  });
  if (!response.ok) return { ok: false, message: await readErrorMessage(response) };
  try {
    return { ok: true, body: await response.json() };
  } catch {
    return { ok: false, message: fallbackMessage() };
  }
}

/**
 * Asks the API who the session belongs to.
 * A rejected email ends the session so the browser doesn't keep a sign-in that kantonq refused.
 */
export async function resolveSignIn(): Promise<SignInState> {
  const client = await supabase();
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { status: "signed_out" };

  const response = await fetch(new URL("/me", await apiOrigin()), {
    headers: {
      authorization: `Bearer ${token}`,
      "accept-language": getRequestHeader("accept-language") ?? "",
    },
  });

  if (response.ok) {
    const body = meResponseSchema.parse(await response.json());
    return { status: "signed_in", person: body.person };
  }

  const error = errorResponseSchema.safeParse(await response.json());
  if (error.success && error.data.error.code === "not_allowed_email") {
    await client.auth.signOut();
    return { status: "not_allowed" };
  }
  if (response.status === 401) await client.auth.signOut();
  return { status: "signed_out" };
}

export async function finishSignIn(code: string): Promise<SignInState> {
  const client = await supabase();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return { status: "signed_out" };
  return resolveSignIn();
}

/** Starts Google sign-in and returns the address the browser should open. */
export async function startSignIn(): Promise<{ url: string }> {
  const client = await supabase();
  const origin = getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/`, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw new Error("Google sign-in could not be started");
  return { url: data.url };
}

export async function endSignIn(): Promise<void> {
  const client = await supabase();
  await client.auth.signOut();
}

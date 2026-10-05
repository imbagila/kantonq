import { errorResponseSchema, meResponseSchema, type Person } from "@kantonq/shared/validation";
import { createServerClient } from "@supabase/ssr";
import { createServerFn } from "@tanstack/react-start";
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

/**
 * Asks the API who the session belongs to.
 * A rejected email ends the session so the browser doesn't keep a sign-in that kantonq refused.
 */
async function resolveSignIn(): Promise<SignInState> {
  const client = await supabase();
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { status: "signed_out" };

  const { API_URL } = await webBindings();
  const response = await fetch(new URL("/me", API_URL), {
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

export const readSignIn = createServerFn({ method: "GET" }).handler(resolveSignIn);

export const finishGoogleSignIn = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const client = await supabase();
    const { error } = await client.auth.exchangeCodeForSession(data.code);
    if (error) return { status: "signed_out" } satisfies SignInState;
    return resolveSignIn();
  });

/** Starts Google sign-in and returns the address the browser should open. */
export const startGoogleSignIn = createServerFn({ method: "POST" }).handler(async () => {
  const client = await supabase();
  const origin = getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/`, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw new Error("Google sign-in could not be started");
  return { url: data.url };
});

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const client = await supabase();
  await client.auth.signOut();
});

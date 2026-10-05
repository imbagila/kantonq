import type { Person } from "@kantonq/shared/validation";
import { createServerFn } from "@tanstack/react-start";

export type SignInState =
  | { status: "signed_out" }
  | { status: "not_allowed" }
  | { status: "signed_in"; person: Person };

export const readSignIn = createServerFn({ method: "GET" }).handler(async () => {
  const { resolveSignIn } = await import("./api.server.ts");
  return resolveSignIn();
});

export const finishGoogleSignIn = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const { finishSignIn } = await import("./api.server.ts");
    return finishSignIn(data.code);
  });

/** Starts Google sign-in and returns the address the browser should open. */
export const startGoogleSignIn = createServerFn({ method: "POST" }).handler(async () => {
  const { startSignIn } = await import("./api.server.ts");
  return startSignIn();
});

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { endSignIn } = await import("./api.server.ts");
  await endSignIn();
});

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { readSignIn } from "@/auth/session.ts";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const session = await readSignIn();
    if (session.status === "signed_in") return { person: session.person };
    throw redirect({
      to: "/",
      search: session.status === "not_allowed" ? { error: "not_allowed_email" } : {},
    });
  },
  component: AppLayout,
});

function AppLayout() {
  return <Outlet />;
}

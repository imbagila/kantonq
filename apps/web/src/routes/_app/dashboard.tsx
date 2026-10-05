import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { signOut } from "@/auth/session.ts";
import { Button } from "@/components/ui/button.tsx";
import { useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const t = useT();
  const { person } = Route.useRouteContext();
  const signOutFn = useServerFn(signOut);
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 sm:px-8">
      <header className="flex h-16 items-center justify-between gap-3">
        <span className="text-xl font-semibold tracking-tight">
          kantonq<span className="text-primary">.</span>
        </span>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            setPending(true);
            void signOutFn()
              .then(() => navigate({ to: "/" }))
              .catch(() => {
                setPending(false);
              });
          }}
        >
          {t("session.signOut")}
        </Button>
      </header>
      <main className="flex flex-1 flex-col justify-center gap-3 pb-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.signedIn")}</p>
        <p className="font-medium break-all">{person.email}</p>
      </main>
    </div>
  );
}

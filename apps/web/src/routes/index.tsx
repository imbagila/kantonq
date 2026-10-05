import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { finishGoogleSignIn, readSignIn, startGoogleSignIn } from "@/auth/session.ts";
import { Button } from "@/components/ui/button.tsx";
import { useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search.code === "string" ? { code: search.code } : {}),
    ...(search.error === "not_allowed_email" ? { error: search.error } : {}),
  }),
  beforeLoad: async ({ search }) => {
    if (search.code) {
      const result = await finishGoogleSignIn({ data: { code: search.code } });
      if (result.status === "signed_in") throw redirect({ to: "/dashboard" });
      throw redirect({
        to: "/",
        search: result.status === "not_allowed" ? { error: "not_allowed_email" } : {},
      });
    }

    const session = await readSignIn();
    if (session.status === "signed_in") throw redirect({ to: "/dashboard" });
    if (session.status === "not_allowed" && search.error !== "not_allowed_email") {
      throw redirect({ to: "/", search: { error: "not_allowed_email" } });
    }
  },
  component: Landing,
});

function Landing() {
  const t = useT();
  const { error } = Route.useSearch();
  const start = useServerFn(startGoogleSignIn);
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 sm:px-8">
      <header className="flex h-16 items-center">
        <span className="text-xl font-semibold tracking-tight">
          kantonq<span className="text-primary">.</span>
        </span>
      </header>
      <main className="flex flex-1 flex-col justify-center gap-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("landing.tagline")}
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          {t("landing.description")}
        </p>
        {error === "not_allowed_email" ? (
          <p role="alert" className="max-w-xl text-pretty text-destructive">
            {t("landing.notAllowed")}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void start()
                .then(({ url }) => {
                  window.location.href = url;
                })
                .catch(() => {
                  setPending(false);
                });
            }}
          >
            {t("landing.signIn")}
          </Button>
          <p className="text-sm text-muted-foreground">{t("landing.building")}</p>
        </div>
      </main>
    </div>
  );
}

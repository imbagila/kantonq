import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button.tsx";
import { useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const t = useT();
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" disabled className="w-full sm:w-auto">
            {t("landing.comingSoon")}
          </Button>
          <p className="text-sm text-muted-foreground">{t("landing.building")}</p>
        </div>
      </main>
    </div>
  );
}

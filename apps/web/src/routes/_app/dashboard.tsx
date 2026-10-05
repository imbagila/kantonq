import { createFileRoute } from "@tanstack/react-router";

import { useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const t = useT();
  const { person, families, currentFamilyId } = Route.useRouteContext();
  const current = families.find((family) => family.id === currentFamilyId);

  return (
    <div className="flex flex-1 flex-col justify-center gap-3">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("dashboard.title")}</h1>
      <p className="text-muted-foreground">{t("dashboard.signedIn")}</p>
      {current ? <p className="text-lg font-medium">{current.name}</p> : null}
      <p className="font-medium break-all">{person.email}</p>
    </div>
  );
}

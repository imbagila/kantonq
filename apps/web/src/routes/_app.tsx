import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { readSignIn, signOut } from "@/auth/session.ts";
import { SelectInput } from "@/components/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { listFamilies, switchFamily } from "@/family-api.ts";
import { I18nProvider, useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const session = await readSignIn();
    if (session.status !== "signed_in") {
      throw redirect({
        to: "/",
        search: session.status === "not_allowed" ? { error: "not_allowed_email" } : {},
      });
    }
    const membership = await listFamilies();
    if (membership.families.length === 0 && location.pathname !== "/family") {
      throw redirect({ to: "/family" });
    }
    return { person: session.person, ...membership };
  },
  component: AppLayout,
});

function AppLayout() {
  const { person } = Route.useRouteContext();
  useEffect(() => {
    document.documentElement.lang = person.language;
  }, [person.language]);

  return (
    <I18nProvider language={person.language}>
      <Shell />
    </I18nProvider>
  );
}

function Shell() {
  const t = useT();
  const { families } = Route.useRouteContext();
  const signOutFn = useServerFn(signOut);
  const navigate = Route.useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 sm:px-8">
      <header className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="text-xl font-semibold tracking-tight">
            kantonq<span className="text-primary">.</span>
          </Link>
          <SignOutButton
            className="sm:hidden"
            pending={pending}
            label={t("session.signOut")}
            onSignOut={() => {
              setPending(true);
              void signOutFn()
                .then(() => navigate({ to: "/" }))
                .catch(() => {
                  setPending(false);
                });
            }}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {families.length > 0 ? <FamilySwitcher /> : null}
          <nav className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/family">{t("nav.family")}</Link>
            </Button>
            {families.length > 0 ? (
              <Button variant="outline" asChild>
                <Link to="/settings">{t("nav.settings")}</Link>
              </Button>
            ) : null}
          </nav>
          <SignOutButton
            className="hidden sm:inline-flex"
            pending={pending}
            label={t("session.signOut")}
            onSignOut={() => {
              setPending(true);
              void signOutFn()
                .then(() => navigate({ to: "/" }))
                .catch(() => {
                  setPending(false);
                });
            }}
          />
        </div>
      </header>
      <main className="flex flex-1 flex-col pb-24">
        <Outlet />
      </main>
    </div>
  );
}

function SignOutButton({
  className,
  pending,
  label,
  onSignOut,
}: {
  className?: string;
  pending: boolean;
  label: string;
  onSignOut: () => void;
}) {
  return (
    <Button variant="outline" className={className} disabled={pending} onClick={onSignOut}>
      {label}
    </Button>
  );
}

function FamilySwitcher() {
  const t = useT();
  const { families, currentFamilyId } = Route.useRouteContext();
  const switchTo = useServerFn(switchFamily);
  const router = useRouter();
  const current = families.find((family) => family.id === currentFamilyId) ?? families[0];
  if (!current) return null;
  if (families.length < 2) {
    return <p className="text-sm font-medium">{current.name}</p>;
  }

  return (
    <SelectInput
      aria-label={t("family.switcher")}
      className="sm:w-52"
      value={current.id}
      onChange={(event) => {
        const familyId = event.target.value;
        void switchTo({ data: { familyId } }).then((result) => {
          if (result.ok) void router.invalidate();
        });
      }}
    >
      {families.map((family) => (
        <option key={family.id} value={family.id}>
          {family.name}
        </option>
      ))}
    </SelectInput>
  );
}

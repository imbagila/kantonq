import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Label, SelectInput, TextInput } from "@/components/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { createFamily, switchFamily, updateLanguage } from "@/family-api.ts";
import { useT } from "@/i18n/i18n.tsx";

export const Route = createFileRoute("/_app/family")({
  ssr: false,
  component: FamilyPage,
});

function FamilyPage() {
  const t = useT();
  const { families, currentFamilyId, person } = Route.useRouteContext();
  const creatingFirst = families.length === 0;

  return (
    <div className="flex flex-col gap-8 py-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {creatingFirst ? t("family.createTitle") : t("family.title")}
        </h1>
        {creatingFirst ? (
          <p className="max-w-xl text-pretty text-muted-foreground">{t("family.createLead")}</p>
        ) : null}
      </div>
      {creatingFirst ? <LanguageField language={person.language} /> : null}
      <CreateFamilyForm />
      {families.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {families.map((family) => (
            <FamilyRow
              key={family.id}
              id={family.id}
              name={family.name}
              current={family.id === currentFamilyId}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LanguageField({ language }: { language: "id" | "en" }) {
  const t = useT();
  const update = useServerFn(updateLanguage);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor="language">{t("settings.language")}</Label>
      <SelectInput
        id="language"
        value={language}
        onChange={(event) => {
          const next = event.target.value;
          if (next !== "id" && next !== "en") return;
          setError(null);
          void update({ data: { language: next } }).then(async (result) => {
            if (!result.ok) {
              setError(result.message);
              return;
            }
            await router.invalidate();
          });
        }}
      >
        <option value="id">{t("language.id")}</option>
        <option value="en">{t("language.en")}</option>
      </SelectInput>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CreateFamilyForm() {
  const t = useT();
  const create = useServerFn(createFamily);
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        void create({ data: { name } })
          .then(async (result) => {
            if (!result.ok) {
              setError(result.message);
              setPending(false);
              return;
            }
            await router.invalidate();
            await navigate({ to: "/dashboard" });
          })
          .catch(() => {
            setError(t("family.failed"));
            setPending(false);
          });
      }}
    >
      <Label htmlFor="family-name">{t("family.name")}</Label>
      <TextInput
        id="family-name"
        name="name"
        required
        maxLength={80}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {t("family.create")}
      </Button>
    </form>
  );
}

function FamilyRow({ id, name, current }: { id: string; name: string; current: boolean }) {
  const t = useT();
  const switchTo = useServerFn(switchFamily);
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <li className="flex flex-col gap-2 rounded-md border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium">{name}</span>
      {current ? (
        <span className="text-sm text-muted-foreground">{t("family.current")}</span>
      ) : (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            setPending(true);
            setError(null);
            void switchTo({ data: { familyId: id } })
              .then(async (result) => {
                if (!result.ok) {
                  setError(result.message);
                  setPending(false);
                  return;
                }
                await router.invalidate();
                await navigate({ to: "/dashboard" });
              })
              .catch(() => {
                setError(t("family.failed"));
                setPending(false);
              });
          }}
        >
          {t("family.switch")}
        </Button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {error}
        </p>
      ) : null}
    </li>
  );
}

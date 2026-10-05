import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";

import { Label, SelectInput } from "@/components/field.tsx";
import { updateHomeTimeZone, updateLanguage, updateTimeZone } from "@/family-api.ts";
import { useT } from "@/i18n/i18n.tsx";
import { timeZoneChoices } from "@/time-zones.ts";

export const Route = createFileRoute("/_app/settings")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const { person, families, currentFamilyId } = Route.useRouteContext();
  const current = families.find((family) => family.id === currentFamilyId);
  if (!current) return null;

  return (
    <div className="flex flex-col gap-8 py-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("settings.title")}</h1>
      <LanguageSetting language={person.language} />
      <TimeZoneSetting familyId={current.id} timeZone={current.timeZone} />
      {current.role === "owner" ? (
        <HomeTimeZoneSetting familyId={current.id} homeTimeZone={current.homeTimeZone} />
      ) : null}
    </div>
  );
}

function LanguageSetting({ language }: { language: "id" | "en" }) {
  const t = useT();
  const update = useServerFn(updateLanguage);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <Setting
      id="language"
      label={t("settings.language")}
      error={error}
      value={language}
      onChange={(value) => {
        if (value !== "id" && value !== "en") return;
        setError(null);
        void update({ data: { language: value } }).then(async (result) => {
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
    </Setting>
  );
}

function TimeZoneSetting({ familyId, timeZone }: { familyId: string; timeZone: string }) {
  const t = useT();
  const update = useServerFn(updateTimeZone);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <ZoneSetting
      id="time-zone"
      label={t("settings.timeZone")}
      value={timeZone}
      error={error}
      onChange={(value) => {
        setError(null);
        void update({ data: { familyId, timeZone: value } }).then(async (result) => {
          if (!result.ok) {
            setError(result.message);
            return;
          }
          await router.invalidate();
        });
      }}
    />
  );
}

function HomeTimeZoneSetting({
  familyId,
  homeTimeZone,
}: {
  familyId: string;
  homeTimeZone: string;
}) {
  const t = useT();
  const update = useServerFn(updateHomeTimeZone);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <ZoneSetting
      id="home-time-zone"
      label={t("settings.homeTimeZone")}
      value={homeTimeZone}
      error={error}
      onChange={(value) => {
        setError(null);
        void update({ data: { familyId, homeTimeZone: value } }).then(async (result) => {
          if (!result.ok) {
            setError(result.message);
            return;
          }
          await router.invalidate();
        });
      }}
    />
  );
}

function ZoneSetting({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <Setting id={id} label={label} value={value} error={error} onChange={onChange}>
      {timeZoneChoices().map((zone) => (
        <option key={zone.id} value={zone.id}>
          {zone.label}
        </option>
      ))}
    </Setting>
  );
}

function Setting({
  id,
  label,
  value,
  error,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <SelectInput
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {children}
      </SelectInput>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

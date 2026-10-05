import type { Invite, Member, MemberRole } from "@kantonq/shared/validation";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Label, SelectInput, TextInput } from "@/components/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  cancelInvite,
  createFamily,
  inviteMember,
  listMembers,
  switchFamily,
  updateLanguage,
  updateMemberRole,
} from "@/family-api.ts";
import { useT } from "@/i18n/i18n.tsx";
import type { MessageKey } from "@/i18n/messages.ts";

export const Route = createFileRoute("/_app/family")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    if (!context.currentFamilyId) return { members: [], invites: [] };
    return listMembers({ data: { familyId: context.currentFamilyId } });
  },
  component: FamilyPage,
});

function FamilyPage() {
  const t = useT();
  const { families, currentFamilyId, person, members, invites } = Route.useRouteContext();
  const creatingFirst = families.length === 0;
  const current = families.find((family) => family.id === currentFamilyId);

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
      {current ? (
        <Members
          familyId={current.id}
          canManage={current.role === "owner"}
          members={members}
          invites={invites}
        />
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

const roles = ["owner", "editor", "viewer"] as const;

function roleKey(role: MemberRole): MessageKey {
  if (role === "owner") return "role.owner";
  if (role === "editor") return "role.editor";
  return "role.viewer";
}

function Members({
  familyId,
  canManage,
  members,
  invites,
}: {
  familyId: string;
  canManage: boolean;
  members: Member[];
  invites: Invite[];
}) {
  const t = useT();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("family.members")}</h2>
        <ul className="flex flex-col gap-2">
          {members.map((member) => (
            <MemberRow key={member.id} familyId={familyId} canManage={canManage} member={member} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("family.invites")}</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("family.noInvites")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {invites.map((invite) => (
              <InviteRow
                key={invite.id}
                familyId={familyId}
                canManage={canManage}
                invite={invite}
              />
            ))}
          </ul>
        )}
      </div>
      {canManage ? <InviteForm familyId={familyId} /> : null}
    </section>
  );
}

function MemberRow({
  familyId,
  canManage,
  member,
}: {
  familyId: string;
  canManage: boolean;
  member: Member;
}) {
  const t = useT();
  const update = useServerFn(updateMemberRole);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <li className="flex flex-col gap-2 rounded-md border px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <span className="font-medium">{member.displayName}</span>
      {canManage ? (
        <SelectInput
          aria-label={t("family.role")}
          className="sm:w-40"
          value={member.role}
          onChange={(event) => {
            const role = event.target.value;
            if (role !== "owner" && role !== "editor" && role !== "viewer") return;
            setError(null);
            void update({ data: { familyId, memberId: member.id, role } }).then(async (result) => {
              if (!result.ok) {
                setError(result.message);
                return;
              }
              await router.invalidate();
            });
          }}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {t(roleKey(role))}
            </option>
          ))}
        </SelectInput>
      ) : (
        <span className="text-sm text-muted-foreground">{t(roleKey(member.role))}</span>
      )}
      {error ? (
        <p role="alert" className="text-sm text-destructive sm:basis-full">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function InviteRow({
  familyId,
  canManage,
  invite,
}: {
  familyId: string;
  canManage: boolean;
  invite: Invite;
}) {
  const t = useT();
  const cancel = useServerFn(cancelInvite);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <li className="flex flex-col gap-2 rounded-md border px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <span>
        <span className="font-medium">{invite.email}</span>
        <span className="text-sm text-muted-foreground"> · {t(roleKey(invite.role))}</span>
      </span>
      {canManage ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            setPending(true);
            setError(null);
            void cancel({ data: { familyId, inviteId: invite.id } })
              .then(async (result) => {
                if (!result.ok) {
                  setError(result.message);
                  setPending(false);
                  return;
                }
                await router.invalidate();
              })
              .catch(() => {
                setError(t("family.failed"));
                setPending(false);
              });
          }}
        >
          {t("family.cancelInvite")}
        </Button>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive sm:basis-full">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function InviteForm({ familyId }: { familyId: string }) {
  const t = useT();
  const invite = useServerFn(inviteMember);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("editor");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        void invite({ data: { familyId, email, role } })
          .then(async (result) => {
            if (!result.ok) {
              setError(result.message);
              setPending(false);
              return;
            }
            setEmail("");
            setPending(false);
            await router.invalidate();
          })
          .catch(() => {
            setError(t("family.failed"));
            setPending(false);
          });
      }}
    >
      <Label htmlFor="invite-email">{t("family.inviteEmail")}</Label>
      <TextInput
        id="invite-email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      <Label htmlFor="invite-role">{t("family.role")}</Label>
      <SelectInput
        id="invite-role"
        value={role}
        onChange={(event) => {
          const next = event.target.value;
          if (next !== "owner" && next !== "editor" && next !== "viewer") return;
          setRole(next);
        }}
      >
        {roles.map((choice) => (
          <option key={choice} value={choice}>
            {t(roleKey(choice))}
          </option>
        ))}
      </SelectInput>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {t("family.invite")}
      </Button>
    </form>
  );
}

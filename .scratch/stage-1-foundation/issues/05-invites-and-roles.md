# 05: Invites and roles

**What to build:** An owner invites someone by Google email. The invite automatically lets that email sign in, and the invited person joins the family the first time they sign in, with no extra steps. Owners can cancel invites that haven't been accepted. Owners give each member the owner, editor or viewer role, and a family can have several owners but always keeps at least one. Editors can change records but not manage members; viewers can see everything but change nothing.

Covers user stories 9–14 and 22–24.

**Blocked by:** 04 (Families: create, switch and settings)

**Status:** ready-for-agent

- [x] An owner can invite an email with a role; editors and viewers can't invite
- [x] A pending invite lets that email pass the allowed-email gate without the super admin
- [x] On first sign-in with an invited email, the person automatically becomes a member of the inviting family with the invited role
- [x] An owner can cancel a pending invite, after which that email can no longer join through it (and is turned away if it has no other reason to be allowed)
- [x] An owner can change any member's role among owner, editor and viewer, and a family can have several owners
- [x] The last owner can't be demoted, with a stable error code
- [x] Viewers are refused on every write; editors are refused on member, invite and family-setting changes, with `forbidden_role`
- [x] The family page lists members with their roles, and pending invites, in both languages
- [x] API tests cover inviting, accepting on sign-in, cancelling, role changes, the last-owner rule, and role enforcement for editors and viewers

## Comments

**Implemented.** An owner invites a Google email with a role. A pending invite is its own reason to pass the allowed-email gate, separate from the super admin's allowed-email list, so cancelling it turns the email away only when nothing else allows it. The next signed-in request accepts every pending invite: the first sign-in joins with the invited role and that family becomes current when the person has none; someone who already had a family keeps the one they were using. Owners change roles among owner, editor and viewer. Demoting the last owner answers `last_owner` (409). Editors and viewers get `forbidden_role` on invites, cancelling, role changes and the home time zone. A member of any role can still set their own time zone and language and switch families. There is no shared-record write yet; viewers will be refused on those with `forbidden_role` when wallets and transactions arrive. The family page lists members, roles and pending invites in Indonesian and English, and owners invite, cancel and change roles there.

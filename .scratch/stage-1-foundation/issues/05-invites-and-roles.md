# 05: Invites and roles

**What to build:** An owner invites someone by Google email. The invite automatically lets that email sign in, and the invited person joins the family the first time they sign in, with no extra steps. Owners can cancel invites that haven't been accepted. Owners give each member the owner, editor or viewer role, and a family can have several owners but always keeps at least one. Editors can change records but not manage members; viewers can see everything but change nothing.

Covers user stories 9–14 and 22–24.

**Blocked by:** 04 (Families: create, switch and settings)

**Status:** ready-for-agent

- [ ] An owner can invite an email with a role; editors and viewers can't invite
- [ ] A pending invite lets that email pass the allowed-email gate without the super admin
- [ ] On first sign-in with an invited email, the person automatically becomes a member of the inviting family with the invited role
- [ ] An owner can cancel a pending invite, after which that email can no longer join through it (and is turned away if it has no other reason to be allowed)
- [ ] An owner can change any member's role among owner, editor and viewer, and a family can have several owners
- [ ] The last owner can't be demoted, with a stable error code
- [ ] Viewers are refused on every write; editors are refused on member, invite and family-setting changes, with `forbidden_role`
- [ ] The family page lists members with their roles, and pending invites, in both languages
- [ ] API tests cover inviting, accepting on sign-in, cancelling, role changes, the last-owner rule, and role enforcement for editors and viewers

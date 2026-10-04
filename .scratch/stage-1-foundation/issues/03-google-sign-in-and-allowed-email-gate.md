# 03: Google sign-in and the allowed-email gate

**What to build:** Only approved people can use kantonq. A person signs in with Google. The super admin, whose email comes from configuration, is always allowed. Anyone else must be on the allowed-email list, or is turned away with a clear message saying they need an invite. The super admin adds and removes allowed emails through the API (there is no admin page in this stage). Signed-in visitors to `/` go straight to `/dashboard`, signed-out visitors to any app page go to `/`, and members can sign out.

Covers user stories 1–4, 8, 107 and 108.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [ ] The super admin email is read from configuration, and the super admin can always sign in, even when the allowed-email list is empty
- [ ] A person whose email isn't the super admin's and isn't on the allowed-email list is rejected on first sign-in with the `not_allowed_email` code
- [ ] The web app shows a clear, bilingual message for a rejected sign-in that explains an invite is needed
- [ ] The super admin can list, add and remove allowed emails through the API; anyone else gets `forbidden_role` (or an equivalent stable code)
- [ ] An allowed person can sign in with Google through Supabase Auth, and a person record is created on first sign-in
- [ ] Removing an allowed email stops that person from signing in for the first time (people already signed in are handled by family membership in later tickets)
- [ ] Signing out ends the session
- [ ] A signed-in visitor to `/` is redirected to `/dashboard`; a signed-out visitor to any app route is redirected to `/`
- [ ] API tests cover the super admin, an allowed email, a rejected email, and allowed-email management by the super admin and by a non-admin

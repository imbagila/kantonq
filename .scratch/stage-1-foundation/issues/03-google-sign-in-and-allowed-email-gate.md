# 03: Google sign-in and the allowed-email gate

**What to build:** Only approved people can use kantonq. A person signs in with Google. The super admin, whose email comes from configuration, is always allowed. Anyone else must be on the allowed-email list, or is turned away with a clear message saying they need an invite. The super admin adds and removes allowed emails through the API (there is no admin page in this stage). Signed-in visitors to `/` go straight to `/dashboard`, signed-out visitors to any app page go to `/`, and members can sign out.

Covers user stories 1–4, 8, 107 and 108.

**Blocked by:** 01 (Walking skeleton)

**Status:** ready-for-agent

- [x] The super admin email is read from configuration, and the super admin can always sign in, even when the allowed-email list is empty
- [x] A person whose email isn't the super admin's and isn't on the allowed-email list is rejected on first sign-in with the `not_allowed_email` code
- [x] The web app shows a clear, bilingual message for a rejected sign-in that explains an invite is needed
- [x] The super admin can list, add and remove allowed emails through the API; anyone else gets `forbidden_role` (or an equivalent stable code)
- [x] An allowed person can sign in with Google through Supabase Auth, and a person record is created on first sign-in
- [x] Removing an allowed email stops that person from signing in for the first time (people already signed in are handled by family membership in later tickets)
- [x] Signing out ends the session
- [x] A signed-in visitor to `/` is redirected to `/dashboard`; a signed-out visitor to any app route is redirected to `/`
- [x] API tests cover the super admin, an allowed email, a rejected email, and allowed-email management by the super admin and by a non-admin

## Comments

**Implemented.** The gate runs before the person row is inserted. A person who already has a row can keep calling the API after their email is removed; a new Google identity with that email is rejected. Family membership in later tickets decides what an existing person can still do.

- `SUPER_ADMIN_EMAIL` is an API binding (local `.dev.vars`, staging secret). Comparison ignores case.
- Allowed emails are stored lowercase. `GET` and `POST /allowed-emails`, and `DELETE /allowed-emails/:email`, are super-admin only.
- A body that isn't an email answers `invalid_request`.
- The landing page signs in with Google through Supabase. A rejection lands on `/?error=not_allowed_email`. Sign-out clears the Supabase session.
- `/dashboard` sits under a pathless layout that sends a signed-out visitor to `/`. The deploy job sets the web Worker's `API_URL` from the API's workers.dev address.

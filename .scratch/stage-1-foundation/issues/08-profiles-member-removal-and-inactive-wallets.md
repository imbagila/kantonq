# 08: Profiles, member removal and inactive wallets

**What to build:** An owner creates a profile (a member without a login, such as a child) who can own wallets and be a spender, and later upgrades the profile to a login member by inviting an email for it, keeping its history. An owner removes a member who left: the member becomes inactive, their history stays, and wallets whose only active owner they were become inactive. Inactive wallets are read-only but still count in net worth, and an owner can reactivate them. Shared wallets stay active while another owner remains.

Covers user stories 15–21 and 41.

**Blocked by:** 05 (Invites and roles), 06 (Wallets, adjustments and balances)

**Status:** ready-for-agent

- [ ] An owner can create a profile with a display name; the profile can own wallets
- [ ] An owner can invite an email for an existing profile; when accepted, that person takes over the profile and keeps its history and wallets
- [ ] An owner can remove a member, who becomes inactive and can no longer act in the family; their past records stay intact
- [ ] Removing a member deactivates every wallet whose only active owner they were; wallets with another active owner stay active
- [ ] The last owner can't be removed, with a stable error code
- [ ] Every write against an inactive wallet is refused with a stable error code, except reactivation by an owner
- [ ] Inactive wallets still count toward net worth on the dashboard and are shown as inactive in the wallet list
- [ ] API tests cover profiles, upgrade by invite, removal, wallet deactivation for sole and shared owners, writes refused on inactive wallets, and reactivation

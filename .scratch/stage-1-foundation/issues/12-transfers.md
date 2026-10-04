# 12: Transfers

**What to build:** Editors record moving money between two of the family's wallets, so it isn't counted as income or spending. A transfer takes money out of one wallet and puts it into another, in the same currency (cross-currency transfers come in ticket 15). Transfers carry tags and a note, can be edited and deleted with history, and are listed on `/transfers`.

Covers user story 46.

**Blocked by:** 10 (Expenses)

**Status:** ready-for-agent

- [ ] Editors and owners can record a transfer with a from wallet, a to wallet, an amount, date and time, tags and note
- [ ] A transfer whose two wallets are the same is refused with a stable error code
- [ ] A transfer to a wallet in another family is refused
- [ ] A transfer between wallets of different currencies is refused until ticket 15 adds cross-currency support
- [ ] Both wallet balances change correctly, and net worth is unchanged by a transfer
- [ ] Transfers never count as income or expense, and never count against a budget
- [ ] Transfers can be edited and deleted, with history entries in the same database transaction
- [ ] `/transfers` lists transfers newest first, with a recording form
- [ ] API tests cover recording, validation, balances on both sides, edit, delete and history

# 11: Incomes and income categories

**What to build:** Owners and editors create income categories such as Gaji and Freelance, with optional subtypes (for example per project) and never a limit. Editors record incomes with an amount, wallet, income category, optional subtype, date and time, plus tags and a note, on `/income`. Incomes can be edited and deleted with history, like expenses.

Covers user stories 43 and 86–88.

**Blocked by:** 10 (Expenses)

**Status:** ready-for-agent

- [ ] Owners and editors can create, rename and archive income categories, and add, rename and remove their subtypes; there is no way to set a limit
- [ ] Editors and owners can record an income with amount, wallet, income category, optional subtype, date and time, tags and note
- [ ] A subtype that doesn't belong to the chosen income category is refused with a stable error code
- [ ] Incomes can be edited and deleted, with history entries in the same database transaction
- [ ] `/income` lists incomes newest first, with a recording form
- [ ] Wallet balances and the dashboard reflect incomes
- [ ] API tests cover income categories, subtypes, recording, validation, edit, delete, history and balance effects

# 10: Expenses

**What to build:** Editors record money going out. An expense has an amount, a wallet, a budget (required), an optional subtype of that budget, a date and time, and a spender who defaults to the recorder. Transactions can carry tags (such as "lebaran 2026") and a note. Expenses can be edited and deleted (deletes keep history), each change is in the transaction's history, and times are shown in the member's own time zone. `/expenses` lists them, and wallet balances and the dashboard reflect them. This ticket sets up the tag, note, edit, delete and list plumbing that incomes, transfers and debts reuse.

Covers user stories 44, 45, 52, 58–61 and 64 (and 62 for expenses).

**Blocked by:** 06 (Wallets, adjustments and balances), 09 (Budgets, subtypes and built-in budgets)

**Status:** ready-for-agent

- [ ] Editors and owners can record an expense with amount, wallet, budget, optional subtype, date and time, spender (default: the recorder), tags and note
- [ ] An expense without a budget is refused with a stable error code
- [ ] A subtype that doesn't belong to the chosen budget is refused with a stable error code
- [ ] Archived budgets can't be chosen for new expenses
- [ ] Tags are per family and reusable across transactions
- [ ] Expenses can be edited and deleted; a delete sets the deleted marker and the expense stops counting toward the balance
- [ ] Every create, edit and delete writes a history entry in the same database transaction, and the expense's history is viewable
- [ ] Times are shown in the viewing member's time zone
- [ ] `/expenses` lists expenses newest first, with a form using the member's default wallet and fast amount entry
- [ ] The wallet balance and the dashboard update after an expense is recorded, edited or deleted
- [ ] Viewers and writes against inactive wallets are refused
- [ ] API tests cover recording, budget and subtype validation, spender, tags, notes, edit, delete, history and balance effects

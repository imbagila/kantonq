# 13: Fees

**What to build:** Editors add one or more fees to any income, expense or transfer, so admin charges are captured. A fee is its own expense, linked to its parent and taken from the same wallet (ADR 0006). A fee on an expense defaults to that expense's budget; a fee on a transfer or income defaults to the built-in budget "Biaya". The fee's budget and subtype can be changed. A transaction and its fees save or fail together, so there is never half a transfer.

Covers user stories 47–51.

**Blocked by:** 10 (Expenses), 11 (Incomes and income categories), 12 (Transfers)

**Status:** ready-for-agent

- [ ] Editors and owners can add one or more fees when recording or editing an income, expense or transfer
- [ ] Each fee is an expense linked to its parent and taken from the parent's wallet (the from wallet for a transfer)
- [ ] A fee on an expense defaults to the expense's budget; a fee on a transfer or income defaults to "Biaya"
- [ ] The fee's budget and subtype can be changed, following the same validation as any expense
- [ ] The parent and its fees are written in one database transaction: if any fee is invalid, nothing is saved
- [ ] Deleting a parent also deletes its fees; history entries are written for each
- [ ] Fees appear in the wallet's balance and in their budget's expenses
- [ ] Forms for income, expense and transfer let the member add and remove fees
- [ ] API tests cover fee defaults for each parent kind, changing the budget, all-or-nothing saving, deletion and balance effects

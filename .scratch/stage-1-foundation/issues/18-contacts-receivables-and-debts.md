# 18: Contacts, receivables and debts

**What to build:** Money lent to friends is no longer forgotten. Editors keep a list of contacts outside the family. Lending money from a wallet to a contact creates a receivable; borrowing from a contact into a wallet creates a debt. Neither counts as an expense or income, nor touches any budget. Partial or full repayments against a wallet reduce what's outstanding, and an optional due date is stored for later reminders. Forgiving the rest of a receivable records an expense in "Hutang Piutang"; being forgiven the rest of a debt records an income. Each contact shows outstanding receivables and debts with their repayment history, and net worth includes them.

Covers user stories 89–97 and the rest of 99.

**Blocked by:** 07 (Dashboard: net worth and wallets by owner), 10 (Expenses)

**Status:** ready-for-agent

- [ ] Editors and owners can create, rename and archive contacts
- [ ] Editors and owners can record lending from a wallet to a contact, creating a receivable owned by a member, with an optional due date
- [ ] Editors and owners can record borrowing from a contact into a wallet, creating a debt owned by a member, with an optional due date
- [ ] Lending and borrowing change wallet balances but never count as income or expense and never touch a budget
- [ ] Partial and full repayments against a wallet reduce the outstanding amount; a repayment larger than the outstanding amount is refused with a stable error code
- [ ] Forgiving the rest of a receivable records an expense in "Hutang Piutang" and closes it; being forgiven the rest of a debt records an income and closes it
- [ ] Every debt-related transaction writes history and can be edited or deleted like other transactions
- [ ] The money calculations module adds receivables and subtracts debts in net worth, tested with worked examples
- [ ] `/debts` lists contacts with their outstanding receivables and debts and each one's repayment history
- [ ] The dashboard's net worth includes receivables and debts
- [ ] API tests cover contacts, lending, borrowing, repayments, overpayment refusal, both kinds of forgiveness, and net worth effects

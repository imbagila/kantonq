# 06: Wallets, adjustments and balances

**What to build:** Members represent every place the family's money sits. A wallet is cash, a bank account, an e-wallet, a credit card or paylater; it holds IDR or USD and has one or more owning members. A starting balance is recorded as an adjustment, and later adjustments with a reason match the app to the real bank balance. Balances are always calculated from transactions, never stored (ADR 0004), and liability wallets show what is owed. This is the first transaction kind, so it also introduces transaction history and fast amount entry ("450rb", "2jt", "Rp 2.000.000").

Covers user stories 30–40, 42, 62 and 63.

**Blocked by:** 04 (Families: create, switch and settings)

**Status:** ready-for-agent

- [ ] Editors and owners can create a wallet with a kind, a currency (IDR or USD), a name, an icon and one or more owning members from the family
- [ ] An optional starting balance is recorded as an adjustment transaction, not stored on the wallet
- [ ] Editors and owners can record an adjustment with a reason against a wallet
- [ ] The money calculations module computes a wallet's balance from its transactions, for both normal and liability wallets, tested with worked examples
- [ ] Credit card and paylater wallets show the amount owed; they can store an optional credit limit (with remaining credit shown), a statement day and a due day
- [ ] Wallets can be renamed, re-ordered and given an icon
- [ ] `/wallets` lists all wallets grouped by owner, with balances
- [ ] Each member can choose a default wallet, which new transaction forms start with
- [ ] Amounts are stored as integers in minor units; the money calculations module parses "450rb", "2jt" and similar input and formats rupiah as "Rp 2.000.000" and USD amounts correctly, tested with worked examples
- [ ] Every create, edit and delete of an adjustment writes a history entry (member, time, action, changed fields) in the same database transaction, and members can view a transaction's history
- [ ] IDs are UUIDv7; deleting an adjustment sets a deleted marker and removes it from the balance
- [ ] The API never accepts a client-sent balance
- [ ] API tests cover wallet creation with and without a starting balance, adjustments, liability balances, ordering, default wallet, history, and viewer refusal

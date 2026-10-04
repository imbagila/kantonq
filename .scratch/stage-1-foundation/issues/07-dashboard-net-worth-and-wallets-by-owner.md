# 07: Dashboard: net worth and wallets by owner

**What to build:** `/dashboard` gives the family one picture of its money at a glance: net worth, and every wallet's balance grouped by owner. Net worth adds normal wallets and subtracts liability wallets. Later tickets add their pieces to this dashboard: USD conversion (15), budget cards (16), and receivables and debts (18).

Covers parts of user stories 98 and 99.

**Blocked by:** 06 (Wallets, adjustments and balances)

**Status:** ready-for-agent

- [ ] The money calculations module computes net worth from wallets with balances, adding normal wallets and subtracting liability wallets, tested with worked examples
- [ ] The API returns the dashboard figures computed by the money calculations module; nothing is stored
- [ ] `/dashboard` shows net worth and wallet balances grouped by owner, in both languages and at phone width
- [ ] API tests cover net worth for a family with normal and liability wallets

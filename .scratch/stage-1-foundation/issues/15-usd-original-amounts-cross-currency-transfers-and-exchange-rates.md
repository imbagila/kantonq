# 15: USD: original amounts, cross-currency transfers and exchange rates

**What to build:** Some charges are in US dollars. An editor records a USD charge paid from an IDR wallet with both the dollar amount and the rupiah amount, so the real cost is kept. If the rupiah amount isn't known yet, it is filled from the latest exchange rate. A transfer between an IDR wallet and a USD wallet records both amounts, keeping the rate actually received. Exchange rates come from Frankfurter and are stored per day. Net worth and dashboard totals convert USD balances to rupiah at the latest rate.

Covers user stories 55–57 and 100.

**Blocked by:** 07 (Dashboard: net worth and wallets by owner), 10 (Expenses), 12 (Transfers)

**Status:** ready-for-agent

- [ ] When a rate is needed, the API fetches it from Frankfurter and stores it per currency pair and date; "latest rate" means the most recent stored rate
- [ ] A transaction on an IDR wallet can carry an original amount and currency (USD); the wallet amount is in rupiah
- [ ] If the rupiah amount is omitted for a USD charge, it is filled from the latest rate
- [ ] A transfer between wallets of different currencies requires both amounts, and is refused with a stable error code if either is missing
- [ ] Wallet balances use each wallet's own currency; USD wallets keep a USD balance
- [ ] The money calculations module converts USD balances to rupiah at a given rate for net worth, tested with worked examples
- [ ] The dashboard shows net worth in rupiah, including converted USD wallets
- [ ] The forms show the original amount and both amounts of a cross-currency transfer
- [ ] API tests cover original amounts, rate filling, cross-currency transfers, and net worth with USD wallets (the Frankfurter call is replaced by a test double at the HTTP boundary)

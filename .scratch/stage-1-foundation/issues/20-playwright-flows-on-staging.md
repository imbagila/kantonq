# 20: Playwright flows on staging

**What to build:** Two end-to-end flows prove the deployed app works as a whole, running against staging with the test-only email-and-password user. First, a member signs in, adds an expense and sees it reflected on the dashboard. Second, a member records a transfer with a fee and sees both wallet balances change and the fee appear in "Biaya".

**Blocked by:** 02 (Staging environments and CI/CD), 07 (Dashboard: net worth and wallets by owner), 13 (Fees)

**Status:** ready-for-agent

- [ ] Playwright is set up in the repo and signs in to staging with the test-only user (credentials from secrets, never committed)
- [ ] Flow 1: sign in, add an expense, and see the wallet balance and net worth change on the dashboard
- [ ] Flow 2: record a transfer with a fee, and see both wallet balances and the fee in "Biaya"
- [ ] The flows create their own data and don't depend on what earlier runs left behind
- [ ] GitHub Actions runs the flows after each staging deploy

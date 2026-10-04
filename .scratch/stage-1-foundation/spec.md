# Stage 1: Foundation

Status: ready-for-agent

Source: `docs/SPEC.md` (stage 1 in section 16). Vocabulary follows `CONTEXT.md`. Respects ADRs 0001, 0003, 0004, 0005, 0006, 0007 and 0010.

## Problem Statement

My family's money is spread across cash, several bank accounts, e-wallets, credit cards and paylater. My wife, my kids and I each own some of these wallets. Nobody can see in one place how much we have, where it went, or whether we're staying inside what we planned to spend on food, the kids or a trip. Fees on transfers and top-ups disappear unnoticed. Money lent to friends is forgotten. Some charges are in US dollars and some are not. The general-purpose apps I've tried don't fit how my family thinks about money. We think in budgets like "Makan", "Anak" or "Jakarta" that are themselves the category, and we want everyone in the family to see everything.

## Solution

A web app where a family, invited by Google email, shares one picture of its money:

- Each member records incomes, expenses and transfers against the family's wallets, with fees captured as their own expenses.
- Every expense is placed in a budget, and optionally a subtype of that budget.
- Budgets repeat daily, weekly, monthly or yearly, or cover one fixed date range. They can be shared or individual, and they carry leftover and overspent amounts forward.
- Wallets can hold rupiah or US dollars, and USD charges paid from rupiah wallets keep both amounts.
- Money lent to or borrowed from contacts is tracked until repaid or forgiven.
- Everything can be tagged, noted, searched and filtered. Every transaction shows who created and changed it.
- Balances and net worth are always correct, because they are calculated from transactions, never typed in.

This stage is online-only. Offline sync is stage 2, Android is stage 3.

## User Stories

### Access and sign-in

1. As the super admin, I want my Google account to always be allowed to sign in, so that I can never lock myself out.
2. As the super admin, I want to add and remove allowed emails, so that only people I approve can use kantonq.
3. As a person whose email isn't allowed, I want a clear message when I try to sign in, so that I know I need an invite.
4. As an allowed person, I want to sign in with Google, so that I don't need another password.
5. As a signed-in person with no family yet, I want to create a family, so that I can start recording money.
6. As a person who belongs to several families, I want to switch between them, so that I can manage both my parents' family and my own.
7. As a signed-in member, I want the app to remember the last family I used, so that I land in the right place.
8. As a member, I want to sign out, so that nobody else can use my session on a shared computer.

### Families and members

9. As an owner, I want to invite someone by their Google email, so that they can join my family.
10. As an owner, I want my invite to automatically allow that email to sign in, so that I don't need the super admin for family members.
11. As an invited person, I want to join the family the first time I sign in with the invited email, so that joining needs no extra steps.
12. As an owner, I want to cancel an invite that hasn't been accepted, so that a mistaken email can't join.
13. As an owner, I want to give each member the owner, editor or viewer role, so that I control who can change things.
14. As an owner, I want a family to be able to have several owners, so that my wife and I both manage it.
15. As an owner, I want to create a profile for my child without a login, so that the child can own wallets and be a spender.
16. As an owner, I want to upgrade a profile to a login member by inviting an email for it, so that my child keeps their history when they get their own account.
17. As an owner, I want to remove a member, so that someone who left no longer has access.
18. As an owner, I want a removed member's history to stay, so that past records remain complete.
19. As an owner, I want wallets owned only by a removed member to become inactive, so that nobody records new transactions against them by mistake.
20. As an owner, I want a shared wallet to stay active when one of its owners is removed, so that the remaining owner can keep using it.
21. As an owner, I want to reactivate an inactive wallet, so that I can use it again if needed.
22. As an owner, I want the family to always keep at least one owner, so that the family can't become unmanageable.
23. As an editor, I want to create and change records but not manage members, so that roles are respected.
24. As a viewer, I want to see everything but change nothing, so that I can follow the family's money safely.
25. As a member, I want to see every wallet, budget and transaction in my family, so that we share one picture of our money.
26. As a member, I want never to see another family's data, so that families stay separate.
27. As a member, I want to set my own time zone (default WIB), so that dates and my individual budgets follow where I live.
28. As an owner, I want to set the family's home time zone (default WIB), so that shared budgets have one boundary for everyone.
29. As a member, I want to choose Indonesian or English, so that I can use the language I prefer.
30. As a member, I want to choose my default wallet, so that new transactions start with the wallet I use most.

### Wallets

31. As a member, I want to create wallets of kind cash, bank account, e-wallet, credit card or paylater, so that every place our money sits is represented.
32. As a member, I want a wallet to have one or more owners, so that joint accounts are represented correctly.
33. As a member, I want a wallet to hold IDR or USD, so that a dollar account keeps its own balance.
34. As a member, I want to set a starting balance when I create a wallet, so that existing money is accounted for. This is recorded as an adjustment.
35. As a member, I want a wallet's balance to always be calculated from its transactions, so that it can never silently drift.
36. As a member, I want to record an adjustment with a reason, so that I can match the app to my real bank balance.
37. As a member, I want credit card and paylater wallets to show what I owe rather than what I hold, so that net worth is correct.
38. As a member, I want to set a credit limit on a liability wallet, so that I can see how much I can still spend.
39. As a member, I want to store a liability wallet's statement date and due date, so that the dates are ready for reminders in a later stage.
40. As a member, I want to rename, re-order and choose an icon for wallets, so that the list is easy to scan.
41. As a member, I want inactive wallets to be read-only but still counted in net worth, so that money that exists is never ignored.
42. As a member, I want to see all wallets grouped by owner with their balances, so that I know who holds what.

### Recording transactions

43. As an editor, I want to record an income with an amount, wallet, income category, optional subtype, date and time, so that money coming in is tracked.
44. As an editor, I want to record an expense with an amount, wallet, budget, optional subtype, date and time, so that money going out is tracked.
45. As an editor, I want an expense to be impossible to save without a budget, so that every expense is placed.
46. As an editor, I want to record a transfer between two family wallets, so that moving money isn't counted as spending.
47. As an editor, I want to add one or more fees to any income, expense or transfer, so that admin charges are captured.
48. As an editor, I want a fee on an expense to default to that expense's budget, so that the cost of something stays with it.
49. As an editor, I want a fee on a transfer or income to default to the built-in budget "Biaya", so that fees are collected in one place.
50. As an editor, I want to change a fee's budget and subtype, so that I can place it where it really belongs.
51. As an editor, I want a transaction and its fees to save or fail together, so that I never end up with half a transfer.
52. As an editor, I want to set the spender of an expense, defaulting to me, so that spending is attributed to the right person.
53. As an editor, I want to split an expense into items, each with its own amount, budget and subtype, so that a mixed shopping trip lands in the right budgets.
54. As an editor, I want the items to add up to the expense total, so that a split can't create or lose money.
55. As an editor, I want to record a USD charge paid from an IDR wallet with both the dollar amount and the rupiah amount, so that I know what it really cost.
56. As an editor, I want the rupiah amount to be filled from the latest exchange rate when I don't know it, so that I can still record the charge.
57. As an editor, I want a transfer between an IDR wallet and a USD wallet to record both amounts, so that the rate I actually got is kept.
58. As an editor, I want to add tags to transactions, so that I can group things across budgets, for example "lebaran 2026".
59. As an editor, I want to add a note to a transaction, so that I remember why I spent it.
60. As an editor, I want to edit a transaction, so that I can fix mistakes.
61. As an editor, I want to delete a transaction, so that I can remove a duplicate. It's marked deleted, so history stays.
62. As a member, I want to see each transaction's history (who created and changed it, and when), so that the family can trust the records.
63. As a member, I want amounts shown in rupiah format ("Rp 2.000.000") and entered quickly ("450rb", "2jt"), so that entry is fast.
64. As a member, I want transactions shown in my own time zone, so that "today" means my today.

### Budgets

65. As an owner or editor, I want to create a budget with a name, an optional limit and a period, so that our spending plan is represented.
66. As an owner or editor, I want a budget without a limit to work as a plain category, so that "Lain-lain" doesn't need a number.
67. As an owner or editor, I want to add, rename and remove subtypes inside a budget, so that "Jakarta" can have Makan, Minum and Entertainment.
68. As a member, I want subtypes to belong to one budget only, so that Jakarta's Entertainment and Bandung's Entertainment stay separate.
69. As a member, I want an expense under Jakarta / Entertainment to count only against Jakarta, so that the limit lives with the budget, never with a subtype or another budget of the same name.
70. As an owner or editor, I want periods that are daily, weekly (from Monday), monthly (from a day I choose) or yearly (from January), so that each budget matches how I plan.
71. As an owner or editor, I want a one-off budget with a start and end date, so that a trip has its own money.
72. As a member, I want an ended one-off budget hidden from the budget picker but kept in reports, so that the picker stays short.
73. As an owner or editor, I want a budget to be shared or individual to one member, so that both family and personal plans fit.
74. As a member, I want only expenses whose spender is the budget's member to count against an individual budget, so that my child's budget reflects the child's spending.
75. As a member, I want a shared budget's periods to follow the family's home time zone, and an individual budget's to follow its member's time zone, so that boundaries are predictable.
76. As a member, I want to see each budget's limit, spent amount, carry-over and remaining amount for the current period, so that I know where I stand.
77. As a member, I want overspending to be allowed and clearly shown, so that a real purchase is never blocked.
78. As an owner or editor, I want carry-over on by default and switchable per budget, so that leftover money isn't lost unless I choose.
79. As a member, I want overspent amounts to carry over too, so that next period honestly shows less available.
80. As an owner or editor, I want a limit change to apply only to the current and future periods, so that past periods stay as they were.
81. As a member, I want to browse a budget's past periods, so that I can see how each one went.
82. As an owner or editor, I want to set alert thresholds per budget (default 80% and 100%), so that they're ready for Telegram alerts in a later stage.
83. As a member, I want the built-in budgets "Biaya" and "Hutang Piutang" to always exist, so that fees and forgiven debts always have a home.
84. As an owner, I want built-in budgets to be impossible to delete, so that the system's rules keep working.
85. As an owner or editor, I want to archive a budget that's no longer used, so that old expenses keep their budget.

### Income categories

86. As an owner or editor, I want to create income categories such as Gaji and Freelance, so that income is grouped.
87. As an owner or editor, I want subtypes inside an income category, so that Freelance can be split by project.
88. As a member, I want income categories never to have limits, so that they stay simple.

### Debts

89. As an editor, I want to keep a list of contacts outside the family, so that I can record who I lend to or borrow from.
90. As an editor, I want to record lending money from a wallet to a contact, so that the receivable is tracked.
91. As a member, I want lending not to count as an expense or touch any budget, so that budgets reflect real spending.
92. As an editor, I want to record borrowing money from a contact into a wallet, so that the debt is tracked.
93. As an editor, I want to record a partial or full repayment against a wallet, so that the outstanding amount stays correct.
94. As an editor, I want to set an optional due date on a receivable or debt, so that it's ready for reminders in a later stage.
95. As an editor, I want to forgive the rest of a receivable, recording it as an expense in "Hutang Piutang", so that the books close honestly.
96. As an editor, I want to record being forgiven the rest of a debt as an income, so that the books close honestly.
97. As a member, I want to see each contact's outstanding receivables and debts with their repayment history, so that nothing is forgotten.

### Net worth and lists

98. As a member, I want a dashboard with net worth, wallet balances by owner, and budgets for the current period, so that I see the whole picture at a glance.
99. As a member, I want net worth to add wallets (including inactive ones) and receivables, and subtract liability wallets and debts, so that it reflects reality.
100. As a member, I want USD balances converted to rupiah at the latest rate in totals, so that net worth is in one currency.
101. As a member, I want to list transactions newest first, with fast scrolling through thousands of records, so that history stays usable.
102. As a member, I want to search transactions by note and item names, so that I can find "susu" quickly.
103. As a member, I want to filter by date range, wallet, budget, subtype, income category, member (spender or recorder), tag, kind and amount range, so that I can answer any question about our money.
104. As a member, I want my filters reflected in the URL, so that I can bookmark or share a view with my family.

### Look and feel

105. As a member, I want the web app to follow my system's light or dark mode, so that it's comfortable to use.
106. As a member, I want the app to work well on a phone browser, so that I can record on the go before the Android app exists.
107. As a logged-in visitor to `/`, I want to go straight to `/dashboard`, so that I don't see the landing page every time.
108. As a logged-out visitor to any app page, I want to be sent to `/`, so that private pages are protected.

## Implementation Decisions

### Repository and tooling

- A Bun workspaces monorepo with the web app, the API, the database package and the shared package. The Android app is added in stage 3.
- `oxlint` and `oxfmt` replace ESLint and Prettier. TypeScript strict mode everywhere.
- GitHub Actions runs type-checking, lint, format check and all tests, and deploys the web app and API to the staging `*.workers.dev` addresses. This needs the GitHub repository to exist first, which is a human step.

### Modules

- **Shared package: validation.** Schemas for every request and response. Used by the API to validate input and by the web app for forms, so client and server agree.
- **Shared package: money calculations** (a test seam). A deep module of pure functions over plain data, with no I/O. Its public interface:
  - **Balance of a wallet**, given its transactions.
  - **Net worth**, given wallets with balances, receivables, debts and an exchange rate.
  - **Budget status**, given a budget (limit history, period rule, carry-over flag, shared or individual), its expenses and items, a time zone and a moment. It returns the current period's start and end, limit, spent amount, carry-over in, and remaining amount.
  - **Budget period list**, giving past periods with the same figures.
  - **Amount parsing and formatting** for rupiah ("450rb", "2jt", "Rp 2.000.000") and USD.

  The API and the web app both use it. Stage 2 runs it in the browser on local data.
- **Database package.** Drizzle schema and migrations for Supabase Postgres, plus row-level security policies scoped to family membership.
- **API.** Hono on Cloudflare Workers.
  - It verifies the Supabase JWT on every request and resolves the member and role for the requested family.
  - It runs every multi-step write in one Drizzle transaction, through Hyperdrive.
  - It never trusts a client-sent balance, total or role.
- **Web.** TanStack Start with shadcn/ui and Tailwind CSS.
  - `/` is rendered on the server (a placeholder landing page until stage 7).
  - App routes are client-only: `/dashboard`, `/income`, `/expenses`, `/transfers`, `/wallets`, `/budgets`, `/debts`, `/family`, `/settings`.
  - Data comes from TanStack Query against the API. Forms use TanStack Form, transaction lists use TanStack Table and Virtual, and search input is debounced with TanStack Pacer.
  - Interface strings are in Indonesian and English.

### Data model (entities, not code)

- **Person:** a Google identity, with language.
- **Allowed email:** maintained by the super admin and by invites.
- **Family:** has a home time zone.
- **Member:**
  - links a person, or nothing for a profile, to a family
  - has a role, a time zone, a default wallet, an active or inactive state and a display name
- **Invite:** a family, an email, an optional profile it upgrades, an inviting member and a state.
- **Wallet:** a family, a kind, a currency, a name, an icon, an order and an active state.
  - Liability wallets also have an optional credit limit, statement day and due day.
  - A wallet has one or more owning members.
- **Transaction:**
  - **Kind:** income, expense, transfer, adjustment, lending, borrowing, receivable repayment, debt repayment, or forgiveness.
  - **Common fields:** a family, a wallet, an amount in minor units with the wallet's currency, and an occurred-at time.
  - **Optional fields:** an original amount and currency, a counter wallet and counter amount (transfers), a recorder and spender, a budget and subtype (expenses), and an income category and subtype (incomes).
  - **Links:** a parent transaction (for fees) and a receivable or debt (for debt kinds).
  - **Other:** a note and a deleted marker.
- **Item:** belongs to an expense, with a name, optional quantity, amount, budget and optional subtype.
- **Tag:** per family, many-to-many with transactions.
- **Budget:**
  - a family and a name
  - shared, or individual with an owning member
  - a period rule: kind, plus anchor day for monthly or start and end dates for one-off
  - a carry-over flag, alert thresholds, a built-in flag and an archived flag
- **Budget limit:** a budget, an amount and the period it's effective from. A history, so limit changes never rewrite the past.
- **Subtype:** belongs to one budget.
- **Income category** and **income subtype:** the same shape, with no limits.
- **Contact:** per family.
- **Receivable or debt:** a family, a contact, a member, a direction, a principal, an optional due date and a state.
- **History entry:** a transaction, a member, a time, an action and the changed fields.
- **Exchange rate:** a currency pair, a date and a rate.

### Rules enforced by the API

- **Families and access:**
  - Every family-scoped request is addressed by family, and the caller must be an active member of it. Viewers can't write. Only owners manage members, invites and family settings.
  - The last owner can't be removed or demoted.
  - Removing a member makes them inactive and deactivates wallets whose only active owner they were.
  - No writes against inactive wallets, except reactivation by an owner.
- **Validating transactions:**
  - Expenses require a budget.
  - Subtypes must belong to the chosen budget or income category.
  - Items must sum to their expense's amount.
  - A transfer's two wallets must differ and belong to the same family.
  - Cross-currency transfers require both amounts.
- **Fees:** created in the same database transaction as their parent, with the default budget rule from ADR 0006.
- **Built-in budgets:** "Biaya" (with subtypes Admin Transfer, Admin Bulanan, Biaya Kurs) and "Hutang Piutang" are created with every family and can't be deleted.
- **Money:** amounts are integers in minor units, never floating point. Balances, budget figures and net worth are always computed using the money calculations module, never stored (ADR 0004).
- **Exchange rates:** fetched from Frankfurter when a rate is needed and stored per day. "Latest rate" means the most recent stored rate.
- **History:** every create, edit and delete of a transaction writes a history entry in the same database transaction.
- **IDs and deletes:** IDs are UUIDv7. Deletes set a deleted marker.

### API shape

- REST over JSON, with resources nested under a family.
- Request and response bodies are validated with the shared schemas.
- Errors have a stable machine-readable code (for example `not_allowed_email`, `forbidden_role`, `items_do_not_sum`) plus a message in the member's language.
- List endpoints use cursor pagination and accept the same filter set as user story 103.

### Auth

- Supabase Auth with Google as the only provider in production.
- The super admin email comes from configuration.
- On first sign-in, the API rejects people who aren't allowed (super admin, an allowed email, or a pending invite). It accepts pending invites automatically.
- The staging project additionally enables a test-only email-and-password user for the Playwright flows. That login method is never enabled in production.

## Testing Decisions

- **Approach:** test-driven development, following the `tdd` skill. Red, then green, one vertical slice at a time. Each test exercises behaviour through a seam's public interface, and expected values come from worked examples, never recomputed the way the code does. Refactoring happens in review.
- **Seam 1: the API over HTTP** (the main seam). Tests send HTTP requests to the Hono app, backed by a real Postgres in a Podman container locally and a service container in CI, with authentication tokens signed by a test key. They assert only on HTTP responses, never by querying the database. This covers:
  - every write and read in the user stories
  - role enforcement and family separation
  - the allowed-email gate and invites
  - fees saving or failing together with their parent
  - item sums, USD handling, debts and forgiveness
  - search and filters, and history
- **Seam 2: the money calculations module.** Plain data in, results out. This covers:
  - balances of normal and liability wallets
  - net worth with USD conversion, receivables and debts
  - period boundaries for every period kind in different time zones, including month-start days such as the 31st in short months
  - carry-over of leftover and overspent amounts across several periods, and carry-over switched off
  - limit changes that leave earlier periods unchanged
  - individual budgets counting only their member's spending
  - items split across budgets
  - amount parsing and formatting
- **Seam 3: Playwright** against staging with the test-only user:
  - signing in, then adding an expense and seeing it on the dashboard
  - recording a transfer with a fee, then seeing both wallet balances and the fee in "Biaya"
- **No tests against internals** (database rows, private helpers, component internals). There is no prior art yet; these become the patterns for later stages.

## Out of Scope

- **Later stages:**
  - offline sync, the service worker, the installable app and export (stage 2)
  - the Android app (stage 3)
  - investments (stage 4)
  - Telegram, notifications, alerts, reminders, monthly reports and recurring rules (stage 5)
  - AI captures and receipt photos (stage 6)
  - the real landing page, invite requests and the admin page (stage 7)

  Stage 1 stores alert thresholds and due dates but never sends anything.
- **Admin interface:** the super admin manages allowed emails through the API only in this stage. The admin interface is stage 7.
- **Out of version 1 entirely:** private wallets or records, limits on subtypes, and debts with family members.
- **Production deployment** to `kantonq.com`. Stage 1 deploys to staging only.

## Further Notes

- **Glossary gap:** `CONTEXT.md` defines a transaction as income, expense or transfer, but stage 1 also needs adjustment, lending, borrowing, repayment and forgiveness as transaction kinds. Glossary entries exist for Adjustment, Repayment and Forgiveness, but the definition of Transaction should be widened. That's a `/domain-modeling` follow-up.
- **Open question for stage 3:** the money calculations module is TypeScript, but the Android app must compute balances and budget status on its own local data. Options are a Kotlin port tested against the same worked examples, or expressing the calculations as SQL that runs on both clients' local databases. Decide before stage 3, not now.
- **Free-tier note:** keep each API request's CPU use small. Cloudflare's free plan allows 10 ms per request, and waiting on the database doesn't count toward it.

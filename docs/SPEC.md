# kantonq specification

This document records what kantonq does and the rules it follows. Terms in **bold** are defined in [`CONTEXT.md`](../CONTEXT.md). The reasons behind the larger choices are in [`docs/adr/`](./adr/).

## 1. Product

- kantonq is a money manager for one person or a whole **family**. It starts with the creator's own family and is built to serve many families.
- Access is invite-only. Anyone can send an **invite request** from the landing page. The **super admin** (`roid.rabbani@gmail.com`, fixed in configuration and not changeable from the app) approves requests and manages the list of allowed emails. Each request appears on the admin page and is also sent to the super admin on Telegram.
- Login is Google only.
- The interface is in Indonesian, with English available as a per-member setting. The AI understands Indonesian and English in every channel.
- There are three channels: the web app, the Android app and a Telegram bot.

## 2. Families and permissions

- A person can be a **member** of several families and switch between them.
- The roles are **Owner**, **Editor** and **Viewer**. A family can have several owners.
  - Owners can do everything, including managing members.
  - Editors can create and change records, but cannot manage members.
  - Viewers can only read.
- **Inviting:** an owner invites a person by their Google email. This creates an **invite** and adds the email to the allowed list. The person joins when they first sign in with that email.
- **Profiles:** a member can be a **profile** with no login, for example a child. A profile can own wallets and be a spender. It can later be upgraded to a login member and keeps all its history.
- **Everyone in a family sees everything in it.** There are no private wallets, budgets or records.
- **Removing a member:**
  - The member becomes an **inactive member**, and all their history stays.
  - A wallet they owned alone becomes an **inactive wallet**. It is read-only, its balance still counts toward net worth, and an owner can reactivate it.
  - A wallet they owned with someone else stays active.
- Every transaction keeps a **history** of who created and changed it, and when. It is shown in a "Riwayat" section on the transaction.
- **Time zones:**
  - Each member has a time zone, defaulting to WIB (`Asia/Jakarta`).
  - The family has a **home time zone**, also defaulting to WIB. It is used for shared budgets and the family report.
  - Individual budgets and personal reports use the member's own time zone.

## 3. Wallets

- **Kinds:** cash, bank account, e-wallet, credit card and paylater. Credit card and paylater wallets are **liability wallets**.
- A wallet has one or more owning members and holds one currency: IDR (the default) or USD.
- A wallet's **balance** is always calculated from its transactions. It is never entered or stored as an editable number. To correct a balance, record an **adjustment**.
- **Liability wallets** have:
  - an optional credit limit, used to show how much can still be spent
  - a statement date and a due date
  - a Telegram reminder 3 days before the due date

  Paying the bill is a **transfer** from another wallet.

## 4. Transactions

### 4.1 Kinds

- **Income:** money in from outside the family. It has an **income category** and an optional subtype.
- **Expense:** money out to outside the family. It always has a **budget** and an optional **subtype**.
- **Transfer:** money between two of the family's wallets.
- **Adjustment:** a balance correction, as described in section 3.

### 4.2 Fees

- Any income, expense or transfer can have one or more **fees**.
- A fee is its own expense, linked to its parent transaction and taken from the same wallet.
- **The fee's budget by default:**
  - For a fee on an expense: the expense's budget.
  - For a fee on an income or a transfer: the **built-in budget** "Biaya".
  - Either default can be changed on each fee.
- "Biaya" comes with the subtypes "Admin Transfer", "Admin Bulanan" and "Biaya Kurs".

### 4.3 Currencies

- When a charge in USD is paid from an IDR wallet, the transaction stores both the **original amount** in USD and the rupiah amount. The rupiah amount is what the member enters (for example from the bank statement). If they don't enter one, it is calculated from the exchange rate.
- A transfer between an IDR wallet and a USD wallet records both amounts. The exchange rate is implied by the two amounts.
- Net worth and reports convert USD to rupiah at the latest exchange rate. Budgets always count in rupiah.
- Exchange rates come from Frankfurter (European Central Bank reference rates, free).

### 4.4 Other rules

- **Spender:** defaults to the **recorder** and can be changed.
- **Items:** an expense can be split into **items**. Each item has an amount, an optional quantity, a budget and an optional subtype. Tax, service charge and discount lines from a receipt are spread proportionally across the items.
- **Tags and notes:** transactions can carry **tags** and a **note**.
- **Search and filters:** search by text (note, item names), amount, date range, wallet, budget, subtype, income category, member and tag.
- **Conflicts:** if two members edit the same transaction while offline, the edit made later wins.

## 5. Budgets and income categories

- A **budget** is the top-level category of an expense. Every expense belongs to exactly one budget, or to one per item when it is split.
- **Subtypes** belong to one budget only. "Entertainment" in Jakarta is unrelated to "Entertainment" in Bandung, and unrelated to a budget named "Entertainment".
- **Limit:** optional. Without a limit, a budget is simply a category. The limit applies to the whole budget, never to a subtype.
  - Example: with a budget Entertainment of 1,000,000 and a budget Jakarta of 3,000,000, an expense of 500,000 under Jakarta / Entertainment counts only against Jakarta.
- **Periods:**
  - daily
  - weekly, starting Monday
  - monthly, starting on a chosen day of the month, for example the 25th
  - yearly, starting 1 January
  - a **one-off** fixed date range

  Period boundaries use the home time zone for shared budgets and the owning member's time zone for individual budgets.
- **Shared or individual:** a budget is a **shared budget** or an **individual budget** belonging to one member. Only expenses whose spender is that member count against an individual budget. Everyone in the family can still see it.
- **Overspending and carry-over:**
  - Overspending is allowed.
  - **Carry-over** is on by default and can be turned off per budget. Both leftover and overspent amounts carry over to the next period.
  - Example: Makan has a limit of 2,000,000 a month and is overspent by 200,000 in October. November's available amount is 1,800,000.
- **Changing a limit** affects the current and future periods only. Past periods keep the limit they had.
- **When a one-off budget ends,** it is hidden from the budget picker and stays in reports.
- **Built-in budgets** always exist and have no limit by default: "Biaya" (fees) and "Hutang Piutang" (forgiven receivables).
- **Income categories** (Gaji, Freelance and so on) have optional subtypes and never have limits.
- **Budget alerts:** sent at 80% and 100% of the limit by default. The thresholds can be changed per budget. Alerts for a shared budget go to the whole family; alerts for an individual budget go only to its member.

## 6. Debts (hutang/piutang)

- Debts are recorded with **contacts**: people outside the family. Money moving inside the family is a transfer.
- **Lending** creates a **receivable**: money leaves a wallet, but it is not an expense, and the receivable counts as an asset.
- **Borrowing** creates a **debt**: money enters a wallet, and the debt counts as a liability.
- **Repayments** can be partial. Each one is a transaction against a wallet.
- An optional due date triggers a Telegram reminder.
- **Forgiveness:** forgiving the rest of a receivable records an expense in the built-in budget "Hutang Piutang". Being forgiven the rest of a debt records an income.

## 7. Recurring rules

- **Schedules:** daily, weekly, monthly or yearly, or every N days, weeks or months. A rule can have an optional end date or a maximum number of occurrences.
- Each rule is either an **automatic rule** or a **confirm-first rule**.
  - The default is automatic for a fixed amount and confirm-first for a variable amount.
  - A confirm-first rule sends a prompt on Telegram and in the app, where the amount can be changed before recording.
- The server creates recurring transactions on schedule, so they happen even when every device is offline.

## 8. Investments

### 8.1 Gold

- Covers physical bars (Antam, UBS, Galeri24 and so on) and digital gold (Pegadaian Tabungan Emas, Pluang, Treasury and so on), recorded in grams per brand.
- Gold is valued at the brand's **buyback price** from the community API [logam-mulia-api](https://github.com/iamutaki/logam-mulia-api).
- If that source fails, the international spot price from [GoldAPI.io](https://www.goldapi.io/) (XAU/IDR) is used, fetched at most once a day to stay inside the free 100 requests a month.

### 8.2 Crypto

- Prices come from the CoinGecko Demo API in rupiah and are refreshed hourly. Any coin listed on CoinGecko can be held.

### 8.3 Holdings

- Each **holding** has an owning member and a **platform** label.
- **Buying** moves money from a wallet into a holding, fees included. It is not an expense and does not touch budgets.
- **Selling** moves money back into a wallet, fees included, and records a **realized gain** using **average cost**.
- A **snapshot** of every holding's value is saved daily. It drives the portfolio chart and the 1-, 7- and 30-day changes. The current **unrealized gain** is shown against average cost.
- Investments are always valued in rupiah.

## 9. Net worth and reports

- **Net worth** = wallets (including inactive ones) + receivables + holdings − liability wallets − debts, in rupiah.
- The **monthly report** is sent on the 1st of the month at 08:00. It uses the family's home time zone for the family group and the member's time zone for personal chats. It covers the previous calendar month, even for budgets whose month starts on another day, and includes:
  - net worth and its change from the previous month
  - income compared with expenses
  - how each budget did
  - a breakdown per member
  - investment realized and unrealized gains
- **Export:**
  - CSV and Excel (.xlsx), of either the currently filtered transactions or a full family backup.
  - The file is built on the device, so it works offline.
  - Telegram's `/export` command sends the file in chat.

## 10. Telegram bot

- **Bot and linking:** there is one kantonq bot. A member links it with a one-time code from the app's settings, which opens the bot. It works in private chats and in one optional family group per family.
- **Commands are read-only:**
  - `/start`, `/help`, `/settings`
  - `/report [today|week|month]`, `/export`
  - `/income`, `/expense`, `/transfer`
  - `/balance` (wallet balances), `/budget` (what's left)
  - `/assets` (net worth and investments), `/invest`
- New records are created by sending a normal message or a photo (section 11).
- **Transaction notifications:**
  - Each member chooses: everything in the family, only wallets they own (the default), or none.
  - The family group receives everything.
  - Transactions recorded offline are notified when they sync, labelled with their original time.
- **Other messages:**
  - budget alerts (section 5)
  - the monthly report (section 9)
  - liability wallet due dates (section 3)
  - debt due dates (section 6)
  - confirm-first recurring prompts (section 7)
  - invite requests, sent to the super admin
- **Language:** bot replies follow the member's language setting.

## 11. AI captures

- **Provider:** Google Gemini on its free tier, called through TanStack AI. On the free tier, Google may use the data to improve its products; this was accepted.
- **Kinds of capture:**
  - receipt photos (OCR plus understanding), from the web app, the Android app and Telegram
  - free-text messages in Indonesian or English, from the same three places
- **What a capture can do:**
  - create incomes, expenses (with items), transfers with fees, and investment buys and sells
  - answer questions such as "sisa budget makan berapa?"
  - edit or delete records. These always become a **draft**, whatever the mode.
- **Modes:**
  - Each member chooses **auto-save mode** or **ask-first mode**, separately for receipts and for text. The default for both is ask-first.
  - Even in auto-save mode, a capture becomes a draft when the AI is unsure, or when a wallet, budget or subtype it needs doesn't exist. In that case it suggests creating the missing subtype.
- **Defaults when not stated:** the member's default wallet, unless one is named ("pakai gopay"), and the current time, unless a date is given ("kemarin", "tanggal 3").
  - Example: "beli susu anak 450rb" becomes an expense of 450,000 rupiah, budget Anak, subtype Susu, from the member's default wallet, at the current time.
- **Confirming drafts:**
  - On Telegram: a summary with Simpan / Ubah / Batal buttons.
  - In the apps: a pre-filled form.
- **Offline:** captures are queued on the device and processed once back online. The member is then notified, or asked to confirm.
- **When the Gemini quota is used up:**
  - The member is told the quota has run out.
  - The capture is kept and retried automatically after the quota resets.
  - A "Tambah manual" action lets the member enter it by hand immediately instead.
- **Receipt photos:** compressed to about 100–200 KB and stored with the transaction. Each member sets how long their photos are kept: 30, 60 or 90 days, default 30. After the photo is deleted, the transaction and its items stay.

## 12. Offline and sync

- The web app and the Android app are both offline-first. All reading and writing works without a connection.
- Each device keeps a local database synced by PowerSync. Local writes go into a queue. When the device is online, the queue is uploaded to the API, which validates each batch and applies it all-or-nothing.
- Conflicts are resolved per edit: the later edit wins. Balances can't conflict, because they are calculated (section 3).

## 13. Architecture

### 13.1 Repository

- One GitHub repository using Bun workspaces:

| Path | Contents |
|---|---|
| `apps/web` | TanStack Start web app and landing page |
| `apps/api` | Hono API on Cloudflare Workers: sync upload, AI captures, Telegram webhook, scheduled jobs, admin |
| `apps/android` | Kotlin Android app (Gradle) |
| `packages/db` | Drizzle schema and migrations |
| `packages/shared` | validation schemas, money and budget logic, AI prompts |

- **Tooling:** Bun for packages, scripts and tests. `oxlint` for linting and `oxfmt` for formatting. Bun runs locally only; deployed code runs on Cloudflare's runtime, so it can't use Bun-only APIs.

### 13.2 Web

- TanStack Start with Router, Query, DB, Form, Table, Virtual, Pacer, Store, AI and Devtools, plus shadcn/ui and Tailwind CSS.
- **Rendering:** the landing page at `/` is rendered on the server. App pages are client-only and read from the local database. A service worker caches the app shell, making the web app installable and usable offline.
- **Redirects:** a logged-in visitor to `/` goes to `/dashboard`. A logged-out visitor to any app page goes to `/`. The app's menu links back to the landing page.
- **App routes** (no `/app` prefix): `/dashboard`, `/income`, `/expenses`, `/transfers`, `/wallets`, `/budgets`, `/investments`, `/debts`, `/recurring`, `/reports`, `/family`, `/settings`, and `/admin` (super admin only).

### 13.3 API and data

- Hono (TypeScript) on Cloudflare Workers. Every write from every channel goes through this API.
- Drizzle reaches Supabase Postgres (Singapore region) through Cloudflare Hyperdrive. The API acts with the signed-in user's token, so the database's row-level security also checks family membership.
- Supabase also provides Google login and file storage for receipt photos.
- **Scheduled jobs:** one hourly scheduled trigger dispatches every job, because the free plan allows only 5 per account. The jobs are:
  - crypto prices (hourly)
  - gold prices and snapshots (daily)
  - exchange rates (daily)
  - recurring rules
  - due-date reminders
  - monthly reports
  - receipt photo cleanup
  - retrying captures that hit the quota

  These daily jobs also keep the free Supabase and PowerSync projects from pausing after a week without activity.

### 13.4 Android

- Kotlin, Jetpack Compose and Material 3, styled to match shadcn. A view-model per screen.
- Libraries: Koin, Ktor, supabase-kt with Credential Manager for Google sign-in, the PowerSync Kotlin SDK, and CameraX.
- Minimum version Android 8.0 (API 26). Package `com.kantonq.android`.
- Indonesian and English, following the member's language setting.
- Distributed as an APK from the landing page and GitHub Releases first, then on Google Play.
- No push notifications in version 1; Telegram covers notifications.
- Built from the command line in WSL without Android Studio, and tested on a phone over Wi-Fi debugging.

### 13.5 Hosting

| Environment | Web | API | Supabase | PowerSync |
|---|---|---|---|---|
| Production | `kantonq.com` | `api.kantonq.com` | production project | production instance |
| Staging | `*.workers.dev` | `*.workers.dev` | staging project | staging instance |

- `kantonq.com`'s DNS is on Cloudflare.
- GitHub Actions runs tests, deploys the web app and API, and builds the APK.

### 13.6 Free-tier limits to keep in mind

| Service | Limit |
|---|---|
| Cloudflare Workers | 100,000 requests a day across all Workers, 10 ms CPU per request, 5 scheduled triggers per account |
| Cloudflare Hyperdrive | 100,000 database queries a day |
| Supabase | 500 MB database, 1 GB file storage, 2 projects, paused after 1 week without activity |
| PowerSync | 2 GB synced a month, 500 MB hosted, 50 devices online at once, deactivated after 1 week without activity |
| GoldAPI.io | 100 requests a month |
| Gemini | per-minute and per-day request limits; see the quota handling in section 11 |

## 14. Landing page

- **Sections:**
  - a hero with a "Masuk dengan Google" button
  - features
  - app screenshots
  - an Android APK download
  - a request-an-invite form
  - an FAQ
- Indonesian, with English available.
- **Look:** shadcn neutral with an emerald accent. Light and dark follow the system setting. A text logo until a real one exists.

## 15. Engineering defaults

These weren't discussed explicitly. They are the defaults I'll use unless you change them.

- **Money:** amounts are stored as whole numbers in the currency's smallest unit (rupiah, or US cents) together with a currency code. Floating-point numbers are never used for money.
- **IDs:** generated on the device (UUIDv7), so records can be created offline.
- **Deletes:** records are marked deleted rather than removed, so the history stays complete and deletions sync to other devices.
- **Timestamps:** stored in UTC and shown in the member's time zone.

## 16. Build stages

Each stage ends with something usable.

1. **Foundation (web):**
   - monorepo, database schema, Google login and the allowed-email list
   - families, roles, profiles and invites
   - wallets and transactions with fees, USD support and items
   - budgets with subtypes, periods and carry-over, and income categories
   - debts and contacts
   - tags, notes, search and filters, and transaction history
2. **Offline sync for the web:** PowerSync, the service worker and installable app, and export.
3. **Android app:** feature parity with stages 1–2.
4. **Investments:** gold, crypto, price jobs, snapshots and charts.
5. **Telegram:** linking, commands, notifications, budget alerts, monthly reports, reminders and recurring rules.
6. **AI captures:** receipts and text on web, Android and Telegram.
7. **Landing page, invite requests and the admin page.**

## 17. Testing

- **Approach:** test-driven development, following the mattpocock `tdd` skill.
  - Red, then green, in vertical slices: one test, then the minimum code to pass it, then the next.
  - Tests go only at seams (public entry points) agreed with the user before each stage starts. They test behaviour through public interfaces, never internals.
  - Refactoring happens in review, not inside the loop.
- **Stage 1 seams (agreed):**
  1. **API over HTTP** (the main seam): every write and read, roles, invite-only access and family separation, tested through HTTP responses against a real Postgres.
  2. **Money calculations module:** balances, net worth, budget periods, how much is left, and carry-over, as pure functions over plain data.
  3. **Playwright** against staging, with a test-only email-and-password user that is never enabled in production:
     - sign in, then add an expense
     - record a transfer with a fee, then check both wallet balances
- **Stage 2 seams (moved from stage 1):**
  - **Sync upload:** a batch of offline changes is applied all-or-nothing, invalid changes are rejected, and the later edit wins on conflicts.
  - **Playwright:** record a transfer with a fee while offline, then sync it.
- **Tools:**
  - `bun test` for TypeScript.
  - Integration tests run against a real Postgres in a Podman container locally, and in a service container in CI.
  - Playwright for the web, JUnit for Android logic.
  - GitHub Actions runs everything on every push.

## 18. Explicitly out of scope for version 1

- private wallets or records inside a family
- limits on subtypes
- push notifications from the Android app
- investments other than gold and crypto (stocks, mutual funds, deposits)
- jewellery as gold
- debts with family members (use transfers instead)

# kantonq

kantonq is a personal and family money manager. It records how money moves between a family's wallets, budgets and investments, and reports on it across web, Android and Telegram.

## Families and people

**Family**:
A group of members who share one set of wallets, budgets, investments and records. Everyone in a family can see everything in it.
_Avoid_: Household, group, workspace, tenant

**Member**:
A person inside a family. A person can be a member of several families.
_Avoid_: User (when talking about family membership), participant

**Profile**:
A member without a login, such as a young child, who can own wallets and be a spender. A profile can later be upgraded to a login member and keeps its history.
_Avoid_: Dependent, sub-account, guest

**Owner**:
A member role that can do everything in the family, including inviting, removing and changing the roles of members. A family can have several owners.
_Avoid_: Admin (reserved for the super admin)

**Editor**:
A member role that can create and change records but cannot manage members.

**Viewer**:
A member role that can only read the family's records.

**Inactive member**:
A former member whose history stays in the family but who can no longer act in it.
_Avoid_: Deleted member

**Super admin**:
The single, fixed person who runs kantonq itself, approves invite requests and manages the allowed-email list. Not a family role.
_Avoid_: Admin, root

**Invite**:
An owner's offer, addressed to a Google email, for that person to join a family.

**Invite request**:
A request from someone outside kantonq, sent from the landing page, asking the super admin for access.
_Avoid_: Signup, waitlist entry

**Home time zone**:
The family's time zone, used for shared budgets and the family report. Each member also has their own time zone for individual budgets and personal reports.

## Wallets

**Wallet**:
A place money sits: cash, a bank account, an e-wallet, a credit card or a paylater account. It holds exactly one currency (IDR or USD) and has one or more owning members.
_Avoid_: Account, pocket, dompet (in code)

**Liability wallet**:
A credit card or paylater wallet, whose balance is money owed rather than money held.
_Avoid_: Debt wallet, credit account

**Statement date**:
The day each month a liability wallet's bill is calculated.

**Due date**:
The day each month a liability wallet's bill must be paid.

**Inactive wallet**:
A wallet with no remaining active owner. It is read-only, but its balance still counts toward net worth.
_Avoid_: Archived wallet, closed wallet

**Balance**:
The amount in a wallet, always calculated from its transactions and never entered directly.

**Adjustment**:
A transaction that corrects a wallet's balance to match reality.
_Avoid_: Correction, reconciliation entry

## Transactions

**Transaction**:
A single recorded movement of money: an income, an expense or a transfer.
_Avoid_: Entry, record, mutation

**Income**:
Money entering a wallet from outside the family.

**Expense**:
Money leaving a wallet to outside the family. Every expense belongs to a budget.
_Avoid_: Spending, outflow, cost

**Transfer**:
Money moving between two wallets in the same family. It is neither income nor expense.
_Avoid_: Move, top-up

**Fee**:
An expense attached to another transaction, such as a transfer's admin charge, and taken from the same wallet.
_Avoid_: Charge, admin cost

**Spender**:
The member an expense is attributed to. By default it is the recorder, and it can be changed.
_Avoid_: Payer, owner

**Recorder**:
The member who created a transaction.
_Avoid_: Author, creator

**Item**:
One line of an expense, usually from a receipt, with its own amount, budget and subtype.
_Avoid_: Line, split

**Original amount**:
The amount and currency a transaction was actually charged in, when that differs from the wallet's currency.

**Tag**:
A free-form label on transactions, shared across the family.

**Note**:
Free text written on a transaction.

**History**:
The record of who created and changed a transaction, and when.
_Avoid_: Audit log

## Budgets

**Budget**:
The top-level category of an expense, such as Makan, Anak or Jakarta. It may carry a limit for a period.
_Avoid_: Category, type, envelope

**Subtype**:
An optional finer label within one budget, such as Entertainment within Jakarta. Each budget has its own subtypes, which are unrelated to subtypes of other budgets.
_Avoid_: Type, subcategory, tag

**Limit**:
The amount a budget allows per period. The limit applies to the whole budget, never to a subtype.
_Avoid_: Cap, allowance, quota

**Period**:
The span of time a budget's limit covers: a day, week, month or year, or one fixed date range.

**One-off budget**:
A budget with a single fixed date range instead of a repeating period, such as a trip.
_Avoid_: Event budget, temporary budget

**Shared budget**:
A budget that every member's expenses count against.

**Individual budget**:
A budget belonging to one member, where only expenses whose spender is that member count against it.
_Avoid_: Personal budget, private budget

**Carry-over**:
The leftover amount, or the overspent amount, that a period passes to the next one.
_Avoid_: Rollover

**Overspend**:
Expenses in a period that go beyond the budget's limit. This is allowed.

**Built-in budget**:
A budget that kantonq provides and that always exists: Biaya (fees) and Hutang Piutang (forgiven debts).
_Avoid_: System budget, default budget

**Income category**:
The top-level label of an income, such as Gaji or Freelance. It has optional subtypes and never has a limit.
_Avoid_: Income budget, source

**Budget alert**:
A warning that a budget's spending has reached a threshold of its limit in the current period.

## Debts

**Contact**:
A person outside the family whom money is lent to or borrowed from.
_Avoid_: Counterparty, friend

**Receivable**:
Money a member lent to a contact and is owed back (piutang). It counts as an asset.
_Avoid_: Loan given, credit

**Debt**:
Money a member borrowed from a contact and owes back (hutang). It counts as a liability.
_Avoid_: Loan taken

**Repayment**:
A transaction that reduces a receivable or a debt, in full or in part.

**Forgiveness**:
Closing the rest of a receivable as an expense, or the rest of a debt as an income.
_Avoid_: Write-off

## Investments

**Holding**:
A member's position in one investment asset on one platform, such as Antam bars kept at home or bitcoin on Indodax.
_Avoid_: Position, portfolio item

**Asset**:
The thing being held: a gold product (by brand) or a crypto coin.
_Avoid_: Instrument, security

**Platform**:
Where a holding is kept, such as Pegadaian, Indodax or "physical at home".
_Avoid_: Broker, exchange, custodian

**Buy**:
Moving money from a wallet into a holding. It is not an expense.

**Sell**:
Moving value from a holding back into a wallet.

**Average cost**:
The cost per unit of a holding, used to work out profit or loss on a sell.

**Realized gain**:
The profit or loss already locked in by selling.

**Unrealized gain**:
The profit or loss a holding would show if valued at today's price.

**Buyback price**:
The price a gold dealer would pay today, used to value gold holdings.
_Avoid_: Sell price (ambiguous)

**Snapshot**:
The recorded value of every holding at the end of one day.

## Repeating and captured transactions

**Recurring rule**:
A schedule that produces a transaction repeatedly, such as monthly salary or a subscription.
_Avoid_: Subscription, schedule, standing order

**Automatic rule**:
A recurring rule whose transactions are recorded on their date without asking.

**Confirm-first rule**:
A recurring rule that asks a member to confirm, and optionally change the amount, before recording.

**Capture**:
A receipt photo or a free-text message that the AI turns into one or more proposed changes.
_Avoid_: Scan, prompt, input

**Draft**:
A proposed change produced from a capture, waiting for a member to confirm or reject it.
_Avoid_: Pending transaction, suggestion

**Auto-save mode**:
A member setting under which captures are saved without asking, unless the AI is unsure or something is missing.
_Avoid_: Auto-insert

**Ask-first mode**:
A member setting under which every capture becomes a draft that must be confirmed.
_Avoid_: Manual mode

## Reports

**Net worth**:
The value of all wallets, receivables and holdings, minus liability wallets and debts, in rupiah.
_Avoid_: Total assets, wealth

**Monthly report**:
The summary sent on the 1st of each month, covering the previous calendar month.

**Linked chat**:
A Telegram private chat or family group connected to kantonq.

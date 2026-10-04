# 16: Budget limits and current-period status

**What to build:** Owners and editors give a budget an optional limit and a period: daily, weekly (from Monday), monthly (from a chosen day), yearly (from January), or a one-off start and end date for something like a trip. A budget is shared, or individual to one member, in which case only expenses whose spender is that member count. Shared budgets follow the family's home time zone; individual budgets follow their member's time zone. Each budget shows its limit, spent amount and remaining amount for the current period. Overspending is allowed and clearly shown. The limit lives with the whole budget, so Jakarta / Entertainment counts only against Jakarta. Budget cards appear on the dashboard. Carry-over and limit history come in ticket 17.

Covers user stories 65, 69–77 and 82.

**Blocked by:** 07 (Dashboard: net worth and wallets by owner), 10 (Expenses), 14 (Items)

**Status:** ready-for-agent

- [ ] Owners and editors can set a budget's limit (optional), period kind, monthly anchor day, or one-off start and end dates
- [ ] Owners and editors can make a budget shared or individual to one member
- [ ] Owners and editors can set alert thresholds per budget (default 80% and 100%); they are stored but nothing is sent
- [ ] The money calculations module returns the current period's start, end, limit, spent amount and remaining amount, given a budget, its expenses and items, a time zone and a moment, tested with worked examples for every period kind in different time zones, including monthly anchors such as the 31st in short months
- [ ] An expense under a subtype counts only against its own budget, never against another budget with a similarly named subtype
- [ ] Items count against their own budgets, not the parent expense's budget
- [ ] Individual budgets count only expenses whose spender is their member
- [ ] Overspending is allowed; the remaining amount goes negative and is clearly shown
- [ ] A one-off budget whose end date has passed is hidden from the budget picker but still shown in budget lists
- [ ] `/budgets` and the dashboard show each budget's current limit, spent and remaining amounts
- [ ] API tests cover limits, every period kind, shared and individual budgets, items split across budgets, overspend, and hiding ended one-off budgets from the picker

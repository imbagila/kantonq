# 17: Carry-over, limit changes and past periods

**What to build:** Leftover money isn't lost, and overspending isn't forgotten. Carry-over is on by default and switchable per budget: a period's leftover or overspent amount passes to the next. A limit change applies only to the current and future periods, so past periods stay as they were. Members browse a budget's past periods and see how each one went.

Covers user stories 78–81.

**Blocked by:** 16 (Budget limits and current-period status)

**Status:** ready-for-agent

- [ ] Carry-over is on by default for new budgets, and owners and editors can switch it per budget
- [ ] Limits are kept as a history with the period each is effective from; changing a limit never rewrites earlier periods
- [ ] The money calculations module includes carry-over in for each period, carrying both leftover and overspent amounts, tested with worked examples across several periods and with carry-over switched off
- [ ] The money calculations module returns a budget's past periods with the same figures (start, end, limit, spent, carry-over in, remaining)
- [ ] Budget status on `/budgets` and the dashboard shows carry-over in
- [ ] Members can browse a budget's past periods in the web app
- [ ] API tests cover carry-over across periods, carry-over off, limit changes leaving past periods unchanged, and the past-period list

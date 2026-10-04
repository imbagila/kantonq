# 14: Items (split expenses)

**What to build:** Editors split one expense, such as a mixed shopping trip, into items. Each item has a name, an optional quantity, an amount, a budget and an optional subtype of that budget. Items must add up to the expense total, so a split can't create or lose money.

Covers user stories 53 and 54.

**Blocked by:** 10 (Expenses)

**Status:** ready-for-agent

- [ ] Editors and owners can add items to an expense, each with name, optional quantity, amount, budget and optional subtype
- [ ] Items that don't add up to the expense amount are refused with `items_do_not_sum`
- [ ] Each item's subtype must belong to that item's budget
- [ ] Items can be edited along with their expense, and every change is recorded in the expense's history
- [ ] The expense form lets the member add, edit and remove items and shows the remaining unassigned amount
- [ ] API tests cover saving items, the sum rule, item budget and subtype validation, editing and history

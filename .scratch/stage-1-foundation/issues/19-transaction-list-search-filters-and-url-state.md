# 19: Transaction list: search, filters and URL state

**What to build:** History stays usable as it grows. Transaction lists show newest first and scroll quickly through thousands of records. Members search by note and item names ("susu"), and filter by date range, wallet, budget, subtype, income category, member (spender or recorder), tag, kind and amount range. Filters live in the URL, so a view can be bookmarked or shared with the family.

Covers user stories 101–104.

**Blocked by:** 11 (Incomes and income categories), 12 (Transfers), 14 (Items)

**Status:** ready-for-agent

- [ ] List endpoints use cursor pagination, newest first, and stay stable when transactions share the same time
- [ ] List endpoints accept the full filter set: date range, wallet, budget, subtype, income category, member as spender or recorder, tag, kind and amount range
- [ ] Search matches notes and item names, case-insensitively
- [ ] Item-level budget filters match expenses that have an item in that budget
- [ ] Deleted transactions never appear
- [ ] The web lists use virtual scrolling and load more pages as the member scrolls
- [ ] The search box is debounced, and every filter is reflected in and restored from the URL
- [ ] API tests cover pagination, each filter, combined filters, search by note and item name, and family separation

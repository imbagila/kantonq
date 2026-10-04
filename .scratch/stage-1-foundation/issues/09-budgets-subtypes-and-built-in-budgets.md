# 09: Budgets, subtypes and built-in budgets

**What to build:** Budgets are the family's expense categories (ADR 0005). Owners and editors create budgets such as Makan, Anak or Jakarta, and add, rename and remove subtypes that belong to one budget only. A budget without a limit works as a plain category. The built-in budgets "Biaya" and "Hutang Piutang" always exist and can't be deleted. Budgets no longer in use can be archived, so old expenses keep their budget. Limits, periods and figures come in ticket 16.

Covers user stories 66–68 and 83–85.

**Blocked by:** 04 (Families: create, switch and settings)

**Status:** ready-for-agent

- [ ] Owners and editors can create, rename and archive budgets; viewers can't
- [ ] Owners and editors can add, rename and remove subtypes within a budget; a subtype belongs to exactly one budget, and same-named subtypes in different budgets are separate
- [ ] "Biaya" (with subtypes Admin Transfer, Admin Bulanan and Biaya Kurs) and "Hutang Piutang" appear in every family and are marked built-in
- [ ] Deleting or archiving a built-in budget is refused with a stable error code
- [ ] Archived budgets are hidden from the budget picker but remain readable
- [ ] `/budgets` lists the family's budgets and their subtypes, in both languages and at phone width
- [ ] API tests cover budget and subtype management, built-in protection, archiving and role enforcement

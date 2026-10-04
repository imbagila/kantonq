# 04: Families: create, switch and settings

**What to build:** A signed-in person with no family creates one and becomes its owner. A person who belongs to several families can switch between them, and the app remembers the last family they used. Every family-scoped request is addressed by family, and a person can never see or change another family's data. Each member sets their own time zone (default WIB) and language (Indonesian or English); owners set the family's home time zone (default WIB). The interface and error messages follow the member's language.

Covers user stories 5–7 and 25–29.

**Blocked by:** 03 (Google sign-in and the allowed-email gate)

**Status:** ready-for-agent

- [ ] A signed-in person with no family is led to create one, and becomes its first owner
- [ ] Creating a family also creates the built-in budgets "Biaya" (with subtypes Admin Transfer, Admin Bulanan and Biaya Kurs) and "Hutang Piutang"; ticket 09 makes them visible and protected
- [ ] A person in several families can switch between them in the web app, and lands in the last family they used on their next visit
- [ ] Every family-scoped API request requires the caller to be an active member of that family; requests for another family's data are refused
- [ ] A member can set their own time zone (default WIB) and language (default Indonesian), and the interface and error messages switch language accordingly
- [ ] An owner can set the family's home time zone (default WIB); editors and viewers can't
- [ ] API tests cover family creation, switching, family separation between two families, and who may change each setting

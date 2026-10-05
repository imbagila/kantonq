# 04: Families: create, switch and settings

**What to build:** A signed-in person with no family creates one and becomes its owner. A person who belongs to several families can switch between them, and the app remembers the last family they used. Every family-scoped request is addressed by family, and a person can never see or change another family's data. Each member sets their own time zone (default WIB) and language (Indonesian or English); owners set the family's home time zone (default WIB). The interface and error messages follow the member's language.

Covers user stories 5–7 and 25–29.

**Blocked by:** 03 (Google sign-in and the allowed-email gate)

**Status:** ready-for-agent

- [x] A signed-in person with no family is led to create one, and becomes its first owner
- [x] Creating a family also creates the built-in budgets "Biaya" (with subtypes Admin Transfer, Admin Bulanan and Biaya Kurs) and "Hutang Piutang"; ticket 09 makes them visible and protected
- [x] A person in several families can switch between them in the web app, and lands in the last family they used on their next visit
- [x] Every family-scoped API request requires the caller to be an active member of that family; requests for another family's data are refused
- [x] A member can set their own time zone (default WIB) and language (default Indonesian), and the interface and error messages switch language accordingly
- [x] An owner can set the family's home time zone (default WIB); editors and viewers can't
- [x] API tests cover family creation, switching, family separation between two families, and who may change each setting

## Comments

**Implemented.** A signed-in person with no family is sent to `/family` to create one and becomes its owner. Creating a family also creates the built-in budgets. The last family used is stored on the person, so the next request opens that family. Family-scoped routes answer `not_found` when the caller is not an active member. A member sets their own time zone; language is on the person, and once they are signed in, error messages follow that language rather than `Accept-Language`. Only an owner can change the home time zone (`forbidden_role` otherwise).

Ticket 05 is what places someone in the editor or viewer role. The home-time-zone route already refuses anyone who is not an owner, and the API tests cover the owner and a member of another family. They cannot yet observe `forbidden_role` for an editor or viewer, because no invite exists to give those roles.

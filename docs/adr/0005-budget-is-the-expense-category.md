# A budget is the expense category

kantonq has no category separate from budgets. A budget is the top-level category of every expense, such as Makan, Anak or Jakarta, and its limit is optional. Subtypes belong to exactly one budget. The limit applies only to the budget as a whole, so an expense under Jakarta / Entertainment counts only against Jakarta, never against a budget named Entertainment. This matches how the family thinks about spending ("this came out of the Jakarta money"), at the cost of not being able to total "all entertainment" across budgets.

## Considered options

- **A shared list of types that budgets pick from**, allowing reports across budgets. Rejected by the user.
- **Categories and budgets as separate concepts**, the common design in other apps. Rejected: a second label on every expense, for no benefit to this family.
- **Limits on subtypes.** Rejected: the limit belongs to the budget only.

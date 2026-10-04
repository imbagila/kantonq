# Fees are linked expense transactions

A fee isn't a number field on the transaction it belongs to. It is its own expense, linked to its parent transaction and taken from the same wallet. This way fees appear in reports, count against budgets, and follow every rule of an ordinary expense. A fee on an expense defaults to that expense's budget, and a fee on a transfer or income defaults to the built-in "Biaya" budget. A parent and its fees are always written in one database transaction.

# Wallet balances are always derived from transactions

A wallet's balance is never stored as an editable number. It is always calculated from the wallet's transactions, and corrections are recorded as adjustment transactions. Several devices write offline and the later edit wins (ADR 0002). A stored balance would be overwritten by whichever device synced last, while a sum over transactions can't conflict.

## Consequences

- Balance reads must aggregate transactions. If that ever becomes slow, add a cache that can be rebuilt from transactions, never one that is the source of truth.

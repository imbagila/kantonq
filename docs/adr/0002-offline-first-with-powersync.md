# Offline-first web and Android with PowerSync

Both the web and Android apps must read and write with no connection and sync later. We use PowerSync: Postgres is replicated into a local SQLite database on each device, and local writes are queued and uploaded through our own API (ADR 0001), which applies each batch all-or-nothing. PowerSync has official Kotlin and web SDKs and a TanStack DB integration.

## Considered options

- **Our own sync (Room on Android, IndexedDB on the web, an outbox, pull by cursor).** Rejected: entirely free and has no vendor, but it means much more code and many more edge cases in the most error-prone part of the system.

## Consequences

- The free PowerSync instance deactivates after a week without activity. The daily scheduled jobs keep it active.
- Conflicts are resolved with the later edit winning. This is only safe because balances are never stored (ADR 0004).
- App pages on the web are client-only, because they read from the local database.

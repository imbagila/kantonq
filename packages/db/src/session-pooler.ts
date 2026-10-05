const directHost = /^db\.([a-z0-9]+)\.supabase\.co$/i;

/**
 * GitHub-hosted runners are IPv4-only. Supabase's direct host is IPv6-only, so a
 * connection to `db.<ref>.supabase.co` is refused there. The shared pooler in
 * session mode is the IPv4 path that still supports migrations. Transaction mode
 * (port 6543) does not.
 *
 * Leaves every other connection string alone, including one that already uses the pooler.
 */
export function withSessionPooler(
  connectionString: string,
  poolerHost: string | undefined,
): string {
  const host = poolerHost?.trim();
  if (!host) return connectionString;

  const url = new URL(connectionString);
  const match = directHost.exec(url.hostname);
  if (!match) return connectionString;

  url.username = `postgres.${match[1]}`;
  url.hostname = host;
  url.port = "5432";
  return url.href;
}

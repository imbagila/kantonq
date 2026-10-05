const namedZones: Record<string, string> = {
  "Asia/Jakarta": "WIB (Asia/Jakarta)",
  "Asia/Makassar": "WITA (Asia/Makassar)",
  "Asia/Jayapura": "WIT (Asia/Jayapura)",
};

const preferred = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];

/** Indonesian zones first, then every other zone the runtime knows. */
export function timeZoneChoices(): { id: string; label: string }[] {
  const known = new Set(Intl.supportedValuesOf("timeZone"));
  const first = preferred.filter((id) => known.has(id));
  const rest = [...known]
    .filter((id) => !first.includes(id))
    .toSorted((a, b) => a.localeCompare(b));
  return [...first, ...rest].map((id) => ({ id, label: namedZones[id] ?? id }));
}

/** The family's home time zone and each member's time zone start here (WIB). */
export const defaultTimeZone = "Asia/Jakarta";

const timeZones = new Set(Intl.supportedValuesOf("timeZone"));

export function isTimeZone(value: string): boolean {
  return timeZones.has(value);
}

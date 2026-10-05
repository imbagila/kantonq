/** Compares emails without caring about case or surrounding space. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

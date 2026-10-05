import type { Language } from "@kantonq/shared/language";

const id = {
  "landing.tagline": "Uang keluarga, dalam satu tempat.",
  "landing.description":
    "Catat pemasukan, pengeluaran dan transfer di semua dompet keluarga, dan lihat sisa budget kapan saja.",
  "landing.signIn": "Masuk dengan Google",
  "landing.notAllowed": "Email ini belum diundang. Minta undangan untuk masuk.",
  "landing.building": "kantonq sedang dibangun.",
  "dashboard.title": "Dasbor",
  "dashboard.signedIn": "Anda sudah masuk.",
  "session.signOut": "Keluar",
} as const;

export type MessageKey = keyof typeof id;

const en: Record<MessageKey, string> = {
  "landing.tagline": "Your family's money, in one place.",
  "landing.description":
    "Record income, expenses and transfers across every family wallet, and see what's left in each budget at any time.",
  "landing.signIn": "Sign in with Google",
  "landing.notAllowed": "This email hasn't been invited. Ask for an invite to sign in.",
  "landing.building": "kantonq is being built.",
  "dashboard.title": "Dashboard",
  "dashboard.signedIn": "You're signed in.",
  "session.signOut": "Sign out",
};

export const messages: Record<Language, Record<MessageKey, string>> = { id, en };

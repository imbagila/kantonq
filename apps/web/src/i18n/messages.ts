import type { Language } from "@kantonq/shared/language";

const id = {
  "landing.tagline": "Uang keluarga, dalam satu tempat.",
  "landing.description":
    "Catat pemasukan, pengeluaran dan transfer di semua dompet keluarga, dan lihat sisa budget kapan saja.",
  "landing.comingSoon": "Segera hadir",
  "landing.building": "kantonq sedang dibangun.",
} as const;

export type MessageKey = keyof typeof id;

const en: Record<MessageKey, string> = {
  "landing.tagline": "Your family's money, in one place.",
  "landing.description":
    "Record income, expenses and transfers across every family wallet, and see what's left in each budget at any time.",
  "landing.comingSoon": "Coming soon",
  "landing.building": "kantonq is being built.",
};

export const messages: Record<Language, Record<MessageKey, string>> = { id, en };

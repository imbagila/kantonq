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
  "nav.family": "Keluarga",
  "nav.settings": "Pengaturan",
  "family.createTitle": "Buat keluarga",
  "family.createLead": "Buat keluarga Anda untuk mulai mencatat uang.",
  "family.title": "Keluarga",
  "family.name": "Nama keluarga",
  "family.create": "Buat keluarga",
  "family.current": "Sedang dipakai",
  "family.switch": "Pakai keluarga ini",
  "family.switcher": "Keluarga",
  "family.failed": "Tidak dapat menyimpan. Silakan coba lagi.",
  "settings.title": "Pengaturan",
  "settings.language": "Bahasa",
  "settings.timeZone": "Zona waktu saya",
  "settings.homeTimeZone": "Zona waktu rumah keluarga",
  "language.id": "Bahasa Indonesia",
  "language.en": "English",
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
  "nav.family": "Family",
  "nav.settings": "Settings",
  "family.createTitle": "Create a family",
  "family.createLead": "Create your family to start recording money.",
  "family.title": "Family",
  "family.name": "Family name",
  "family.create": "Create family",
  "family.current": "In use",
  "family.switch": "Use this family",
  "family.switcher": "Family",
  "family.failed": "Couldn't save. Please try again.",
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.timeZone": "My time zone",
  "settings.homeTimeZone": "Family home time zone",
  "language.id": "Bahasa Indonesia",
  "language.en": "English",
};

export const messages: Record<Language, Record<MessageKey, string>> = { id, en };

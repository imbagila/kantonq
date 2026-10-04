export const languages = ["id", "en"] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "id";

function isLanguage(value: string): value is Language {
  return (languages as readonly string[]).includes(value);
}

/** Picks the interface language from an `Accept-Language` header, falling back to Indonesian. */
export function pickLanguage(acceptLanguage: string | null | undefined): Language {
  if (!acceptLanguage) return defaultLanguage;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return {
        primary: tag.split("-")[0]?.toLowerCase() ?? "",
        quality: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter((entry) => entry.quality > 0)
    .toSorted((a, b) => b.quality - a.quality)
    .map((entry) => entry.primary)
    .find(isLanguage);

  return preferred ?? defaultLanguage;
}

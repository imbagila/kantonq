import { defaultLanguage, pickLanguage, type Language } from "@kantonq/shared/language";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createContext, useContext, type ReactNode } from "react";

import { messages, type MessageKey } from "./messages.ts";

/**
 * The server picks the language from the browser's preference and writes it to `<html lang>`;
 * the client reads it back from there so both render the same strings.
 */
export const detectLanguage = createIsomorphicFn()
  .server((): Language => pickLanguage(getRequestHeader("accept-language")))
  .client((): Language => pickLanguage(document.documentElement.lang));

const LanguageContext = createContext<Language>(defaultLanguage);

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext value={language}>{children}</LanguageContext>;
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function useT(): (key: MessageKey) => string {
  const language = useLanguage();
  return (key) => messages[language][key];
}

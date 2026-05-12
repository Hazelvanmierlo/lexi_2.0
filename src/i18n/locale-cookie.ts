import { cookies } from "next/headers";

export const LOCALES = ["nl-NL", "nl-BE"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl-NL";
export const COOKIE_NAME = "lexi-locale";

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export async function readLocaleCookie(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  return isValidLocale(raw) ? raw : DEFAULT_LOCALE;
}

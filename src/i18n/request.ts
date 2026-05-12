import { getRequestConfig } from "next-intl/server";
import { readLocaleCookie } from "./locale-cookie";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function deepMerge(base: Json, override: Json): Json {
  if (
    base !== null &&
    override !== null &&
    typeof base === "object" &&
    typeof override === "object" &&
    !Array.isArray(base) &&
    !Array.isArray(override)
  ) {
    const out: { [key: string]: Json } = { ...(base as { [key: string]: Json }) };
    for (const key of Object.keys(override as { [key: string]: Json })) {
      const b = (base as { [key: string]: Json })[key];
      const o = (override as { [key: string]: Json })[key];
      out[key] = b === undefined ? o : deepMerge(b, o);
    }
    return out;
  }
  return override;
}

export default getRequestConfig(async () => {
  const locale = await readLocaleCookie();
  const base = (await import("../messages/nl-NL.json")).default as Json;
  const messages =
    locale === "nl-NL"
      ? base
      : deepMerge(base, (await import(`../messages/${locale}.json`)).default as Json);
  return { locale, messages: messages as Record<string, unknown> };
});

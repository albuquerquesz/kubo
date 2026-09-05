import { cookies, headers } from "next/headers";

import { localeCookieName, localeRequestHeaderName } from "./config";
import { resolveLocale } from "./resolve-locale";

export async function getLocale() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  return resolveLocale({
    requestLocale: headerStore.get(localeRequestHeaderName),
    cookie: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

import { cookies, headers } from "next/headers";

import { localeCookieName } from "./config";
import { resolveLocale } from "./resolve-locale";

export async function getLocale() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return resolveLocale({
    cookie: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

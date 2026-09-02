import { NextResponse, type NextRequest } from "next/server";

import { isLocale, localeCookieMaxAge, localeCookieName } from "@/i18n/config";
import { localeFromAcceptLanguage } from "@/i18n/resolve-locale";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(localeCookieName)?.value;
  if (isLocale(existing)) {
    return NextResponse.next();
  }

  const locale = localeFromAcceptLanguage(request.headers.get("accept-language"));
  const response = NextResponse.next();
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: localeCookieMaxAge,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match page navigations; skip Next internals, static assets, and API routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|assets/|icon/|integrations/|mascots/|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};

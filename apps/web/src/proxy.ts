import { NextResponse, type NextRequest } from "next/server";

import {
  localeCookieMaxAge,
  localeCookieName,
  localeRequestHeaderName,
  usesBrowserLocale,
} from "@/i18n/config";
import { localeForPathname } from "@/i18n/resolve-locale";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = localeForPathname(pathname, request.headers.get("accept-language"));
  const existing = request.cookies.get(localeCookieName)?.value;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeRequestHeaderName, locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (usesBrowserLocale(pathname) && existing !== locale) {
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
    });
  }

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

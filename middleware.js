import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./lib/adminAuth";

// /admin needs a signed admin session (see lib/adminAuth.js). Server actions
// check the session again themselves (lib/requireAdmin.js): this only guards
// the pages.
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionEmail = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);

  if (pathname === "/admin/login") {
    if (sessionEmail) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!sessionEmail) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};

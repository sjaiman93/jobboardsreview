import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./lib/adminAuth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = await verifyAdminSession(sessionToken);

    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login, redirect directly to /admin
  if (pathname === "/admin/login") {
    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = await verifyAdminSession(sessionToken);
    if (isValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

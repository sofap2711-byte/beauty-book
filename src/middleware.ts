import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect master dashboard pages
  if (pathname.startsWith("/master/dashboard") || pathname.startsWith("/master/schedule") || pathname.startsWith("/master/slots")) {
    const masterSession = request.cookies.get("master_session")?.value;
    if (!masterSession) {
      return NextResponse.redirect(new URL("/master/login", request.url));
    }
  }

  // Redirect logged-in masters away from login page
  if (pathname === "/master/login") {
    const masterSession = request.cookies.get("master_session")?.value;
    if (masterSession) {
      return NextResponse.redirect(new URL("/master/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/master/:path*"],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const role = token?.role;

    // Handle authentication pages
    if (isAuthPage) {
      if (isAuth) {
        if (role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        } else if (role === "officer") {
          return NextResponse.redirect(new URL("/officer", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    // Handle protected routes
    if (!isAuth && !req.nextUrl.pathname.startsWith("/")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Role-based access control
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/officer") && role !== "officer" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    // Protect all routes that start with these prefixes
    "/dashboard/:path*",
    "/record/:path*",
    "/users/:path*",
    // Exclude public routes and root path
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)",
  ],
};

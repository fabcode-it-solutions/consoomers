import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const protectedPrefixes = [
  { prefix: "/dashboard" },
  { prefix: "/brand" },
  { prefix: "/products" },
  { prefix: "/brand/create-product", role: ["brand", "admin"] },
  { prefix: "/profile/tester", role: "tester" },
  { prefix: "/profile/edit/tester", role: "tester" },
];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    for (const route of protectedPrefixes) {
      if (pathname.startsWith(route.prefix)) {
        if (!token) {
          return NextResponse.redirect(new URL("/accounts/sign-in", req.url));
        }

        if (route.role) {
          const allowed = Array.isArray(route.role) ? route.role : [route.role];
          if (!allowed.includes(token.role as string)) {
            return NextResponse.redirect(new URL("/accounts/sign-in", req.url));
          }
        }
      }
    }
    if (token && pathname.startsWith("/accounts")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|accounts).*)",
  ],
};

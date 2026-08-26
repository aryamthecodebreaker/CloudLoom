import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { isConsolePath } from "@/lib/auth.config";

// Edge-safe console protection. The full Credentials authorizer (Prisma-backed)
// lives in lib/auth.ts and runs only in Node route handlers.
const { auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
});

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (isConsolePath(path) && !req.auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }
  if ((path === "/login" || path === "/register") && req.auth) {
    return NextResponse.redirect(new URL("/console", req.url));
  }
});

export const config = {
  matcher: ["/console/:path*", "/login", "/register"],
};

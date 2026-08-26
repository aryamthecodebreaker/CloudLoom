import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe slice of the auth config (no Prisma). The full instance with the
// DB-backed Credentials authorizer lives in lib/auth.ts.
export const { auth: edgeAuth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
});

export const isConsolePath = (path: string) => path.startsWith("/console");

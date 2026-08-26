import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        const email = typeof creds?.email === "string" ? creds.email.toLowerCase().trim() : "";
        const password = typeof creds?.password === "string" ? creds.password : "";
        if (email === "" || password === "") return null;

        const user = await db.user.findUnique({
          where: { email },
          include: { memberships: { orderBy: { createdAt: "asc" }, take: 1 } },
        });
        if (!user) return null;
        if (!bcrypt.compareSync(password, user.passwordHash)) return null;

        const membership = user.memberships[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: membership?.workspaceId ?? null,
          role: membership?.role ?? "VIEWER",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        const extra = user as unknown as { workspaceId?: string | null; role?: string };
        token.workspaceId = extra.workspaceId ?? null;
        token.role = extra.role ?? "VIEWER";
      }
      return token;
    },
    session({ session, token }) {
      session.userId = token.userId as string;
      session.workspaceId = (token.workspaceId as string | null) ?? null;
      session.role = (token.role as string) ?? "VIEWER";
      return session;
    },
  },
});

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId: string;
    workspaceId: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    workspaceId?: string | null;
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    workspaceId?: string | null;
    role?: string;
  }
}

export type { DefaultSession };

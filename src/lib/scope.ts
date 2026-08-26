import { NextResponse } from "next/server";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type WorkspaceContext = {
  userId: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  ingestToken: string;
  role: Role;
  /** Cloud-account row ids in this workspace — use for `cloudAccountId: { in: ... }` scoping. */
  accountIds: string[];
  canWrite: boolean;
};

export const ROLE_RANK: Record<Role, number> = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };

/**
 * Pure tenant-scoping fragments. Kept free of next-auth imports so they stay
 * unit-testable — every console page and API route composes its `where` from
 * these, and a regression here is a cross-tenant leak.
 *
 * All three fail closed: a workspace with no cloud accounts yields `in: []`,
 * which matches zero rows rather than degrading to an unscoped query.
 */

/** Scoped where fragment for models hanging off CloudAccount. */
export function accountScope(ctx: WorkspaceContext) {
  return { cloudAccountId: { in: ctx.accountIds } };
}

/** Scoped where fragment for models reached through a Resource relation. */
export function resourceScope(ctx: WorkspaceContext) {
  return { resource: { cloudAccountId: { in: ctx.accountIds } } };
}

/** Scoped where fragment for graph edges — both endpoints inside the workspace. */
export function edgeScope(ctx: WorkspaceContext) {
  return {
    from: { cloudAccountId: { in: ctx.accountIds } },
    to: { cloudAccountId: { in: ctx.accountIds } },
  };
}

/** Returns a 403 response when the role is below `min`, otherwise null. */
export function denyBelowRole(ctx: WorkspaceContext, min: Role): NextResponse | null {
  if (ROLE_RANK[ctx.role] < ROLE_RANK[min]) {
    return NextResponse.json({ error: `Forbidden — requires ${min}` }, { status: 403 });
  }
  return null;
}

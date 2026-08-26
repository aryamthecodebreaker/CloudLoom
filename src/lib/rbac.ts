import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { db } from "./db";
import { ROLE_RANK, type Role, type WorkspaceContext } from "./scope";

export type { Role, WorkspaceContext };
export { accountScope, resourceScope, edgeScope, denyBelowRole } from "./scope";

/**
 * Session → workspace context, or null when unauthenticated. Callers decide
 * how to react: pages redirect, route handlers return 401.
 */
export async function loadWorkspace(): Promise<WorkspaceContext | null> {
  const session = await auth();
  if (!session?.userId || !session.workspaceId) return null;

  const membership = await db.accountMember.findUnique({
    where: { userId_workspaceId: { userId: session.userId, workspaceId: session.workspaceId } },
    include: { workspace: { select: { id: true, name: true, ingestToken: true } } },
  });
  if (!membership) return null;

  const accounts = await db.cloudAccount.findMany({
    where: { workspaceId: membership.workspaceId },
    select: { id: true },
  });

  const role = membership.role as Role;
  return {
    userId: session.userId,
    email: session.user?.email ?? "",
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspace.name,
    ingestToken: membership.workspace.ingestToken,
    role,
    accountIds: accounts.map((a) => a.id),
    canWrite: ROLE_RANK[role] >= ROLE_RANK.MEMBER,
  };
}

/** Server-component entry point: redirects to /login when unauthenticated. */
export async function requireWorkspace(): Promise<WorkspaceContext> {
  const ctx = await loadWorkspace();
  if (!ctx) redirect("/login");
  return ctx;
}

/**
 * Route-handler entry point. Returns either the context or the 401 to return.
 * Every mutating or data-returning API route must go through this — middleware
 * does not cover /api, so unauthenticated reads would otherwise leak the graph.
 */
export async function apiWorkspace(): Promise<
  { ctx: WorkspaceContext; denied: null } | { ctx: null; denied: NextResponse }
> {
  const ctx = await loadWorkspace();
  if (!ctx) {
    return { ctx: null, denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ctx, denied: null };
}

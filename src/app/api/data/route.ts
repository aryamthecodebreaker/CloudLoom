import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";
import { apiWorkspace, denyBelowRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Wipes this workspace's graph — the "start over" action. Scoped to the
 * caller's workspace and gated on ADMIN: an unauthenticated caller must never
 * be able to empty the database.
 *
 * Control and ComplianceFramework rows are a shared, idempotently-recreated
 * catalog, not tenant data, so they are deliberately left in place.
 *
 * Projects are swept afterwards if nothing references them. No code path
 * creates a Project or sets Resource.projectId — the model is vestigial and
 * any surviving rows are residue from the removed seed script.
 */
export async function DELETE(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  const { ctx, denied: unauth } = await apiWorkspace();
  if (unauth) return unauth;
  const forbidden = denyBelowRole(ctx, "ADMIN");
  if (forbidden) return forbidden;

  const accountIds = ctx.accountIds;
  const resourceIds = (
    await db.resource.findMany({
      where: { cloudAccountId: { in: accountIds } },
      select: { id: true },
    })
  ).map((r) => r.id);

  try {
    await db.$transaction([
      db.cloudEvent.deleteMany({ where: { workspaceId: ctx.workspaceId } }),
      db.graphEdge.deleteMany({
        where: {
          OR: [{ fromId: { in: resourceIds } }, { toId: { in: resourceIds } }],
        },
      }),
      db.issue.deleteMany({ where: { resourceId: { in: resourceIds } } }),
      db.vulnerability.deleteMany({ where: { resourceId: { in: resourceIds } } }),
      db.resource.deleteMany({ where: { cloudAccountId: { in: accountIds } } }),
      db.cloudAccount.deleteMany({ where: { workspaceId: ctx.workspaceId } }),
    ]);
    // Projects carry no workspaceId, so they cannot be scoped. Deleting only
    // the ones with zero remaining resources is safe under multi-tenancy: a
    // project no resource points at belongs to nobody.
    const projects = await db.project.deleteMany({ where: { resources: { none: {} } } });

    return NextResponse.json({
      ok: true,
      accounts: accountIds.length,
      resources: resourceIds.length,
      projects: projects.count,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "wipe failed" }, { status: 500 });
  }
}

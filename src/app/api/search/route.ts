import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiWorkspace, accountScope, resourceScope } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** Backing API for the ⌘K command palette: issues + resources + quick pages. */
export async function GET(req: NextRequest) {
  const { ctx, denied } = await apiWorkspace();
  if (denied) return denied;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ issues: [], resources: [] });

  const [issues, resources] = await Promise.all([
    db.issue.findMany({
      where: {
        AND: [
          resourceScope(ctx),
          { OR: [{ title: { contains: q } }, { refId: { contains: q } }] },
        ],
      },
      select: { refId: true, title: true, severity: true, status: true },
      take: 6,
    }),
    db.resource.findMany({
      where: {
        AND: [
          accountScope(ctx),
          { OR: [{ name: { contains: q } }, { type: { contains: q } }] },
        ],
      },
      select: { id: true, name: true, type: true, provider: true },
      take: 6,
    }),
  ]);

  return NextResponse.json({ issues, resources });
}

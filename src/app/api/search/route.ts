import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Backing API for the ⌘K command palette: issues + resources + quick pages. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ issues: [], resources: [] });

  const [issues, resources] = await Promise.all([
    db.issue.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { refId: { contains: q } },
        ],
      },
      select: { refId: true, title: true, severity: true, status: true },
      take: 6,
    }),
    db.resource.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { type: { contains: q } },
        ],
      },
      select: { id: true, name: true, type: true, provider: true },
      take: 6,
    }),
  ]);

  return NextResponse.json({ issues, resources });
}

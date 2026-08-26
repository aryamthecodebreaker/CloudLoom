import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Wipes every row from the graph. This is the real-product "start over":
 * after this, the console is empty until an agent pushes a real snapshot.
 */
export async function DELETE(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  try {
    await db.$transaction([
      db.cloudEvent.deleteMany(),
      db.graphEdge.deleteMany(),
      db.issue.deleteMany(),
      db.vulnerability.deleteMany(),
      db.resource.deleteMany(),
      db.control.deleteMany(),
      db.complianceFramework.deleteMany(),
      db.cloudAccount.deleteMany(),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "wipe failed" }, { status: 500 });
  }
}

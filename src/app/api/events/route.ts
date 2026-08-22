import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Demo-only: appends an agent-action row to the simulated activity feed.
 * Called by the "simulate fix" action on issue detail pages.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const refId = typeof body?.refId === "string" ? body.refId : null;
  if (!refId || !/^CL-\d{3,5}$/.test(refId)) {
    return NextResponse.json({ error: "Invalid refId" }, { status: 400 });
  }
  const event = await db.cloudEvent.create({
    data: {
      ts: new Date(),
      actor: "agent/green",
      action: `Opened context-aware remediation PR for ${refId} and marked the finding resolved`,
      target: refId,
      result: "SUCCESS",
      source: "CloudLoom Agent",
    },
  });
  return NextResponse.json(event);
}

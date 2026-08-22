import { NextRequest, NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";
import { guardMutation } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Demo-only endpoint: restores the seeded environment to its pristine state.
 * Unauthenticated by design — this whole tenant is a simulation — but
 * cross-site invocations are rejected.
 */
export async function POST(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  try {
    const counts = await runSeed();
    return NextResponse.json({ ok: true, ...counts });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "seed failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Demo-only endpoint: restores the seeded environment to its pristine state.
 * Unauthenticated by design — this whole tenant is a simulation.
 */
export async function POST() {
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

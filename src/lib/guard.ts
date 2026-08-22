import { NextRequest, NextResponse } from "next/server";

/**
 * Demo-grade write protection: mutating API routes only accept requests that
 * originate from this site (browser fetch sends Origin; same-site navigations
 * send Sec-Fetch-Site). Not an auth system — the whole tenant is a simulation.
 */
export function guardMutation(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");

  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  }
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== req.headers.get("host")) {
        return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }
  return null;
}

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

const ALLOWED = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = guardMutation(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.status !== "string") {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
  const { status } = body;
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // Accept either the internal cuid or the public CL-#### reference.
    const where = /^CL-\d+$/i.test(params.id)
      ? { refId: params.id.toUpperCase() }
      : { id: params.id };
    const issue = await db.issue.update({ where, data: { status } });
    return NextResponse.json(issue);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

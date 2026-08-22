import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const issue = await db.issue.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(issue);
}

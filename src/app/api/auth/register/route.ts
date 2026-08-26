import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Registration. The first account created on a fresh deployment becomes the
 * OWNER of the initial workspace; subsequent registrations each get their own
 * workspace (self-host = you control invites; workspace member invites are a
 * roadmap feature).
 */
/**
 * Workspace.name is unique, so two people called "Sam" would otherwise collide
 * and surface the P2002 as an unhandled 500. Suffix until the name is free.
 */
async function uniqueWorkspaceName(base: string): Promise<string> {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base} (${n + 1})`;
    const taken = await db.workspace.findUnique({ where: { name: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base} ${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (email === "" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: "Password must be at least 10 characters" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const base = name === "" ? `${email.split("@")[0]}'s workspace` : `${name}'s workspace`;
  const workspaceName = await uniqueWorkspaceName(base);
  const ingestToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

  const user = await db.user.create({
    data: {
      email,
      name: name === "" ? null : name,
      passwordHash,
      memberships: {
        create: {
          role: "OWNER",
          workspace: {
            create: { name: workspaceName, ingestToken },
          },
        },
      },
    },
    include: { memberships: true },
  });

  const workspaceId = user.memberships[0]?.workspaceId ?? null;

  // Self-host upgrade path: a deployment that ingested data before auth existed
  // has cloud accounts and events belonging to no workspace. The first person
  // to register owns that deployment, so they inherit it — otherwise the data
  // is stranded and their console looks empty.
  let adopted = 0;
  if (workspaceId !== null) {
    const isFirstUser = (await db.user.count()) === 1;
    if (isFirstUser) {
      const claimed = await db.cloudAccount.updateMany({
        where: { workspaceId: null },
        data: { workspaceId },
      });
      await db.cloudEvent.updateMany({ where: { workspaceId: null }, data: { workspaceId } });
      adopted = claimed.count;
    }
  }

  return NextResponse.json({ ok: true, workspace: workspaceId, adopted });
}

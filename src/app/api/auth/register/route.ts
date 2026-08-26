import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

/**
 * Registration. The first person to register on a deployment owns it, so they
 * inherit any workspace that already holds data but has no members — the one
 * `scripts/bootstrap-workspace.mjs` creates when upgrading a pre-auth
 * self-host, or the "Default" workspace the env INGEST_TOKEN maps to.
 * Otherwise every registration gets a fresh workspace of its own (member
 * invites are a roadmap feature).
 */
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

  const isFirstUser = (await db.user.count()) === 0;
  const bootstrap = isFirstUser
    ? await db.workspace.findFirst({
        where: { members: { none: {} } },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      })
    : null;

  let workspaceId: string;
  let inherited = false;

  if (bootstrap) {
    await db.user.create({
      data: {
        email,
        name: name === "" ? null : name,
        passwordHash,
        memberships: { create: { role: "OWNER", workspaceId: bootstrap.id } },
      },
    });
    workspaceId = bootstrap.id;
    inherited = true;
  } else {
    const base = name === "" ? `${email.split("@")[0]}'s workspace` : `${name}'s workspace`;
    const workspaceName = await uniqueWorkspaceName(base);
    const ingestToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const user = await db.user.create({
      data: {
        email,
        name: name === "" ? null : name,
        passwordHash,
        memberships: {
          create: { role: "OWNER", workspace: { create: { name: workspaceName, ingestToken } } },
        },
      },
      include: { memberships: true },
    });
    workspaceId = user.memberships[0].workspaceId;
  }

  return NextResponse.json({ ok: true, workspace: workspaceId, inherited });
}

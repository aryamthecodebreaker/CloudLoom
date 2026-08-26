import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-unused-vars */
type RouteResource = {
  name?: unknown; type?: unknown; region?: unknown;
  externalId?: unknown; isPublic?: unknown; hasSensitiveData?: unknown;
};

type IngestBody = {
  provider?: unknown; accountId?: unknown; account?: unknown;
  resources?: unknown;
};

/**
 * Real cloud ingestion: the Go agent discovers a customer account read-only
 * on THEIR machine and pushes the snapshot here with a bearer token.
 *
 *   Authorization: Bearer <INGEST_TOKEN>
 *
 * Upserts are idempotent per (externalId, cloudAccount) — re-running the
 * agent updates existing rows instead of duplicating them.
 */
export async function POST(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  const token = process.env.INGEST_TOKEN ?? "";
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (token === "" || provided === "" || provided !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as IngestBody | null;
  const prov = typeof body?.provider === "string" ? body.provider : "";
  const accountId = typeof body?.accountId === "string" ? body.accountId : "";
  if (!prov || !accountId || !Array.isArray(body!.resources)) {
    return NextResponse.json({ error: "Malformed snapshot" }, { status: 400 });
  }
  if (body!.resources.length > 5_000) {
    return NextResponse.json({ error: "Snapshot too large" }, { status: 413 });
  }

  const accountName =
    typeof body!.account === "string" && body!.account !== "" ? body!.account : accountId;

  let account = await db.cloudAccount.findFirst({
    where: { provider: prov, externalId: accountId },
  });
  if (!account) {
    account = await db.cloudAccount.create({
      data: { provider: prov, externalId: accountId, name: accountName, status: "CONNECTED", lastScanAt: new Date() },
    });
  } else {
    account = await db.cloudAccount.update({
      where: { id: account.id },
      data: { status: "CONNECTED", lastScanAt: new Date() },
    });
  }

  let upserted = 0;
  const skipped: string[] = [];
  const idMap = new Map<string, string>(); // externalId → resource row id
  for (const raw of body!.resources as import("@/lib/evaluate").IngestResource[]) {
    if (typeof raw.name !== "string" || typeof raw.externalId !== "string" ||
        raw.name === "" || raw.externalId === "") {
      skipped.push(String(raw.name ?? "<unnamed>"));
      continue;
    }
    const data = {
      name: raw.name,
      type: typeof raw.type === "string" ? raw.type : "Unknown",
      provider: prov,
      region: typeof raw.region === "string" ? raw.region : "unknown",
      externalId: raw.externalId,
      isPublic: raw.isPublic === true,
      hasSensitiveData: false, // classification lands with roadmap DSPM work
      cloudAccountId: account.id,
      lastScanAt: new Date(),
    };
    const existing = await db.resource.findFirst({
      where: { externalId: raw.externalId, cloudAccountId: account.id },
      select: { id: true },
    });
    let rowId: string;
    if (existing) {
      await db.resource.update({ where: { id: existing.id }, data });
      rowId = existing.id;
    } else {
      const createdRow = await db.resource.create({ data, select: { id: true } });
      rowId = createdRow.id;
    }
    idMap.set(raw.externalId, rowId);
    upserted++;
  }

  await db.cloudEvent.create({
    data: {
      ts: new Date(),
      actor: `agent/${prov.toLowerCase()}`,
      action: `Discovered ${upserted} resources in ${accountName}`,
      target: account.name,
      result: "SUCCESS",
      source: "CloudLoom Agent",
    },
  });

  // Real findings from real resources — built-in controls over the snapshot.
  const { evaluateSnapshot } = await import("@/lib/evaluate");
  const findings = await evaluateSnapshot(
    (body!.resources as import("@/lib/evaluate").IngestResource[]).filter(
      (r) => typeof r.name === "string" && typeof r.externalId === "string" && r.name && r.externalId
    ) as import("@/lib/evaluate").IngestResource[],
    idMap
  );

  return NextResponse.json({ ok: true, account: account.name, upserted, skipped: skipped.length, findings });
}

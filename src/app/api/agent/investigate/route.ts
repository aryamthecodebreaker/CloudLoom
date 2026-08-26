import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardMutation } from "@/lib/guard";
import { apiWorkspace, resourceScope } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Blue Agent: autonomous issue investigation. Bring your own key —
 * OPENAI_API_KEY (optionally OPENAI_BASE_URL for compatible providers).
 * Without a key this returns 501 with setup guidance; the product is fully
 * functional without it.
 */
export async function POST(req: NextRequest) {
  const denied = guardMutation(req);
  if (denied) return denied;

  const { ctx, denied: unauth } = await apiWorkspace();
  if (unauth) return unauth;

  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (apiKey === "") {
    return NextResponse.json(
      {
        error: "Blue Agent is not configured on this deployment.",
        hint: "Set OPENAI_API_KEY in the environment to enable AI investigations. Everything else works without it.",
      },
      { status: 501 }
    );
  }
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  const body = await req.json().catch(() => null);
  const refId = typeof body?.refId === "string" ? body.refId : "";
  if (!/^CL-\d+$/i.test(refId)) {
    return NextResponse.json({ error: "Invalid refId" }, { status: 400 });
  }

  const issue = await db.issue.findFirst({
    where: { AND: [{ refId: refId.toUpperCase() }, resourceScope(ctx)] },
    include: {
      control: true,
      resource: { include: { cloudAccount: true, project: true, _count: { select: { vulnerabilities: true } } } },
    },
  });
  if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

  const edges = await db.graphEdge.findMany({
    where: { OR: [{ fromId: issue.resourceId }, { toId: issue.resourceId }] },
    include: { from: { select: { name: true } }, to: { select: { name: true } } },
  });

  const context = [
    `Issue: ${issue.refId} [${issue.severity}, ${issue.status}] — ${issue.title}`,
    `Description: ${issue.description}`,
    `Matched control: ${issue.control.controlId} — ${issue.control.name} (query: ${issue.control.queryHint})`,
    `Resource: ${issue.resource.name} (${issue.resource.type}, ${issue.resource.cloudAccount.provider} account ${issue.resource.cloudAccount.name}, region ${issue.resource.region})`,
    `Resource flags: ${issue.resource.isPublic ? "internet-exposed" : "internal"}, ${issue.resource.hasSensitiveData ? "handles sensitive data" : "no sensitive data"}, ${issue.resource._count.vulnerabilities} known CVEs`,
    `Graph connections: ${edges.map((e) => `${e.from.name} → ${e.to.name}`).join("; ") || "none"}`,
  ].join("\n");

  let investigation: string;
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are CloudLoom's Blue Agent, a cloud-security investigation assistant. Given a finding with graph context, produce a concise investigation: (1) what the finding means in plain language, (2) whether it looks exploitable based on the connections shown, (3) the single best next action, (4) a one-line verdict starting with 'VERDICT:'. Be specific, cite the context given, never invent resources that are not listed. Max 180 words.",
          },
          { role: "user", content: context },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `AI provider returned ${res.status}`, detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }
    const data = await res.json();
    investigation = data?.choices?.[0]?.message?.content ?? "";
  } catch {
    return NextResponse.json({ error: "Investigation request failed" }, { status: 502 });
  }

  if (investigation === "") {
    return NextResponse.json({ error: "Empty investigation response" }, { status: 502 });
  }

  await db.cloudEvent.create({
    data: {
      ts: new Date(),
      actor: "agent/blue",
      action: `Investigated ${issue.refId} — verdict delivered`,
      target: issue.refId,
      result: "SUCCESS",
      source: "CloudLoom Agent",
    },
  });

  return NextResponse.json({ investigation });
}

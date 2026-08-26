import { db } from "@/lib/db";
import { ensureFrameworks } from "@/lib/catalog";

// Wire shape mirrors agent/internal/provider.Resource (Go) — camelCase JSON.
export type IngestResource = {
  name: string;
  type: string;
  region?: string;
  externalId: string;
  isPublic?: boolean;
};

/**
 * Built-in controls evaluated against REAL ingested resources. This is what
 * makes a connected account produce genuine findings instead of seed noise.
 * Each rule: (control row, predicate over a resource).
 */
const REAL_CONTROLS: Array<{
  controlId: string;
  name: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  category: string;
  framework: string;
  queryHint: string;
  match: (r: IngestResource) => boolean;
  issueTitle: (r: IngestResource) => string;
  issueBody: (r: IngestResource) => string;
}> = [
  {
    controlId: "R-2001",
    name: "Object storage publicly accessible",
    description: "Storage reachable by anonymous principals. Public buckets are the most common cause of real cloud data breaches.",
    severity: "CRITICAL",
    category: "Data Security",
    framework: "PCI DSS v4.0",
    queryHint: "resource.type = storage AND resource.isPublic",
    match: (r) => r.isPublic === true && /storage|bucket/i.test(r.type),
    issueTitle: (r) => `Object storage "${r.name}" is publicly accessible`,
    issueBody: (r) => `Discovered by the CloudLoom agent in ${r.region || "unknown region"}. Block public access at the account and bucket level, then verify with a re-scan.`,
  },
  {
    controlId: "R-2002",
    name: "Compute exposed to the internet",
    description: "Virtual machines with public IPs are the entry point of most cloud intrusions. Pair exposure with patch status before judging severity.",
    severity: "HIGH",
    category: "Network",
    framework: "CIS AWS Foundations v3.0",
    queryHint: "resource.type = vm AND resource.isPublic",
    match: (r) => r.isPublic === true && /virtual machine|instance/i.test(r.type),
    issueTitle: (r) => `Compute "${r.name}" is reachable from the internet`,
    issueBody: (r) => `The agent found a public address on this instance (${r.region || "unknown region"}). If exposure is unintended, remove the public IP or front it with a load balancer.`,
  },
  {
    controlId: "R-2003",
    name: "Identity trusts external principals",
    description: "Roles whose trust policy accepts external accounts or anonymous principals can be hijacked by parties outside your organization.",
    severity: "HIGH",
    category: "Identity & Entitlements",
    framework: "SOC 2 Type II",
    queryHint: "resource.type = identity AND resource.isPublic",
    match: (r) => r.isPublic === true && /identity|role/i.test(r.type),
    issueTitle: (r) => `Identity "${r.name}" trusts principals outside the account`,
    issueBody: (r) => `AssumeRolePolicyDocument references external roots or anonymous principals. Scope the trust policy to known principals and require external-id conditions.`,
  },
];

/** Ensure the built-in real-ingestion controls exist (idempotent). */
export async function ensureRealControls() {
  await ensureFrameworks();
  for (const c of REAL_CONTROLS) {
    await db.control.upsert({
      where: { controlId: c.controlId },
      update: { name: c.name, description: c.description, severity: c.severity },
      create: {
        controlId: c.controlId,
        name: c.name,
        description: c.description,
        severity: c.severity,
        framework: c.framework,
        category: c.category,
        queryHint: c.queryHint,
      },
    });
  }
}

/**
 * Evaluate built-in controls over a freshly ingested snapshot.
 * Creates OPEN issues for matches; never duplicates an existing open finding
 * for the same (control, resource) pair.
 */
export async function evaluateSnapshot(resources: IngestResource[], resourceIds: Map<string, string>) {
  await ensureRealControls();
  let created = 0;

  for (const c of REAL_CONTROLS) {
    const control = await db.control.findUnique({ where: { controlId: c.controlId } });
    if (!control) continue;

    for (const r of resources) {
      if (!c.match(r)) continue;
      const resourceId = resourceIds.get(r.externalId);
      if (!resourceId) continue;

      const existing = await db.issue.findFirst({
        where: { controlId: control.id, resourceId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        select: { id: true },
      });
      if (existing) continue;

      await db.issue.create({
        data: {
          refId: await nextRefId(),
          title: c.issueTitle(r),
          description: c.issueBody(r),
          status: "OPEN",
          severity: c.severity,
          controlId: control.id,
          resourceId,
        },
      });
      created++;
    }
  }
  return created;
}

/** Allocate the next public reference number for agent-generated issues. */
export async function nextRefId(): Promise<string> {
  const agg = await db.issue.aggregate({ _max: { refId: true } });
  const max = agg._max.refId ?? "CL-999";
  const n = parseInt(max.replace("CL-", ""), 10) || 999;
  return `CL-${n + 1}`;
}

/**
 * Re-evaluation pass: for every built-in control, auto-close OPEN findings on
 * this account whose resource is present in a fresh snapshot but no longer
 * matches. Resources absent from the snapshot are left for the operator —
 * absence is ambiguous (deleted vs. permission regression).
 */
export async function closeStaleFindings(
  accountId: string,
  fresh: IngestResource[],
  resourceIds: Map<string, string>,
  workspaceId: string
): Promise<number> {
  await ensureRealControls();
  let resolved = 0;

  for (const c of REAL_CONTROLS) {
    const control = await db.control.findUnique({ where: { controlId: c.controlId } });
    if (!control) continue;

    const open = await db.issue.findMany({
      where: { controlId: control.id, status: "OPEN", resource: { cloudAccountId: accountId } },
      include: { resource: { select: { externalId: true, name: true } } },
    });

    for (const issue of open) {
      const freshRow = fresh.find((f) => f.externalId === issue.resource.externalId);
      if (!freshRow || c.match(freshRow)) continue;

      await db.issue.update({ where: { id: issue.id }, data: { status: "RESOLVED" } });
      await db.cloudEvent.create({
        data: {
          ts: new Date(),
          actor: "system/reevaluation",
          action: `Auto-closed ${issue.refId} — "${c.name}" no longer matches on re-scan`,
          target: issue.resource.name,
          result: "SUCCESS",
          source: "CloudLoom Agent",
          workspaceId,
        },
      });
      resolved++;
    }
  }
  return resolved;
}
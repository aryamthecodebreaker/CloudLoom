import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvCell } from "@/lib/csv";
import { apiWorkspace, accountScope } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** Full inventory export (SBOM-style): every discovered resource. */
export async function GET() {
  const { ctx, denied } = await apiWorkspace();
  if (denied) return denied;

  const resources = await db.resource.findMany({
    where: accountScope(ctx),
    include: { cloudAccount: true, project: true, _count: { select: { issues: true, vulnerabilities: true } } },
    orderBy: [{ provider: "asc" }, { name: "asc" }],
  });

  const header = ["name", "type", "provider", "account", "region", "external_id", "public", "sensitive_data", "project", "open_issues", "cves"];
  const rows = resources.map((r) =>
    [
      r.name,
      r.type,
      r.provider,
      r.cloudAccount.name,
      r.region,
      r.externalId,
      r.isPublic ? "yes" : "no",
      r.hasSensitiveData ? "yes" : "no",
      r.project?.name ?? "",
      r._count.issues,
      r._count.vulnerabilities,
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = "\uFEFF" + [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cloudloom-inventory.csv"',
    },
  });
}

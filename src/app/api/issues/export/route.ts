import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvCell } from "@/lib/csv";
import { apiWorkspace, resourceScope } from "@/lib/rbac";

export const dynamic = "force-dynamic";


export async function GET() {
  const { ctx, denied } = await apiWorkspace();
  if (denied) return denied;

  const issues = await db.issue.findMany({
    where: resourceScope(ctx),
    include: {
      control: true,
      resource: { include: { cloudAccount: true, project: true } },
    },
    orderBy: { refId: "asc" },
  });

  const header = [
    "ref_id", "title", "severity", "status", "control", "resource",
    "provider", "account", "project", "has_attack_path", "created_at",
  ];
  const rows = issues.map((i) =>
    [
      i.refId,
      i.title,
      i.severity,
      i.status,
      `${i.control.controlId} ${i.control.name}`,
      i.resource.name,
      i.resource.cloudAccount.provider,
      i.resource.cloudAccount.name,
      i.resource.project?.name ?? "",
      i.attackPathJson ? "yes" : "no",
      i.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(",")
  );
  // UTF-8 BOM so Excel on Windows reads the encoding correctly
  const csv = "\uFEFF" + [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cloudloom-issues.csv"',
    },
  });
}

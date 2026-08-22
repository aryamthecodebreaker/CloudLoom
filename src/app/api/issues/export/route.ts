import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const issues = await db.issue.findMany({
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
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cloudloom-issues.csv"',
    },
  });
}

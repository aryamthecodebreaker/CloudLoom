import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { csvCell } from "@/lib/csv";
import { apiWorkspace, resourceScope } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** Audit-ready evidence export: every mapped control with live status and open findings. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { ctx, denied } = await apiWorkspace();
  if (denied) return denied;

  const framework = await db.complianceFramework.findUnique({ where: { id: params.id } });
  if (!framework) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const controls = await db.control.findMany({
    where: { framework: framework.name },
    include: {
      issues: {
        where: { AND: [{ status: { in: ["OPEN", "IN_PROGRESS"] } }, resourceScope(ctx)] },
        include: { resource: { select: { name: true } } },
      },
    },
    orderBy: { controlId: "asc" },
  });

  const header = ["control_id", "control", "severity", "category", "status", "open_findings", "affected_resources"];
  const rows = controls.map((c) =>
    [
      c.controlId,
      c.name,
      c.severity,
      c.category,
      c.issues.length > 0 ? "FAILING" : "PASSING",
      c.issues.length,
      c.issues.map((i) => i.resource.name).join("; "),
    ]
      .map(csvCell)
      .join(",")
  );
  const csv =
    "\uFEFF" +
    [`# framework: ${framework.name} (${framework.family})`, `# exported: ${new Date().toISOString()}`, header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${framework.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-evidence.csv"`,
    },
  });
}

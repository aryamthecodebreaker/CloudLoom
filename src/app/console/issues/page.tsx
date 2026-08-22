import { db } from "@/lib/db";
import { IssuesClient } from "./issues-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Issues" };

export default async function IssuesPage() {
  const issues = await db.issue.findMany({
    include: {
      control: true,
      resource: { include: { project: true, cloudAccount: true } },
    },
    orderBy: [{ status: "asc" }, { severity: "asc" }, { refId: "desc" }],
  });

  const sevRank = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];
  const statusRank = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

  const initial = issues
    .map((i) => ({
      id: i.id,
      refId: i.refId,
      title: i.title,
      description: i.description,
      status: i.status,
      severity: i.severity,
      controlName: i.control.name,
      controlId: i.control.controlId,
      resourceName: i.resource.name,
      resourceType: i.resource.type,
      provider: i.resource.cloudAccount.provider,
      projectName: i.resource.project?.name ?? "—",
      hasPath: !!i.attackPathJson,
      updatedAt: i.updatedAt.toISOString(),
    }))
    .sort(
      (a, b) =>
        statusRank.indexOf(a.status) - statusRank.indexOf(b.status) ||
        sevRank.indexOf(a.severity) - sevRank.indexOf(b.severity)
    );

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-wiz-navy">Issues</h1>
        <p className="mt-1 text-sm text-slate-500">
          Prioritized risk findings from controls evaluated against the security graph.
          Click a row for details · change status inline.
        </p>
      </header>
      <IssuesClient initial={initial} />
    </div>
  );
}

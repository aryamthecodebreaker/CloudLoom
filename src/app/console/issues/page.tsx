import Link from "next/link";
import { db } from "@/lib/db";
import { IssuesClient } from "./issues-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Issues" };

export default async function IssuesPage({
  searchParams,
}: {
  searchParams?: { ref?: string; status?: string; severity?: string };
}) {
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

  const sp = searchParams ?? {};
  const validStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"].includes(sp.status ?? "")
    ? (sp.status as string)
    : "ALL";

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Issues</h1>
          <p className="mt-1 text-sm text-slate-500">
            Prioritized findings from controls evaluated against the security graph.
            Click a row for details · press <kbd className="rounded border border-line bg-white px-1 text-[10px] font-semibold">/</kbd> to search · share views via URL.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/issues/export" className="btn-secondary">Export CSV</a>
          <Link href="/console/graph" className="btn-primary">Open graph</Link>
        </div>
      </header>
      <IssuesClient
        initial={initial}
        initialRef={sp.ref ?? ""}
        initialStatus={validStatus}
        initialSeverity={sevRank.includes(sp.severity ?? "") ? (sp.severity as string) : "ALL"}
      />
    </div>
  );
}

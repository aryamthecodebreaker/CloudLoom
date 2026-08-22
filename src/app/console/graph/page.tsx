import { db } from "@/lib/db";
import { GraphClient } from "./graph-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Graph Explorer" };

const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFORMATIONAL: 0 };

export default async function GraphExplorerPage() {
  const [resources, edges] = await Promise.all([
    db.resource.findMany({
      include: {
        cloudAccount: true,
        project: true,
        issues: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, select: { refId: true, title: true, severity: true, status: true } },
        _count: { select: { vulnerabilities: true, edgesOut: true, edgesIn: true } },
      },
    }),
    db.graphEdge.findMany(),
  ]);

  const nodes = resources.map((r) => {
    const worstOpen = r.issues.reduce<string | null>(
      (worst, i) => (!worst || SEV_RANK[i.severity] > SEV_RANK[worst] ? i.severity : worst),
      null
    );
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      provider: r.cloudAccount.provider,
      accountName: r.cloudAccount.name,
      region: r.region,
      externalId: r.externalId,
      isPublic: r.isPublic,
      hasSensitiveData: r.hasSensitiveData,
      projectName: r.project?.name ?? "—",
      worstOpenSeverity: worstOpen,
      openIssues: r.issues,
      vulnCount: r._count.vulnerabilities,
      edgeCount: r._count.edgesOut + r._count.edgesIn,
    };
  });

  return (
    <div className="mx-auto max-w-[1400px] p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Graph Explorer</h1>
          <p className="mt-1 text-sm text-slate-500">
            The seeded security graph, drawn. Columns are cloud accounts; edges show how risk
            travels. Click any node to inspect it.
          </p>
        </div>
        <span className="badge bg-amber-100 px-3 py-1.5 text-amber-700" title="No live cloud connections — seeded simulation">
          Simulated data
        </span>
      </header>
      <GraphClient nodes={nodes} edges={edges.map((e) => ({ fromId: e.fromId, kind: e.kind, toId: e.toId }))} />
    </div>
  );
}

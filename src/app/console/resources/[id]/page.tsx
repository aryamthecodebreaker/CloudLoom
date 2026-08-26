import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EDGE_LEGEND, edgeColor, formatDate, relTime, severityStyle, SEVERITY_STYLES, statusStyle } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const resource = await db.resource.findUnique({
    where: { id: params.id },
    include: {
      cloudAccount: true,
      project: true,
      issues: { include: { control: true }, orderBy: [{ status: "asc" }, { severity: "asc" }] },
      vulnerabilities: { orderBy: { cvss: "desc" } },
    },
  });
  if (!resource) notFound();

  const edges = await db.graphEdge.findMany({
    where: { OR: [{ fromId: resource.id }, { toId: resource.id }] },
    include: { from: { select: { id: true, name: true } }, to: { select: { id: true, name: true } } },
  });
  const outgoing = edges.filter((e) => e.fromId === resource.id);
  const incoming = edges.filter((e) => e.toId === resource.id);

  // Attack paths whose hops mention this resource
  const pathsThrough = await db.issue.findMany({
    where: { attackPathJson: { contains: resource.name } },
    select: { refId: true, title: true, severity: true },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link href="/console/inventory" className="text-sm font-semibold text-accent hover:underline">
        ← Inventory
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-coal">{resource.name}</h1>
            {resource.isPublic && <span className="badge bg-orange-100 text-orange-700">Public</span>}
            {resource.hasSensitiveData && <span className="badge bg-pink-100 text-pink-600">Sensitive data</span>}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">{resource.externalId}</p>
        </div>
        <Link href="/console/graph" className="btn-secondary">View in graph</Link>
      </header>

      <dl className="mt-6 grid gap-x-8 gap-y-2 rounded-md border border-line bg-white p-5 text-sm sm:grid-cols-[160px_1fr]">
        <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">Type</dt>
        <dd className="text-ink">{resource.type}</dd>
        <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">Account</dt>
        <dd className="text-ink">{resource.cloudAccount.provider} · {resource.cloudAccount.name}</dd>
        <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">Region</dt>
        <dd className="text-ink">{resource.region}</dd>
        <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">Project</dt>
        <dd className="text-ink">{resource.project?.name ?? "—"}</dd>
        <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">Last scan</dt>
        <dd className="text-ink">{formatDate(resource.lastScanAt)}</dd>
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Issues */}
        <section className="rounded-md border border-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Issues ({resource.issues.length})
          </h2>
          <ul className="mt-4 space-y-2.5">
            {resource.issues.map((i) => (
              <li key={i.id}>
                <Link href={`/console/issues/${i.refId}`} className="block rounded-lg border border-line px-4 py-3 transition-colors hover:border-accent/50">
                  <span className="flex items-center gap-2">
                    <span className={`badge ${severityStyle(i.severity)}`}>{i.severity}</span>
                    <span className="font-mono text-[10px] text-slate-400">{i.refId}</span>
                    <span className={`ml-auto text-[10px] font-bold uppercase ${statusStyle(i.status).split(" ")[1] ?? ""}`}>{i.status.replace("_", " ")}</span>
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-snug text-coal">{i.title}</span>
                </Link>
              </li>
            ))}
            {resource.issues.length === 0 && (
              <li className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">No issues on this resource.</li>
            )}
          </ul>
        </section>

        {/* Vulnerabilities */}
        <section className="rounded-md border border-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Vulnerabilities ({resource.vulnerabilities.length})
          </h2>
          <ul className="mt-4 space-y-2.5">
            {resource.vulnerabilities.map((v) => (
              <li key={v.id} className="rounded-lg border border-line px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-coal">{v.cveId}</span>
                  <span className={`badge ${SEVERITY_STYLES[v.severity as keyof typeof SEVERITY_STYLES] ?? ""}`}>{v.severity}</span>
                  {v.exploitedInWild && <span className="badge bg-red-600 text-white">KEV</span>}
                  <span className="ml-auto font-mono text-xs text-slate-400">CVSS {v.cvss.toFixed(1)}</span>
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  {v.packageName} {v.installedVersion} → fix in <span className="text-emerald-600">{v.fixedVersion}</span>
                </p>
              </li>
            ))}
            {resource.vulnerabilities.length === 0 && (
              <li className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">No known CVEs.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Graph connections */}
      <section className="mt-6 rounded-md border border-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Graph connections ({edges.length})
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {EDGE_LEGEND.slice(0, 6).map(([k, c]) => (
              <span key={k} className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: c }} />
                {k.replace(/_/g, " ").toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {[
            { title: "Outgoing", list: outgoing, pick: (e: (typeof outgoing)[number]) => e.to },
            { title: "Incoming", list: incoming, pick: (e: (typeof incoming)[number]) => e.from },
          ].map(({ title, list, pick }) => (
            <div key={title}>
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{title}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((e) => {
                  const other = pick(e);
                  return (
                    <li key={e.id}>
                      <Link href={`/console/resources/${other.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2 text-sm transition-colors hover:bg-mist">
                        <span className="truncate font-medium text-coal">{other.name}</span>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${edgeColor(e.kind)}18`, color: edgeColor(e.kind) }}>
                          {e.kind.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {list.length === 0 && <li className="text-xs text-slate-400">none</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Attack paths through this resource */}
      {pathsThrough.length > 0 && (
        <section className="mt-6 rounded-md border border-pink-200 bg-pink-50/40 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-pink-600">
            Attack paths through this resource
          </h2>
          <ul className="mt-3 space-y-2">
            {pathsThrough.map((p) => (
              <li key={p.refId}>
                <Link href={`/console/issues/${p.refId}`} className="flex items-center gap-2 text-sm">
                  <span className={`badge ${SEVERITY_STYLES[p.severity as keyof typeof SEVERITY_STYLES] ?? ""}`}>{p.severity}</span>
                  <span className="font-mono text-[10px] text-slate-400">{p.refId}</span>
                  <span className="font-medium text-coal hover:text-accent">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs text-slate-400">Discovered {relTime(resource.lastScanAt)} · {resource.cloudAccount.provider} resource</p>
    </div>
  );
}

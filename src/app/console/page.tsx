import Link from "next/link";
import { db } from "@/lib/db";
import { SEVERITY_STYLES, STATUS_STYLES, formatDate, parseAttackPath } from "@/lib/ui";

export const dynamic = "force-dynamic";

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];

export default async function SecurityDashboard() {
  const [issues, accounts, resources, vulns] = await Promise.all([
    db.issue.findMany({ include: { resource: true, control: true }, orderBy: { createdAt: "desc" } }),
    db.cloudAccount.findMany(),
    db.resource.count(),
    db.vulnerability.findMany(),
  ]);

  const openIssues = issues.filter((i) => i.status === "OPEN");
  const criticalPaths = issues.filter((i) => i.attackPathJson && (i.status === "OPEN" || i.status === "IN_PROGRESS"));
  const kevCount = vulns.filter((v) => v.exploitedInWild).length;
  const bySeverity = Object.fromEntries(SEV_ORDER.map((s) => [s, openIssues.filter((i) => i.severity === s).length]));
  const maxSev = Math.max(1, ...Object.values(bySeverity));

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-loom-navy">Security Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Environment-wide risk at a glance · Last sync {formatDate(accounts[0]?.lastScanAt ?? null)}
          </p>
        </div>
        <Link href="/console/issues" className="btn-secondary">View all issues →</Link>
      </header>

      {/* KPI cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open issues" value={openIssues.length} accent="#E23A82" sub={`${issues.length - openIssues.length} closed`} />
        <Kpi label="Critical attack paths" value={criticalPaths.length} accent="#D92D20" sub="entry → sensitive data" />
        <Kpi label="Monitored resources" value={resources} accent="#2C6BFF" sub={`${accounts.filter(a => a.status === "CONNECTED").length}/${accounts.length} connectors healthy`} />
        <Kpi label="Exploited-in-the-wild CVEs" value={kevCount} accent="#B54708" sub="across your workloads" />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Open issues by severity */}
        <section className="rounded-2xl border border-loom-line bg-white p-6 shadow-card lg:col-span-3">
          <h2 className="font-bold text-loom-navy">Open issues by severity</h2>
          <div className="mt-5 space-y-4">
            {SEV_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className={`badge ${SEVERITY_STYLES[s]} w-28 justify-center`}>{s}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-loom-cloud">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${(bySeverity[s] / maxSev) * 100}%`,
                      background: s === "CRITICAL" ? "#D92D20" : s === "HIGH" ? "#F76808" : s === "MEDIUM" ? "#F59E0B" : s === "LOW" ? "#0BA5EC" : "#94A3B8",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-loom-navy">{bySeverity[s]}</span>
              </div>
            ))}
          </div>
          <Link href="/console/issues?status=OPEN" className="mt-6 inline-block text-sm font-semibold text-loom-blue hover:underline">
            Triage open issues →
          </Link>
        </section>

        {/* Connector health */}
        <section className="rounded-2xl border border-loom-line bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-bold text-loom-navy">Connector health</h2>
          <ul className="mt-4 space-y-3">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-loom-cloud px-4 py-2.5 text-sm">
                <div>
                  <span className="font-semibold text-loom-navy">{a.name}</span>
                  <span className="ml-2 text-xs uppercase tracking-wide text-slate-400">{a.provider}</span>
                </div>
                <span className={`badge ${a.status === "CONNECTED" ? "bg-emerald-100 text-emerald-700" : a.status === "ERROR" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Top attack paths */}
      <section className="mt-8 rounded-2xl border border-loom-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-loom-navy">Top attack paths</h2>
          <Link href="/console/attack-paths" className="text-sm font-semibold text-loom-blue hover:underline">All paths →</Link>
        </div>
        <ul className="mt-4 divide-y divide-loom-line">
          {criticalPaths.slice(0, 4).map((issue) => {
            const hops = parseAttackPath(issue.attackPathJson);
            return (
              <li key={issue.id}>
                <Link href="/console/attack-paths" className="group flex items-center gap-4 py-4">
                  <span className={`badge ${SEVERITY_STYLES[issue.severity]} shrink-0`}>{issue.severity}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-loom-navy group-hover:text-loom-blue">
                    {issue.title}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 md:flex">
                    {hops.map((h, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        {idx > 0 && <span className="text-xs text-loom-pink">→</span>}
                        <span className="rounded-md bg-loom-sky px-2 py-1 text-[11px] font-medium text-loom-blue">{h.label}</span>
                      </span>
                    ))}
                  </span>
                  <span className={`badge ${STATUS_STYLES[issue.status]} shrink-0`}>{issue.status.replace("_", " ")}</span>
                </Link>
              </li>
            );
          })}
          {criticalPaths.length === 0 && (
            <li className="py-6 text-sm text-slate-500">No active attack paths. Nice.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: number; sub: string; accent: string }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-loom-line bg-white p-6 shadow-card">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight" style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </article>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { requireWorkspace, accountScope, resourceScope } from "@/lib/rbac";
import { ConnectGuide } from "@/components/connect-guide";
import { SEVERITIES, eventStyle, formatDate, parseAttackPath, relTime, severityStyle, statusStyle } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SecurityDashboard() {
  const ws = await requireWorkspace();
  const issueScope = resourceScope(ws);
  const [severityGroups, openCount, closedCount, accounts, resources, kevCount, criticalPaths, events] =
    await Promise.all([
      db.issue.groupBy({
        by: ["severity"],
        where: { AND: [{ status: "OPEN" }, issueScope] },
        _count: { _all: true },
      }),
      db.issue.count({ where: { AND: [{ status: "OPEN" }, issueScope] } }),
      db.issue.count({ where: { AND: [{ status: { notIn: ["OPEN"] } }, issueScope] } }),
      db.cloudAccount.findMany({ where: { workspaceId: ws.workspaceId } }),
      db.resource.count({ where: accountScope(ws) }),
      db.vulnerability.count({ where: { AND: [{ exploitedInWild: true }, issueScope] } }),
      db.issue.findMany({
        where: {
          AND: [
            { attackPathJson: { not: null }, status: { in: ["OPEN", "IN_PROGRESS"] } },
            issueScope,
          ],
        },
        orderBy: { refId: "desc" },
        take: 4,
      }),
      db.cloudEvent.findMany({
        where: { workspaceId: ws.workspaceId },
        orderBy: { ts: "desc" },
        take: 6,
      }),
    ]);

  const bySeverity = Object.fromEntries(
    SEVERITIES.map((s) => [s, severityGroups.find((g) => g.severity === s)?._count._all ?? 0])
  );
  const maxSev = Math.max(1, ...Object.values(bySeverity));
  const healthyScans = accounts
    .filter((a) => a.status === "CONNECTED" && a.lastScanAt)
    .map((a) => a.lastScanAt as Date);
  const lastSync = healthyScans.length
    ? new Date(Math.min(...healthyScans.map((d) => d.getTime())))
    : null;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Security Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Environment-wide risk at a glance · Last sync {formatDate(lastSync)}
          </p>
        </div>
        <Link href="/console/issues" className="btn-secondary">View all issues →</Link>
      </header>

      {accounts.length === 0 ? (
        <div className="mt-8">
          <ConnectGuide />
        </div>
      ) : (
      <>
      {/* KPI cards — hierarchy by order and weight, not rainbow strips */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi href="/console/issues?status=OPEN" label="Open issues" value={openCount} sub={`${closedCount} closed`} alarm={false} />
        <Kpi href="/console/attack-paths" label="Critical attack paths" value={criticalPaths.length} sub="entry → sensitive data" alarm={criticalPaths.length > 0} />
        <Kpi href="/console/inventory" label="Monitored resources" value={resources} sub={`${accounts.filter(a => a.status === "CONNECTED").length}/${accounts.length} connectors healthy`} alarm={false} />
        <Kpi href="/console/vulnerabilities" label="Exploited-in-the-wild CVEs" value={kevCount} sub="across your workloads" alarm={false} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Open issues by severity */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-3">
          <h2 className="font-bold text-coal">Open issues by severity</h2>
          {openCount === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No open issues. Connect a cloud account and findings will appear here as the agent discovers them.
            </p>
          ) : (
          <div className="mt-5 space-y-4">
            {SEVERITIES.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className={`badge ${severityStyle(s)} w-28 justify-center`}>{s}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-cream">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${(bySeverity[s] / maxSev) * 100}%`,
                      background: s === "CRITICAL" ? "#D92D20" : s === "HIGH" ? "#F76808" : s === "MEDIUM" ? "#F59E0B" : s === "LOW" ? "#0BA5EC" : "#94A3B8",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-coal">{bySeverity[s]}</span>
              </div>
            ))}
          </div>
          )}
          <Link href="/console/issues?status=OPEN" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
            Triage open issues →
          </Link>
        </section>

        {/* Connector health */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-bold text-coal">Connector health</h2>
          <ul className="mt-4 space-y-3">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-cream px-4 py-2.5 text-sm">
                <div>
                  <span className="font-semibold text-coal">{a.name}</span>
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
      <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-coal">Top attack paths</h2>
          <Link href="/console/attack-paths" className="text-sm font-semibold text-accent hover:underline">All paths →</Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {criticalPaths.map((issue) => {
            const hops = parseAttackPath(issue.attackPathJson);
            return (
              <li key={issue.id}>
                <Link href="/console/attack-paths" className="group flex items-center gap-4 py-4">
                  <span className={`badge ${severityStyle(issue.severity)} shrink-0`}>{issue.severity}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-coal group-hover:text-accent">
                    {issue.title}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 md:flex">
                    {hops.map((h, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        {idx > 0 && <span className="text-xs text-rose">→</span>}
                        <span className="rounded-md bg-mist px-2 py-1 text-[11px] font-medium text-accent">{h.label}</span>
                      </span>
                    ))}
                  </span>
                  <span className={`badge ${statusStyle(issue.status)} shrink-0`}>{issue.status.replace("_", " ")}</span>
                </Link>
              </li>
            );
          })}
          {criticalPaths.length === 0 && (
            <li className="py-6 text-sm text-slate-500">No active attack paths. Nice.</li>
          )}
        </ul>
      </section>

      </>
      )}
      {/* Recent cloud activity */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-coal">Recent cloud activity</h2>
          <span className="text-xs text-slate-400">simulated event stream</span>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
              <span className={`badge shrink-0 ${eventStyle(ev.result)}`}>{ev.result}</span>
              <span className="min-w-0 flex-1">
                <span className="font-mono text-xs text-slate-500">{ev.actor}</span>{" "}
                <span className="text-slate-700">{ev.action}</span>
              </span>
              <span className="hidden shrink-0 rounded-md bg-cream px-2 py-0.5 text-[11px] font-medium text-slate-500 lg:inline-block">
                {ev.source}
              </span>
              <span className="w-24 shrink-0 text-right text-xs text-slate-400">{relTime(ev.ts)}</span>
            </li>
          ))}
          {events.length === 0 && (
            <li className="py-6 text-sm text-slate-500">No events recorded yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, alarm, href }: { label: string; value: number; sub: string; alarm: boolean; href: string }) {
  return (
    <Link href={href} className="block rounded-md border border-line bg-white p-5 transition-colors hover:border-ink/40">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${alarm ? "text-red-600" : "text-ink"}`}>
        {value}
        {alarm && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-600 align-middle" aria-hidden />}
      </p>
      <p className="mt-1 text-xs text-ink-faint">{sub}</p>
    </Link>
  );
}

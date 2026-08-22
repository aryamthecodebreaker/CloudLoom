import Link from "next/link";
import { db } from "@/lib/db";
import { parseAttackPath, severityStyle, statusStyle, type AttackHop } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Attack Paths" };

const KIND_COLORS: Record<string, string> = {
  entry: "#F79009",
  workload: "#E23A82",
  identity: "#2C6BFF",
  data: "#12B76A",
  impact: "#7C3AED",
};
const KIND_LABELS: Record<string, string> = {
  entry: "Entry point",
  workload: "Workload",
  identity: "Identity",
  data: "Sensitive data",
  impact: "Impact",
};

export default async function AttackPathsPage() {
  const paths = await db.issue.findMany({
    where: { attackPathJson: { not: null } },
    include: { resource: { include: { cloudAccount: true, project: true } }, control: true },
    orderBy: { refId: "desc" },
  });

  const active = paths.filter((p) => p.status === "OPEN" || p.status === "IN_PROGRESS");

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Attack Paths</h1>
          <p className="mt-1 text-sm text-slate-500">
            Toxic combinations ranked by exploitability — each hop is a place to break the chain.
          </p>
        </div>
        <span className={`badge px-3 py-1.5 ${active.length > 0 ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-700"}`}>
          {active.length} active
        </span>
      </header>

      <div className="mt-6 space-y-6">
        {paths.map((issue) => {
          const hops = parseAttackPath(issue.attackPathJson);
          return (
            <article key={issue.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex flex-wrap items-center gap-3 border-b border-line bg-cream px-6 py-4">
                <span className={`badge ${severityStyle(issue.severity)}`}>{issue.severity}</span>
                <span className={`badge ${statusStyle(issue.status)}`}>{issue.status.replace("_", " ")}</span>
                <h2 className="min-w-0 flex-1 truncate font-semibold text-coal">{issue.title}</h2>
                <Link href={`/console/issues?ref=${issue.refId}`} className="text-xs font-semibold text-accent hover:underline">
                  Manage in issues →
                </Link>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-5">
                {/* Hop graph */}
                <div className="lg:col-span-3">
                  <ol className="flex flex-col gap-0">
                    {hops.map((hop: AttackHop, idx) => {
                      const color = KIND_COLORS[hop.kind] ?? "#2C6BFF";
                      return (
                        <li key={idx}>
                          {idx > 0 && (
                            <div className="ml-[22px] h-7 w-px" style={{ background: color }} aria-hidden />
                          )}
                          <div className="flex items-center gap-4">
                            <span
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                              style={{ background: `${color}18`, color }}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1 rounded-xl border px-4 py-2.5" style={{ borderColor: `${color}55`, background: `${color}08` }}>
                              <p className="truncate text-sm font-semibold text-coal">
                                {hop.label}
                                <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: `${color}18`, color }}>
                                  {KIND_LABELS[hop.kind] ?? hop.kind}
                                </span>
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">{hop.sublabel}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-4">
                    {[...new Set(hops.map((h) => h.kind))].map((k) => (
                      <span key={k} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLORS[k] }} />
                        {KIND_LABELS[k]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Context */}
                <div className="space-y-4 lg:col-span-2">
                  <p className="text-sm leading-relaxed text-slate-600">{issue.description}</p>
                  <dl className="rounded-xl bg-cream p-4 text-xs leading-relaxed text-slate-600">
                    <Row k="Resource" v={`${issue.resource.type} · ${issue.resource.name}`} />
                    <Row k="Cloud account" v={`${issue.resource.cloudAccount.provider} · ${issue.resource.cloudAccount.name}`} />
                    <Row k="Project / owner" v={issue.resource.project?.name ?? "—"} />
                    <Row k="Matched control" v={`${issue.control.controlId} — ${issue.control.name}`} />
                    <Row k="Graph query" v={issue.control.queryHint} mono />
                  </dl>
                  <p className="rounded-lg border border-dashed border-rose/40 bg-pink-50/60 px-4 py-3 text-xs leading-relaxed text-slate-600">
                    <strong className="font-semibold text-rose">Break the first hop:</strong>{" "}
                    removing internet exposure or fixing{" "}
                    {hops[1]?.label ?? "the entry workload"} collapses this entire path.
                  </p>
                </div>
              </div>
            </article>
          );
        })}
        {paths.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-white py-16 text-center text-sm text-slate-400">
            No attack paths detected in the seeded environment.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-3 py-1">
      <dt className="w-32 shrink-0 font-medium text-slate-400">{k}</dt>
      <dd className={`min-w-0 break-all font-medium text-slate-700 ${mono ? "font-mono text-[11px]" : ""}`}>{v}</dd>
    </div>
  );
}

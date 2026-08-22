import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SEVERITY_STYLES, formatDate, parseAttackPath } from "@/lib/ui";
import { StatusSelect } from "./status-select";

export const dynamic = "force-dynamic";

const KIND_COLORS: Record<string, string> = {
  entry: "#F79009", workload: "#E23A82", identity: "#2C6BFF",
  data: "#12B76A", impact: "#7C3AED",
};

export default async function IssueDetailPage({
  params,
}: {
  params: { refId: string };
}) {
  const issue = await db.issue.findFirst({
    where: { refId: params.refId.toUpperCase() },
    include: {
      control: true,
      resource: { include: { cloudAccount: true, project: true } },
    },
  });
  if (!issue) notFound();

  const hops = parseAttackPath(issue.attackPathJson);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/console/issues" className="text-sm font-semibold text-loom-blue hover:underline">
        ← All issues
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${SEVERITY_STYLES[issue.severity]}`}>{issue.severity}</span>
            <span className="font-mono text-xs text-slate-400">{issue.refId}</span>
            <span className="text-xs text-slate-400">· opened {formatDate(issue.createdAt)}</span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-loom-navy">
            {issue.title}
          </h1>
        </div>
        <StatusSelect id={issue.id} status={issue.status} />
      </header>

      <section className="mt-6 rounded-2xl border border-loom-line bg-white p-6 shadow-card">
        <p className="text-sm leading-relaxed text-slate-700">{issue.description}</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Affected resource */}
        <section className="rounded-2xl border border-loom-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Affected resource</h2>
          <p className="mt-3 font-bold text-loom-navy">{issue.resource.name}</p>
          <dl className="mt-3 space-y-1.5 rounded-xl bg-loom-cloud p-4 text-xs leading-relaxed">
            <Row k="Type" v={issue.resource.type} />
            <Row k="Account" v={`${issue.resource.cloudAccount.provider} · ${issue.resource.cloudAccount.name}`} />
            <Row k="Region" v={issue.resource.region} />
            <Row k="Project" v={issue.resource.project?.name ?? "—"} />
            <Row k="External ID" v={issue.resource.externalId} mono />
            {(issue.resource.isPublic || issue.resource.hasSensitiveData) && (
              <div className="flex gap-2 pt-1">
                {issue.resource.isPublic && <span className="badge bg-orange-100 text-orange-700">Public</span>}
                {issue.resource.hasSensitiveData && <span className="badge bg-pink-100 text-pink-600">Sensitive data</span>}
              </div>
            )}
          </dl>
          <Link href="/console/graph" className="mt-4 inline-block text-sm font-semibold text-loom-blue hover:underline">
            View in Graph Explorer →
          </Link>
        </section>

        {/* Matched control */}
        <section className="rounded-2xl border border-loom-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Matched control</h2>
          <p className="mt-3 font-bold text-loom-navy">
            {issue.control.controlId} — {issue.control.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{issue.control.description}</p>
          <p className="mt-4 rounded-lg bg-loom-cloud px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600">
            {issue.control.queryHint}
          </p>
          <p className="mt-3 text-xs text-slate-400">Category: {issue.control.category}</p>
        </section>
      </div>

      {/* Attack path */}
      {hops.length > 0 && (
        <section className="mt-6 rounded-2xl border border-pink-200 bg-pink-50/40 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-pink-600">Attack path</h2>
          <ol className="mt-4 space-y-0">
            {hops.map((hop, idx) => (
              <li key={idx}>
                {idx > 0 && <div className="ml-[22px] h-6 w-px" style={{ background: KIND_COLORS[hop.kind] ?? "#2C6BFF" }} />}
                <div className="flex items-center gap-4">
                  <span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: `${KIND_COLORS[hop.kind] ?? "#2C6BFF"}18`, color: KIND_COLORS[hop.kind] ?? "#2C6BFF" }}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-2.5" style={{ borderColor: `${KIND_COLORS[hop.kind] ?? "#2C6BFF"}55` }}>
                    <p className="truncate text-sm font-semibold text-loom-navy">{hop.label}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{hop.sublabel}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs text-slate-400">Last updated {formatDate(issue.updatedAt)} · simulated finding</p>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 font-medium text-slate-400">{k}</dt>
      <dd className={`break-all font-medium text-slate-700 ${mono ? "font-mono text-[10px]" : ""}`}>{v}</dd>
    </div>
  );
}

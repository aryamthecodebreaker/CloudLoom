import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, parseAttackPath, severityStyle } from "@/lib/ui";
import { StatusSelect } from "./status-select";
import { FixButton } from "./fix-button";
import { CopyLinkButton } from "./copy-link";
import { InvestigateButton } from "./investigate";

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

  // Neighbours in triage order (status → severity → ref), for prev/next navigation
  const all = await db.issue.findMany({
    select: { refId: true, status: true, severity: true },
  });
  const statusRank: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, REJECTED: 3 };
  const sevRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFORMATIONAL: 4 };
  const ordered = all
    .sort(
      (a, b) =>
        (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) ||
        (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) ||
        a.refId.localeCompare(b.refId)
    )
    .map((i) => i.refId);
  const idx = ordered.indexOf(issue.refId);
  const prevRef = idx > 0 ? ordered[idx - 1] : null;
  const nextRef = idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const hops = parseAttackPath(issue.attackPathJson);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/console/issues" className="text-sm font-semibold text-accent hover:underline">
        ← All issues
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${severityStyle(issue.severity)}`}>{issue.severity}</span>
            <span className="font-mono text-xs text-slate-400">{issue.refId}</span>
            <span className="text-xs text-slate-400">· opened {formatDate(issue.createdAt)}</span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-coal">
            {issue.title}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2"><CopyLinkButton /><StatusSelect id={issue.id} status={issue.status} /></div>
          <InvestigateButton refId={issue.refId} />
          <FixButton issueId={issue.id} refId={issue.refId} />
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        <p className="text-sm leading-relaxed text-slate-700">{issue.description}</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Affected resource */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Affected resource</h2>
          <p className="mt-3 font-bold text-coal">{issue.resource.name}</p>
          <dl className="mt-3 space-y-1.5 rounded-xl bg-cream p-4 text-xs leading-relaxed">
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
          <Link href="/console/graph" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
            View in Graph Explorer →
          </Link>
        </section>

        {/* Matched control */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Matched control</h2>
          <p className="mt-3 font-bold text-coal">
            {issue.control.controlId} — {issue.control.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{issue.control.description}</p>
          <p className="mt-4 rounded-lg bg-cream px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600">
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
                    <p className="truncate text-sm font-semibold text-coal">{hop.label}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{hop.sublabel}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="mt-10 flex items-center justify-between border-t border-line pt-5 text-sm">
        {prevRef ? (
          <Link href={`/console/issues/${prevRef}`} className="font-semibold text-accent hover:underline">← {prevRef}</Link>
        ) : <span />}
        {nextRef ? (
          <Link href={`/console/issues/${nextRef}`} className="font-semibold text-accent hover:underline">{nextRef} →</Link>
        ) : <span />}
      </nav>
      <p className="mt-4 text-xs text-slate-400">Last updated {formatDate(issue.updatedAt)}</p>
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

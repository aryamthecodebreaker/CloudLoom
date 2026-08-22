"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SEVERITY_STYLES, STATUS_STYLES } from "@/lib/ui";

type Row = {
  id: string; refId: string; title: string; description: string;
  status: string; severity: string; controlName: string; controlId: string;
  resourceName: string; resourceType: string; provider: string;
  projectName: string; hasPath: boolean; updatedAt: string;
};

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export function IssuesClient({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(initial);
  const [sevFilter, setSevFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (sevFilter === "ALL" || r.severity === sevFilter) &&
          (statusFilter === "ALL" || r.status === statusFilter) &&
          (!query ||
            `${r.refId} ${r.title} ${r.resourceName} ${r.projectName}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [rows, sevFilter, statusFilter, query]
  );

  async function updateStatus(id: string, status: string) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setRows(prev);
      alert("Failed to update issue");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues, resources, projects…"
          className="w-72 rounded-lg border border-loom-line bg-white px-4 py-2 text-sm outline-none focus:border-loom-blue"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-loom-line bg-white px-3 py-2 text-sm outline-none focus:border-loom-blue">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="rounded-lg border border-loom-line bg-white px-3 py-2 text-sm outline-none focus:border-loom-blue">
          <option value="ALL">All severities</option>
          {SEV_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`ml-auto text-xs text-slate-400 transition ${pending ? "opacity-100" : "opacity-0"}`}>
          Syncing…
        </span>
        <span className="text-sm font-medium text-slate-500">{filtered.length} of {rows.length}</span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-loom-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-loom-cloud text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Issue</th>
              <th className="px-4 py-3.5">Severity</th>
              <th className="px-4 py-3.5 hidden lg:table-cell">Control</th>
              <th className="px-4 py-3.5 hidden xl:table-cell">Resource / Project</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-loom-line">
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className={`cursor-pointer align-top transition hover:bg-loom-cloud/60 ${expanded === r.id ? "bg-loom-sky/40" : ""}`}
                >
                  <td className="max-w-md px-5 py-4">
                    <p className="flex items-center gap-2 font-semibold text-loom-navy">
                      {r.hasPath && <span title="Attack path" className="text-xs text-loom-pink">⇶</span>}
                      {r.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{r.refId}</p>
                  </td>
                  <td className="px-4 py-4"><span className={`badge ${SEVERITY_STYLES[r.severity]}`}>{r.severity}</span></td>
                  <td className="hidden px-4 py-4 lg:table-cell">
                    <p className="font-medium text-slate-700">{r.controlId}</p>
                    <p className="max-w-[220px] truncate text-xs text-slate-400">{r.controlName}</p>
                  </td>
                  <td className="hidden px-4 py-4 xl:table-cell">
                    <p className="font-medium text-slate-700">{r.resourceName}</p>
                    <p className="text-xs text-slate-400">{r.provider} · {r.projectName}</p>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide outline-none ring-offset-1 focus:ring-2 ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr className="bg-loom-sky/30">
                    <td colSpan={5} className="px-5 py-5">
                      <p className="text-sm leading-relaxed text-slate-700">{r.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-slate-500">
                        <span>Resource: <strong className="text-slate-700">{r.resourceType} · {r.resourceName}</strong></span>
                        <span>Last updated: <strong className="text-slate-700">{new Date(r.updatedAt).toLocaleString()}</strong></span>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">No issues match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

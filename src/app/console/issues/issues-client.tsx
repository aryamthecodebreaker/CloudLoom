"use client";

import { Fragment, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STATUSES, formatDateTime, severityStyle, statusStyle } from "@/lib/ui";
import { useToast } from "@/components/toast";

type Row = {
  id: string; refId: string; title: string; description: string;
  status: string; severity: string; controlName: string; controlId: string;
  resourceName: string; resourceType: string; provider: string;
  projectName: string; hasPath: boolean; updatedAt: string;
};

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];


export function IssuesClient({
  initial,
  initialRef = "",
  initialStatus = "ALL",
  initialSeverity = "ALL",
}: {
  initial: Row[];
  initialRef?: string;
  initialStatus?: string;
  initialSeverity?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(initial);
  const [sevFilter, setSevFilter] = useState(initialSeverity);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [query, setQuery] = useState(initialRef);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"triage" | "severity" | "updated">("triage");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 25;
  const searchRef = useRef<HTMLInputElement>(null);

  // Server data changes after router.refresh() (e.g. status updates) — stay in sync
  // so re-sorted results appear without a full page reload.
  const signature = useMemo(() => initial.map((r) => `${r.id}:${r.status}`).join(","), [initial]);
  useEffect(() => {
    setRows(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // Press "/" anywhere to jump to search (unless already typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || !searchRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      e.preventDefault();
      searchRef.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const sorted = useMemo(() => {
    const sevRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFORMATIONAL: 4 };
    const s = [...filtered];
    if (sortBy === "severity") s.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
    if (sortBy === "updated") s.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return s;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
      toast("Failed to update issue", "error");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function bulkUpdate(status: string) {
    const ids = [...selected];
    if (ids.length === 0) return;
    let ok = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`/api/issues/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          ok++;
          setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
        }
      } catch {
        /* counted below */
      }
    }
    setSelected(new Set());
    startTransition(() => router.refresh());
    if (ok === ids.length) {
      toast(`${ok} issue${ids.length === 1 ? "" : "s"} → ${status.replace("_", " ").toLowerCase()}`);
    } else {
      toast(`${ok} of ${ids.length} updated — some failed`, "error");
    }
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, resources, projects…"
            className="w-72 rounded-lg border border-line bg-white px-4 py-2 pr-8 text-sm outline-none focus:border-accent"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-cream px-1.5 text-[10px] font-semibold text-slate-400">/</kbd>
        </div>
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select aria-label="Filter by severity" value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="ALL">All severities</option>
          {SEV_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`ml-auto text-xs text-slate-400 transition ${pending ? "opacity-100" : "opacity-0"}`}>
          Syncing…
        </span>
                  <select aria-label="Sort issues" value={sortBy} onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/50">
            <option value="triage">Sort: triage order</option>
            <option value="severity">Sort: severity</option>
            <option value="updated">Sort: recently updated</option>
          </select>
          <span className="text-sm font-medium text-slate-500">{sorted.length} of {rows.length}</span>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-ink/20 bg-white px-4 py-2.5">
          <span className="font-mono text-xs text-ink">{selected.size} selected</span>
          <button
            onClick={() => bulkUpdate("RESOLVED")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Resolve selected
          </button>
          <button
            onClick={() => bulkUpdate("REJECTED")}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-ink"
          >
            Reject selected
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto font-mono text-xs text-ink-faint hover:text-ink">
            clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-cream text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  aria-label="Select all on page"
                  checked={paged.length > 0 && paged.every((r) => selected.has(r.id))}
                  onChange={(e) => {
                    const next = new Set(selected);
                    paged.forEach((r) => (e.target.checked ? next.add(r.id) : next.delete(r.id)));
                    setSelected(next);
                  }}
                  className="h-3.5 w-3.5 accent-accent"
                />
              </th>
              <th className="px-5 py-3.5">Issue</th>
              <th className="px-4 py-3.5">Severity</th>
              <th className="px-4 py-3.5 hidden lg:table-cell">Control</th>
              <th className="px-4 py-3.5 hidden xl:table-cell">Resource / Project</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paged.map((r) => (
              <Fragment key={r.id}>
                <tr
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className={`cursor-pointer align-top transition hover:bg-cream/60 ${expanded === r.id ? "bg-mist/40" : ""}`}
                >
                  <td className="w-10 px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.refId}`}
                      checked={selected.has(r.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.id);
                        else next.delete(r.id);
                        setSelected(next);
                      }}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                  </td>
                  <td className="max-w-md px-5 py-4">
                    <Link
                      href={`/console/issues/${r.refId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-start gap-2 font-semibold text-coal hover:text-accent"
                    >
                      {r.hasPath && <span title="Attack path" className="mt-0.5 text-xs text-rose">⇶</span>}
                      <span className="hover:underline">{r.title}</span>
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">{r.refId}</p>
                  </td>
                  <td className="px-4 py-4"><span className={`badge ${severityStyle(r.severity)}`}>{r.severity}</span></td>
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
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide outline-none ring-offset-1 focus:ring-2 ${statusStyle(r.status)}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr className="bg-mist/30">
                    <td colSpan={5} className="px-5 py-5">
                      <p className="text-sm leading-relaxed text-slate-700">{r.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-slate-500">
                        <span>Resource: <strong className="text-slate-700">{r.resourceType} · {r.resourceName}</strong></span>
                        <span>Last updated: <strong className="text-slate-700">{formatDateTime(r.updatedAt)}</strong></span>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">No issues match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

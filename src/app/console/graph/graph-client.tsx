"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EDGE_COLORS, SEVERITY_STYLES, STATUS_STYLES } from "@/lib/ui";

export type GraphNode = {
  id: string; name: string; type: string; provider: string; accountName: string;
  region: string; externalId: string; isPublic: boolean; hasSensitiveData: boolean;
  projectName: string; worstOpenSeverity: string | null;
  openIssues: Array<{ refId: string; title: string; severity: string; status: string }>;
  vulnCount: number; edgeCount: number;
};
export type GraphEdgeInput = { fromId: string; kind: string; toId: string };

const NODE_W = 152;
const NODE_H = 46;
const COL_W = 196;
const ROW_H = 64;
const PAD = 56;

const DOT_COLORS: Record<string, string> = {
  CRITICAL: "#D92D20", HIGH: "#F76808", MEDIUM: "#F59E0B", LOW: "#0BA5EC",
};

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdgeInput[] }) {
  const providers = useMemo(() => [...new Set(nodes.map((n) => n.provider))], [nodes]);
  const [activeProviders, setActive] = useState<Set<string>>(new Set(providers));
  const [riskyOnly, setRiskyOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      new Set(
        nodes
          .filter((n) => activeProviders.has(n.provider))
          .filter((n) => !riskyOnly || n.worstOpenSeverity)
          .map((n) => n.id)
      ),
    [nodes, activeProviders, riskyOnly]
  );

  const layout = useMemo(() => {
    const byAccount = new Map<string, GraphNode[]>();
    for (const id of visible) {
      const n = nodes.find((x) => x.id === id)!;
      if (!byAccount.has(n.accountName)) byAccount.set(n.accountName, []);
      byAccount.get(n.accountName)!.push(n);
    }
    const cols = [...byAccount.entries()].map(([account, list]) => ({
      account,
      items: list
        .slice()
        .sort(
          (a, b) =>
            (b.worstOpenSeverity ? 1 : 0) - (a.worstOpenSeverity ? 1 : 0) ||
            a.name.localeCompare(b.name)
        ),
    }));
    const pos = new Map<string, { x: number; y: number }>();
    let maxRows = 0;
    cols.forEach((col, ci) => {
      col.items.forEach((n, ri) => {
        pos.set(n.id, { x: PAD + ci * COL_W, y: PAD + ri * ROW_H });
        maxRows = Math.max(maxRows, col.items.length);
      });
    });
    return {
      cols,
      pos,
      width: PAD * 2 + Math.max(1, cols.length) * COL_W - (COL_W - NODE_W),
      height: PAD * 2 + maxRows * ROW_H - (ROW_H - NODE_H),
      accountX: Object.fromEntries(cols.map((c, i) => [c.account, PAD + i * COL_W])),
    };
  }, [visible, nodes]);

  const connections = useMemo(() => {
    const m = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!m.has(a)) m.set(a, new Set());
      m.get(a)!.add(b);
    };
    for (const e of edges) {
      if (!visible.has(e.fromId) || !visible.has(e.toId)) continue;
      add(e.fromId, e.toId);
      add(e.toId, e.fromId);
    }
    return m;
  }, [edges, visible]);

  const focusId = hoverId ?? selectedId;
  const isDimmed = (id: string) =>
    !!focusId && focusId !== id && !connections.get(focusId)?.has(id);

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null;

  const toggleProvider = (p: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => toggleProvider(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeProviders.has(p)
                  ? "bg-loom-blue text-white shadow-sm"
                  : "bg-white text-slate-400 ring-1 ring-loom-line hover:text-slate-600"
              }`}
            >
              {p}
            </button>
          ))}
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={riskyOnly}
              onChange={(e) => setRiskyOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-loom-blue"
            />
            Risky resources only
          </label>
        </div>

        {/* Canvas */}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-loom-line bg-loom-navy p-4 shadow-card">
          <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="min-w-[900px]" role="img" aria-label="Interactive security graph of the seeded environment" onClick={() => setSelectedId(null)}>
            {edges.map((e, i) => {
              if (!visible.has(e.fromId) || !visible.has(e.toId)) return null;
              const a = layout.pos.get(e.fromId);
              const b = layout.pos.get(e.toId);
              if (!a || !b) return null;
              const x1 = a.x + NODE_W;
              const y1 = a.y + NODE_H / 2;
              const x2 = b.x;
              const y2 = b.y + NODE_H / 2;
              const midX = (x1 + x2) / 2;
              const sameCol = a.x === b.x;
              const d = sameCol
                ? `M${x1},${y1} C${x1 + 70},${y1} ${x2 - 70},${y2} ${x2},${y2}`
                : `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
              const dim =
                focusId && e.fromId !== focusId && e.toId !== focusId ? "opacity-10" : "";
              return (
                <path key={i} d={d} fill="none" stroke={EDGE_COLORS[e.kind] ?? "#8FB3FF"} strokeWidth={focusId && !dim ? 2.4 : 1.5} className={`transition-opacity duration-200 ${dim ? dim : "opacity-70"}`} />
              );
            })}
            {[...visible].map((id) => {
              const n = nodes.find((x) => x.id === id)!;
              const p = layout.pos.get(id)!;
              const dim = isDimmed(id);
              const dot = n.worstOpenSeverity ? DOT_COLORS[n.worstOpenSeverity] : "#64748B";
              return (
                <g
                  key={id}
                  transform={`translate(${p.x},${p.y})`}
                  className={`cursor-pointer transition-opacity duration-200 ${dim ? "opacity-25" : ""}`}
                  onClick={(ev) => { ev.stopPropagation(); setSelectedId(id); }}
                  onMouseEnter={() => setHoverId(id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={11}
                    fill="#FFFFFF"
                    stroke={selectedId === id ? "#2C6BFF" : "#E4E9F2"}
                    strokeWidth={selectedId === id ? 2.4 : 1.4}
                  />
                  <circle cx={15} cy={NODE_H / 2} r={4.5} fill={dot} />
                  <text x={27} y={19} fontSize={11.5} fontWeight={700} fill="#101828">
                    {n.name.length > 18 ? `${n.name.slice(0, 17)}…` : n.name}
                  </text>
                  <text x={27} y={33} fontSize={9} fill="#667085">
                    {n.type.length > 22 ? `${n.type.slice(0, 21)}…` : n.type}
                  </text>
                  {n.isPublic && <circle cx={NODE_W - 12} cy={12} r={3.5} fill="#F79009" />}
                  {n.hasSensitiveData && <circle cx={NODE_W - 12} cy={NODE_H - 12} r={3.5} fill="#FF4F9A" />}
                </g>
              );
            })}
            {Object.entries(layout.accountX).map(([account, x]) => (
              <text key={account} x={x + NODE_W / 2} y={PAD - 26} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7E93BC">
                {account}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          {Object.entries(EDGE_COLORS).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 rounded" style={{ background: c }} />
              {k.replace(/_/g, " ").toLowerCase()}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400" />internet-exposed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-500" />sensitive data</span>
        </div>
      </div>

      {/* Detail panel */}
      <aside className={`rounded-2xl border p-6 ${selected ? "border-loom-blue/40 bg-white shadow-card" : "border-dashed border-loom-line bg-white/60"}`}>
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-loom-navy">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{selected.type} · {selected.provider}</p>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close details" className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-loom-cloud hover:text-loom-navy">✕</button>
            </div>
            <dl className="mt-4 space-y-1.5 rounded-xl bg-loom-cloud p-4 text-xs leading-relaxed">
              <Row k="Account" v={selected.accountName} />
              <Row k="Region" v={selected.region} />
              <Row k="Project" v={selected.projectName} />
              <Row k="External ID" v={selected.externalId} mono />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.isPublic && <span className="badge bg-orange-100 text-orange-700">Public</span>}
              {selected.hasSensitiveData && <span className="badge bg-pink-100 text-pink-600">Sensitive data</span>}
              <span className="badge bg-slate-100 text-slate-600">{selected.vulnCount} CVE{selected.vulnCount === 1 ? "" : "s"}</span>
              <span className="badge bg-slate-100 text-slate-600">{selected.edgeCount} edge{selected.edgeCount === 1 ? "" : "s"}</span>
            </div>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Open / in-progress issues</h3>
            <ul className="mt-2 space-y-2">
              {selected.openIssues.map((i) => (
                <li key={i.refId}>
                  <Link href="/console/issues" className="block rounded-lg bg-loom-cloud px-3 py-2 transition hover:bg-loom-sky">
                    <span className="flex items-center gap-2">
                      <span className={`badge ${SEVERITY_STYLES[i.severity]}`}>{i.severity}</span>
                      <span className="font-mono text-[10px] text-slate-400">{i.refId}</span>
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-snug text-loom-navy">{i.title}</span>
                    <span className={`mt-1 inline-block text-[10px] font-bold ${STATUS_STYLES[i.status].split(" ")[1]}`}>{i.status.replace("_", " ")}</span>
                  </Link>
                </li>
              ))}
              {selected.openIssues.length === 0 && (
                <li className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">No open issues on this node.</li>
              )}
            </ul>
          </>
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="12" cy="36" r="4" /><circle cx="38" cy="32" r="4" /><circle cx="24" cy="10" r="4" />
              <path d="M14.5 33l7-20M26.5 12l9 17M15.8 35.5l18-3" />
            </svg>
            <p className="mt-4 text-sm font-semibold text-loom-navy">Select a node</p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
              Click any resource in the graph — or just hover — to trace how it connects to the rest of your estate.
            </p>
          </div>
        )}
      </aside>
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

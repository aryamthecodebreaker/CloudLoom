"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Result =
  | { kind: "page"; label: string; href: string }
  | { kind: "issue"; label: string; href: string; meta: string }
  | { kind: "resource"; label: string; href: string; meta: string };

const PAGES: Result[] = [
  { kind: "page", label: "Security Dashboard", href: "/console" },
  { kind: "page", label: "Graph Explorer", href: "/console/graph" },
  { kind: "page", label: "Issues", href: "/console/issues" },
  { kind: "page", label: "Attack Paths", href: "/console/attack-paths" },
  { kind: "page", label: "Identities", href: "/console/identities" },
  { kind: "page", label: "Inventory", href: "/console/inventory" },
  { kind: "page", label: "Vulnerabilities", href: "/console/vulnerabilities" },
  { kind: "page", label: "Compliance", href: "/console/compliance" },
  { kind: "page", label: "Connectors", href: "/console/connectors" },
];

/**
 * ⌘K / Ctrl+K command palette: jump to pages, issues, and resources.
 * Arrow keys + Enter; Esc closes. Debounced live search against /api/search.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<{ issues: Result[]; resources: Result[] }>({ issues: [], resources: [] });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results: Result[] = q.trim()
    ? [...remote.issues, ...remote.resources]
    : PAGES;
  const all = q.trim() ? [...PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())), ...results] : PAGES;

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setRemote({ issues: [], resources: [] });
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setRemote({ issues: [], resources: [] });
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();
        setRemote({
          issues: (data.issues ?? []).map((i: { refId: string; title: string; severity: string }) => ({
            kind: "issue" as const,
            label: `${i.refId} — ${i.title}`,
            href: `/console/issues/${i.refId}`,
            meta: i.severity,
          })),
          resources: (data.resources ?? []).map((r: { id: string; name: string; type: string; provider: string }) => ({
            kind: "resource" as const,
            label: r.name,
            href: `/console/inventory?q=${encodeURIComponent(r.name)}`,
            meta: `${r.provider} · ${r.type}`,
          })),
        });
        setActive(0);
      } catch {
        /* palette search is best-effort */
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(r: Result) {
    close();
    router.push(r.href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[14vh] backdrop-blur-[2px]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-md border border-line bg-paper shadow-[0_24px_80px_-24px_rgba(0,0,0,.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, all.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && all[active]) { e.preventDefault(); go(all[active]); }
          }}
          placeholder="Search issues, resources — or jump to a page…"
          className="w-full border-b border-line bg-transparent px-5 py-4 font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
          autoComplete="off"
          aria-label="Search"
        />
        <ul ref={listRef} className="dark-scroll max-h-[50vh] overflow-y-auto py-2">
          {all.map((r, i) => (
            <li key={`${r.kind}-${r.href}-${i}`} data-idx={i}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={`flex w-full items-center justify-between gap-4 px-5 py-2.5 text-left text-sm transition-colors ${
                  i === active ? "bg-mist" : ""
                }`}
              >
                <span className="truncate text-ink">
                  {r.kind === "issue" && <span className="mr-2 text-accent">⚠</span>}
                  {r.kind === "resource" && <span className="mr-2 text-ink-faint">◈</span>}
                  {r.label}
                </span>
                {"meta" in r && <span className="shrink-0 font-mono text-[10px] uppercase text-ink-faint">{r.meta}</span>}
              </button>
            </li>
          ))}
          {all.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-slate-400">Nothing matches “{q}”.</li>
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-5 py-2 font-mono text-[10px] text-ink-faint">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{q.trim() ? `${all.length} results` : "pages"}</span>
        </div>
      </div>
    </div>
  );
}

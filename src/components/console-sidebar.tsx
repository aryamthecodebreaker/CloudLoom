"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

const nav = [
  { href: "/console", label: "Security Dashboard", icon: "▦" },
  { href: "/console/graph", label: "Graph Explorer", icon: "⌗" },
  { href: "/console/issues", label: "Issues", icon: "⚠" },
  { href: "/console/attack-paths", label: "Attack Paths", icon: "⇶" },
  { href: "/console/identities", label: "Identities", icon: "◈" },
  { href: "/console/inventory", label: "Inventory", icon: "☰" },
  { href: "/console/vulnerabilities", label: "Vulnerabilities", icon: "◉" },
  { href: "/console/compliance", label: "Compliance", icon: "✓" },
  { href: "/console/connectors", label: "Connectors", icon: "⇄" },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  async function resetDemo() {
    if (!confirm("Reset the demo environment?\n\nAll triage changes will be discarded and the seeded estate restored.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } finally {
      setResetting(false);
    }
  }

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-white/10 bg-coal text-slate-300 lg:w-60">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" aria-label="CloudLoom home"><Logo dark /></Link>
        <p className="mt-1 hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 lg:block pl-8">Demo tenant</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((n) => {
          const active = n.href === "/console" ? pathname === "/console" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              title={n.label}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition lg:justify-start ${
                active ? "bg-accent text-white shadow-graph" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-4 text-center opacity-80">{n.icon}</span>
              <span className="hidden lg:inline">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-white/10 p-4 lg:block">
        <button
          onClick={resetDemo}
          disabled={resetting}
          className="w-full rounded-lg border border-white/15 px-3 py-2.5 text-left text-xs font-semibold text-slate-300 transition hover:border-white/40 hover:text-white disabled:opacity-50"
        >
          {resetting ? "Reseeding…" : "↺ Reset demo data"}
          <span className="mt-0.5 block text-[10px] font-normal leading-snug text-slate-500">
            Restore the pristine seed. Break things freely.
          </span>
        </button>
      </div>
    </aside>
  );
}

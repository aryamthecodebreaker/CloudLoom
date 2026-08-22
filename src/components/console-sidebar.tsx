"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const nav = [
  { href: "/console", label: "Security Dashboard", icon: "▦" },
  { href: "/console/graph", label: "Graph Explorer", icon: "⌗" },
  { href: "/console/issues", label: "Issues", icon: "⚠" },
  { href: "/console/attack-paths", label: "Attack Paths", icon: "⇶" },
  { href: "/console/inventory", label: "Inventory", icon: "☰" },
  { href: "/console/vulnerabilities", label: "Vulnerabilities", icon: "◈" },
  { href: "/console/compliance", label: "Compliance", icon: "✓" },
  { href: "/console/connectors", label: "Connectors", icon: "⇄" },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-white/10 bg-loom-navy text-slate-300 lg:w-60">
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
                active ? "bg-loom-blue text-white shadow-graph" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-4 text-center opacity-80">{n.icon}</span>
              <span className="hidden lg:inline">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-white/10 p-4 lg:block">
        <div className="rounded-xl bg-white/5 p-3.5">
          <p className="text-xs font-semibold text-white">Community edition</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Seeded demo data · Apache-2.0
          </p>
        </div>
      </div>
    </aside>
  );
}

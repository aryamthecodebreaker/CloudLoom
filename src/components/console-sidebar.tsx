"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { useToast } from "./toast";

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

function NavIcon({ href }: { href: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": true };
  switch (href) {
    case "/console": return (<svg {...common} {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>);
    case "/console/graph": return (<svg {...common} {...p}><circle cx="5.5" cy="18.5" r="2.2" /><circle cx="18.5" cy="16" r="2.2" /><circle cx="11" cy="5.5" r="2.2" /><path d="M7.4 17.2l2.5-9.2M12.9 7l4.4 7.2M7.7 18l8.6-.9" /></svg>);
    case "/console/issues": return (<svg {...common} {...p}><path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17.5v.5" /></svg>);
    case "/console/attack-paths": return (<svg {...common} {...p}><path d="M4 19L20 5M20 5h-6M20 5v6" /><circle cx="5" cy="19" r="1.6" /><circle cx="12" cy="12" r="1.6" /></svg>);
    case "/console/identities": return (<svg {...common} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" /></svg>);
    case "/console/inventory": return (<svg {...common} {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>);
    case "/console/vulnerabilities": return (<svg {...common} {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="M12 3.5v2M12 18.5v2M20.5 12h-2M3.5 12h2" /></svg>);
    case "/console/compliance": return (<svg {...common} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></svg>);
    case "/console/connectors": return (<svg {...common} {...p}><path d="M7 10h10M7 14h10" /><circle cx="4.5" cy="10" r="1.6" /><circle cx="19.5" cy="14" r="1.6" /></svg>);
    default: return null;
  }
}
export function ConsoleSidebar({ connected = 0 }: { connected?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  async function wipeData() {
    if (!confirm("Wipe ALL data from this environment?\n\nEvery resource, finding and event is deleted. Reconnect a cloud account via the agent to repopulate.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/data", { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast("Wipe failed — try again", "error");
    } finally {
      setResetting(false);
    }
  }

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-white/10 bg-coal text-slate-300 lg:w-60">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" aria-label="CloudLoom home"><Logo dark /></Link>
        <p className="mt-1 hidden pl-8 text-[10px] uppercase tracking-[0.2em] text-slate-500 lg:block">
          {connected === 0
            ? "No account connected"
            : `${connected} account${connected === 1 ? "" : "s"} connected`}
        </p>
      </div>
      <nav className="dark-scroll flex-1 space-y-1 overflow-y-auto p-3">
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
              <span className="w-4 text-center opacity-80"><NavIcon href={n.href} /></span>
              <span className="hidden lg:inline">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-white/10 p-4 lg:block">
        <button
          onClick={wipeData}
          disabled={resetting}
          className="w-full rounded-lg border border-white/15 px-3 py-2.5 text-left text-xs font-semibold text-slate-300 transition hover:border-white/40 hover:text-white disabled:opacity-50"
        >
          {resetting ? "Wiping…" : "⌫ Wipe all data"}
          <span className="mt-0.5 block text-[10px] font-normal leading-snug text-slate-500">
            Start clean. Reconnect via the agent.
          </span>
        </button>
      </div>
    </aside>
  );
}

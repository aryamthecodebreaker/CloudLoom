import Link from "next/link";
import { Logo } from "./logo";
import { SiteNav } from "./site-nav";

export const GITHUB_URL = "https://github.com/aryamthecodebreaker/CloudLoom";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-coal text-paper/70">
      <div className="container-loom grid gap-10 py-14 md:grid-cols-[1fr_auto_auto] md:gap-20">
        <div className="max-w-sm space-y-4">
          <Logo dark />
          <p className="text-sm leading-relaxed text-paper/60">
            An open-source CNAPP blueprint. A working security-graph console woven
            from a realistic simulated cloud — free forever.
          </p>
          <p className="font-mono text-xs text-paper/40">
            Apache-2.0 · simulated data only · no telemetry home
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-paper/40">Product</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/console" className="transition hover:text-white">Dashboard</Link></li>
            <li><Link href="/console/graph" className="transition hover:text-white">Graph explorer</Link></li>
            <li><Link href="/console/issues" className="transition hover:text-white">Issues</Link></li>
            <li><Link href="/platform" className="transition hover:text-white">Platform</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-paper/40">Source</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Repository ↗</a></li>
            <li><a href={`${GITHUB_URL}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Quickstart ↗</a></li>
            <li><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">License ↗</a></li>
            <li><a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Issues tracker ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <p className="container-loom font-mono text-xs text-paper/35">
          © {new Date().getFullYear()} CloudLoom contributors — never connects to a real cloud account.
        </p>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

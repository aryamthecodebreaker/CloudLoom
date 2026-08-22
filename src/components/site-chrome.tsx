import Link from "next/link";
import { Logo } from "./logo";
import { SiteNav } from "./site-nav";
import { IconGitHub } from "./icons";

export const GITHUB_URL = "https://github.com/aryamthecodebreaker/CloudLoom";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-loom-navy text-slate-300">
      <div className="container-loom grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <Logo dark />
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            An open-source CNAPP blueprint. A working security-graph console woven
            from a realistic simulated cloud — free forever, wired for what&apos;s next.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
          >
            <IconGitHub className="h-4 w-4" /> Star on GitHub
          </a>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Product</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/console" className="transition hover:text-white">Security dashboard</Link></li>
            <li><Link href="/console/issues" className="transition hover:text-white">Issues triage</Link></li>
            <li><Link href="/console/attack-paths" className="transition hover:text-white">Attack paths</Link></li>
            <li><Link href="/platform" className="transition hover:text-white">Platform overview</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Open source</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href={`${GITHUB_URL}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Repository</a></li>
            <li><a href={`${GITHUB_URL}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Quickstart guide</a></li>
            <li><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Apache-2.0 license</a></li>
            <li><a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Report an issue</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CloudLoom contributors · Apache-2.0 · Demo environment runs on simulated data only — never connects to a real cloud account.
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

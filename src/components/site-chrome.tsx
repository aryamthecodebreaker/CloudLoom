import Link from "next/link";
import { Logo } from "./logo";

const links = [
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/console", label: "Live Demo Console" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-wiz-line bg-white/85 backdrop-blur">
      <div className="container-wiz flex h-16 items-center justify-between">
        <Link href="/" aria-label="OpenWiz home"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-wiz-ink md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-wiz-blue">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/console" className="btn-primary">Open console</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-wiz-navy text-slate-300">
      <div className="container-wiz grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo dark />
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            The open-source cloud & AI security platform. Connect your stack,
            see every attack path, fix what matters.
          </p>
          <p className="text-xs text-slate-500">
            Apache-2.0 · Built by the community
          </p>
        </div>
        {[
          { h: "Platform", items: ["Security Graph", "Attack Paths", "Code to Cloud", "Runtime Sensor"] },
          { h: "Use cases", items: ["Vulnerability Management", "Cloud Posture", "Data Security", "AI Security"] },
          { h: "Resources", items: ["Documentation", "Contribute", "Changelog", "Community Slack"] },
        ].map((col) => (
          <div key={col.h}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{col.h}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.items.map((i) => (
                <li key={i}><span className="cursor-pointer transition hover:text-white">{i}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} OpenWiz contributors. Demo data only — no live cloud connections.
      </div>
    </footer>
  );
}

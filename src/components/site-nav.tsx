"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { GITHUB_URL } from "./site-chrome";

const links = [
  { href: "/platform", label: "Platform" },
  { href: "/console", label: "Console" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Back/forward navigation doesn't fire link onClick handlers — close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="container-loom flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="CloudLoom home"><Logo /></Link>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-[13px] tracking-wide transition-colors duration-150 hover:text-accent ${
                  pathname.startsWith(l.href) && l.href !== "/" ? "text-accent" : "text-ink-soft"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-mono text-[13px] text-ink-soft transition-colors duration-150 hover:text-accent sm:block"
          >
            GitHub ↗
          </a>
          <Link href="/console" className="btn-primary">Open console</Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 top-0 h-px w-4 bg-ink transition-all ${open ? "top-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-px w-4 bg-ink transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-px w-4 bg-ink transition-all ${open ? "top-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 py-2 md:hidden">
          {[...links, { href: "/console", label: "Open console" }].map((l, i) => (
            <Link
              key={`${l.href}-${i}`}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/60 py-3 font-mono text-sm text-ink last:border-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

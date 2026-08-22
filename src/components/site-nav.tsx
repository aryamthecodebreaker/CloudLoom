"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { IconGitHub } from "./icons";

const links = [
  { href: "/platform", label: "Platform" },
  { href: "/console", label: "Live Demo Console" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-loom-line bg-white/80 backdrop-blur-md">
      <div className="container-loom flex h-16 items-center justify-between">
        <Link href="/" aria-label="CloudLoom home"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-loom-ink md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition hover:text-loom-blue ${pathname.startsWith(l.href) && l.href !== "/" ? "text-loom-blue" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/aryamthecodebreaker/CloudLoom"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CloudLoom on GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-loom-navy transition hover:bg-loom-cloud hover:text-loom-blue"
          >
            <IconGitHub className="h-5 w-5" />
          </a>
          <Link href="/console" className="btn-primary hidden sm:inline-flex">Open console</Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-loom-line md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 top-0 h-0.5 w-4 bg-loom-navy transition-all ${open ? "top-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-4 bg-loom-navy transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-0.5 w-4 bg-loom-navy transition-all ${open ? "top-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-loom-line bg-white px-4 py-3 md:hidden">
          {[...links, { href: "/console", label: "Open console" }].map((l, i) => (
            <Link
              key={`${l.href}-${i}`}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-loom-ink transition hover:bg-loom-cloud hover:text-loom-blue"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

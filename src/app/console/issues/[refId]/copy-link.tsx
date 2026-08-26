"use client";

import { useState } from "react";

/** Copies the current issue URL; tiny confirmation without leaving the page. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-ink/40 hover:text-ink"
    >
      {copied ? "✓ Link copied" : "Copy link"}
    </button>
  );
}

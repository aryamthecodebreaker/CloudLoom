"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Playful remediation: marks the issue RESOLVED (real PATCH) and logs a
 * Green-agent style entry in the simulated activity feed. Reset demo data
 * restores the world.
 */
export function FixButton({ issueId, refId }: { issueId: string; refId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");

  async function simulate() {
    setState("running");
    try {
      const patch = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (!patch.ok) throw new Error();
      const evt = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId }),
      });
      if (!evt.ok) throw new Error();
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={simulate}
        disabled={state === "running" || state === "done"}
        className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {state === "running" ? "Green agent working…" : state === "done" ? "✓ Fix simulated — feed updated" : "Simulate fix (Green agent)"}
      </button>
      {state === "error" && <span className="text-xs text-red-500">Failed — try again</span>}
      {state !== "done" && (
        <span className="text-[11px] leading-snug text-slate-400">
          Marks the finding RESOLVED and logs an agent action to the demo feed. Reset demo data to undo.
        </span>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; text: string }
  | { kind: "unconfigured"; hint: string }
  | { kind: "error"; message: string };

/** Blue Agent: AI investigation with full graph context. BYO-key (see Settings). */
export function InvestigateButton({ refId }: { refId: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function run() {
    setState({ kind: "running" });
    try {
      const res = await fetch("/api/agent/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) {
        setState({ kind: "unconfigured", hint: data.hint ?? "Set OPENAI_API_KEY to enable." });
      } else if (!res.ok) {
        setState({ kind: "error", message: data.error ?? `Request failed (${res.status})` });
      } else {
        setState({ kind: "done", text: data.investigation });
      }
    } catch {
      setState({ kind: "error", message: "Investigation request failed" });
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={run}
        disabled={state.kind === "running"}
        className="w-full rounded-md bg-loom-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose disabled:opacity-50"
      >
        {state.kind === "running" ? "Blue Agent investigating…" : "◈ Investigate (Blue Agent)"}
      </button>

      {state.kind === "done" && (
        <div className="mt-4 rounded-md border border-loom-accent/30 bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-loom-accent">Blue Agent · investigation</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{state.text}</p>
          <p className="mt-3 border-t border-line pt-2 text-[10px] text-slate-400">
            AI-generated, grounded in the graph context above. Verify before acting.
          </p>
        </div>
      )}
      {state.kind === "unconfigured" && (
        <p className="mt-2 rounded-md bg-stone-50 px-3 py-2 text-xs leading-relaxed text-slate-500 ring-1 ring-stone-200">
          {state.hint} See <strong>Settings</strong> in the sidebar.
        </p>
      )}
      {state.kind === "error" && (
        <p className="mt-2 text-xs text-red-500">{state.message}</p>
      )}
    </div>
  );
}

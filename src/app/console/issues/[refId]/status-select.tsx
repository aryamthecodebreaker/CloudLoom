"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { STATUS_STYLES } from "@/lib/ui";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(status);
  const [error, setError] = useState(false);

  async function update(next: string) {
    const prev = value;
    setValue(next);
    setError(false);
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setValue(prev);
      setError(true);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => update(e.target.value)}
        disabled={pending}
        className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide outline-none ring-offset-1 focus:ring-2 disabled:opacity-60 ${STATUS_STYLES[value]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>
      {pending && <span className="text-xs text-slate-400">saving…</span>}
      {error && <span className="text-xs text-red-500">failed — retry</span>}
    </div>
  );
}

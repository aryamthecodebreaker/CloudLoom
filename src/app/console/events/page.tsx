import Link from "next/link";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/rbac";
import { eventStyle, relTime } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity" };

export default async function EventsPage() {
  const ws = await requireWorkspace();
  const events = await db.cloudEvent.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: { ts: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-coal">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every event the agent and platform recorded — newest first.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line bg-white py-14 text-center text-sm text-slate-500">
          No activity yet. Connect a cloud account via the agent — discovery and agent actions land here.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-md border border-line bg-white shadow-card">
          {events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3.5 text-sm">
              <span className={`badge shrink-0 ${eventStyle(ev.result)}`}>{ev.result}</span>
              <span className="min-w-0 flex-1">
                <span className="font-mono text-xs text-slate-500">{ev.actor}</span>{" "}
                <span className="text-slate-700">{ev.action}</span>
              </span>
              <span className="hidden shrink-0 rounded-md bg-cream px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline-block">
                {ev.source}
              </span>
              <span className="w-24 shrink-0 text-right text-xs text-slate-400">{relTime(ev.ts)}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/console" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
        ← Dashboard
      </Link>
    </div>
  );
}

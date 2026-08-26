import Link from "next/link";
import { db } from "@/lib/db";
import { requireWorkspace, resourceScope } from "@/lib/rbac";
import { ensureFrameworks } from "@/lib/catalog";
import { FAMILY_COLORS } from "./colors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compliance" };

export default async function CompliancePage() {
  const ws = await requireWorkspace();
  await ensureFrameworks();

  const [frameworks, controls] = await Promise.all([
    db.complianceFramework.findMany({ orderBy: { name: "asc" } }),
    db.control.findMany({
      include: {
        issues: {
          where: { AND: [{ status: { in: ["OPEN", "IN_PROGRESS"] } }, resourceScope(ws)] },
          include: { resource: { select: { name: true } } },
        },
      },
    }),
  ]);

  // Live posture: a mapped control FAILS while it has open findings.
  const posture = frameworks.map((f) => {
    const mapped = controls.filter((c) => c.framework === f.name);
    const failing = mapped.filter((c) => c.issues.length > 0);
    return { framework: f, mapped: mapped.length, failing, passing: mapped.length - failing.length };
  });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-coal">Compliance Posture</h1>
        <p className="mt-1 text-sm text-slate-500">
          Computed live from real controls and open findings — never stored snapshots.
          Frameworks with no mapped controls yet show as pending.
        </p>
      </header>

      <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posture.map(({ framework: f, mapped, failing, passing }) => {
          const total = mapped;
          const pct = total > 0 ? Math.round((passing / total) * 100) : null;
          const color = FAMILY_COLORS[f.family] ?? "#2C6BFF";
          const r = 52;
          const circ = 2 * Math.PI * r;
          return (
            <Link
              key={f.id}
              href={`/console/compliance/${f.id}`}
              className="rounded-md border border-line bg-white p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-accent/40"
            >
              <span className="badge mb-3" style={{ background: `${color}14`, color }}>{f.family}</span>
              <div className="relative mx-auto h-36 w-36">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r={r} fill="none" stroke="#EEF2F7" strokeWidth="11" />
                  {pct !== null && (
                    <circle
                      cx="60" cy="60" r={r} fill="none"
                      stroke={pct >= 90 ? "#12B76A" : pct >= 75 ? color : "#F76808"}
                      strokeWidth="11" strokeLinecap="butt"
                      strokeDasharray={`${(pct / 100) * circ} ${circ}`}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-coal">{pct === null ? "—" : `${pct}%`}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    {total === 0 ? "no controls" : "passing"}
                  </span>
                </div>
              </div>
              <h2 className="mt-4 font-bold text-coal">{f.name}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {total === 0
                  ? "No controls mapped yet"
                  : `${passing} passing · ${failing.length} failing of ${total}`}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 rounded-md border border-line bg-white p-6 shadow-card">
        <h2 className="font-bold text-coal">Framework heatmap</h2>
        <div className="mt-4 space-y-3">
          {posture.map(({ framework: f, failing, passing }) => {
            const total = failing.length + passing;
            return (
              <div key={f.id} className="flex items-center gap-4">
                <span className="w-56 shrink-0 truncate text-sm font-medium text-slate-700">{f.name}</span>
                <div className="flex h-6 flex-1 overflow-hidden rounded-sm bg-cream">
                  {total === 0 ? (
                    <span className="w-full text-center text-[10px] leading-6 text-slate-400">pending</span>
                  ) : (
                    <>
                      <div className="bg-emerald-400 transition-all" style={{ width: `${(passing / total) * 100}%` }} />
                      <div className="bg-orange-300 transition-all" style={{ width: `${(failing.length / total) * 100}%` }} />
                    </>
                  )}
                </div>
                <span className="w-12 text-right text-sm font-bold text-coal">
                  {total === 0 ? "—" : `${Math.round((passing / total) * 100)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

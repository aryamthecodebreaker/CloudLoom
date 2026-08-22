import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compliance" };

const FAMILY_COLORS: Record<string, string> = {
  Cloud: "#2C6BFF",
  Audit: "#7C3AED",
  Payments: "#E23A82",
  Healthcare: "#12B76A",
  Privacy: "#F79009",
};

export default async function CompliancePage() {
  const frameworks = await db.complianceFramework.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-wiz-navy">Compliance Posture</h1>
        <p className="mt-1 text-sm text-slate-500">
          Out-of-the-box frameworks evaluated continuously against the security graph.
        </p>
      </header>

      <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((f) => {
          const total = f.passed + f.failed;
          const pct = Math.round((f.passed / total) * 100);
          const color = FAMILY_COLORS[f.family] ?? "#2C6BFF";
          const r = 52;
          const circ = 2 * Math.PI * r;
          return (
            <article key={f.id} className="rounded-2xl border border-wiz-line bg-white p-6 text-center shadow-card transition hover:-translate-y-0.5">
              <span className="badge mb-3" style={{ background: `${color}14`, color }}>{f.family}</span>
              <div className="relative mx-auto h-36 w-36">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r={r} fill="none" stroke="#EEF2F7" strokeWidth="11" />
                  <circle
                    cx="60" cy="60" r={r} fill="none"
                    stroke={pct >= 90 ? "#12B76A" : pct >= 75 ? color : "#F76808"}
                    strokeWidth="11" strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * circ} ${circ}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-wiz-navy">{pct}%</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">passing</span>
                </div>
              </div>
              <h2 className="mt-4 font-bold text-wiz-navy">{f.name}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {f.passed} passed · <span className="font-semibold text-orange-600">{f.failed} failing</span> of {total} controls
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-wiz-line bg-white p-6 shadow-card">
        <h2 className="font-bold text-wiz-navy">Framework heatmap</h2>
        <div className="mt-4 space-y-3">
          {frameworks.map((f) => {
            const total = f.passed + f.failed;
            return (
              <div key={f.id} className="flex items-center gap-4">
                <span className="w-56 shrink-0 truncate text-sm font-medium text-slate-700">{f.name}</span>
                <div className="flex h-7 flex-1 overflow-hidden rounded-md">
                  <div className="bg-emerald-400 transition-all" style={{ width: `${(f.passed / total) * 100}%` }} />
                  <div className="bg-orange-300 transition-all" style={{ width: `${(f.failed / total) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-sm font-bold text-wiz-navy">{Math.round((f.passed / total) * 100)}%</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import { db } from "@/lib/db";
import { formatDate } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connectors" };

const STEPS = [
  ["Authenticate", "Read-only role assumed via cross-account trust"],
  ["Discover", "Full inventory snapshot across every service"],
  ["Graph build", "Relationships resolved into the security graph"],
] as const;

export default async function ConnectorsPage() {
  const accounts = await db.cloudAccount.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { resources: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-coal">Connectors</h1>
        <p className="mt-1 text-sm text-slate-500">
          Agentless connections to your clouds. Read-only credentials, minutes to value.
        </p>
      </header>

      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">{i + 1}</span>
            <p className="mt-3 font-semibold text-coal">{t}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Account</th>
              <th className="px-4 py-3.5">Provider</th>
              <th className="px-4 py-3.5 hidden md:table-cell">External ID</th>
              <th className="px-4 py-3.5">Resources</th>
              <th className="px-4 py-3.5">Last scan</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {accounts.map((a) => (
              <tr key={a.id} className="transition hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-coal">{a.name}</td>
                <td className="px-4 py-3.5 text-slate-600">{a.provider}</td>
                <td className="hidden px-4 py-3.5 font-mono text-xs text-slate-500 md:table-cell">{a.externalId}</td>
                <td className="px-4 py-3.5 text-slate-600">{a._count.resources}</td>
                <td className="px-4 py-3.5 text-slate-600">{formatDate(a.lastScanAt)}</td>
                <td className="px-4 py-3.5">
                  <span className={`badge ${
                    a.status === "CONNECTED" ? "bg-emerald-100 text-emerald-700"
                    : a.status === "ERROR" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>{a.status}</span>
                  {a.status === "ERROR" && (
                    <p className="mt-1 max-w-[220px] text-[11px] text-red-500">Assume-role failed — external ID rotated?</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { PROVIDER_LABELS } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const resources = await db.resource.findMany({
    include: {
      cloudAccount: true,
      project: true,
      _count: { select: { issues: true, vulnerabilities: true } },
    },
    orderBy: [{ provider: "asc" }, { name: "asc" }],
  });

  const byProvider = resources.reduce<Record<string, number>>((acc, r) => {
    acc[r.provider] = (acc[r.provider] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-loom-navy">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every discovered resource across your connected accounts — the nodes of the security graph.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        {Object.entries(byProvider).map(([p, n]) => (
          <span key={p} className="rounded-xl border border-loom-line bg-white px-4 py-2.5 text-sm font-semibold shadow-sm">
            {PROVIDER_LABELS[p] ?? p} <span className="ml-1 text-loom-blue">{n}</span>
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-loom-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-loom-cloud text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Resource</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5 hidden md:table-cell">Account</th>
              <th className="px-4 py-3.5 hidden lg:table-cell">Region</th>
              <th className="px-4 py-3.5">Flags</th>
              <th className="px-4 py-3.5">Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-loom-line">
            {resources.map((r) => (
              <tr key={r.id} className="transition hover:bg-loom-cloud/60">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-loom-navy">{r.name}</p>
                  <p className="font-mono text-[10px] text-slate-400">{r.externalId}</p>
                </td>
                <td className="px-4 py-3.5 text-slate-600">{r.type}</td>
                <td className="hidden px-4 py-3.5 text-slate-600 md:table-cell">
                  {PROVIDER_LABELS[r.cloudAccount.provider] ?? r.cloudAccount.provider} · {r.cloudAccount.name}
                </td>
                <td className="hidden px-4 py-3.5 text-slate-600 lg:table-cell">{r.region}</td>
                <td className="px-4 py-3.5">
                  <span className="flex gap-1.5">
                    {r.isPublic && <Flag label="Public" cls="bg-orange-100 text-orange-700" />}
                    {r.hasSensitiveData && <Flag label="Sensitive" cls="bg-red-100 text-red-600" />}
                    {!r.isPublic && !r.hasSensitiveData && <span className="text-xs text-slate-400">—</span>}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`font-semibold ${r._count.issues > 0 ? "text-loom-blue" : "text-slate-400"}`}>
                    {r._count.issues} issue{r._count.issues === 1 ? "" : "s"}
                  </span>
                  <span className="text-slate-300"> · </span>
                  <span className={r._count.vulnerabilities > 0 ? "text-slate-600" : "text-slate-400"}>
                    {r._count.vulnerabilities} CVE{r._count.vulnerabilities === 1 ? "" : "s"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Flag({ label, cls }: { label: string; cls: string }) {
  return <span className={`badge ${cls}`}>{label}</span>;
}

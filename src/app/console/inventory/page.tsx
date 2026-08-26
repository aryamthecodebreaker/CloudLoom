import Link from "next/link";
import { db } from "@/lib/db";
import { requireWorkspace, accountScope } from "@/lib/rbac";
import { PROVIDER_LABELS } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventory" };

type SearchParams = { q?: string; provider?: string; type?: string };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ?? {};
  const ws = await requireWorkspace();
  const [allResources, accounts] = await Promise.all([
    db.resource.findMany({
      where: accountScope(ws),
      include: {
        cloudAccount: true,
        project: true,
        _count: { select: { issues: true, vulnerabilities: true } },
      },
      orderBy: [{ provider: "asc" }, { name: "asc" }],
    }),
    db.cloudAccount.findMany({ where: { workspaceId: ws.workspaceId } }),
  ]);

  const providers = [...new Set(allResources.map((r) => r.provider))].sort();
  const types = [...new Set(allResources.map((r) => r.type))].sort();

  const q = (sp.q ?? "").trim().toLowerCase();
  const fProvider = providers.includes(sp.provider ?? "") ? sp.provider! : "";
  const fType = types.includes(sp.type ?? "") ? sp.type! : "";

  const resources = allResources.filter((r) => {
    if (fProvider && r.provider !== fProvider) return false;
    if (fType && r.type !== fType) return false;
    if (q && !`${r.name} ${r.externalId}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const byProvider = allResources.reduce<Record<string, number>>((acc, r) => {
    acc[r.provider] = (acc[r.provider] ?? 0) + 1;
    return acc;
  }, {});
  const filtered = q || fProvider || fType;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-coal">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every discovered resource across your connected accounts — the nodes of the security graph.
        </p>
      </header>

      {/* Filters — plain GET form, shareable URLs */}
      <form className="mt-6 flex flex-wrap items-center gap-3" action="/console/inventory">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name or external ID…"
          className="w-64 rounded-md border border-line bg-white px-4 py-2 text-sm outline-none focus:border-ink/50"
        />
        <select name="provider" defaultValue={fProvider} className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/50">
          <option value="">All providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>{PROVIDER_LABELS[p] ?? p}</option>
          ))}
        </select>
        <select name="type" defaultValue={fType} className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/50">
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="btn-primary">Apply</button>
        {filtered && (
          <Link href="/console/inventory" className="text-sm font-semibold text-accent hover:underline">Clear</Link>
        )}
        <a href="/api/inventory/export" className="mr-3 text-xs font-semibold text-accent hover:underline">Export CSV</a><span className="ml-auto font-mono text-xs text-slate-400">
          {resources.length} of {allResources.length}
        </span>
      </form>

      <div className="mt-4 overflow-hidden rounded-md border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Resource</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5 hidden md:table-cell">Account</th>
              <th className="px-4 py-3.5 hidden lg:table-cell">Region</th>
              <th className="px-4 py-3.5">Flags</th>
              <th className="px-4 py-3.5">Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {resources.map((r) => (
              <tr key={r.id} className="transition hover:bg-mist/60">
                <td className="px-5 py-3.5">
                  <Link href={`/console/resources/${r.id}`} className="font-semibold text-coal hover:text-accent hover:underline">{r.name}</Link>
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
                  <span className={`font-semibold ${r._count.issues > 0 ? "text-accent" : "text-slate-400"}`}>
                    {r._count.issues} issue{r._count.issues === 1 ? "" : "s"}
                  </span>
                  <span className="text-slate-300"> · </span>
                  <span className={r._count.vulnerabilities > 0 ? "text-slate-600" : "text-slate-400"}>
                    {r._count.vulnerabilities} CVE{r._count.vulnerabilities === 1 ? "" : "s"}
                  </span>
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Nothing matches these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Flag({ label, cls }: { label: string; cls: string }) {
  return <span className={`badge ${cls}`}>{label}</span>;
}

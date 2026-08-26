import Link from "next/link";
import { db } from "@/lib/db";
import { PROVIDER_LABELS, severityStyle } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Data" };

export default async function DataPage() {
  const [stores, edges] = await Promise.all([
    db.resource.findMany({
      where: { hasSensitiveData: true },
      include: { cloudAccount: true, project: true, _count: { select: { issues: true } } },
      orderBy: [{ isPublic: "desc" }, { name: "asc" }],
    }),
    db.graphEdge.findMany({
      include: { from: { select: { id: true, name: true, type: true } } },
    }),
  ]);

  const byStore = new Map<string, string[]>(); // storeId → identity names that reach it
  const storeIds = new Set(stores.map((s) => s.id));
  for (const e of edges) {
    if (!storeIds.has(e.toId)) continue;
    const from = e.from;
    if (!/identity|role|service/i.test(from.type)) continue;
    if (!byStore.has(e.toId)) byStore.set(e.toId, []);
    byStore.get(e.toId)!.push(from.name);
  }

  const publicCount = stores.filter((s) => s.isPublic).length;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            DSPM-lite: stores classified as sensitive (name-based heuristics), their
            exposure, and which identities can reach them.
          </p>
        </div>
        <span className={`badge px-3 py-1.5 ${publicCount > 0 ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"}`}>
          {publicCount} publicly exposed of {stores.length}
        </span>
      </header>

      {stores.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line bg-white py-14 text-center text-sm text-slate-500">
          No sensitive stores discovered yet. Connect a cloud account — classification
          runs automatically on ingest.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {stores.map((s) => {
            const identities = byStore.get(s.id) ?? [];
            return (
              <article key={s.id} className={`rounded-md border bg-white p-5 ${s.isPublic ? "border-red-200" : "border-line"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <div>
                    <Link href={`/console/resources/${s.id}`} className="font-semibold text-coal hover:text-accent">
                      {s.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      {PROVIDER_LABELS[s.provider] ?? s.provider} · {s.cloudAccount.name} · {s.region} · {s.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.isPublic && <span className="badge bg-red-50 text-red-600 ring-1 ring-red-200">public</span>}
                    <span className="badge bg-slate-100 text-slate-600">{identities.length} identity reach</span>
                    {s._count.issues > 0 && (
                      <span className={`badge ${severityStyle("HIGH")} ${s._count.issues > 0 ? "" : "opacity-0"}`}>{s._count.issues} issues</span>
                    )}
                  </div>
                </div>
                {identities.length > 0 && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Reachable by:{" "}
                    {identities.map((n, i) => (
                      <span key={n}>
                        <span className="font-mono text-slate-600">{n}</span>
                        {i < identities.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

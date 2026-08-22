import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Identities" };

const TRAVERSE_KINDS = new Set(["ACCESSES", "ASSUMES", "EXPOSES", "DECRYPTS_WITH"]);

export default async function IdentitiesPage() {
  const [resources, edges] = await Promise.all([
    db.resource.findMany({
      include: { cloudAccount: true, project: true, _count: { select: { issues: true } } },
    }),
    db.graphEdge.findMany(),
  ]);

  const byId = new Map(resources.map((r) => [r.id, r]));
  const outMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!TRAVERSE_KINDS.has(e.kind)) continue;
    if (!outMap.has(e.fromId)) outMap.set(e.fromId, []);
    outMap.get(e.fromId)!.push(e.toId);
  }

  function reachable(startId: string): string[] {
    const seen = new Set<string>([startId]);
    const queue = [startId];
    while (queue.length) {
      const cur = queue.shift()!;
      for (const next of outMap.get(cur) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    return [...seen].filter((id) => id !== startId);
  }

  const identities = resources
    .filter((r) => /identity|role|service account/i.test(r.type))
    .map((ident) => {
      const reach = reachable(ident.id).map((id) => byId.get(id)!).filter(Boolean);
      const sensitiveHits = reach.filter((t) => t.hasSensitiveData);
      const publicHits = reach.filter((t) => t.isPublic && !t.hasSensitiveData);
      const adminish = /admin|\*/i.test(ident.name) || reach.length >= 3;
      return { ident, reach, sensitiveHits, publicHits, toxic: sensitiveHits.length > 0 || (adminish && reach.length > 0) };
    })
    .sort((a, b) => Number(b.toxic) - Number(a.toxic) || b.reach.length - a.reach.length);

  const toxicCount = identities.filter((i) => i.toxic).length;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-coal">Identities</h1>
          <p className="mt-1 text-sm text-slate-500">
            CIEM-lite: every workload identity in the seed, what it can actually reach via the
            graph, and whether that combination is toxic.
          </p>
        </div>
        <span className={`badge px-3 py-1.5 ${toxicCount > 0 ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"}`}>
          {toxicCount} toxic of {identities.length}
        </span>
      </header>

      <div className="mt-6 space-y-4">
        {identities.map(({ ident, reach, sensitiveHits, publicHits, toxic }) => (
          <article
            key={ident.id}
            className={`rounded-md border bg-white p-5 ${toxic ? "border-red-200" : "border-line"}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <div>
                <p className="font-semibold text-coal">{ident.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                  {ident.cloudAccount.provider} · {ident.cloudAccount.name} · {ident.project?.name ?? "unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-slate-100 text-slate-600">reaches {reach.length}</span>
                {toxic ? (
                  <span className="badge bg-red-50 text-red-600 ring-1 ring-red-200">toxic access</span>
                ) : (
                  <span className="badge bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">scoped</span>
                )}
              </div>
            </div>

            {reach.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reachable resources
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {reach.map((t) => (
                    <li key={t.id}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.hasSensitiveData ? "bg-pink-50 text-pink-700" : "bg-mist text-ink-soft"
                        }`}
                      >
                        {t.name}
                        {t.hasSensitiveData && <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />}
                        {t.isPublic && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
                      </span>
                    </li>
                  ))}
                </ul>
                {(sensitiveHits.length > 0 || publicHits.length > 0) && (
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">
                    {sensitiveHits.length > 0 && (
                      <>This identity can read <strong>{sensitiveHits.length} sensitive data store{sensitiveHits.length === 1 ? "" : "s"}</strong>.{" "}
                        Least-privilege fix: scope its policy to named resources only.
                      </>
                    )}
                    {sensitiveHits.length === 0 && publicHits.length > 0 && (
                      <>Reach is limited to exposed surfaces — review whether that trust is intended.</>
                    )}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
        {identities.length === 0 && (
          <p className="rounded-md border border-dashed border-line bg-white py-14 text-center text-sm text-slate-400">
            No identity-type resources in the current seed.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Reachability walks ACCESSES · ASSUMES · EXPOSES · DECRYPTS_WITH edges from the seeded graph —{" "}
        <Link href="/console/graph" className="font-semibold text-accent hover:underline">
          see it visually in the Graph Explorer →
        </Link>
      </p>
    </div>
  );
}

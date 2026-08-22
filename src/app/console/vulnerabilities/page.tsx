import { db } from "@/lib/db";
import { SEVERITY_STYLES } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vulnerabilities" };

export default async function VulnerabilitiesPage() {
  const vulns = await db.vulnerability.findMany({
    include: { resource: true },
    orderBy: [{ cvss: "desc" }],
  });

  const kev = vulns.filter((v) => v.exploitedInWild);
  const byCve = new Map<string, typeof vulns>();
  for (const v of vulns) {
    const list = byCve.get(v.cveId) ?? [];
    list.push(v);
    byCve.set(v.cveId, list);
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-loom-navy">Vulnerabilities</h1>
          <p className="mt-1 text-sm text-slate-500">
            Agentless scan results correlated with the graph — exploited-in-the-wild first.
          </p>
        </div>
        <span className="badge bg-red-100 px-3 py-1.5 text-red-700">
          {kev.length} CVEs exploited in the wild
        </span>
      </header>

      <div className="mt-6 space-y-4">
        {[...byCve.entries()].map(([cve, hits]) => {
          const v = hits[0];
          const maxSevOnTargets = Math.max(...hits.map((h) => h.cvss));
          return (
            <article key={cve} className="rounded-2xl border border-loom-line bg-white shadow-card">
              <div className="flex flex-wrap items-center gap-3 border-b border-loom-line px-6 py-4">
                <span className="font-mono text-sm font-bold text-loom-navy">{cve}</span>
                {v.exploitedInWild && (
                  <span className="badge bg-red-600 text-white">Exploited in wild</span>
                )}
                <span className={`badge ${SEVERITY_STYLES[v.severity]}`}>{v.severity}</span>
                <span className="ml-auto inline-flex items-center gap-2">
                  <span className="text-xs text-slate-400">Max CVSS</span>
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: maxSevOnTargets >= 9 ? "#D92D20" : maxSevOnTargets >= 7 ? "#F76808" : maxSevOnTargets >= 4 ? "#F59E0B" : "#94A3B8" }}
                  >
                    {maxSevOnTargets.toFixed(1)}
                  </span>
                </span>
              </div>
              <div className="grid gap-5 p-6 md:grid-cols-5">
                <div className="md:col-span-2">
                  <p className="text-sm leading-relaxed text-slate-600">{v.description}</p>
                  <dl className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <p><strong className="text-slate-700">Package:</strong> {v.packageName}</p>
                    <p><strong className="text-slate-700">Installed:</strong> {v.installedVersion} → <strong className="text-emerald-600">Fix in {v.fixedVersion}</strong></p>
                  </dl>
                </div>
                <div className="md:col-span-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Detected on {hits.length} resource{hits.length === 1 ? "" : "s"}
                  </p>
                  <ul className="space-y-2">
                    {hits.map((h) => (
                      <li key={h.id + h.resource.id} className="flex items-center justify-between rounded-lg bg-loom-cloud px-4 py-2.5 text-sm">
                        <span className="font-medium text-loom-navy">{h.resource.name}</span>
                        <span className="text-xs text-slate-500">
                          {h.resource.provider} · {h.resource.type}
                          {(h.resource.isPublic || h.resource.hasSensitiveData) && (
                            <span className="ml-2 font-semibold text-loom-pink">
                              {h.resource.isPublic && h.resource.hasSensitiveData ? "public + sensitive" : h.resource.isPublic ? "internet-exposed" : "sensitive data"}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

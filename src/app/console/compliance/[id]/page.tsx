import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FAMILY_COLORS } from "../colors";

export const dynamic = "force-dynamic";

export default async function FrameworkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const framework = await db.complianceFramework.findUnique({ where: { id: params.id } });
  if (!framework) notFound();

  const controls = await db.control.findMany({
    where: { framework: framework.name },
    include: {
      issues: {
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        include: { resource: { select: { id: true, name: true } } },
      },
    },
    orderBy: { controlId: "asc" },
  });

  const failing = controls.filter((c) => c.issues.length > 0);
  const passing = controls.filter((c) => c.issues.length === 0);
  const color = FAMILY_COLORS[framework.family] ?? "#2C6BFF";

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link href="/console/compliance" className="text-sm font-semibold text-accent hover:underline">
        ← Compliance
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="badge" style={{ background: `${color}14`, color }}>{framework.family}</span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-coal">{framework.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {passing.length} passing · {failing.length} failing of {controls.length} mapped controls ·
            computed live from open findings
          </p>
        </div>
        <span className={`badge px-3 py-1.5 ${
          controls.length === 0 ? "bg-stone-100 text-stone-500"
          : failing.length === 0 ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
          : "bg-orange-50 text-orange-600 ring-1 ring-orange-200"
        }`}>
          {controls.length === 0 ? "PENDING" : failing.length === 0 ? "PASSING" : `${failing.length} FAILING`}
        </span>
      </header>

      {controls.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line bg-white py-14 text-center text-sm text-slate-500">
          No controls are mapped to {framework.name} yet. Controls arrive as real resources are
          ingested and evaluated — connect an account to populate evidence.
        </p>
      ) : (
        <>
          {failing.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Failing — open findings ({failing.length})
              </h2>
              <ul className="mt-3 space-y-3">
                {failing.map((c) => (
                  <li key={c.id} className="rounded-md border border-orange-200 bg-orange-50/40 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="font-semibold text-coal">
                        <span className="font-mono text-xs text-slate-400">{c.controlId}</span> {c.name}
                      </p>
                      <span className="badge bg-orange-100 text-orange-700">{c.issues.length} open</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {c.issues.map((i) => (
                        <li key={i.id}>
                          <Link href={`/console/issues/${i.refId}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-coal ring-1 ring-line transition hover:ring-accent">
                            {i.resource.name}
                            <span className="font-mono text-[10px] text-slate-400">{i.refId}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {passing.length > 0 && (
            <section className={`mt-8 ${failing.length > 0 ? "" : ""}`}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Passing — no open findings ({passing.length})
              </h2>
              <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-white">
                {passing.map((c) => (
                  <li key={c.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-coal">
                      <span className="mr-2 text-emerald-600">✓</span>
                      <span className="font-mono text-xs text-slate-400">{c.controlId}</span> {c.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{c.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

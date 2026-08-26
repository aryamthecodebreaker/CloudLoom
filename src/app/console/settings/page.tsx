import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

function Status({ configured }: { configured: boolean }) {
  return (
    <span className={`badge ${configured ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "bg-stone-100 text-stone-500 ring-1 ring-stone-200"}`}>
      {configured ? "configured" : "not set"}
    </span>
  );
}

export default async function SettingsPage() {
  // Presence only — values are never rendered.
  const integrations = [
    {
      name: "Agent ingestion token",
      env: "INGEST_TOKEN",
      configured: !!process.env.INGEST_TOKEN,
      note: "The Go agent authenticates with this token to push real discoveries.",
      doc: "Set in your hosting provider's environment variables.",
    },
    {
      name: "Alert webhook",
      env: "WEBHOOK_URL",
      configured: !!process.env.WEBHOOK_URL,
      note: "Slack-compatible webhook — fires on suspicious drift and critical findings.",
      doc: "Optional. Create a Slack app webhook or use any POST-accepting endpoint.",
    },
    {
      name: "Blue Agent (AI investigation)",
      env: "OPENAI_API_KEY",
      configured: !!process.env.OPENAI_API_KEY,
      note: "Bring your own key — powers autonomous issue investigation with full graph context.",
      doc: "Get a key at platform.openai.com. Optional: OPENAI_BASE_URL for compatible providers.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-coal">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Integration status for this deployment. Values are read from environment
          variables — they are never displayed here or stored in the database.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {integrations.map((i) => (
          <article key={i.env} className="rounded-md border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-coal">{i.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">{i.env}</p>
              </div>
              <Status configured={i.configured} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{i.note}</p>
            <p className="mt-1 text-xs text-slate-400">{i.doc}</p>
          </article>
        ))}
      </div>

      <section className="mt-8 rounded-md border border-line bg-white p-6 shadow-card">
        <h2 className="font-bold text-coal">Database</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connected via <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-xs">DATABASE_URL</code> — any
          Postgres (Supabase, Neon, RDS, Docker). Schema is managed with{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-xs">npm run db:push</code>.
        </p>
        <Link href="/console/connectors" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
          Connect a cloud account →
        </Link>
      </section>
    </div>
  );
}

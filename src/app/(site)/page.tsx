import Link from "next/link";
import { Reveal } from "@/components/motion";
import { GITHUB_URL } from "@/components/site-chrome";

const shipped = [
  {
    title: "Security graph, drawn and queryable",
    meta: "Postgres · 20 typed edges",
    body: "A seeded multi-cloud estate — resources, identities, relationships — rendered as an interactive canvas. Columns are accounts; every edge is a way risk travels.",
  },
  {
    title: "Triage that survives a refresh",
    meta: "Controls → issues · persisted",
    body: "Rules evaluate against the graph into prioritized issues. Move one through OPEN, IN_PROGRESS, RESOLVED or REJECTED and it stays moved — the database is the source of truth.",
  },
  {
    title: "Attack paths, hop by hop",
    meta: "Toxic combinations",
    body: "Internet exposure plus a flaw plus an over-scoped role plus sensitive data is one walkable path. CloudLoom draws the hops and names the one that breaks the chain.",
  },
  {
    title: "The paperwork views",
    meta: "Inventory · CVEs · compliance",
    body: "Resource catalog across five modeled providers, exploited-in-the-wild CVE view, and framework posture computed from the same tables you can open yourself.",
  },
];

const roadmap = [
  ["Live cloud connectors", "Read-only AWS / Azure / GCP ingestion via the Go agent"],
  ["Real IAM & resource graphs", "Your estate, not the seed"],
  ["Telemetry-driven attack paths", "Live network and identity edges"],
  ["CVE scanning", "Actual package detection against workloads"],
  ["Runtime monitoring", "eBPF sensor signals"],
  ["Multi-tenancy & RBAC", "Teams, projects, scoped access"],
  ["Red · Blue · Green agents", "Simulation, investigation, remediation"],
];

const specs: Array<[string, string]> = [
  ["License", "Apache-2.0 — every line yours"],
  ["Stack", "Next.js 14 · TypeScript strict · Prisma v5"],
  ["Database", "Any Postgres (Supabase-ready)"],
  ["Demo estate", "22 resources · 5 providers · 20 edges"],
  ["Connectors", "Go agent scaffolded — roadmap #1"],
  ["Cost", "$0. No tier, no gate, no telemetry home."],
];

const faqs = [
  {
    q: "Is CloudLoom connected to my cloud?",
    a: "No — and it never touches a real account in its current form. The console ships with a richly seeded simulated environment so every screen is explorable without credentials, risk, or setup.",
  },
  {
    q: "So what exactly is it today?",
    a: "A working open-source blueprint of a CNAPP: the data model, the security-graph queries, the triage workflow, and the visual language — implemented end to end against Postgres and ready to be pointed at real telemetry.",
  },
  {
    q: "Why start with simulation instead of scanners?",
    a: "Because the hard problem in cloud security tooling isn't reading data — it's turning findings into decisions. Building the decision layer first means connectors, when they land, plug into something already worth using.",
  },
  {
    q: "Is it really 100% free?",
    a: "Yes. Apache-2.0 licensed, no gated features, no paid tier, no telemetry home. Clone it, run it anywhere Node runs, own every byte.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero: left-aligned, typographic, terminal beside it ---------- */}
      <section className="container-loom grid items-start gap-12 pb-28 pt-20 lg:grid-cols-[11fr_9fr] lg:gap-16 lg:pt-28">
        <div>
          <h1 className="clip-reveal font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Find the paths that
            <br />
            actually reach your data.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
            CloudLoom weaves resources, identities and findings into one security
            graph, then shows which combinations an attacker could walk. Today it
            runs as a fully working console on a realistic simulated cloud —
            built to explore, learn from, and extend toward live clouds.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/console" className="btn-primary px-6 py-3 text-base">
              Open the demo console
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3 text-base">
              Read the code instead
            </a>
          </div>
          <p className="mt-8 font-mono text-xs text-ink-faint">
            Honest scope: no live AWS/Azure/GCP connections yet — connectors are roadmap item #1.
          </p>
        </div>

        {/* Real quickstart, styled like the terminal it runs in */}
        <Reveal variant="fade" delay={120} className="lg:pt-6">
          <div className="overflow-hidden rounded-md bg-coal shadow-card ring-1 ring-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <span className="font-mono text-xs text-white/50">quickstart</span>
              <span className="font-mono text-[10px] text-white/30">bash — 80×24</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-white/85"><code>{`$ git clone https://github.com/aryamthecodebreaker/CloudLoom.git
$ cd CloudLoom && cp .env.example .env
$ npm install

$ npm run dev

`}<span className="text-emerald-400">✓ console ready — connect a cloud via the agent</span>{"\n"}<span className="text-white/45">→ http://localhost:3000/console</span></code></pre>
          </div>
          <p className="mt-3 font-mono text-xs text-ink-faint">No signup. No cloud credentials. Your data stays yours.</p>
        </Reveal>
      </section>

      <div className="container-loom"><div className="rule" /></div>

      {/* ---------- Shipped: sticky intro + hairline list (no cards) ---------- */}
      <section className="container-loom grid gap-12 py-24 lg:grid-cols-[4fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            What ships today.
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-ink-soft">
            Four things, working right now in this repo. No vaporware list — each
            one is backed by tables you can open and inspect.
          </p>
        </div>
        <div>
          {shipped.map((f, i) => (
            <Reveal key={f.title} variant="left" delay={i * 60}>
              <article className={`${i > 0 ? "rule" : ""} py-8 first:pt-0`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-display text-xl font-medium text-ink">{f.title}</h3>
                  <span className="font-mono text-xs text-accent">{f.meta}</span>
                </div>
                <p className="mt-2.5 max-w-2xl leading-relaxed text-ink-soft">{f.body}</p>
              </article>
            </Reveal>
          ))}

          {/* The signature attack-path drawing, inline where it belongs */}
          <div className="rule pt-8">
            <div className="rounded-md border border-line bg-white/60 p-5">
              <svg viewBox="0 0 680 150" className="w-full" role="img" aria-label="Attack path from internet exposure to sensitive data">
                <defs>
                  <marker id="path-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#D6246E" />
                  </marker>
                </defs>
                {heroSegments.map((s, i) => (
                  <path
                    key={i}
                    d={`M${s.x1},${s.y1} C${s.x1 + 55},${s.y1} ${s.x2 - 55},${s.y2} ${s.x2},${s.y2}`}
                    fill="none"
                    stroke="#D6246E"
                    strokeWidth="2"
                    markerEnd="url(#path-arrow)"
                    className={`draw-path draw-path-${i + 1}`}
                  />
                ))}
                <g className="pop-in pop-1"><PathNode x={18} y={44} label="Internet" sub="0.0.0.0/0" /></g>
                <g className="pop-in pop-2"><PathNode x={196} y={66} label="edge-worker-01" sub="modeled RCE finding" /></g>
                <g className="pop-in pop-3"><PathNode x={428} y={88} label="etl-role" sub="over-scoped s3:*" /></g>
                <g className="pop-in pop-4"><PathNode x={560} y={112} label="pii-exports" sub="seeded PII store" tone /></g>
              </svg>
              <p className="mt-3 font-mono text-[11px] text-ink-faint">
                CL-1042 · break any single hop and the path collapses — the console names which one to cut first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Roadmap on dark ---------- */}
      <section className="bg-coal py-24 text-paper">
        <div className="container-loom grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Then the road to live clouds.
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-paper/70">
              We won&apos;t pretend the rest exists. This is the build order —
              each step lands against schema headroom that already exists.
            </p>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-md bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-white">
              Claim an issue →
            </a>
          </div>
          <ol>
            {roadmap.map(([title, detail], i) => (
              <li key={title} className={`${i > 0 ? "border-t border-white/10" : ""} flex items-baseline gap-6 py-5`}>
                <span className="w-8 shrink-0 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-paper/55">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Spec sheet, not a stat banner ---------- */}
      <section className="bg-cream py-20">
        <div className="container-loom grid gap-10 lg:grid-cols-[4fr_7fr] lg:gap-20">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
            The datasheet.
          </h2>
          <dl className="divide-y divide-ink/10 border-y border-ink/10">
            {specs.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-mono text-xs uppercase tracking-wider text-ink-faint">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="py-24">
        <div className="container-loom max-w-3xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
            The uncomfortable questions.
          </h2>
          <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-ink">
                  {f.q}
                  <span className="font-mono text-lg text-accent transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA: solid dark, one button ---------- */}
      <section className="bg-coal py-24 text-paper">
        <div className="container-loom flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Walk the graph yourself.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-paper/70">
              A fully seeded environment is waiting — attack paths, triage,
              compliance. No signup, no credentials, no risk.
            </p>
          </div>
          <Link href="/console" className="rounded-md bg-paper px-7 py-3.5 text-base font-semibold text-ink transition-colors duration-150 hover:bg-white">
            Open the console
          </Link>
        </div>
      </section>
    </>
  );
}

const heroSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 60, y1: 70, x2: 200, y2: 95 },
  { x1: 330, y1: 95, x2: 450, y2: 115 },
  { x1: 545, y1: 118, x2: 585, y2: 138 },
];

function PathNode({ x, y, label, sub, tone }: { x: number; y: number; label: string; sub: string; tone?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="122" height="38" rx={3} fill="#fff" stroke="#E4DCCC" strokeWidth="1" />
      <circle cx="12" cy="19" r="3.5" fill={tone ? "#12B76A" : "#D6246E"} />
      <text x="23" y="16" fontSize="10" fontWeight="700" fill="#211B12">{label}</text>
      <text x="23" y="29" fontSize="8.5" fill="#8C8371">{sub}</text>
    </g>
  );
}

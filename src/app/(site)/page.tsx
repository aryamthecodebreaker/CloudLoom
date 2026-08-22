import Link from "next/link";
import { Reveal } from "@/components/motion";
import { IconCode, IconGraph, IconShieldPulse, IconChipNodes } from "@/components/icons";
import { GITHUB_URL } from "@/components/site-chrome";

const shipped = [
  {
    icon: IconGraph,
    accent: "#2C6BFF",
    title: "Security graph model",
    body: "A seeded multi-cloud estate — resources, identities, and the relationships between them — queried like the real thing.",
  },
  {
    icon: IconShieldPulse,
    accent: "#FF4F9A",
    title: "Issue triage that persists",
    body: "Controls evaluate against the graph into prioritized issues. Change a status and it sticks — Postgres-backed, not props.",
  },
  {
    icon: IconCode,
    accent: "#7C3AED",
    title: "Attack path visualization",
    body: "Toxic combinations rendered hop by hop, entry point to sensitive data, with guidance on which single hop breaks the chain.",
  },
  {
    icon: IconChipNodes,
    accent: "#12B76A",
    title: "Inventory, CVEs & compliance views",
    body: "A resource catalog across five modeled providers, an exploited-in-the-wild CVE view, and framework posture with honest math.",
  },
];

const roadmap = [
  ["Live cloud connectors", "Read-only AWS / Azure / GCP ingestion via API"],
  ["Real IAM & resource graph", "Your actual estate, not the seed"],
  ["Telemetry-driven attack graphs", "Live network and identity edges"],
  ["CVE scanning", "Real package detection against workloads"],
  ["Runtime monitoring", "eBPF sensor signals and alerting"],
  ["Multi-tenancy & RBAC", "Teams, projects, scoped access"],
  ["Red · Blue · Green agents", "Designed attack-simulation, investigation & remediation AI"],
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
  {
    q: "Can I help build the real connectors?",
    a: "Please do. The roadmap above is the build order, the schema is deliberately shaped for live ingestion, and good first issues are waiting in the repository.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-loom-navy text-white">
        <GraphConstellation />
        <div className="grain absolute inset-0" aria-hidden />
        <div className="animate-orb absolute -top-40 left-[12%] h-[480px] w-[720px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, #2C6BFF 0%, transparent)" }} aria-hidden />
        <div className="animate-orb absolute -bottom-52 right-[6%] h-[420px] w-[420px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, #FF4F9A 0%, transparent)", animationDelay: "-6s" }} aria-hidden />

        <div className="container-loom relative pb-20 pt-24 text-center md:pt-32">
          <span className="pop-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Open source · Apache-2.0 · 100% free
          </span>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl md:leading-[1.06]">
            See your cloud the way
            <br />
            an attacker would.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-300">
            CloudLoom weaves resources, identities, and risks into one security graph.
            Today it runs as a fully working console on a{" "}
            <strong className="font-semibold text-white">realistic simulated environment</strong>{" "}
            — built to explore, learn from, and extend toward live clouds.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm leading-relaxed text-slate-300">
            Honest scope: no live AWS/Azure/GCP connections yet — connectors are the top
            roadmap item. Everything you see below is real software running on seed data.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/console" className="btn-primary px-8 py-3.5 text-base shadow-graph transition hover:-translate-y-0.5">
              Explore the demo console →
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary border-white/25 bg-transparent px-8 py-3.5 text-base text-white hover:border-white hover:text-white">
              Read the code instead
            </a>
          </div>

          {/* Animated attack-path showcase */}
          <Reveal delay={150} className="mx-auto mt-16 max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 shadow-graph md:p-8">
              <div className="grain absolute inset-0" aria-hidden />
              <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">From the seeded graph</p>
                  <p className="font-semibold text-white">Critical attack path · CL-1042</p>
                </div>
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-300 ring-1 ring-red-400/40">
                  Entry → PII in 3 hops
                </span>
              </div>
              <svg viewBox="0 0 680 190" className="relative w-full" role="img" aria-label="Animated attack path drawing itself from internet exposure to sensitive data">
                <defs>
                  <marker id="hero-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#FF4F9A" />
                  </marker>
                </defs>
                {heroSegments.map((s, i) => (
                  <path
                    key={i}
                    d={`M${s.x1},${s.y1} C${s.x1 + 55},${s.y1} ${s.x2 - 55},${s.y2} ${s.x2},${s.y2}`}
                    fill="none"
                    stroke="#FF4F9A"
                    strokeWidth="2.5"
                    markerEnd="url(#hero-arrow)"
                    className={`draw-path draw-path-${i + 1}`}
                    style={{ strokeDasharray: "160", strokeDashoffset: "160" }}
                  />
                ))}
                <g className="pop-in pop-1"><HeroNode x={18} y={48} label="Internet" sub="0.0.0.0/0 : HTTPS" color="#F79009" /></g>
                <g className="pop-in pop-2"><HeroNode x={196} y={72} label="edge-worker-01" sub="modeled RCE finding" color="#FF4F9A" /></g>
                <g className="pop-in pop-3"><HeroNode x={428} y={98} label="etl-role" sub="over-scoped s3:*" color="#8FB3FF" /></g>
                <g className="pop-in pop-4"><HeroNode x={566} y={132} label="pii-exports" sub="seeded PII store" color="#34D399" /></g>
              </svg>
              <div className="relative mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {[
                  ["Break hop 1", "close exposure", "#F79009"],
                  ["Break hop 2", "patch the flaw", "#FF4F9A"],
                  ["Break hop 3", "scope the role", "#8FB3FF"],
                  ["…or shield", "the data directly", "#34D399"],
                ].map(([t, s, c]) => (
                  <div key={t} className="rounded-xl bg-white/5 px-3.5 py-2.5 ring-1 ring-white/10">
                    <p className="text-xs font-bold" style={{ color: c }}>{t}</p>
                    <p className="text-[11px] text-slate-400">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Shipped today ---------- */}
      <section className="py-24">
        <div className="container-loom">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-loom-navy md:text-4xl">
              What actually ships today
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              No vaporware list. These four things work right now, in this repo,
              backed by Postgres you can inspect.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {shipped.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <article className="flex h-full gap-5 rounded-2xl border border-loom-line bg-white p-7 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${f.accent}14`, color: f.accent }}
                  >
                    <f.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-loom-navy">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Roadmap ---------- */}
      <section className="relative overflow-hidden bg-loom-navy py-24 text-white">
        <div className="grain absolute inset-0" aria-hidden />
        <div className="container-loom relative grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              The road to live clouds
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              We won&apos;t pretend the rest exists. Here is exactly what&apos;s next,
              in build order — each step plugs into a schema that&apos;s already
              shaped for it.
            </p>
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-loom-blue transition hover:-translate-y-0.5"
            >
              Claim an issue on GitHub →
            </a>
          </Reveal>
          <ol className="space-y-3 lg:col-span-3">
            {roadmap.map(([title, detail], i) => (
              <Reveal key={title} delay={i * 60}>
                <li className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-loom-blue/20 text-xs font-bold text-sky-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{detail}</p>
                  </div>
                  <span className="ml-auto hidden shrink-0 self-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ring-1 ring-white/15 sm:inline-block">
                    Planned
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Fact strip ---------- */}
      <section className="border-b border-loom-line bg-loom-cloud py-10">
        <div className="container-loom grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {[
            ["100%", "free & open source"],
            ["Apache-2.0", "every line yours"],
            ["5 clouds", "modeled in the demo graph"],
            ["< 2 min", "clone to running console"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-extrabold text-loom-navy">{v}</p>
              <p className="mt-1 text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="py-24">
        <div className="container-loom mx-auto max-w-3xl">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-loom-navy md:text-4xl">
              The uncomfortable questions
            </h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group rounded-2xl border border-loom-line bg-white px-6 py-5 shadow-card transition open:border-loom-blue/40 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-loom-navy">
                    {f.q}
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-loom-cloud text-loom-blue transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="pb-24">
        <div className="container-loom">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-loom-blue to-loom-navy px-8 py-16 text-center text-white shadow-graph md:py-20">
            <div className="grain absolute inset-0" aria-hidden />
            <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">
              Walk the graph yourself
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-lg text-sky-100">
              A fully seeded environment is waiting — attack paths, triage,
              compliance, and all. No signup, no credentials, no risk.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/console" className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-loom-blue transition hover:-translate-y-0.5 hover:bg-sky-100">
                Open the console
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold transition hover:bg-white/10">
                Star the repository
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const heroSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 60, y1: 70, x2: 200, y2: 95 },
  { x1: 330, y1: 105, x2: 450, y2: 120 },
  { x1: 565, y1: 130, x2: 600, y2: 155 },
];

function GraphConstellation() {
  const pts: Array<[number, number, number]> = [
    [90, 120, 0], [260, 60, 1.2], [420, 150, 2.4], [580, 70, 3.6], [760, 130, .8],
    [930, 55, 2], [1090, 140, 3.2], [180, 300, 4.2], [350, 380, .4], [520, 320, 1.8],
    [700, 400, 2.9], [880, 330, 4], [1040, 290, 1], [280, 560, 3.4], [480, 610, .6],
    [660, 540, 1.6], [850, 600, 2.7], [1010, 520, 3.8],
  ];
  const links: Array<[number, number]> = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,7],[7,8],[8,9],[9,10],[10,11],[11,12],[8,13],[13,14],[14,15],[15,16],[16,17],[2,9],[4,11],[9,15],[10,16]];
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 1180 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {links.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#3E63C4" strokeWidth="1" opacity="0.35" />
      ))}
      {pts.map(([x, y, d], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 5 === 0 ? 5 : 3}
          fill={i % 4 === 0 ? "#FF4F9A" : "#7FA8FF"}
          className="twinkle"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </svg>
  );
}

function HeroNode({ x, y, label, sub, color }: { x: number; y: number; label: string; sub: string; color: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="128" height="42" rx="11" fill="rgba(255,255,255,.09)" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="21" r="4" fill={color} />
      <text x="24" y="17" fontSize="10.5" fontWeight="700" fill="#fff">{label}</text>
      <text x="24" y="31" fontSize="8.5" fill="#cbd5e1">{sub}</text>
    </g>
  );
}

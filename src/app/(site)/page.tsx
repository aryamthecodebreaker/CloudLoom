import Link from "next/link";

const modules = [
  {
    name: "OpenWiz Code",
    tagline: "Start secure from the first commit",
    body: "Scan IaC, dependencies, and secrets in the pipeline, then trace every cloud risk back to the exact line that caused it. One-click fixes land as pull requests.",
    accent: "#2C6BFF",
    points: ["SCA & SBOM", "IaC scanning", "Secrets detection", "Code-to-cloud correlation"],
  },
  {
    name: "OpenWiz Defend",
    tagline: "Detect and respond at runtime",
    body: "An eBPF sensor plus agentless log analysis spots live exploitation, maps the full attack path, and hands responders a verdict in minutes instead of days.",
    accent: "#FF4F9A",
    points: ["Runtime sensor", "Cloud investigation", "Identity threat detection", "Data detection & response"],
  },
  {
    name: "OpenWiz AI Shield",
    tagline: "Security for the AI stack",
    body: "Inventory models, agents, and MCP servers wherever they run. Catch prompt injection, data exfiltration, and rogue agent behavior before it spreads.",
    accent: "#7C3AED",
    points: ["AI asset discovery", "AI-native risk scoring", "Agent posture", "Model runtime protection"],
  },
];

const agents = [
  { name: "Red Agent", color: "#FF4F9A", role: "Offensive validation", body: "Simulates real attack paths across your environment to prove what is actually exploitable — so the queue holds signal, not theory." },
  { name: "Blue Agent", color: "#2C6BFF", role: "Autonomous investigation", body: "Investigates every alert end-to-end, correlates evidence across code and cloud, and delivers a defensible verdict with blast radius included." },
  { name: "Green Agent", color: "#10B981", role: "Precision remediation", body: "Turns findings into context-aware fixes at the source, opening reviewed pull requests that close entire classes of risk." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-wiz-navy text-white">
        <div className="grain absolute inset-0" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #2C6BFF 0%, transparent)" }}
          aria-hidden
        />
        <div
          className="absolute -bottom-56 right-[8%] h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #FF4F9A 0%, transparent)" }}
          aria-hidden
        />
        <div className="container-wiz relative flex flex-col items-center py-28 text-center md:py-36">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-wiz-pink" />
            Open source · Apache-2.0
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl md:leading-[1.08]">
            Protect everything you build
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-wiz-blue to-wiz-pink bg-clip-text text-transparent">
              and everything you run.
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300">
            OpenWiz connects your code, cloud, identities, and runtime into a single
            security graph — then uses AI to find real attack paths, cut the noise,
            and fix risks at the source.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/console" className="btn-primary px-7 py-3 text-base shadow-graph">
              Explore the demo console
            </Link>
            <Link href="/platform" className="btn-secondary border-white/25 bg-transparent text-white hover:border-white hover:text-white">
              See the platform
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400">No signup · Seeded demo environment · Runs anywhere</p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-wiz-line bg-wiz-cloud py-8">
        <div className="container-wiz flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-bold tracking-wide text-slate-400">
          <span>TRUSTED IN DEMOS BY</span>
          {["Northwind Labs", "Acme Robotics", "Globex Cloud", "Initech Systems", "Hooli Ventures"].map((c) => (
            <span key={c} className="transition hover:text-wiz-blue">{c}</span>
          ))}
        </div>
      </section>

      {/* Security graph */}
      <section className="py-24">
        <div className="container-wiz grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-wiz-blue">The Security Graph</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-wiz-navy md:text-4xl">
              One graph. Every relationship. Zero guesswork.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Most tools show you thousands of alerts. OpenWiz shows you the handful of
              paths an attacker would actually walk — entry point, identity hop,
              workload, sensitive data — and tells you which single hop breaks the chain.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                ["Attack path analysis", "Toxic combinations surfaced as prioritized issues, ranked by business impact."],
                ["Code-to-cloud correlation", "Every running resource traces back to the repo, pipeline, and developer that shipped it."],
                ["Blast radius mapping", "Know instantly what an incident touches — and who owns the fix."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wiz-blue/10 text-xs font-bold text-wiz-blue">✓</span>
                  <p><strong className="font-semibold text-wiz-navy">{t}.</strong> <span className="text-slate-600">{d}</span></p>
                </li>
              ))}
            </ul>
          </div>
          <GraphMock />
        </div>
      </section>

      {/* Modules */}
      <section className="bg-wiz-cloud py-24">
        <div className="container-wiz">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-wiz-blue">Platform</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-wiz-navy md:text-4xl">
              One platform from code to runtime
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Replace the sprawl of point tools with a single agentless-first CNAPP that
              deploys in minutes.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {modules.map((m) => (
              <article key={m.name} className="group rounded-2xl border border-wiz-line bg-white p-8 shadow-card transition hover:-translate-y-1 hover:border-wiz-blue/40">
                <span className="inline-block h-10 w-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${m.accent}, ${m.accent}55)` }} aria-hidden />
                <h3 className="mt-5 text-xl font-bold text-wiz-navy">{m.name}</h3>
                <p className="mt-1 text-sm font-medium" style={{ color: m.accent }}>{m.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{m.body}</p>
                <ul className="mt-6 space-y-2 border-t border-wiz-line pt-5">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} />{p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="relative overflow-hidden bg-wiz-navy py-24 text-white">
        <div className="grain absolute inset-0" aria-hidden />
        <div className="container-wiz relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-wiz-pink">Agentic security</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Your AI security team, on call 24/7</h2>
            <p className="mt-4 text-lg text-slate-300">
              Specialized agents grounded in the security graph do the triage,
              investigation, and remediation work that used to eat your week.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {agents.map((a) => (
              <article key={a.name} className="rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-lg" style={{ background: `${a.color}22`, color: a.color }}>◆</span>
                  <div>
                    <h3 className="font-bold">{a.name}</h3>
                    <p className="text-xs uppercase tracking-wider" style={{ color: a.color }}>{a.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-slate-300">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container-wiz grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["< 15 min", "from zero account connection to full inventory"],
            ["100%", "agentless coverage across VMs, containers, serverless"],
            ["10×", "faster MTTR with agentic investigation"],
            ["120k+", "vulnerabilities in the open knowledge base"],
          ].map(([n, d]) => (
            <div key={n}>
              <p className="bg-gradient-to-r from-wiz-blue to-wiz-pink bg-clip-text text-4xl font-extrabold text-transparent">{n}</p>
              <p className="mx-auto mt-2 max-w-[220px] text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-wiz">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-wiz-blue to-wiz-navy px-8 py-16 text-center text-white shadow-graph">
            <div className="grain absolute inset-0" aria-hidden />
            <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">Ready when you are</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-lg text-sky-100">
              Walk through a fully seeded production environment — attack paths,
              compliance posture, vulnerabilities, and all.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/console" className="rounded-lg bg-white px-7 py-3 text-base font-semibold text-wiz-blue transition hover:bg-sky-100">
                Open the console
              </Link>
              <Link href="/pricing" className="rounded-lg border border-white/30 px-7 py-3 text-base font-semibold transition hover:bg-white/10">
                Compare editions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function GraphMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-wiz-line bg-gradient-to-br from-wiz-navy via-[#12245c] to-wiz-blue p-6 shadow-graph">
      <div className="grain absolute inset-0" aria-hidden />
      <svg viewBox="0 0 420 320" className="relative w-full" role="img" aria-label="Example attack path from internet exposure to sensitive data">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#FF4F9A" />
          </marker>
        </defs>
        {[
          [70, 80, 190, 95], [200, 105, 290, 175], [300, 185, 330, 245],
        ].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1},${y1} C${x1 + 40},${y1 + 10} ${x2 - 40},${y2 - 10} ${x2},${y2}`} fill="none" stroke="#FF4F9A" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow)" />
        ))}
        <Node x={50} y={62} label="Internet" sub="0.0.0.0/0" kind="entry" />
        <Node x={165} y={78} label="edge-worker-01" sub="CVE RCE · CVSS 9.8" kind="risk" />
        <Node x={268} y={158} label="etl-role" sub="s3:* wildcard" kind="identity" />
        <Node x={298} y={228} label="pii-exports" sub="38 GB · PII" kind="data" />
      </svg>
      <div className="relative mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-slate-300">
        {[["#FFB84D", "Entry point"], ["#FF4F9A", "Exploitable workload"], ["#8FB3FF", "Identity"], ["#34D399", "Sensitive data"]].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</span>
        ))}
      </div>
    </div>
  );
}

function Node({ x, y, label, sub, kind }: { x: number; y: number; label: string; sub: string; kind: string }) {
  const colors: Record<string, string> = {
    entry: "#FFB84D", risk: "#FF4F9A", identity: "#8FB3FF", data: "#34D399",
  };
  const c = colors[kind] ?? "#8FB3FF";
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="118" height="46" rx="10" fill="rgba(255,255,255,.08)" stroke={c} strokeWidth="1.5" />
      <circle cx="14" cy="23" r="4.5" fill={c} />
      <text x="26" y="19" fontSize="10" fontWeight="700" fill="#fff">{label}</text>
      <text x="26" y="33" fontSize="8" fill="#cbd5e1">{sub}</text>
    </g>
  );
}

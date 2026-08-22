import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { GITHUB_URL } from "@/components/site-chrome";
import { ArchitectureDiagram } from "@/components/architecture-diagram";

export const metadata: Metadata = { title: "Platform" };

const pillars = [
  {
    name: "The graph model",
    body: "Resources, identities, network paths, and findings are rows in Postgres with explicit relationships. The seed estate models five providers so every query has realistic structure to chew on.",
  },
  {
    name: "Controls → issues",
    body: "A control pairs a graph-shaped rule with a severity. When its conditions match modeled resources, an issue is raised and triaged through OPEN, IN_PROGRESS, RESOLVED, or REJECTED — persisted for real.",
  },
  {
    name: "Attack-path reasoning",
    body: "Entry exposure plus an exploitable finding plus an identity hop plus sensitive data: when the hops line up they surface as one prioritized toxic combination instead of three disconnected alerts.",
  },
  {
    name: "Honest reporting surfaces",
    body: "Inventory, CVE knowledge-base views, and compliance posture dashboards compute from the same tables you can open and inspect. No magic numbers, no black boxes.",
  },
];

const designed = [
  ["Live connectors", "Read-only ingestion across AWS, Azure, GCP, OCI & Kubernetes via the Go agent"],
  ["Real telemetry", "Network, identity, and runtime edges feeding live attack graphs"],
  ["Runtime sensor", "Optional eBPF signals for detection and blocking"],
  ["Agentic layer", "Red (attack simulation) · Blue (investigation) · Green (remediation PRs)"],
];

export default function PlatformPage() {
  return (
    <>
      <section className="container-loom max-w-3xl pb-16 pt-20 md:pt-28">
        <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink md:text-5xl">
          A CNAPP&apos;s architecture,
          <br />
          running for real.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          CloudLoom implements the decision-making heart of a cloud security
          platform — the graph, the controls, the attack-path logic — against a
          simulated multi-cloud estate. The integration layer comes next.
        </p>
      </section>

      <div className="container-loom"><div className="rule" /></div>

      <section className="container-loom grid gap-x-20 gap-y-2 py-16 lg:grid-cols-[3fr_7fr]">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink lg:sticky lg:top-28 lg:self-start">
          Four working parts.
        </h2>
        <div>
          {pillars.map((p, i) => (
            <Reveal key={p.name} variant="left" delay={i * 50}>
              <article className={`${i > 0 ? "rule" : ""} py-7 first:pt-0`}>
                <h3 className="font-semibold text-ink">{p.name}</h3>
                <p className="mt-2 max-w-[62ch] leading-relaxed text-ink-soft">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-coal py-20 text-paper">
        <div className="container-loom grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-20">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
              Designed, not yet built.
            </h2>
            <p className="mt-4 leading-relaxed text-paper/70">
              These exist as schema headroom and roadmap order — not features.
              We say so because trust beats marketing.
            </p>
            <Link href="/console" className="mt-8 inline-flex items-center gap-2 rounded-md bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-white">
              See what IS built →
            </Link>
          </div>
          <ul>
            {designed.map(([t, d], i) => (
              <li key={t} className={`${i > 0 ? "border-t border-white/10" : ""} flex items-baseline gap-5 py-4`}>
                <span className="w-6 shrink-0 font-mono text-sm text-accent">→</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-0.5 text-sm text-paper/55">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20">
        <div className="container-loom">
          <Reveal>
            <h2 className="max-w-md font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
              How the pieces fit.
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              One diagram, honestly labeled — solid lines run today, dashed lines are the roadmap.
            </p>
          </Reveal>
          <Reveal delay={100} variant="fade" className="mt-10 rounded-md border border-line bg-white p-4 sm:p-8">
            <ArchitectureDiagram />
          </Reveal>
          <div className="rule mt-16 pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-6">
              <p className="font-mono text-sm text-ink-faint">
                Next.js 14 / TypeScript strict / Prisma v5 / Postgres / Tailwind / Go agent
              </p>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Inspect the schema ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

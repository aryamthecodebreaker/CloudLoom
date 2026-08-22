import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { GITHUB_URL } from "@/components/site-chrome";
import { ArchitectureDiagram } from "@/components/architecture-diagram";

export const metadata: Metadata = { title: "Platform" };

const pillars = [
  {
    name: "The graph model",
    body: "Resources, identities, network paths, and findings are rows in Postgres with explicit relationships — the seed estate models five providers so every query has realistic structure to chew on.",
  },
  {
    name: "Controls → issues pipeline",
    body: "A control pairs a graph-shaped rule with a severity. When its conditions match modeled resources, an issue is raised and triaged through OPEN, IN_PROGRESS, RESOLVED, or REJECTED — persisted for real.",
  },
  {
    name: "Attack path reasoning",
    body: "Entry exposure, a exploitable finding, an identity hop, sensitive data: when the hops line up, they surface as one prioritized toxic combination instead of three disconnected alerts.",
  },
  {
    name: "Honest reporting surfaces",
    body: "Inventory, CVE knowledge-base views, and compliance posture dashboards compute from the same tables you can open and inspect. No magic numbers, no black boxes.",
  },
];

const designed = [
  ["Live connectors", "Read-only ingestion across AWS, Azure, GCP, OCI & Kubernetes"],
  ["Real telemetry", "Network, identity, and runtime edges feeding live attack graphs"],
  ["Runtime sensor", "Optional eBPF signals for detection and blocking"],
  ["Agentic layer", "Red (attack simulation) · Blue (investigation) · Green (remediation PRs)"],
];

const integrations = ["Postgres-ready", "Next.js 14", "TypeScript strict", "Tailwind tokens", "Prisma v5", "Deployable on Vercel", "Runs on any Node host"];

export default function PlatformPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-loom-navy py-24 text-white">
        <div className="grain absolute inset-0" aria-hidden />
        <div className="container-loom relative max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-sky-300">The CloudLoom blueprint</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            A CNAPP&apos;s architecture, running for real
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            CloudLoom implements the decision-making heart of a cloud security platform
            — the graph, the controls, the attack-path logic — against a simulated
            multi-cloud estate. The integration layer comes next.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-loom grid gap-6 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.name} delay={i * 70}>
              <article className="h-full rounded-2xl border border-loom-line bg-white p-8 shadow-card transition hover:-translate-y-0.5">
                <h2 className="text-lg font-bold text-loom-navy">{p.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-loom">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-loom-navy md:text-3xl">How the pieces fit</h2>
            <p className="mt-3 text-slate-600">
              One diagram, honestly labeled — solid lines run today, dashed lines are the roadmap.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10 overflow-hidden rounded-2xl border border-loom-line bg-white p-4 shadow-card sm:p-8">
            <ArchitectureDiagram />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-loom-line bg-loom-cloud py-20">
        <div className="container-loom grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-loom-navy md:text-3xl">Designed, not yet built</h2>
            <p className="mt-3 text-slate-600">
              These exist as schema headroom and roadmap order — not as features. We say so because trust beats marketing.
            </p>
            <Link href="/console" className="btn-primary mt-7">See what IS built →</Link>
          </div>
          <ul className="space-y-3">
            {designed.map(([t, d]) => (
              <li key={t} className="rounded-xl border border-dashed border-loom-line bg-white px-5 py-4">
                <p className="font-semibold text-loom-navy">{t}</p>
                <p className="mt-0.5 text-sm text-slate-500">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20">
        <div className="container-loom text-center">
          <h2 className="text-2xl font-extrabold text-loom-navy">Boring tech, on purpose</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {integrations.map((i) => (
              <span key={i} className="rounded-full border border-loom-line bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                {i}
              </span>
            ))}
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-10 inline-flex">
            Inspect the schema on GitHub →
          </a>
        </div>
      </section>
    </>
  );
}

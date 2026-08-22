import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Platform" };

const pillars = [
  {
    name: "Security Graph",
    body: "Every resource, identity, network path, and vulnerability becomes a node with edges you can query. Complex relationships become one answer: what matters right now?",
  },
  {
    name: "Attack Path Analysis",
    body: "Toxic combinations — public exposure plus a critical vuln plus access to sensitive data — are surfaced as single prioritized issues instead of three disconnected alerts.",
  },
  {
    name: "Agentless Visibility",
    body: "Connect accounts read-only over API and get full inventory across VMs, containers, serverless, and AI services in minutes. No agents, no performance tax.",
  },
  {
    name: "Code-to-Cloud Correlation",
    body: "Running infrastructure maps back to the commit, pipeline, and team that shipped it, so remediation happens where the risk was born.",
  },
  {
    name: "Runtime Sensor",
    body: "An optional eBPF sensor adds real-time detection, workload blocking, reachability context that sharpens prioritization, and forensic capture when something goes wrong.",
  },
  {
    name: "Democratized Security",
    body: "Projects group resources by owning team, RBAC mirrors your org, and every engineer gets answers in plain language — security stops being a black box.",
  },
];

const integrations = ["AWS", "Azure", "GCP", "Kubernetes", "OCI", "GitHub", "GitLab", "Slack", "Jira", "PagerDuty", "Terraform", "Datadog"];

export default function PlatformPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-wiz-navy py-24 text-white">
        <div className="grain absolute inset-0" aria-hidden />
        <div
          className="absolute -top-32 right-[15%] h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #FF4F9A 0%, transparent)" }}
          aria-hidden
        />
        <div className="container-wiz relative max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-sky-300">The OpenWiz platform</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">Your cloud &amp; AI security HQ</h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            One graph-powered platform to discover everything running in your clouds,
            understand which risks lead to real breaches, and fix them at the source —
            built in the open, extensible by design.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-wiz grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.name} className="rounded-2xl border border-wiz-line bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:border-wiz-blue/40">
              <h2 className="text-lg font-bold text-wiz-navy">{p.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-wiz-line bg-wiz-cloud py-16">
        <div className="container-wiz text-center">
          <h2 className="text-2xl font-extrabold text-wiz-navy">Plays well with your stack</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {integrations.map((i) => (
              <span key={i} className="rounded-full border border-wiz-line bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-wiz-blue hover:text-wiz-blue">
                {i}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <Link href="/console" className="btn-primary px-8 py-3 text-base">See it on seeded data →</Link>
      </section>
    </>
  );
}

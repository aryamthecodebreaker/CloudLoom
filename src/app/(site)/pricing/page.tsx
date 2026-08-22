import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

const tiers = [
  {
    name: "Community",
    price: "$0",
    cadence: "forever",
    blurb: "Everything an individual or small team needs to see their cloud clearly.",
    features: [
      "Up to 200 cloud resources",
      "Security graph & attack paths",
      "Agentless AWS, GCP & Kubernetes connectors",
      "Vulnerability knowledge base",
      "Community support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Team",
    price: "$49",
    cadence: "per resource-pack / month",
    blurb: "For teams shipping fast who want automation and code-to-cloud fixes.",
    features: [
      "Unlimited resources",
      "All connectors incl. Azure & OCI",
      "AI agents (Red / Blue / Green)",
      "One-click remediation PRs",
      "Compliance frameworks out of the box",
      "RBAC & projects",
    ],
    cta: "Start 30-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    blurb: "Scale, control, and support for regulated, multi-cloud organizations.",
    features: [
      "Self-hosted or private cloud deployment",
      "SSO / SCIM & audit logging",
      "Runtime sensor fleet management",
      "Custom SLAs & dedicated support",
      "On-prem AI option",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-loom-cloud to-white py-20 text-center">
        <div className="container-loom max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-loom-blue">Pricing</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-loom-navy md:text-5xl">
            Security that scales with you
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Open source at the core, paid automation on top. Every edition runs the same
            engine — no crippled demo tier.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-loom grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-9 ${
                t.featured
                  ? "border-loom-blue shadow-graph ring-2 ring-loom-blue/20"
                  : "border-loom-line shadow-card"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-loom-pink px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-loom-navy">{t.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight text-loom-navy">{t.price}</span>{" "}
                <span className="text-sm text-slate-500">{t.cadence}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.blurb}</p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-loom-line pt-7">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-slate-700">
                    <span className="font-bold text-loom-blue">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 rounded-lg px-5 py-3 text-sm font-semibold transition ${
                  t.featured ? "btn-primary" : "border border-loom-line hover:border-loom-blue hover:text-loom-blue"
                }`}
              >
                {t.cta}
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

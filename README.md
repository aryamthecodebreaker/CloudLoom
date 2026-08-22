<div align="center">

# 🧶 CloudLoom

**The open-source cloud & AI security platform (CNAPP) — code to cloud to runtime.**

CloudLoom weaves every resource, identity, network path, and vulnerability in your
stack into a single security graph — so you can see the attack paths an attacker
would actually walk, and cut them at the source.

`Next.js 14` · `TypeScript` · `Tailwind CSS` · `Prisma v5` · `Postgres`

[**🚀 Live demo**](https://trycloudloom.vercel.app/console) · [**⭐ Repository**](https://github.com/aryamthecodebreaker/CloudLoom) · [**📦 Quickstart**](#-quickstart) · [Contribute](#-contributing)

[![Deployed on Vercel](https://img.shields.io/badge/live-cloudloom--zeta.vercel.app-2C6BFF)](https://trycloudloom.vercel.app)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

</div>

---

## ✨ What is CloudLoom?

CloudLoom is a full-stack, self-contained demo of a modern CNAPP
(Cloud-Native Application Protection Platform). It ships as two experiences in one app:

| Experience | What you get |
|---|---|
| 🌐 **Marketing site** (`/`) | Landing page and platform overview — the public face |
| 🛡️ **Security console** (`/console`) | A working CNAPP dashboard backed by a real seeded database |

### The console includes

- **Security Dashboard** — environment-wide KPIs, open issues by severity, connector health, top attack paths
- **Issues** — prioritized findings with severities (`CRITICAL → INFORMATIONAL`) and statuses (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`); update status inline and it persists
- **Attack Paths** — toxic combinations rendered hop-by-hop (entry point → workload → identity → sensitive data), with "break the first hop" guidance
- **Inventory** — full resource catalog across AWS, Azure, GCP, Kubernetes & OCI with public/sensitive flags
- **Vulnerabilities** — CVEs grouped across affected resources, exploited-in-the-wild highlighted, with fix versions
- **Compliance** — donut + heatmap views for CIS, SOC 2, ISO 27001, PCI DSS, HIPAA & GDPR posture
- **Connectors** — cloud account connection status with scan freshness

All demo data is generated — **no real cloud accounts are ever connected**.

## 🎯 Status: what CloudLoom is today

CloudLoom is a **working blueprint**, not a production scanner. To be completely
explicit about scope:

**It does:**

- Model a realistic multi-cloud estate (AWS, Azure, GCP, Kubernetes, OCI) as a queryable graph in Postgres
- Evaluate controls into prioritized issues with real, persistent triage (`OPEN → IN_PROGRESS → RESOLVED / REJECTED`)
- Visualize attack paths hop-by-hop with break-the-chain guidance
- Render inventory, CVE knowledge-base, and compliance-posture views from those tables

**It does not (yet):**

- Connect to AWS/Azure/GCP or ingest live IAM/resources
- Build attack graphs from live telemetry
- Scan actual packages/CVEs in your workloads
- Monitor runtime (no eBPF sensor)
- Implement multi-tenancy/RBAC
- Include the planned Red/Blue/Green security agents

Everything in the second list is on the roadmap below — the schema is deliberately
shaped so each lands without a rewrite.

## 🧠 The core idea: one graph, not ten thousand alerts

Traditional scanners produce noise. CloudLoom models the same data as relationships:

```
Internet ──▶ edge-worker-01 ──▶ etl-role ──▶ pii-exports
0.0.0.0/0    CVE RCE 9.8        s3:*         38 GB PII
```

A finding only matters when exposure + vulnerability + identity + sensitive data
combine into a walkable path. That's what the console is built around.

## ⚙️ Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components read Prisma directly — zero API boilerplate for reads |
| Language | TypeScript (strict) | Safety you can lean on |
| Styling | Tailwind CSS | Fast, consistent design tokens |
| Database | Any Postgres via **Prisma v5** | Free tiers from Supabase/Neon, or a local Docker Postgres |
| Charts/Viz | Hand-rolled SVG | No chart-library bloat; fully deterministic renders |

> Pure-JS dependencies only — no native build tools required on Windows/macOS/Linux.

## 🚀 Quickstart

```bash
# 1. Clone & install
git clone https://github.com/aryamthecodebreaker/CloudLoom.git
cd CloudLoom
npm install

# 2. Configure env — point DATABASE_URL at any Postgres instance
cp .env.example .env          # Windows: copy .env.example .env

# 3. Create the schema & seed realistic demo data
npm run db:push
npm run db:seed

# 4. Launch
npm run dev                   # marketing site at http://localhost:3000
                              # demo console at http://localhost:3000/console
```

Need an instant free Postgres? Create a project on [Supabase](https://supabase.com) or
[Neon](https://neon.tech), copy the connection string into `DATABASE_URL`, done.

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | Strict TypeScript check |
| `npm run db:push` | Sync `prisma/schema.prisma` to SQLite |
| `npm run db:seed` | Wipe + reseed demo data |

## 🗂️ Project structure

```
src/
├── app/
│   ├── (site)/               # Marketing pages: landing, platform
│   ├── console/              # CNAPP dashboard: overview, issues, attack paths,
│   │                         #   inventory, vulnerabilities, compliance, connectors
│   │                         #   + loading skeleton & error boundary
│   ├── api/issues/[id]/      # PATCH endpoint for issue status transitions
│   ├── layout.tsx            # Root layout + metadata
│   ├── icon.svg              # Favicon (woven-thread mark)
│   ├── opengraph-image.tsx   # Social link-preview card
│   ├── not-found.tsx         # Branded 404
│   └── globals.css           # Tailwind layers + motion utilities
├── components/               # Logo, nav, footer, sidebar, icons, motion helpers
└── lib/
    ├── db.ts                 # Prisma client (dev-safe singleton)
    └── ui.ts                 # Severity/status styles, attack-path helpers
agent/                       # Go engine room (roadmap #1): read-only cloud
├── cmd/agent/main.go        #   connectors feeding the graph — see agent/README.md
└── internal/
    ├── provider/provider.go # Provider interface + Resource contract
    └── aws/aws.go           # First connector target (stub + validation tests)
prisma/
├── schema.prisma             # CloudAccount · Resource · Control · Issue ·
│                             #   Vulnerability · ComplianceFramework
└── seed.ts                   # Realistic multi-cloud demo environment
```

## 🗺️ Roadmap

In build order — each lands against schema headroom that already exists:

- [ ] Live cloud connectors: read-only AWS / Azure / GCP ingestion
- [ ] Real IAM & resource graph from your actual estate
- [ ] Telemetry-driven attack graphs (live network + identity edges)
- [ ] Real CVE scanning of workloads and packages
- [ ] Runtime monitoring via an eBPF sensor
- [ ] Multi-tenancy, projects & RBAC
- [ ] AI agents: Red (attack simulation), Blue (auto-investigation), Green (remediation PRs)
- [ ] Security Graph explorer (interactive query canvas)

Contributions welcome — grab anything above or surprise us.

## 🤝 Contributing

1. Fork & branch: `git checkout -b feat/my-feature`
2. Make your change; keep `npm run lint` && `npm run typecheck` green
3. Open a PR describing the *why*, not just the *what*

## ⚖️ License & disclaimer

Licensed under **Apache-2.0**.

This project is an independent educational demo of CNAPP concepts. It is not
affiliated with, endorsed by, or connected to any commercial security vendor.
All company names, resources, vulnerabilities, and findings in the seed data are fictional.

<div align="center">
<sub>Built with ☁️ and a little magic.</sub>
</div>

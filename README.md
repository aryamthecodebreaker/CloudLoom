<div align="center">

# 🧶 CloudLoom

**The open-source cloud & AI security platform (CNAPP) — code to cloud to runtime.**

CloudLoom weaves every resource, identity, network path, and vulnerability in your
stack into a single security graph — so you can see the attack paths an attacker
would actually walk, and cut them at the source.

`Next.js 14` · `TypeScript` · `Tailwind CSS` · `Prisma v5` · `SQLite`

[Explore the demo console](#-quickstart) · [Report a bug](../../issues) · [Contribute](#-contributing)

</div>

---

## ✨ What is CloudLoom?

CloudLoom is a full-stack, self-contained demo of a modern CNAPP
(Cloud-Native Application Protection Platform). It ships as two experiences in one app:

| Experience | What you get |
|---|---|
| 🌐 **Marketing site** (`/`) | Landing page, platform overview, and pricing — the public face |
| 🛡️ **Security console** (`/console`) | A working CNAPP dashboard backed by a real seeded database |

### The console includes

- **Security Dashboard** — environment-wide KPIs, open issues by severity, connector health, top attack paths
- **Issues** — prioritized findings with severities (`CRITICAL → INFORMATIONAL`) and statuses (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`); update status inline and it persists
- **Attack Paths** — toxic combinations rendered hop-by-hop (entry point → workload → identity → sensitive data), with "break the first hop" guidance
- **Inventory** — full resource catalog across AWS, Azure, GCP, Kubernetes & OCI with public/sensitive flags
- **Vulnerabilities** — CVEs grouped across affected resources, exploited-in-the-wild highlighted, with fix versions
- **Compliance** — donut + heatmap views for CIS, SOC 2, ISO 27001, PCI DSS, HIPAA & GDPR posture
- **Connectors** — cloud account connection status with scan freshness

All demo data is generated and stored locally — **no real cloud accounts are ever connected**.

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
| Database | SQLite via **Prisma v5** | Zero-config local DB; swap `provider` for Postgres when you outgrow it |
| Charts/Viz | Hand-rolled SVG | No chart-library bloat; fully deterministic renders |

> Pure-JS dependencies only — no native build tools required on Windows/macOS/Linux.

## 🚀 Quickstart

```bash
# 1. Clone & install
git clone https://github.com/aryamthecodebreaker/CloudLoom.git
cd CloudLoom
npm install

# 2. Configure env
cp .env.example .env          # Windows: copy .env.example .env

# 3. Create the database & seed realistic demo data
npm run db:push
npm run db:seed

# 4. Launch
npm run dev                   # marketing site at http://localhost:3000
                              # demo console at http://localhost:3000/console
```

That's it — under 2 minutes from clone to a fully populated security console.

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
│   ├── (site)/               # Marketing pages: landing, platform, pricing
│   ├── console/              # CNAPP dashboard: overview, issues, attack paths,
│   │                         #   inventory, vulnerabilities, compliance, connectors
│   ├── api/issues/[id]/      # PATCH endpoint for issue status transitions
│   ├── layout.tsx            # Root layout + metadata
│   └── globals.css           # Tailwind layers + shared utilities
├── components/               # Logo, site chrome, console sidebar
└── lib/
    ├── db.ts                 # Prisma client (dev-safe singleton)
    └── ui.ts                 # Severity/status styles, attack-path helpers
prisma/
├── schema.prisma             # CloudAccount · Resource · Control · Issue ·
│                             #   Vulnerability · ComplianceFramework
└── seed.ts                   # Realistic multi-cloud demo environment
```

## 🗺️ Roadmap

- [ ] Security Graph explorer (interactive WQL-style query canvas)
- [ ] AI agents: Red (attack simulation), Blue (auto-investigation), Green (fix PRs)
- [ ] Runtime sensor event feed (simulated eBPF telemetry)
- [ ] Postgres provider + multi-tenant projects/RBAC
- [ ] Terraform / IaC scanning results view

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

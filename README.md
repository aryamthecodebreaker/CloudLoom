<div align="center">

# 🧶 CloudLoom

**The open-source cloud & AI security platform (CNAPP) — code to cloud to runtime.**

CloudLoom weaves every resource, identity, network path, and vulnerability in your
stack into a single security graph — so you can see the attack paths an attacker
would actually walk, and cut them at the source.

`Next.js 14` · `TypeScript` · `Go` · `Tailwind CSS` · `Prisma v5` · `Postgres`

[**🚀 Live console**](https://trycloudloom.vercel.app/console) · [**⭐ Repository**](https://github.com/aryamthecodebreaker/CloudLoom) · [**📦 Quickstart**](#-quickstart) · [**🔌 Connect a cloud**](#-connect-a-real-cloud-account) · [Contributing](#-contributing)

[![CI](https://github.com/aryamthecodebreaker/CloudLoom/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)
[![Agent](https://github.com/aryamthecodebreaker/CloudLoom/actions/workflows/agent.yml/badge.svg)](./.github/workflows/agent.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)
[![Release](https://img.shields.io/badge/download-agent%20binaries-2C6BFF)](../../releases)

</div>

---

## ✨ What is CloudLoom?

CloudLoom is an open-source CNAPP
(Cloud-Native Application Protection Platform) with **real multi-cloud
discovery**. It ships as two experiences in one app:

| Experience | What you get |
|---|---|
| 🌐 **Marketing site** (`/`) | Landing page and platform overview — the public face |
| 🛡️ **Security console** (`/console`) | A working CNAPP: graph, triage, compliance — populated by the agent from YOUR clouds |

**No seed data. No demo mode.** The console starts empty and fills only with
what the agent discovers in accounts you connect.

### 🎯 Status: what CloudLoom is today

**It does:**

- **Discover real clouds read-only** — AWS (EC2, S3, IAM), Azure (VMs, Storage), Kubernetes (Nodes, Deployments, LoadBalancer Services, ServiceAccounts) via the Go agent
- **Evaluate real findings** — built-in controls turn discovered exposure into prioritized, deduplicated issues with stable refs
- **Render the security graph** — interactive explorer with typed edges, path finding (BFS), and a WQL-lite query language (`severity=critical and exposure=public`)
- **Triage end-to-end** — status workflow persisted to Postgres, detail pages, prev/next flow, CSV export, shareable filter URLs
- **Report compliance live** — framework posture computed from real controls, with per-control evidence drill-down
- **Stay honest** — DB-level enums, same-origin write guards, bearer-token ingestion, CI (lint + typecheck + tests + build), multi-platform release binaries

**It does not (yet):**

- Classify sensitive data automatically (DSPM heuristics are next)
- Monitor runtime (eBPF sensor is scaffolded in the roadmap)
- Run the Red/Blue/Green AI agents (designed, not built)
- Provide multi-tenancy/RBAC

## 🧠 The core idea: one graph, not ten thousand alerts

Traditional scanners produce noise. CloudLoom models the same data as relationships:

```
Internet ──▶ edge-worker-01 ──▶ etl-role ──▶ pii-exports
0.0.0.0/0    CVE RCE 9.8        s3:*         PII
```

A finding only matters when exposure + vulnerability + identity + sensitive data
combine into a walkable path. That's what the console is built around.

## ⚙️ Tech stack

| Layer | Choice | Why |
|---|---|---|
| Web app | Next.js 14 (App Router) + TypeScript strict | Server components read Prisma directly — zero API boilerplate for reads |
| Styling | Tailwind CSS + Fraunces/Inter/JetBrains Mono | Warm editorial identity, mono data voice |
| Database | Any Postgres via **Prisma v5** | Free tiers from Supabase/Neon, or local Docker |
| Agent | **Go** (stdlib-first) | Single static binaries; real SDK integrations for AWS/Azure/K8s |
| Charts/Viz | Hand-rolled SVG | No chart-library bloat; deterministic renders |

## 🚀 Quickstart

```bash
# 1. Clone & install
git clone https://github.com/aryamthecodebreaker/CloudLoom.git
cd CloudLoom
npm install

# 2. Point DATABASE_URL at any Postgres instance
cp .env.example .env          # Windows: copy .env.example .env

# 3. Create the schema
npm run db:push

# 4. Launch
npm run dev                   # marketing site at http://localhost:3000
                              # console at http://localhost:3000/console
```

Need an instant free Postgres? [Supabase](https://supabase.com) or
[Neon](https://neon.tech) — copy the connection string into `DATABASE_URL`.

## 🔌 Connect a real cloud account

```bash
# 1. Install the agent (prebuilt binaries — no Go needed)
curl -fsSL https://raw.githubusercontent.com/aryamthecodebreaker/CloudLoom/main/scripts/install.sh | sh

# 2. Preview what it finds (nothing is sent)
./cloudloom-agent -provider aws -account YOUR_12_DIGIT_ACCOUNT_ID

# 3. Push into your console
export CLOUDLOOM_PUSH_URL=http://localhost:3000
export CLOUDLOOM_PUSH_TOKEN=<INGEST_TOKEN from your .env>
./cloudloom-agent -provider aws -account YOUR_12_DIGIT_ACCOUNT_ID -push
```

Also: `-provider azure -subscription UUID` · `-provider kubernetes`.
Credentials are read from your environment and **never leave your machine** —
only resource metadata is pushed. Built-in controls then evaluate your real
resources into findings automatically.

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | Strict TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run db:push` | Sync `prisma/schema.prisma` to Postgres |

## 🗂️ Project structure

```
src/
├── app/
│   ├── (site)/               # Marketing pages: landing, platform
│   ├── console/              # Dashboard, graph explorer, issues (+detail),
│   │                         #   attack paths, identities, resources (+detail),
│   │                         #   vulnerabilities, compliance (+drill-down),
│   │                         #   connectors, events — loading/error states incl.
│   ├── api/
│   │   ├── ingest/           # Bearer-token snapshot ingestion from the agent
│   │   ├── issues/[id]/      # PATCH status (404-aware, refId accepted)
│   │   ├── issues/export/    # CSV export
│   │   ├── search/           # ⌘K palette search
│   │   ├── events/           # agent action log
│   │   └── data/             # wipe-all (same-origin guarded)
│   ├── icon.svg              # Favicon (woven-thread mark)
│   ├── opengraph-image.tsx   # Social link-preview card
│   └── robots.ts
├── components/               # Nav, footer, palette, toasts, sidebar, icons
└── lib/
    ├── db.ts                 # Prisma client (dev-safe singleton)
    ├── evaluate.ts           # Built-in controls → real findings on ingest
    ├── graph-query.ts        # WQL-lite parser + matcher (fully unit-tested)
    ├── catalog.ts            # Compliance framework catalog
    ├── guard.ts              # Same-origin write protection
    ├── csv.ts · ui.ts        # Escaping, tokens, shared formatters
agent/                        # Go engine room
├── cmd/agent/main.go         # discover → print JSON | push to /api/ingest
└── internal/
    ├── provider/provider.go  # Provider contract (read-only, JSON wire shape)
    ├── aws/aws.go            # STS · EC2 · S3 · IAM discovery
    ├── azure/azure.go        # VMs · Storage accounts
    └── kubernetes/…          # Nodes · Deployments · Services · SAs
scripts/install.sh            # curl | sh agent installer
```

## 🗺️ Roadmap

- [ ] DSPM heuristics: sensitive-data classification for discovered stores
- [ ] Graph edges from real IAM role-chaining (currently exposure-derived)
- [x] Blue Agent investigations (BYO-key, grounded in the graph)
- [ ] Runtime monitoring via an eBPF sensor
- [ ] Multi-tenancy, projects & RBAC
- [ ] AI agents: Red (attack simulation), Green (remediation PRs)
- [ ] Scheduled re-discovery + drift detection

Contributions welcome — grab anything above or surprise us.

## 🤝 Contributing

1. Fork & branch: `git checkout -b feat/my-feature`
2. Make your change; keep `npm run lint && npm run typecheck && npm test` green
3. Open a PR describing the *why*, not just the *what*

CI enforces lint, typecheck, tests and build on every push. The Go agent is
vetted, tested, and released as multi-platform binaries on `v*` tags.

## ⚖️ License & disclaimer

Licensed under **Apache-2.0**.

This project is an independent open-source security tool. It is not affiliated
with, endorsed by, or connected to any commercial security vendor. CloudLoom
never requests write permissions to your cloud accounts.

<div align="center">
<sub>Built with ☁️ and a little magic.</sub>
</div>

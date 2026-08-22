# cloudloom-agent

The Go "engine room" of CloudLoom: read-only cloud connectors that will feed
the security graph the TS core serves.

**Status:** scaffolding. The AWS connector validates configuration, compiles
with zero external dependencies, and fails honestly — real discovery is
roadmap item #1 in the root README.

## Why Go

Single static binaries, first-class concurrency for parallel account
enumeration, the same language as Trivy/Terraform-class tooling, and trivial
cross-compilation (one `go build` per OS/arch — no native toolchain drama).

## Layout

```
agent/
├── cmd/agent/main.go        # entrypoint: flags/env → connector → (soon) graph writes
└── internal/
    ├── provider/provider.go # Provider interface + Resource contract (read-only!)
    └── aws/aws.go           # first connector target + validation tests
```

## Build & run

```bash
cd agent
go test ./...            # unit tests, no network
go run ./cmd/agent -account 482910475620 -region us-east-1
```

Exits `2` on bad config, `3` when discovery isn't implemented for a valid
config. Credentials are read from the environment only — never flags, never
files, never committed.

## Ground rules for every connector

1. Read-only. No write scopes requested, ever.
2. One account per process run; fan-out is the orchestrator's job.
3. Every resource carries its provider-native `ExternalID` so graph upserts are idempotent.

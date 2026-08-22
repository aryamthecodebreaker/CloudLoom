// Package provider defines the contract every cloud connector implements.
//
// The TS core owns the Postgres schema; agents discover resources in a real
// cloud account and push them into that same graph via the /api/ingest
// endpoint. Credentials never leave the machine running the agent.
package provider

import (
	"context"
	"errors"
)

var (
	// ErrCredentialsMissing is returned when a connector runs without the
	// read-only credentials it needs.
	ErrCredentialsMissing = errors.New("provider credentials missing")

	// ErrNotImplemented is returned by connectors whose discovery is
	// scaffolded but not yet wired to a cloud SDK.
	ErrNotImplemented = errors.New("discovery not implemented for this provider")
)

// Resource mirrors one row of the security graph's resource table.
//
// JSON tags are camelCase to match the TS core's Prisma field names so an
// ingest payload can be validated shape-for-shape.
type Resource struct {
	Name             string `json:"name"`
	Type             string `json:"type"` // "Virtual Machine", "Object Storage", "Identity", ...
	Provider         string `json:"provider"`
	Region           string `json:"region"`
	ExternalID       string `json:"externalId"` // ARN / full resource ID from the provider
	IsPublic         bool   `json:"isPublic"`
	HasSensitiveData bool   `json:"hasSensitiveData"`
}

// Snapshot is one account's discovery result — the unit pushed to /api/ingest.
type Snapshot struct {
	Provider  string     `json:"provider"`
	AccountID string     `json:"accountId"`
	Account   string     `json:"account"`
	Resources []Resource `json:"resources"`
}

// Provider discovers resources for exactly one connected account.
// Implementations MUST be read-only: never mutate, never request write scopes.
type Provider interface {
	Name() string
	Discover(ctx context.Context) (Snapshot, error)
}

// Closer releases SDK clients, credential caches or connections held by a
// connector. Agents must call it after Discover returns.
type Closer interface {
	Close() error
}

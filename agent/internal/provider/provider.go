// Package provider defines the contract every cloud connector implements.
//
// The TS core owns the Postgres schema today; agents discover resources in a
// customer cloud and upsert them into that same graph. Keeping discovery behind
// this interface means the first live connector (read-only AWS) can be added
// without touching the write path.
package provider

import (
	"context"
	"errors"
)

// ErrCredentialsMissing is returned when a connector runs without the
// read-only credentials it needs.
var ErrCredentialsMissing = errors.New("provider credentials missing")

// Resource mirrors one row of the security graph's resource table.
type Resource struct {
	Name             string
	Type             string // "Virtual Machine", "Object Storage", "Identity", ...
	Provider         string // "AWS", "Azure", "GCP", "Kubernetes", "OCI"
	Region           string
	ExternalID       string // ARN / full resource ID from the provider
	IsPublic         bool
	HasSensitiveData bool
}

// Provider discovers resources for exactly one connected account.
// Implementations MUST be read-only: never mutate, never require write scopes.
type Provider interface {
	Name() string
	Discover(ctx context.Context) ([]Resource, error)
}

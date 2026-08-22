// Package azure implements read-only discovery of an Azure subscription.
//
// Planned coverage: Virtual Machines (public-ip detection), Storage Accounts
// (network rules), Role Assignments (identities).
//
// Auth: DefaultAzureCredential chain (env → managed identity → az cli).
package azure

import (
	"context"
	"fmt"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

type Connector struct {
	SubscriptionID string
}

func New(subscriptionID string) (*Connector, error) {
	if subscriptionID == "" {
		return nil, fmt.Errorf("azure: subscription id required")
	}
	if len(subscriptionID) != 36 {
		return nil, fmt.Errorf("azure: subscription id must be a UUID, got %q", subscriptionID)
	}
	return &Connector{SubscriptionID: subscriptionID}, nil
}

func (c *Connector) Name() string { return "Azure" }

func (c *Connector) Close() error { return nil }

func (c *Connector) Discover(ctx context.Context) (provider.Snapshot, error) {
	snap := provider.Snapshot{Provider: "Azure", AccountID: c.SubscriptionID, Account: c.SubscriptionID}
	return snap, fmt.Errorf("azure: %w", provider.ErrNotImplemented)
}

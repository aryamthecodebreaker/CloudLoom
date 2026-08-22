// Package kubernetes implements read-only discovery of a cluster reachable
// via kubeconfig or in-cluster credentials.
//
// Planned coverage: Nodes, Deployments/DaemonSets (workloads), ServiceAccounts
// with automounted tokens, Services exposed via LoadBalancer/NodePort.
package kubernetes

import (
	"context"
	"fmt"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

type Connector struct {
	ContextName string // "" = current context in KUBECONFIG
}

func New(contextName string) (*Connector, error) {
	return &Connector{ContextName: contextName}, nil
}

func (c *Connector) Name() string { return "Kubernetes" }

func (c *Connector) Close() error { return nil }

func (c *Connector) Discover(ctx context.Context) (provider.Snapshot, error) {
	snap := provider.Snapshot{Provider: "Kubernetes", AccountID: c.ContextName, Account: c.ContextName}
	return snap, fmt.Errorf("kubernetes: %w", provider.ErrNotImplemented)
}

// Package kubernetes implements read-only discovery of a cluster reachable
// via kubeconfig (or in-cluster credentials when run inside a pod).
//
// Coverage:
//   - Nodes                       → "Node"
//   - Deployments (all ns)        → "Container Workload"
//   - Services of type LoadBalancer → flagged internet-exposed
//   - ServiceAccounts             → "Identity"
package kubernetes

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	
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

	cfg, err := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		clientcmd.NewDefaultClientConfigLoadingRules(),
		&clientcmd.ConfigOverrides{CurrentContext: c.ContextName},
	).ClientConfig()
	if err != nil {
		return snap, fmt.Errorf("kubernetes: %w: no usable kubeconfig (%v)",
			provider.ErrCredentialsMissing, err)
	}
	clientset, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return snap, fmt.Errorf("kubernetes: client build: %v", err)
	}
	snap.AccountID = cfg.Host

	var resources []provider.Resource

	nodes, err := clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return snap, fmt.Errorf("kubernetes: list nodes: %v", err)
	}
	for _, n := range nodes.Items {
		resources = append(resources, provider.Resource{
			Name:       n.Name,
			Type:       "Node",
			Provider:   "Kubernetes",
			Region:     string(n.Labels["topology.kubernetes.io/zone"]),
			ExternalID: string(n.UID),
		})
	}

	deployments, err := clientset.AppsV1().Deployments("").List(ctx, metav1.ListOptions{})
	if err == nil {
		for _, d := range deployments.Items {
			resources = append(resources, provider.Resource{
				Name:       d.Namespace + "/" + d.Name,
				Type:       "Container Workload",
				Provider:   "Kubernetes",
				Region:     d.Namespace,
				ExternalID: string(d.UID),
			})
		}
	}

	services, err := clientset.CoreV1().Services("").List(ctx, metav1.ListOptions{})
	if err != nil {
		return snap, fmt.Errorf("kubernetes: list services: %v", err)
	}
	for _, s := range services.Items {
		isLB := s.Spec.Type == corev1.ServiceTypeLoadBalancer
		resources = append(resources, provider.Resource{
			Name:       s.Namespace + "/" + s.Name,
			Type:       "Service",
			Provider:   "Kubernetes",
			Region:     s.Namespace,
			ExternalID: string(s.UID),
			IsPublic:   isLB,
		})
	}

	sas, err := clientset.CoreV1().ServiceAccounts("").List(ctx, metav1.ListOptions{})
	if err == nil {
		for _, sa := range sas.Items {
			resources = append(resources, provider.Resource{
				Name:       sa.Namespace + "/" + sa.Name,
				Type:       "Identity",
				Provider:   "Kubernetes",
				Region:     sa.Namespace,
				ExternalID: string(sa.UID),
			})
		}
	}

	snap.Resources = resources
	return snap, nil
}

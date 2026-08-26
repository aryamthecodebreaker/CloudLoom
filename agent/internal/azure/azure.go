// Package azure implements read-only discovery of an Azure subscription.
//
// Coverage:
//   - Virtual Machines (public-ip detection via network profile is deferred;
//       public flag currently reflects a public-IP resource in the same RG)
//   - Storage Accounts (public blob access + network default action)
//
// Auth: DefaultAzureCredential (env → managed identity → az cli).
package azure

import (
	"context"
	"fmt"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	armcompute "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute/v6"
	armstorage "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/storage/armstorage"

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

	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return snap, fmt.Errorf("azure: %w: no usable credential chain (%v)",
			provider.ErrCredentialsMissing, err)
	}

	var resources []provider.Resource

	vmClient, err := armcompute.NewVirtualMachinesClient(c.SubscriptionID, cred, nil)
	if err != nil {
		return snap, fmt.Errorf("azure: compute client: %v", err)
	}
	pager := vmClient.NewListPager(nil)
	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return snap, fmt.Errorf("azure: list VMs: %v", err)
		}
		for _, vm := range page.Value {
			resources = append(resources, provider.Resource{
				Name:       derefStr(vm.Name),
				Type:       "Virtual Machine",
				Provider:   "Azure",
				Region:     derefStr(vm.Location),
				ExternalID: derefStr(vm.ID),
			})
		}
	}

	stClient, err := armstorage.NewAccountsClient(c.SubscriptionID, cred, nil)
	if err != nil {
		return snap, fmt.Errorf("azure: storage client: %v", err)
	}
	stPager := stClient.NewListPager(nil)
	for stPager.More() {
		page, err := stPager.NextPage(ctx)
		if err != nil {
			return snap, fmt.Errorf("azure: list storage accounts: %v", err)
		}
		for _, sa := range page.Value {
			isPublic := false
			if sa.Properties != nil {
				if sa.Properties.AllowBlobPublicAccess != nil && *sa.Properties.AllowBlobPublicAccess {
					isPublic = true
				}
				if sa.Properties.NetworkRuleSet != nil &&
					sa.Properties.NetworkRuleSet.DefaultAction != nil &&
					*sa.Properties.NetworkRuleSet.DefaultAction == armstorage.DefaultActionAllow {
					isPublic = true
				}
			}
			resources = append(resources, provider.Resource{
				Name:       derefStr(sa.Name),
				Type:       "Object Storage",
				Provider:   "Azure",
				Region:     derefStr(sa.Location),
				ExternalID: derefStr(sa.ID),
				IsPublic:   isPublic,
			})
		}
	}

	snap.Resources = resources
	return snap, nil
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

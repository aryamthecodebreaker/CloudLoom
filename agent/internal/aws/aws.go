// Package aws is the first live connector target: read-only discovery of an
// AWS account into the CloudLoom security graph.
//
// Roadmap (in order):
//  1. STS GetCallerIdentity → confirm the account we're pointed at
//    2. Enumerate EC2, S3, Lambda, IAM roles, KMS keys via aws-sdk-go-v2
//  3. Derive IsPublic from ALBs / SGs 0.0.0.0/0 / bucket ACLs
//  4. Derive HasSensitiveData from Macie flags or naming heuristics (opt-in)
//
// This stub compiles with zero external dependencies so CI stays green until
// step 1 lands; the SDK is added exactly when real calls replace it.
package aws

import (
	"context"
	"fmt"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

type Connector struct {
	AccountID string // 12-digit AWS account the operator pointed us at
	Region    string
}

func New(accountID, region string) (*Connector, error) {
	if len(accountID) != 12 {
		return nil, fmt.Errorf("aws: account id must be 12 digits, got %q", accountID)
	}
	for _, r := range accountID {
		if r < '0' || r > '9' {
			return nil, fmt.Errorf("aws: account id must be numeric, got %q", accountID)
		}
	}
	if region == "" {
		region = "us-east-1"
	}
	return &Connector{AccountID: accountID, Region: region}, nil
}

func (c *Connector) Name() string { return "AWS" }

// Discover performs read-only inventory of the connected account.
// TODO(roadmap-1): replace this stub with aws-sdk-go-v2 enumeration.
func (c *Connector) Discover(ctx context.Context) ([]provider.Resource, error) {
	return nil, fmt.Errorf("aws: discovery for account %s not implemented yet: %w",
		c.AccountID, provider.ErrCredentialsMissing)
}

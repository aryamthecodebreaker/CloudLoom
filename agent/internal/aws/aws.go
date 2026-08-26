// Package aws implements read-only discovery of a real AWS account:
//
//	STS  GetCallerIdentity  → confirm which account we're pointed at
//	EC2  DescribeInstances  → virtual machines (public-ip detection)
//	S3   ListBuckets + PAB  → object stores (public-access detection)
//	IAM  ListRoles          → workload identities
//
// Everything is read-only. The AWS SDK resolves credentials from the
// environment the agent runs in — they are never accepted via flags.
package aws

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
		"github.com/aws/aws-sdk-go-v2/service/iam"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	iamtypes "github.com/aws/aws-sdk-go-v2/service/iam/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

// Compile-time contract checks.
var (
	_ provider.Provider = (*Connector)(nil)
	_ provider.Closer   = (*Connector)(nil)
)

type Connector struct {
	AccountID string
	Region    string

	stsClient *sts.Client
	ec2Client *ec2.Client
	s3Client  *s3.Client
	iamClient *iam.Client
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

	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, fmt.Errorf("aws: %w (%s)", provider.ErrCredentialsMissing, err)
	}

	return &Connector{
		AccountID: accountID,
		Region:    region,
		stsClient: sts.NewFromConfig(cfg),
		ec2Client: ec2.NewFromConfig(cfg),
		s3Client:  s3.NewFromConfig(cfg),
		iamClient: iam.NewFromConfig(cfg),
	}, nil
}

func (c *Connector) Name() string { return "AWS" }

// Close satisfies provider.Closer; SDK clients hold no persistent resources
// today but the hook keeps the lifecycle contract honest.
func (c *Connector) Close() error { return nil }

// Discover performs read-only inventory of the connected account and returns
// a Snapshot ready to push to /api/ingest.
func (c *Connector) Discover(ctx context.Context) (provider.Snapshot, error) {
	snap := provider.Snapshot{Provider: "AWS", AccountID: c.AccountID, Account: c.AccountID}

	caller, err := c.stsClient.GetCallerIdentity(ctx, &sts.GetCallerIdentityInput{})
	if err != nil {
		return snap, fmt.Errorf("aws: %w: GetCallerIdentity failed — is the role attached? %v",
			provider.ErrCredentialsMissing, err)
	}
	got := deref(caller.Account)
	if got != "" && got != c.AccountID {
		return snap, fmt.Errorf("aws: credentials resolve to account %s, expected %s", got, c.AccountID)
	}

	resources, err := c.discoverEC2(ctx)
	if err != nil {
		return snap, err
	}
	buckets, err := c.discoverS3(ctx)
	if err != nil {
		return snap, err
	}
	roles, err := c.discoverIAM(ctx)
	if err != nil {
		return snap, err
	}
	snap.Resources = append(snap.Resources, resources...)
	snap.Resources = append(snap.Resources, buckets...)
	snap.Resources = append(snap.Resources, roles...)
	return snap, nil
}

func (c *Connector) discoverEC2(ctx context.Context) ([]provider.Resource, error) {
	var out []provider.Resource
	pages := ec2.NewDescribeInstancesPaginator(c.ec2Client, &ec2.DescribeInstancesInput{})
	for pages.HasMorePages() {
		page, err := pages.NextPage(ctx)
		if err != nil {
			return out, fmt.Errorf("aws: DescribeInstances: %v", err)
		}
		for _, res := range page.Reservations {
			for _, in := range res.Instances {
				name := deref(in.InstanceId)
				state := "unknown"
				if in.State != nil && in.State.Name != "" {
					state = string(in.State.Name)
				}
				for _, t := range in.Tags {
					if deref(t.Key) == "Name" && deref(t.Value) != "" {
						name = deref(t.Value)
					}
				}
				out = append(out, provider.Resource{
					Name:       name,
					Type:       "Virtual Machine (" + state + ")",
					Provider:   "AWS",
					Region:     c.Region,
					ExternalID: fmt.Sprintf("arn:aws:ec2:%s:%s:instance/%s", c.Region, c.AccountID, deref(in.InstanceId)),
					IsPublic:   in.PublicIpAddress != nil,
				})
			}
		}
	}
	return out, nil
}

func (c *Connector) discoverS3(ctx context.Context) ([]provider.Resource, error) {
	var out []provider.Resource
	listed, err := c.s3Client.ListBuckets(ctx, &s3.ListBucketsInput{})
	if err != nil {
		return out, fmt.Errorf("aws: ListBuckets: %v", err)
	}
	for _, b := range listed.Buckets {
		name := deref(b.Name)
		region := "us-east-1"
		if loc, err := c.s3Client.GetBucketLocation(ctx, &s3.GetBucketLocationInput{Bucket: b.Name}); err == nil && loc.LocationConstraint != "" {
			region = string(loc.LocationConstraint)
		}
		isPublic := false
		pab, err := c.s3Client.GetPublicAccessBlock(ctx, &s3.GetPublicAccessBlockInput{Bucket: b.Name})
		switch {
		case err != nil:
			// No PublicAccessBlock configuration at all → treat as exposed.
			isPublic = true
		case pab.PublicAccessBlockConfiguration != nil:
			cfg := pab.PublicAccessBlockConfiguration
			isPublic = !derefBool(cfg.BlockPublicAcls) || !derefBool(cfg.IgnorePublicAcls) ||
				!derefBool(cfg.BlockPublicPolicy) || !derefBool(cfg.RestrictPublicBuckets)
		}
		out = append(out, provider.Resource{
			Name:       name,
			Type:       "Object Storage",
			Provider:   "AWS",
			Region:     region,
			ExternalID: fmt.Sprintf("arn:aws:s3:::%s", name),
			IsPublic:   isPublic,
		})
	}
	return out, nil
}

func (c *Connector) discoverIAM(ctx context.Context) ([]provider.Resource, error) {
	var out []provider.Resource
	pages := iam.NewListRolesPaginator(c.iamClient, &iam.ListRolesInput{})
	for pages.HasMorePages() {
		page, err := pages.NextPage(ctx)
		if err != nil {
			return out, fmt.Errorf("aws: ListRoles: %v", err)
		}
		for _, r := range page.Roles {
			name := deref(r.RoleName)
			out = append(out, provider.Resource{
				Name:       name,
				Type:       "Identity",
				Provider:   "AWS",
				Region:     "global",
				ExternalID: deref(r.Arn),
				IsPublic:   hasExternalPrincipal(r),
			})
		}
	}
	return out, nil
}

func hasExternalPrincipal(r iamtypes.Role) bool {
	if r.AssumeRolePolicyDocument == nil {
		return false
	}
	doc := strings.ToLower(*r.AssumeRolePolicyDocument)
	return strings.Contains(doc, ":root") || strings.Contains(doc, "anonymous")
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func derefBool(b *bool) bool {
	return b != nil && *b
}

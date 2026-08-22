// Command agent is CloudLoom's read-only cloud connector.
//
// It discovers resources in one cloud account and writes them into the
// security graph the TS core serves. Today it validates configuration and
// exits honestly — discovery lands with roadmap item #1.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/aws"
)

func main() {
	var (
		accountID = flag.String("account", os.Getenv("CLOUDLOOM_AWS_ACCOUNT"), "12-digit AWS account ID")
		region    = flag.String("region", defaultString("CLOUDLOOM_AWS_REGION", "us-east-1"), "AWS region to discover first")
	)
	flag.Parse()

	conn, err := aws.New(*accountID, *region)
	if err != nil {
		fmt.Fprintf(os.Stderr, "cloudloom-agent: %v\n", err)
		os.Exit(2)
	}

	resources, err := conn.Discover(context.Background())
	if err != nil {
		fmt.Fprintf(os.Stderr, "cloudloom-agent: discovery unavailable (%v)\n", err)
		fmt.Fprintln(os.Stderr, "this binary tracks roadmap item 1 — see agent/README.md")
		os.Exit(3)
	}
	for _, r := range resources {
		fmt.Printf("%s\t%s\t%s\n", r.Provider, r.Type, r.Name)
	}
}

func defaultString(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

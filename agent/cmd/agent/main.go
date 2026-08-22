// Command agent is CloudLoom's read-only cloud connector.
//
// Discover resources in one real cloud account, then either print them as
// JSON (default) or push them straight into a CloudLoom instance's graph:
//
//	# discover and print
//	cloudloom-agent -provider aws -account 482910475620
//
//	# discover and push into your instance
//	CLOUDLOOM_PUSH_URL=https://trycloudloom.vercel.app \
//	CLOUDLOOM_PUSH_TOKEN=<INGEST_TOKEN> \
//	cloudloom-agent -provider aws -account 482910475620 -push
//
// Exit codes: 2 bad configuration · 3 discovery failed · 4 push failed.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/aws"
	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

func main() {
	var (
		provName   = flag.String("provider", envOr("CLOUDLOOM_PROVIDER", "aws"), "cloud provider: aws | azure | kubernetes")
		account    = flag.String("account", os.Getenv("CLOUDLOOM_AWS_ACCOUNT"), "AWS 12-digit account ID")
		region     = flag.String("region", os.Getenv("CLOUDLOOM_AWS_REGION"), "AWS region to discover first")
		push       = flag.Bool("push", false, "push the snapshot to CLOUDLOOM_PUSH_URL instead of printing")
		timeoutSec = flag.Int("timeout", 120, "discovery timeout in seconds")
	)
	flag.Parse()

	var prov interface {
		provider.Provider
		provider.Closer
	}
	switch *provName {
	case "aws":
		conn, err := aws.New(*account, *region)
		if err != nil {
			exit(2, err)
		}
		prov = conn
	default:
		exit(2, fmt.Errorf("unsupported provider %q — supported today: aws (azure, kubernetes landing next)", *provName))
	}
	defer prov.Close()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(*timeoutSec)*time.Second)
	defer cancel()

	snap, err := prov.Discover(ctx)
	if err != nil {
		exit(3, err)
	}

	if *push {
		url := os.Getenv("CLOUDLOOM_PUSH_URL")
		token := os.Getenv("CLOUDLOOM_PUSH_TOKEN")
		if url == "" || token == "" {
			exit(2, fmt.Errorf("push requires CLOUDLOOM_PUSH_URL and CLOUDLOOM_PUSH_TOKEN"))
		}
		if err := pushSnapshot(ctx, url, token, snap); err != nil {
			exit(4, err)
		}
		fmt.Printf("pushed %d resources from %s/%s to %s\n", len(snap.Resources), snap.Provider, snap.AccountID, url)
		return
	}

	out, _ := json.MarshalIndent(snap, "", "  ")
	fmt.Println(string(out))
}

func pushSnapshot(ctx context.Context, base, token string, snap provider.Snapshot) error {
	body, _ := json.Marshal(snap)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, base+"/api/ingest", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("ingest endpoint returned %d", resp.StatusCode)
	}
	return nil
}

func exit(code int, err error) {
	fmt.Fprintf(os.Stderr, "cloudloom-agent: %v\n", err)
	os.Exit(code)
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}


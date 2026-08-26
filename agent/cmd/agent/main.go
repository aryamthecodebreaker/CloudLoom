// Command agent is CloudLoom's read-only cloud connector.
//
// Discover resources in one real cloud account, then either print them as
// JSON (default), push them straight into a CloudLoom instance's graph, or
// run continuously as a scanning daemon:
//
//	# discover and print
//	cloudloom-agent -provider aws -account 482910475620
//
//	# discover and push into your instance
//	CLOUDLOOM_PUSH_URL=https://trycloudloom.vercel.app \
//	CLOUDLOOM_PUSH_TOKEN=<INGEST_TOKEN> \
//	cloudloom-agent -provider aws -account 482910475620 -push
//
//	# daemon: re-discover and push every 6 hours (drift detection)
//	cloudloom-agent -provider aws -account 482910475620 -push -interval 6h
//
// Exit codes: 2 bad configuration · 3 discovery failed · 4 push failed.
// In daemon mode a failed cycle logs and retries on the next interval.
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
	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/azure"
	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/kubernetes"
	"github.com/aryamthecodebreaker/CloudLoom/agent/internal/provider"
)

func main() {
	var (
		provName   = flag.String("provider", envOr("CLOUDLOOM_PROVIDER", "aws"), "cloud provider: aws | azure | kubernetes")
		account    = flag.String("account", os.Getenv("CLOUDLOOM_AWS_ACCOUNT"), "AWS 12-digit account ID")
		region     = flag.String("region", os.Getenv("CLOUDLOOM_AWS_REGION"), "AWS region to discover first")
		sub        = flag.String("subscription", os.Getenv("CLOUDLOOM_AZURE_SUBSCRIPTION"), "Azure subscription UUID")
		kubeCtx    = flag.String("kube-context", os.Getenv("CLOUDLOOM_KUBE_CONTEXT"), "kubeconfig context (empty = current)")
		push       = flag.Bool("push", false, "push the snapshot to CLOUDLOOM_PUSH_URL instead of printing")
		interval   = flag.Duration("interval", 0, "continuous mode: re-discover every interval (e.g. 6h). 0 = run once")
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
	case "azure":
		conn, err := azure.New(*sub)
		if err != nil {
			exit(2, err)
		}
		prov = conn
	case "kubernetes", "k8s":
		conn, err := kubernetes.New(*kubeCtx)
		if err != nil {
			exit(2, err)
		}
		prov = conn
	default:
		exit(2, fmt.Errorf("unsupported provider %q — supported: aws, azure, kubernetes", *provName))
	}
	defer prov.Close()

	runOnce := func(ctx context.Context) error {
		snap, err := prov.Discover(ctx)
		if err != nil {
			return err
		}
		if !*push {
			out, _ := json.MarshalIndent(snap, "", "  ")
			fmt.Println(string(out))
			return nil
		}
		url := os.Getenv("CLOUDLOOM_PUSH_URL")
		token := os.Getenv("CLOUDLOOM_PUSH_TOKEN")
		if url == "" || token == "" {
			return fmt.Errorf("push requires CLOUDLOOM_PUSH_URL and CLOUDLOOM_PUSH_TOKEN")
		}
		if err := pushSnapshot(ctx, url, token, snap); err != nil {
			return err
		}
		fmt.Printf("pushed %d resources from %s/%s to %s\n", len(snap.Resources), snap.Provider, snap.AccountID, url)
		return nil
	}

	if *interval > 0 {
		fmt.Printf("daemon mode: discovering every %s (ctrl-c to stop)\n", *interval)
		for {
			ctx, cancel := context.WithTimeout(context.Background(), time.Duration(*timeoutSec)*time.Second)
			if err := runOnce(ctx); err != nil {
				fmt.Fprintf(os.Stderr, "cloudloom-agent: cycle failed: %v\n", err)
			}
			cancel()
			time.Sleep(*interval)
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(*timeoutSec)*time.Second)
	defer cancel()
	if err := runOnce(ctx); err != nil {
		exit(3, err)
	}
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

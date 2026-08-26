#!/bin/sh
# CloudLoom agent installer — downloads the latest release binary.
# Usage: curl -fsSL https://raw.githubusercontent.com/aryamthecodebreaker/CloudLoom/main/scripts/install.sh | sh
set -eu

REPO="aryamthecodebreaker/CloudLoom"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "unsupported arch: $ARCH" >&2; exit 1 ;;
esac
case "$OS" in
  linux|darwin) ;;
  *) echo "unsupported os: $OS" >&2; exit 1 ;;
esac

echo "Fetching latest CloudLoom agent for ${OS}/${ARCH}..."
TAG=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p')
if [ -z "$TAG" ]; then echo "no releases found — build from source instead: https://github.com/${REPO}#readme" >&2; exit 1; fi

URL="https://github.com/${REPO}/releases/download/${TAG}/cloudloom-agent-${OS}-${ARCH}"
curl -fSL "$URL" -o cloudloom-agent
chmod +x cloudloom-agent

echo ""
echo "✓ cloudloom-agent ${TAG} installed in $(pwd)"
echo ""
echo "Next:"
echo "  1. Preview (nothing sent):  ./cloudloom-agent -provider aws -account YOUR_ACCOUNT_ID"
echo "  2. Push to your console:    export CLOUDLOOM_PUSH_URL=https://your-console"
echo "     export CLOUDLOOM_PUSH_TOKEN=<INGEST_TOKEN>"
echo "     ./cloudloom-agent -provider aws -account YOUR_ACCOUNT_ID -push"

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const sev = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  await db.issue.deleteMany();
  await db.vulnerability.deleteMany();
  await db.resource.deleteMany();
  await db.control.deleteMany();
  await db.project.deleteMany();
  await db.cloudAccount.deleteMany();
  await db.complianceFramework.deleteMany();

  const accounts = await Promise.all(
    [
      { name: "aws-production", provider: "AWS", externalId: "482910475620", status: "CONNECTED" },
      { name: "aws-staging", provider: "AWS", externalId: "739104826501", status: "CONNECTED" },
      { name: "azure-corp", provider: "Azure", externalId: "CloudLoom-corp-sub", status: "CONNECTED" },
      { name: "gcp-ml-platform", provider: "GCP", externalId: "ml-prod-318204", status: "CONNECTED" },
      { name: "k8s-edge-clusters", provider: "Kubernetes", externalId: "edge-fleet", status: "CONNECTED" },
      { name: "oci-archive", provider: "OCI", externalId: "ocid1.tenancy.archive", status: "ERROR" },
    ].map((a) =>
      db.cloudAccount.create({
        data: { ...a, lastScanAt: a.status === "ERROR" ? daysAgo(6) : daysAgo(Math.random() * 0.5) },
      })
    )
  );
  const [awsProd, awsStage, azure, gcp, k8s] = accounts;

  const projects = await Promise.all(
    [
      { name: "payments-core", team: "Payments Eng" },
      { name: "customer-data-lake", team: "Data Platform" },
      { name: "ml-inference", team: "ML Platform" },
      { name: "web-frontend", team: "Web Experience" },
    ].map((p) => db.project.create({ data: p }))
  );

  type R = {
    name: string; type: string; provider: string; region: string;
    acctId: string; projectId?: string; isPublic?: boolean; sensitive?: boolean; externalId: string;
  };
  const rawResources: R[] = [
    // AWS production
    { name: "prod-api-alb", type: "Load Balancer", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[0].id, isPublic: true, externalId: "arn:aws:elasticloadbalancing:.../prod-api-alb" },
    { name: "prod-api-asg", type: "Virtual Machine", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[0].id, externalId: "arn:aws:autoscaling:.../prod-api-asg" },
    { name: "prod-payments-db", type: "Database", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[0].id, sensitive: true, externalId: "arn:aws:rds:us-east-1:...db:payments" },
    { name: "prod-pii-bucket", type: "Object Storage", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[1].id, isPublic: true, sensitive: true, externalId: "prod-pii-bucket" },
    { name: "prod-etl-role", type: "Identity", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[1].id, externalId: "arn:aws:iam::...role/prod-etl" },
    { name: "prod-admin-role", type: "Identity", provider: "AWS", region: "us-east-1", acctId: awsProd.id, externalId: "arn:aws:iam::...role/break-glass-admin" },
    { name: "prod-events-kms", type: "Key Store", provider: "AWS", region: "us-east-1", acctId: awsProd.id, sensitive: true, externalId: "arn:aws:kms:...key/events" },
    { name: "prod-lambda-authorizer", type: "Serverless", provider: "AWS", region: "us-east-1", acctId: awsProd.id, projectId: projects[0].id, externalId: "arn:aws:lambda:...authorizer" },
    { name: "prod-sgx-worker", type: "Virtual Machine", provider: "AWS", region: "eu-west-1", acctId: awsProd.id, projectId: projects[0].id, isPublic: true, externalId: "i-0af31c77e2b91d004" },
    { name: "audit-log-bucket", type: "Object Storage", provider: "AWS", region: "us-east-1", acctId: awsProd.id, sensitive: true, externalId: "corp-audit-logs" },
    // Staging
    { name: "staging-web-ecs", type: "Container", provider: "AWS", region: "us-west-2", acctId: awsStage.id, projectId: projects[3].id, isPublic: true, externalId: "arn:aws:ecs:.../staging-web" },
    { name: "staging-feature-store", type: "Database", provider: "AWS", region: "us-west-2", acctId: awsStage.id, projectId: projects[2].id, sensitive: true, externalId: "arn:aws:rds:...feature-store" },
    { name: "ci-runner-host", type: "Virtual Machine", provider: "AWS", region: "us-west-2", acctId: awsStage.id, isPublic: true, externalId: "i-0be22d88f3c02e115" },
    // Azure
    { name: "corp-ad-vm", type: "Virtual Machine", provider: "Azure", region: "eastus", acctId: azure.id, externalId: "/subscriptions/.../vm/corp-ad" },
    { name: "hr-files-share", type: "File Storage", provider: "Azure", region: "eastus", acctId: azure.id, sensitive: true, externalId: "/shares/hr-files" },
    { name: "finance-sql", type: "Database", provider: "Azure", region: "westeurope", acctId: azure.id, projectId: projects[0].id, sensitive: true, externalId: "/sql/finance-prod" },
    // GCP
    { name: "gpu-infer-pool", type: "Container", provider: "GCP", region: "us-central1", acctId: gcp.id, projectId: projects[2].id, externalId: "gke/ml-infer-pool" },
    { name: "model-weights-store", type: "Object Storage", provider: "GCP", region: "us-central1", acctId: gcp.id, projectId: projects[2].id, sensitive: true, externalId: "gs://model-weights" },
    { name: "vertex-pipeline-sa", type: "Identity", provider: "GCP", region: "us-central1", acctId: gcp.id, projectId: projects[2].id, externalId: "sa/vertex-pipeline@ml-prod" },
    { name: "pubsub-telemetry", type: "Message Queue", provider: "GCP", region: "us-central1", acctId: gcp.id, externalId: "pubsub/telemetry" },
    // K8s
    { name: "edge-ingress-nginx", type: "Kubernetes Ingress", provider: "Kubernetes", region: "multi-cloud", acctId: k8s.id, projectId: projects[3].id, isPublic: true, externalId: "ingress/edge-ingress-nginx" },
    { name: "checkout-service", type: "Kubernetes Workload", provider: "Kubernetes", region: "multi-cloud", acctId: k8s.id, projectId: projects[0].id, externalId: "deploy/checkout-service" },
  ];
  const resources = [];
  for (const r of rawResources) {
    resources.push(
      await db.resource.create({
        data: {
          name: r.name, type: r.type, provider: r.provider, region: r.region,
          externalId: r.externalId, cloudAccountId: r.acctId, projectId: r.projectId ?? null,
          isPublic: !!r.isPublic, hasSensitiveData: !!r.sensitive,
        },
      })
    );
  }
  const byName = Object.fromEntries(resources.map((r) => [r.name, r]));

  const controls = await Promise.all(
    [
      { controlId: "C-1001", name: "VM with Critical vulnerability exposed to the internet", category: "Vulnerability Management", severity: "CRITICAL", description: "Internet-reachable compute running at least one critical-severity vulnerability with public exploit code.", queryHint: 'vulnerability.severity = "critical" AND resource.exposure = "internet"' },
      { controlId: "C-1002", name: "Publicly accessible storage contains sensitive data", category: "Data Security", severity: "CRITICAL", description: "Storage service reachable from the internet that stores classified sensitive records.", queryHint: 'resource.type = "storage" AND resource.isPublic AND data.hasSensitive' },
      { controlId: "C-1003", name: "Over-privileged identity can read sensitive storage", category: "Identity & Entitlements", severity: "HIGH", description: "Human or workload identity holding wildcard read on buckets classified as sensitive.", queryHint: 'identity.permissions CONTAINS "s3:*" AND target.hasSensitive' },
      { controlId: "C-1004", name: "Encryption key policy grants cross-account access", category: "Data Security", severity: "HIGH", description: "CMK key policy allows principals outside the account to decrypt.", queryHint: 'key.policy.grantsCrossAccount = true' },
      { controlId: "C-1005", name: "Serverless function with secrets in environment variables", category: "Secrets", severity: "HIGH", description: "Function runtime environment includes plaintext credential material.", queryHint: 'serverless.env CONTAINS secret' },
      { controlId: "C-1006", name: "CI runner host exposed with docker socket mounted", category: "Code & Pipeline", severity: "CRITICAL", description: "Build infrastructure reachable from the internet with container control socket available to workloads.", queryHint: 'host.role = "ci-runner" AND host.socketMount = "docker.sock" AND exposure = "internet"' },
      { controlId: "C-1007", name: "Ingress controller runs outdated image", category: "Vulnerability Management", severity: "MEDIUM", description: "Cluster ingress controller image is more than two minor versions behind latest patch line.", queryHint: 'workload.image.age > 180d AND workload.type = "ingress"' },
      { controlId: "C-1008", name: "Database backup unencrypted in staging", category: "Posture", severity: "MEDIUM", description: "Snapshot or export written without envelope encryption.", queryHint: 'database.backup.encrypted = false' },
      { controlId: "C-1009", name: "Security group allows 0.0.0.0/0 on admin port", category: "Network", severity: "HIGH", description: "Firewall rule admits all sources on SSH/RDP or other administrative ports.", queryHint: 'network.rule.port IN [22,3389] AND source = "0.0.0.0/0"' },
      { controlId: "C-1010", name: "Service account token automounted in pod spec", category: "Identity & Entitlements", severity: "LOW", description: "Pod mounts cloud credentials it never uses at runtime.", queryHint: 'pod.serviceAccountToken.autoMount = true AND usage = none' },
    ].map((c) => db.control.create({ data: c }))
  );
  const ctl = Object.fromEntries(controls.map((c) => [c.controlId, c]));

  const ap = (hops: { label: string; sublabel: string; kind: string }[]) =>
    JSON.stringify(hops);

  const issuesData = [
    { refId: "CL-1042", title: "Public VM with critical RCE vulnerability can reach payments database", severity: "CRITICAL", status: "OPEN", control: "C-1001", resource: byName["prod-sgx-worker"], attackPathJson: ap([
        { label: "Internet", sublabel: "0.0.0.0/0 : HTTPS", kind: "entry" },
        { label: "prod-sgx-worker", sublabel: "CVE-2026-31142 · RCE · CVSS 9.8", kind: "workload" },
        { label: "prod-api-asg role", sublabel: "iam:PassRole → rds:Connect", kind: "identity" },
        { label: "prod-payments-db", sublabel: "Cardholder records · 4.2M rows", kind: "data" },
      ]), description: "Edge worker is internet-exposed and runs a remotely exploitable deserialization flaw. The instance profile permits connecting to the production payments cluster, creating a complete path from the internet to cardholder data." },
    { refId: "CL-1017", title: "Public bucket exposes PII exports", severity: "CRITICAL", status: "OPEN", control: "C-1002", resource: byName["prod-pii-bucket"], attackPathJson: ap([
        { label: "Internet", sublabel: "Anonymous GET allowed", kind: "entry" },
        { label: "prod-pii-bucket", sublabel: "PII · 214 objects · 38 GB", kind: "data" },
      ]), description: "Bucket ACL permits anonymous reads and nightly ETL jobs land classified PII exports inside it. No identity hop is required." },
    { refId: "CL-1051", title: "Exposed CI runner with docker socket enables supply-chain compromise", severity: "CRITICAL", status: "IN_PROGRESS", control: "C-1006", resource: byName["ci-runner-host"], attackPathJson: ap([
        { label: "Internet", sublabel: "0.0.0.0/0 : 2375", kind: "entry" },
        { label: "ci-runner-host", sublabel: "docker.sock mounted", kind: "workload" },
        { label: "deploy key", sublabel: "org-wide GitHub PAT in env", kind: "identity" },
        { label: "release pipeline", sublabel: "Signs production images", kind: "impact" },
      ]), description: "A self-hosted build host advertises its Docker API publicly. Any caller can spawn a privileged container, harvest the org-wide PAT from runner env, and push tampered release images." },
    { refId: "CL-0998", title: "ETL role with wildcard read on sensitive buckets", severity: "HIGH", status: "OPEN", control: "C-1003", resource: byName["prod-etl-role"], description: "Role policy grants s3:Get* across all buckets including those classified sensitive. Least privilege would scope it to three named buckets." },
    { refId: "CL-0975", title: "KMS key policy trusts an external account", severity: "HIGH", status: "OPEN", control: "C-1004", resource: byName["prod-events-kms"], description: "Key policy statement references principal 210988441277, which no longer maps to any internal account after re-org." },
    { refId: "CL-1033", title: "Authorizer function holds Stripe secret in plaintext env var", severity: "HIGH", status: "OPEN", control: "C-1005", resource: byName["prod-lambda-authorizer"], description: "Live payment secret readable by anyone with lambda:GetFunction. Rotate and move to the secrets manager with KMS encryption." },
    { refId: "CL-1026", title: "Admin port open to the world on corp AD host", severity: "HIGH", status: "IN_PROGRESS", control: "C-1009", resource: byName["corp-ad-vm"], description: "RDP admitted from any source. Restrict to the VPN CIDR and enable session recording." },
    { refId: "CL-1088", title: "Vertex pipeline SA can impersonate storage admin", severity: "HIGH", status: "OPEN", control: "C-1003", resource: byName["vertex-pipeline-sa"], description: "Workload identity carries roles/storage.admin though pipelines only read model artifacts." },
    { refId: "CL-1104", title: "Staging feature store backups unencrypted", severity: "MEDIUM", status: "OPEN", control: "C-1008", resource: byName["staging-feature-store"], description: "Nightly snapshots are written without CMK. Feature vectors are derived from user telemetry and considered internal-confidential." },
    { refId: "CL-1112", title: "Edge ingress controller image two minors behind", severity: "MEDIUM", status: "RESOLVED", control: "C-1007", resource: byName["edge-ingress-nginx"], description: "Controller image lagged the supported patch line. Bumped via pull request CLPR-4471 and rolled out to all edge clusters." },
    { refId: "CL-1119", title: "Checkout pods automount cloud credentials unused at runtime", severity: "LOW", status: "OPEN", control: "C-1010", resource: byName["checkout-service"], description: "Sensor observed zero API calls using the mounted token over 30 days. Safe to disable automount." },
    { refId: "CL-1121", title: "Audit log bucket lacks object-level immutability", severity: "MEDIUM", status: "REJECTED", control: "C-1002", resource: byName["audit-log-bucket"], description: "Reviewed by security council; retention requirements met via WORM replication to the archive tenancy instead." },
  ];

  for (const i of issuesData) {
    const control = ctl[i.control];
    await db.issue.create({
      data: {
        refId: i.refId, title: i.title, description: i.description,
        status: i.status, severity: i.severity, attackPathJson: i.attackPathJson ?? null,
        controlId: control.id, resourceId: i.resource.id,
      },
    });
  }

  const vulnSeed: Array<[string, number, string, string, string, string, boolean, string]> = [
    ["CVE-2026-31142", 9.8, "CRITICAL", "libexpat", "2.5.0", "2.6.4", true, "Deserialization flaw in XML entity handling permits remote code execution in processes parsing untrusted input."],
    ["CVE-2025-9927", 9.1, "CRITICAL", "openssl", "3.0.9", "3.2.2", true, "Heap overflow during X.509 certificate chain verification reachable from TLS handshake."],
    ["CVE-2025-55190", 8.8, "HIGH", "nginx", "1.24.0", "1.27.3", false, "HTTP/2 stream reset storm enables denial of service against default configurations."],
    ["CVE-2026-10458", 8.1, "HIGH", "log4j-core", "2.17.1", "2.24.3", false, "JNDI lookup injection via logged application headers when message lookups are enabled."],
    ["CVE-2024-45387", 8.8, "HIGH", "ingress-nginx", "1.9.6", "1.11.5", true, "Annotation validation bypass in admission controller leads to controller takeover."],
    ["CVE-2025-30114", 7.5, "HIGH", "curl", "8.4.0", "8.11.1", false, "Cookie jar path traversal leaks credentials to sibling processes."],
    ["CVE-2025-78412", 7.2, "HIGH", "containerd", "1.7.3", "1.7.24", false, "Snapshotter race condition allows host filesystem escape from untrusted images."],
    ["CVE-2024-38819", 7.5, "HIGH", "spring-webmvc", "5.3.30", "6.1.14", false, "Path traversal in static resource resolution under functional web endpoints."],
    ["CVE-2026-20093", 6.5, "MEDIUM", "sudo", "1.9.14", "1.9.17p2", false, "Host restriction bypass when fqdn aliases contain wildcard segments."],
    ["CVE-2025-40218", 5.3, "MEDIUM", "zlib", "1.2.13", "1.3.1", false, "Unbounded inflate window allocation causes memory exhaustion under crafted streams."],
    ["CVE-2024-6119", 5.9, "MEDIUM", "sqlite", "3.43.1", "3.46.1", false, "Integer overflow in FTS5 prefix queries crashes the database process."],
    ["CVE-2023-5363", 5.3, "MEDIUM", "openssl", "3.0.9", "3.1.4", false, "Incorrect cipher suite enforcement breaks DH key checks in rare handshakes."],
    ["CVE-2026-12007", 3.7, "LOW", "busybox", "1.36.1", "1.37.0", false, "Information leak in applet error messages reveals mount table contents."],
    ["CVE-2025-90001", 3.1, "LOW", "git", "2.42.0", "2.47.1", false, "Protocol v2 advertisement discloses server-side ref namespaces to unauthenticated peers."],
  ];
  const vulnTargets: Record<string, string[]> = {
    "CVE-2026-31142": ["prod-sgx-worker", "ci-runner-host"],
    "CVE-2025-9927": ["prod-api-asg", "corp-ad-vm"],
    "CVE-2025-55190": ["edge-ingress-nginx", "prod-api-alb"],
    "CVE-2026-10458": ["prod-api-asg"],
    "CVE-2024-45387": ["edge-ingress-nginx"],
    "CVE-2025-30114": ["ci-runner-host", "gpu-infer-pool"],
    "CVE-2025-78412": ["ci-runner-host"],
    "CVE-2024-38819": ["staging-web-ecs"],
    "CVE-2026-20093": ["corp-ad-vm"],
    "CVE-2025-40218": ["gpu-infer-pool"],
    "CVE-2024-6119": ["finance-sql"],
    "CVE-2023-5363": ["staging-web-ecs"],
    "CVE-2026-12007": ["edge-ingress-nginx"],
    "CVE-2025-90001": ["ci-runner-host"],
  };
  for (const [cve, cvss, severity, pkg, inst, fixed, exploited, desc] of vulnSeed) {
    for (const target of vulnTargets[cve] ?? []) {
      await db.vulnerability.create({
        data: { cveId: cve, cvss, severity, packageName: pkg, installedVersion: inst, fixedVersion: fixed, exploitedInWild: exploited, description: desc, resourceId: byName[target].id },
      });
    }
  }

  const frameworks = [
    { name: "CIS AWS Foundations v3.0", family: "Cloud", passed: 148, failed: 19 },
    { name: "SOC 2 Type II", family: "Audit", passed: 61, failed: 7 },
    { name: "ISO 27001:2022", family: "Audit", passed: 89, failed: 11 },
    { name: "PCI DSS v4.0", family: "Payments", passed: 172, failed: 26 },
    { name: "HIPAA Security Rule", family: "Healthcare", passed: 54, failed: 5 },
    { name: "GDPR Art. 32 Controls", family: "Privacy", passed: 31, failed: 3 },
  ];
  for (const f of frameworks) {
    await db.complianceFramework.create({ data: f });
  }

  console.log("Seeded CloudLoom demo data.");
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });

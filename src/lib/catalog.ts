import { db } from "@/lib/db";

/**
 * Out-of-the-box compliance framework catalog. This is product configuration,
 * not fabricated findings — the pass/fail state is always computed live from
 * real controls and real issues.
 */
export const FRAMEWORK_CATALOG = [
  { name: "CIS AWS Foundations v3.0", family: "Cloud" },
  { name: "SOC 2 Type II", family: "Audit" },
  { name: "ISO 27001:2022", family: "Audit" },
  { name: "PCI DSS v4.0", family: "Payments" },
  { name: "HIPAA Security Rule", family: "Healthcare" },
  { name: "GDPR Art. 32 Controls", family: "Privacy" },
];

/** Idempotently ensure the framework catalog exists. */
export async function ensureFrameworks() {
  for (const f of FRAMEWORK_CATALOG) {
    await db.complianceFramework.upsert({
      where: { name: f.name },
      update: {},
      create: { ...f, passed: 0, failed: 0 },
    });
  }
}

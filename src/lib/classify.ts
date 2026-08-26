/**
 * DSPM heuristics: name-based sensitive-data classification.
 * Deliberately conservative — these are signals for triage, not verdicts.
 * ML/classifier integration supersedes this on the roadmap.
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /pii/i, /customer/i, /user[-_]?data/i, /personal/i, /profile/i,
  /backup/i, /dump/i, /export/i, /archive/i,
  /audit/i, /log[-_]?store/i,
  /finance/i, /payment/i, /billing/i, /invoice/i, /tax/i, /payroll/i,
  /hr[-_]?/i, /employee/i, /health/i, /medical/i, /patient/i,
  /secret/i, /credential/i, /password/i, /token/i, /key[-_]?store/i,
  /ssn/i, /passport/i, /license/i,
];

export function classifySensitive(name: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(name));
}

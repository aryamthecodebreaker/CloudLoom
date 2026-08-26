// WQL-lite: a tiny query language for filtering security-graph resources.
//
//   severity=critical and exposure=public
//   data=sensitive provider=gcp
//   severity=high+            (high or critical)
//   checkout                  (bare word → name/type substring)
//
// AND-only by design: `or` is rejected with a clear error rather than
// silently mis-parsed (review finding #180).

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export type Clause = { key: string; value: string };

export const QUERY_KEYS = [
  "severity",
  "exposure",
  "data",
  "type",
  "provider",
  "region",
  "name",
] as const;

const SEV_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];

export type QueryTarget = {
  name: string;
  type: string;
  provider: string;
  region: string;
  worstOpenSeverity?: string | null;
  isPublic?: boolean;
  hasSensitiveData?: boolean;
};

export function parseQuery(q: string): { clauses: Clause[]; error: string | null } {
  const trimmed = q.trim();
  if (!trimmed) return { clauses: [], error: null };

  const clauses: Clause[] = [];
  const parts = trimmed.split(/\s+and\s+/i);

  // Dangling operator: "severity=x and" or "and severity=x"
  if (/\sand\s*$/i.test(trimmed) || /^\s*and\s/i.test(trimmed)) {
    return { clauses: [], error: `Dangling "and" — expected a clause on both sides.` };
  }

  for (const part of parts) {
    const token = part.trim();

    // Lone "and" that survived splitting
    if (/^and$/i.test(token)) {
      return { clauses: [], error: `Dangling "and" — expected a clause on both sides.` };
    }
    // Explicit OR is not supported; reject instead of mis-parsing.
    if (/\s+or\s+/i.test(token) || /^or$/i.test(token)) {
      return { clauses: [], error: `"or" is not supported — combine clauses with "and".` };
    }

    const m = token.match(/^([a-zA-Z_-]+)\s*[:=]\s*(.+)$/);
    if (!m) {
      clauses.push({ key: "name", value: token.toLowerCase().replace(/["'`]/g, "") });
      continue;
    }
    const [, key, rawValue] = m;
    const normalizedKey = key.toLowerCase();
    if (!(QUERY_KEYS as readonly string[]).includes(normalizedKey)) {
      return {
        clauses: [],
        error: `Unknown field "${key}" — valid: ${QUERY_KEYS.join(", ")}`,
      };
    }
    clauses.push({ key: normalizedKey, value: rawValue.toLowerCase().replace(/["'`]/g, "").trim() });
  }

  return { clauses, error: null };
}

export function matchClause(n: QueryTarget, { key, value }: Clause): boolean {
  switch (key) {
    case "name":
      return n.name.toLowerCase().includes(value) || n.type.toLowerCase().includes(value);
    case "severity":
      return matchSeverity(n.worstOpenSeverity ?? null, value);
    case "exposure":
      if (value === "public") return n.isPublic === true;
      if (value === "internal" || value === "private") return n.isPublic === false;
      return false;
    case "data":
      if (value === "sensitive" || value === "true") return n.hasSensitiveData === true;
      if (value === "clean" || value === "false" || value === "none") return n.hasSensitiveData === false;
      return false;
    case "type":
      return n.type.toLowerCase().includes(value);
    case "provider":
      return n.provider.toLowerCase() === value;
    case "region":
      return n.region.toLowerCase().includes(value);
    default:
      return true;
  }
}

/** `critical` exact · `high+` that level or worse · `medium-` that level or better. */
function matchSeverity(actual: string | null, wanted: string): boolean {
  if (!actual) return false;
  const a = actual.toUpperCase();
  const idx = SEV_ORDER.indexOf(a as Severity);
  if (idx === -1) return false;

  if (wanted.endsWith("+")) {
    const w = SEV_ORDER.indexOf(wanted.slice(0, -1).toUpperCase() as Severity);
    return w !== -1 && idx <= w;
  }
  if (wanted.endsWith("-")) {
    const w = SEV_ORDER.indexOf(wanted.slice(0, -1).toUpperCase() as Severity);
    return w !== -1 && idx >= w;
  }
  return a === wanted.toUpperCase();
}

export const matchesAll = (n: QueryTarget, clauses: Clause[]): boolean =>
  clauses.every((c) => matchClause(n, c));

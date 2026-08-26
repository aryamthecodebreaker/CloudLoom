// Central design/data tokens — single source of truth for statuses,
// severities, colors and shared helpers.

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;
export type Status = (typeof STATUSES)[number];

export const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-sky-100 text-sky-700",
  INFORMATIONAL: "bg-stone-100 text-stone-600",
};

/** One semantic color per severity — used by bars, dots and CVSS chips alike. */
export const SEVERITY_HEX: Record<Severity, string> = {
  CRITICAL: "#D92D20",
  HIGH: "#F76808",
  MEDIUM: "#F59E0B",
  LOW: "#0BA5EC",
  INFORMATIONAL: "#94A3B8",
};

export const STATUS_STYLES: Record<Status, string> = {
  OPEN: "bg-red-50 text-red-600 ring-1 ring-red-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  REJECTED: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
};

/** Text-color-only variant (for places that can't take a chip background). */
export const STATUS_TEXT: Record<Status, string> = {
  OPEN: "text-red-600",
  IN_PROGRESS: "text-blue-600",
  RESOLVED: "text-emerald-600",
  REJECTED: "text-stone-500",
};

/** String-safe lookups for values coming out of the DB as plain strings. */
export const severityStyle = (s: string): string => SEVERITY_STYLES[s as Severity] ?? "";
export const statusStyle = (s: string): string => STATUS_STYLES[s as Status] ?? "";

export const PROVIDER_LABELS: Record<string, string> = {
  AWS: "AWS",
  Azure: "Azure",
  GCP: "GCP",
  Kubernetes: "Kubernetes",
  OCI: "OCI",
};

const EVENT_STYLE_FALLBACK = "bg-stone-100 text-stone-600";
const EVENT_STYLES: Record<string, string> = {
  SUCCESS: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  DENIED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  SUSPICIOUS: "bg-red-50 text-red-600 ring-1 ring-red-200",
};
export const eventStyle = (result: string): string =>
  EVENT_STYLES[result] ?? EVENT_STYLE_FALLBACK;

const EDGE_COLOR_MAP: Record<string, string> = {
  ROUTES_TO: "#94A3B8",
  ACCESSES: "#D6246E",
  ASSUMES: "#7C3AED",
  EXPOSES: "#F79009",
  ENCRYPTS: "#12B76A",
  DECRYPTS_WITH: "#0E9F6E",
  FEEDS: "#8B5CF6",
  REPLICATES_FROM: "#6D28D9",
};
export const edgeColor = (kind: string): string => EDGE_COLOR_MAP[kind] ?? "#94A3B8";
/** [kind, color] pairs for legends. */
export const EDGE_LEGEND: Array<[string, string]> = Object.entries(EDGE_COLOR_MAP);

/** Hop taxonomy for attack paths (shared by list + detail views). */
export const HOP_COLORS: Record<string, string> = {
  entry: "#F79009",
  workload: "#D6246E",
  identity: "#2C6BFF",
  data: "#12B76A",
  impact: "#7C3AED",
};
export const HOP_LABELS: Record<string, string> = {
  entry: "Entry point",
  workload: "Workload",
  identity: "Identity",
  data: "Sensitive data",
  impact: "Impact",
};
export const hopColor = (kind: string): string => HOP_COLORS[kind] ?? "#2C6BFF";

export type AttackHop = { label: string; sublabel: string; kind: string };

export function parseAttackPath(json: string | null): AttackHop[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Shared formatter — explicit locale + UTC so server and client agree. */
export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export const formatDate = formatDateTime;

/** "just now" / "5m ago" / "3h ago" / "6d ago" — for activity feeds. */
export function relTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(s)) return "—";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
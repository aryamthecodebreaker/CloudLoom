export const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-sky-100 text-sky-700",
  INFORMATIONAL: "bg-slate-100 text-slate-600",
};

export const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-red-50 text-red-600 ring-1 ring-red-200",
  IN_PROGRESS: "bg-blue-50 text-accent ring-1 ring-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  REJECTED: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

export const PROVIDER_LABELS: Record<string, string> = {
  AWS: "AWS",
  Azure: "Azure",
  GCP: "GCP",
  Kubernetes: "Kubernetes",
  OCI: "OCI",
};

export const EVENT_STYLES: Record<string, string> = {
  SUCCESS: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  DENIED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  SUSPICIOUS: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

export const EDGE_COLORS: Record<string, string> = {
  ROUTES_TO: "#94A3B8",
  ACCESSES: "#2C6BFF",
  ASSUMES: "#FF4F9A",
  EXPOSES: "#F79009",
  ENCRYPTS: "#12B76A",
  DECRYPTS_WITH: "#12B76A",
  FEEDS: "#7C3AED",
  REPLICATES_FROM: "#7C3AED",
};

export type AttackHop = { label: string; sublabel: string; kind: string };

export function parseAttackPath(json: string | null): AttackHop[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as AttackHop[];
  } catch {
    return [];
  }
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

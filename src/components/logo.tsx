export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="2" y="2" width="28" height="28" rx={4} fill={dark ? "#fff" : "#211B12"} />
        <path d="M8.5 11.5h15M8.5 16h15M8.5 20.5h15" stroke="#F6F2EB" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
        <path d="M13 7v18M19.5 7v18" stroke="#FF5CA8" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="13" cy="16" r="2" fill="#161320" stroke="#FF5CA8" strokeWidth="1.3" />
        <circle cx="19.5" cy="16" r="2" fill="#161320" stroke="#FF5CA8" strokeWidth="1.3" />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
        CloudLoom
      </span>
    </span>
  );
}

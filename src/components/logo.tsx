export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="27" height="27" rx="8" fill={dark ? "#fff" : "#2C6BFF"} opacity={dark ? "0.12" : "0.12"} />
        <rect x="2.5" y="2.5" width="27" height="27" rx="8" stroke={dark ? "#8FB3FF" : "#2C6BFF"} strokeWidth="1.8" />
        <path d="M8 11h16M8 16h16M8 21h16" stroke={dark ? "#8FB3FF" : "#2C6BFF"} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <path d="M13 7v18M20 7v18" stroke="#FF4F9A" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="13" cy="16" r="2.1" fill={dark ? "#0A1633" : "#fff"} stroke="#FF4F9A" strokeWidth="1.4" />
        <circle cx="20" cy="16" r="2.1" fill={dark ? "#0A1633" : "#fff"} stroke="#FF4F9A" strokeWidth="1.4" />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-loom-navy"}`}>
        Cloud<span className="text-loom-blue">Loom</span>
      </span>
    </span>
  );
}

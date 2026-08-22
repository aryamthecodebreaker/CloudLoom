export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 2l12 5v9c0 7.2-5 12.6-12 14C9 28.6 4 23.2 4 16V7l12-5z" fill={dark ? "#fff" : "#2C6BFF"} opacity="0.15" />
        <path d="M16 2l12 5v9c0 7.2-5 12.6-12 14C9 28.6 4 23.2 4 16V7l12-5z" stroke={dark ? "#8FB3FF" : "#2C6BFF"} strokeWidth="2" />
        <path d="M11 17.5c2 .2 3.4-.4 4.4-1.9.9-1.3 1.6-3 2.6-4.4 1.2-1.7 2.9-2.4 5-2.1-1.6 2-2.3 3.6-2.6 5.6-.4 2.7-2 4.6-4.7 5-2 .3-3.6-.5-4.7-2.2z" fill="#FF4F9A" stroke={dark ? "#FF4F9A" : "#E23A82"} strokeWidth="0.5" />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-wiz-navy"}`}>
        Open<span className="text-wiz-blue">Wiz</span>
      </span>
    </span>
  );
}

export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 1000 440" className="w-full" role="img" aria-label="CloudLoom architecture: repos and cloud estates feed the security graph; console views read from it; runtime sensor and AI agents are planned">
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#5A6B8C" />
        </marker>
        <marker id="arch-arrow-pink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#FF4F9A" />
        </marker>
      </defs>

      {/* Sources */}
      <Box x={30} y={60} w={190} h={86} title="Repos & CI/CD" sub="commits · pipelines" stroke="#2C6BFF" />
      <Box x={30} y={280} w={190} h={86} title="Cloud estates" sub="AWS · Azure · GCP · K8s" stroke="#2C6BFF" />

      {/* Connectors (planned) */}
      <path d="M225,103 C300,103 320,180 392,192" fill="none" stroke="#5A6B8C" strokeWidth="1.6" strokeDasharray="6 5" markerEnd="url(#arch-arrow)" />
      <text x={268} y={128} fontSize={12} fill="#667085">scans · IaC · SCA</text>
      <path d="M225,323 C300,323 320,246 392,234" fill="none" stroke="#5A6B8C" strokeWidth="1.6" strokeDasharray="6 5" markerEnd="url(#arch-arrow)" />
      <text x={252} y={296} fontSize={12} fill="#E23A82" fontWeight={600}>live APIs — planned</text>

      {/* Graph core */}
      <Box x={395} y={140} w={210} h={146} title="Security Graph" sub="Postgres · controls → issues · attack-path logic" stroke="#2C6BFF" accent />
      <circle cx="445" cy="205" r="4" fill="#2C6BFF" />
      <circle cx="500" cy="185" r="4" fill="#FF4F9A" />
      <circle cx="552" cy="222" r="4" fill="#12B76A" />
      <line x1="447" y1="206" x2="498" y2="187" stroke="#8FB3FF" strokeWidth="1.2" />
      <line x1="502" y1="188" x2="550" y2="220" stroke="#8FB3FF" strokeWidth="1.2" />

      {/* Consumers */}
      <path d="M608,185 C680,175 700,130 762,120" fill="none" stroke="#5A6B8C" strokeWidth="1.6" markerEnd="url(#arch-arrow)" />
      <text x={652} y={138} fontSize={12} fill="#667085">queries</text>
      <Box x={765} y={62} w={205} h={92} title="Console views" sub="dashboard · triage · paths · compliance" stroke="#12B76A" />

      <path d="M608,240 C680,250 700,296 762,306" fill="none" stroke="#5A6B8C" strokeWidth="1.6" strokeDasharray="6 5" markerEnd="url(#arch-arrow)" />
      <text x={668} y={290} fontSize={12} fill="#E23A82" fontWeight={600}>planned</text>
      <Box x={765} y={272} w={205} h={92} title="AI agents" sub="Red · Blue · Green remediation" stroke="#FF4F9A" dashed />

      {/* Runtime sensor (planned) */}
      <path d="M500,289 C500,330 480,352 420,368 L330,384" fill="none" stroke="#F79009" strokeWidth="1.6" strokeDasharray="6 5" markerEnd="url(#arch-arrow-pink)" opacity="0.85" />
      <Box x={110} y={360} w={215} h={54} title="Runtime sensor (eBPF)" sub="telemetry — planned" stroke="#F79009" dashed />

      {/* Legend */}
      <g transform="translate(30,18)">
        <rect width="14" height="14" rx="3" fill="none" stroke="#2C6BFF" strokeWidth="1.6" />
        <text x={22} y={11} fontSize={12} fill="#475467">shipped today</text>
        <rect x={118} width="14" height="14" rx="3" fill="none" stroke="#E23A82" strokeWidth="1.6" strokeDasharray="4 3" />
        <text x={140} y={11} fontSize={12} fill="#475467">dashed = on the roadmap</text>
      </g>
    </svg>
  );
}

function Box({ x, y, w, h, title, sub, stroke, dashed, accent }: {
  x: number; y: number; w: number; h: number; title: string; sub: string;
  stroke: string; dashed?: boolean; accent?: boolean;
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        width={w}
        height={h}
        rx={14}
        fill={accent ? "rgba(44,107,255,.06)" : "#fff"}
        stroke={stroke}
        strokeWidth={accent ? 2.2 : 1.6}
        strokeDasharray={dashed ? "6 5" : undefined}
      />
      <text x={16} y={34} fontSize={15} fontWeight={700} fill="#101828">{title}</text>
      {sub.split("·").map((s, i) => (
        <text key={i} x={16} y={56 + i * 17} fontSize={11.5} fill="#667085">{s.trim()}</text>
      ))}
    </g>
  );
}

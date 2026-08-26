import Link from "next/link";

/**
 * The "connect your first account" guide. Shown on the dashboard empty state
 * and the connectors page until at least one real account is connected.
 * Server component — zero client JS.
 */
export function ConnectGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-md border border-line bg-white p-6 sm:p-8">
      {!compact && (
        <>
          <h2 className="font-display text-2xl font-medium tracking-tight text-coal">
            Connect your first cloud account.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Three commands, about two minutes. The agent runs{" "}
            <strong className="font-semibold text-ink">on your machine</strong> with
            read-only credentials you already have — your keys never leave your
            environment. Findings appear here automatically.
          </p>
        </>
      )}
      {compact && (
        <p className="text-sm text-slate-500">
          Connect your first cloud account — three commands, two minutes, keys stay on your machine.
        </p>
      )}

      <ol className="mt-6 space-y-5">
        <Step n={1} title="Install the agent (one line, no Go needed)">
          <Pre>curl -fsSL https://raw.githubusercontent.com/aryamthecodebreaker/CloudLoom/main/scripts/install.sh | sh</Pre>
        </Step>
        <Step n={2} title="Preview what it finds — nothing is sent yet">
          <Pre>./cloudloom-agent -provider aws -account YOUR_12_DIGIT_ACCOUNT_ID</Pre>
          <p className="mt-1.5 text-xs text-slate-400">
            Works with <code className="font-mono">-provider azure -subscription UUID</code> and{" "}
            <code className="font-mono">-provider kubernetes</code> too.
          </p>
        </Step>
        <Step n={3} title="Push into this graph">
          <Pre>{`export CLOUDLOOM_PUSH_URL=https://trycloudloom.vercel.app
export CLOUDLOOM_PUSH_TOKEN=your-ingest-token
./cloudloom-agent -provider aws -account YOUR_12_DIGIT_ACCOUNT_ID -push`}</Pre>
          <p className="mt-1.5 text-xs text-slate-400">
            Need the token? It&apos;s set by whoever hosts this console (
            <code className="font-mono">INGEST_TOKEN</code> env var).{" "}
            <Link href="/console/connectors" className="font-semibold text-accent hover:underline">
              More detail on the Connectors page →
            </Link>
          </p>
        </Step>
      </ol>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink font-mono text-xs font-bold text-paper">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-coal">{title}</p>
        {children}
      </div>
    </li>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md bg-coal p-3.5 font-mono text-xs leading-relaxed text-paper/85">
      <code>{children}</code>
    </pre>
  );
}

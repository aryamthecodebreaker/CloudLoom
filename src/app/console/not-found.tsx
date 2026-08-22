import Link from "next/link";

export default function ConsoleNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-8 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-ink-faint">404</p>
      <h1 className="mt-3 font-display text-2xl font-medium text-coal">
        That reference isn&apos;t on the graph.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        The issue, resource or page you asked for doesn&apos;t exist in this
        environment — it may have been resolved, renumbered, or never seeded.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/console/issues" className="btn-primary">Back to issues</Link>
        <Link href="/console" className="btn-secondary">Dashboard</Link>
      </div>
    </div>
  );
}

"use client";

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center p-8 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">!</span>
      <h1 className="mt-5 text-xl font-bold text-loom-navy">The graph is unreachable</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        We couldn&apos;t query the database. This is usually a transient connection
        hiccup between Vercel and Supabase — retrying normally fixes it.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-slate-400">digest: {error.digest}</p>
      )}
      <button onClick={reset} className="btn-primary mt-6 px-6 py-3">
        Retry now
      </button>
    </div>
  );
}

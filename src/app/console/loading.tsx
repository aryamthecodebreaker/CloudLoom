export default function ConsoleLoading() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-6 w-28 animate-pulse rounded-full bg-amber-100" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-3">
          <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-6 w-24 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="h-6 flex-1 animate-pulse rounded-md bg-slate-100" />
                <div className="h-4 w-6 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-2">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">Querying the security graph…</p>
    </div>
  );
}

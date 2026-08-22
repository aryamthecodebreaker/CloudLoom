import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-loom-cream px-6 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-loom-accent">404</p>
      <h1 className="mt-4 text-xl font-bold text-loom-coal">
        This thread isn&apos;t on the loom
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist — it may have been moved,
        or the URL got mangled.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-secondary">Back home</Link>
        <Link href="/console" className="btn-primary">Open the console</Link>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPending(false);
      setError(data.error ?? "Registration failed");
      return;
    }
    // Auto sign-in after registration
    const signin = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setPending(false);
    if (signin?.error) {
      router.push("/login?registered=1");
      return;
    }
    router.push("/console");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-faint">Name (optional)</label>
        <input id="name" name="name" type="text" autoComplete="name"
          className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/50" />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-faint">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/50" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-faint">Password (10+ chars)</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password"
          className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/50" />
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 ring-1 ring-red-200">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5 disabled:opacity-50">
        {pending ? "Creating workspace…" : "Create workspace"}
      </button>
    </form>
  );
}

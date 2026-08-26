import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; registered?: string };
}) {
  const session = await auth();
  if (session?.userId) redirect("/console");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5">
      <Link href="/" aria-label="CloudLoom home" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-sm rounded-md border border-line bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Sign in</h1>
        {searchParams?.registered && (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            Account created — sign in below.
          </p>
        )}
        <LoginForm callbackUrl={searchParams?.callbackUrl ?? "/console"} />
        <p className="mt-5 border-t border-line pt-4 text-center text-xs text-slate-500">
          No account?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">Create one</Link>{" "}
          — the first workspace on a fresh deployment is yours.
        </p>
      </div>
      <p className="mt-6 font-mono text-xs text-ink-faint">Self-hosted · your data, your Postgres</p>
    </div>
  );
}

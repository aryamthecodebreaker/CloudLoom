import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.userId) redirect("/console");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5">
      <Link href="/" aria-label="CloudLoom home" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-sm rounded-md border border-line bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Create your workspace</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          You&apos;ll be the owner. Connect clouds via the agent, invite nobody until
          you want to — it&apos;s your data in your Postgres.
        </p>
        <RegisterForm />
        <p className="mt-5 border-t border-line pt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      onClick={async () => {
        setPending(true);
        await signOut({ callbackUrl: "/" });
      }}
      disabled={pending}
      className="mt-2 w-full rounded-lg border border-white/15 px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:border-white/40 hover:text-white disabled:opacity-50"
    >
      {pending ? "Signing out…" : "⏻ Sign out"}
    </button>
  );
}

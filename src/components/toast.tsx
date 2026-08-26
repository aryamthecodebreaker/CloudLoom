"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string; variant: "success" | "error" };
type ToastCtx = { toast: (message: string, variant?: Toast["variant"]) => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-md border px-4 py-3 text-sm font-medium shadow-[0_12px_40px_-12px_rgba(0,0,0,.35)] ${
              t.variant === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {t.variant === "error" ? "✕ " : "✓ "}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

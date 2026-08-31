"use client";

import { useToasts } from "./toast-store";
import { X } from "lucide-react";

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto card animate-slide-up px-4 py-3 flex items-start gap-3 ${
            t.variant === "success" ? "border-emerald-300" : t.variant === "error" ? "border-rose-300" : ""
          }`}
        >
          <div className="flex-1">
            <div className="font-semibold text-sm">{t.title}</div>
            {t.description && <div className="text-xs text-ink-500 mt-0.5">{t.description}</div>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-ink-700">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

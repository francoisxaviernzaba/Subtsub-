"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 card border-brand-500/30 bg-white shadow-xl">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📲</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Install SUB2SUB App</div>
            <div className="text-xs text-ink-500 mt-1">
              Add SUB2SUB to your home screen for quick access and offline support.
            </div>
          </div>
          <button onClick={() => setShowPrompt(false)} className="text-ink-400 hover:text-ink-700">
            ✕
          </button>
        </div>
        <button
          onClick={install}
          className="mt-3 w-full px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600"
        >
          Install Now
        </button>
      </div>
    </div>
  );
}

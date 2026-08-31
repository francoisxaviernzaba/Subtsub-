"use client";

import { SessionProvider } from "next-auth/react";
import { create } from "zustand";

type UIState = {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
};

export const useUI = create<UIState>()((set) => ({
  theme: "light",
  setTheme: (t) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
      try { localStorage.setItem("theme", t); } catch {}
    }
    set({ theme: t });
  },
}));

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeBoot />
      {children}
    </SessionProvider>
  );
}

function ThemeBoot() {
  if (typeof document !== "undefined") {
    const saved = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
    const initial = saved === "dark" || saved === "light" ? saved : "light";
    document.documentElement.classList.toggle("dark", initial === "dark");
  }
  return null;
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
      }}
      className="size-9 grid place-items-center rounded-full hover:bg-[rgb(var(--border))]/60"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

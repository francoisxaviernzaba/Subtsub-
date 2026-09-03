"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Rocket, Coins, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/s2s", label: "Earn", icon: Users },
  { href: "/boost", label: "Boost", icon: Rocket, primary: true },
  { href: "/coins", label: "Coins", icon: Coins },
];

export function BottomNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-0 z-40 px-3 pointer-events-none">
      <div
        className="mx-auto max-w-md pointer-events-auto flex items-center justify-around gap-1 px-2 py-2 rounded-full border border-white/40 dark:border-white/10 shadow-2xl shadow-black/15 backdrop-blur-xl bg-white/70 dark:bg-gray-950/60"
        style={{ WebkitBackdropFilter: "blur(20px) saturate(180%)" }}
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          if (it.primary) {
            return (
              <Link
                key={it.href}
                href={it.href}
                className="flex flex-col items-center justify-center -mt-7"
              >
                <div
                  className={cn(
                    "size-14 rounded-full grid place-items-center text-white shadow-glow ring-4",
                    active
                      ? "bg-gradient-to-br from-rose-500 to-red-500 ring-rose-200/60"
                      : "bg-gradient-to-br from-brand-500 to-rose-500 ring-white/60 dark:ring-gray-950/60"
                  )}
                >
                  <Icon size={26} strokeWidth={2.4} />
                </div>
                <div className={cn("text-[10px] mt-0.5 font-semibold", active ? "text-brand-600" : "text-ink-500")}>{it.label}</div>
              </Link>
            );
          }
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-full text-[11px] font-semibold transition",
                active ? "text-brand-600 bg-brand-50/70 dark:bg-brand-900/20" : "text-ink-500"
              )}
            >
              <Icon size={22} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname() || "";
  const links = [
    { href: "/s2s", label: "Earn" },
    { href: "/boost", label: "Boost" },
  ];
  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 h-9 rounded-full text-sm font-semibold flex items-center",
              active ? "bg-brand-100/80 text-brand-700 dark:bg-brand-900/30" : "hover:bg-white/40"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

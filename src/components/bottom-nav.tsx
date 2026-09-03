"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Rocket, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/s2s", label: "S2S", icon: Users },
  { href: "/boost", label: "Boost", icon: Rocket },
  { href: "/coins", label: "Coins", icon: Coins },
];

export function BottomNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur">
      <div className="grid grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium",
                active ? "text-brand-600" : "text-ink-500"
              )}
            >
              <Icon size={20} />
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
    { href: "/s2s", label: "S2S" },
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
              "px-3 h-9 rounded-full text-sm font-medium flex items-center",
              active ? "bg-[rgb(var(--border))]/70" : "hover:bg-[rgb(var(--border))]/40"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

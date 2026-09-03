"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Bell, Coins, Search, LogOut, Settings as SettingsIcon, User as UserIcon, Youtube, Shield, ChevronDown } from "lucide-react";
import { formatCoins } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsPopover } from "./notifications-popover";

type User = { id: string; name: string | null; email: string | null; image: string | null; role: string };
type YT = { id: string; title: string; handle: string | null; thumbnailUrl: string | null } | null;

export function Header({ user, balance, youtube }: { user: User; balance: number; youtube: YT }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpenMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-14">
        <Link href="/s2s" className="flex items-center gap-2 font-extrabold tracking-tight">
          <div className="size-8 rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 grid place-items-center text-white text-sm shadow-glow">S2S</div>
          <span className="hidden sm:inline">SUB2SUB</span>
        </Link>

        <div className="flex-1 max-w-xl mx-auto">
          <Link
            href="/s2s"
            className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full bg-[rgb(var(--border))]/40 text-sm text-ink-500 hover:bg-[rgb(var(--border))]/70"
          >
            <Search size={16} /> Discover videos & channels
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/coins"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow-soft"
          >
            <Coins size={16} /> {formatCoins(balance)}
          </Link>

          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="relative size-9 grid place-items-center rounded-full hover:bg-[rgb(var(--border))]/60"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <UnreadDot />
          </button>

          <ThemeToggle />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2 h-9 rounded-full hover:bg-[rgb(var(--border))]/60"
            >
              <div className="size-7 rounded-full overflow-hidden bg-[rgb(var(--border))]">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full grid place-items-center text-xs font-semibold">
                    {(user.name || user.email || "U")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <ChevronDown size={14} className="text-ink-400" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-72 card p-1.5 animate-fade-in">
                <div className="px-3 py-2.5 flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-[rgb(var(--border))]">
                    {user.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{user.name || "User"}</div>
                    <div className="text-xs text-ink-500 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="border-t border-[rgb(var(--border))] my-1" />
                <div className="px-3 py-2 text-xs">
                  <div className="text-ink-500 mb-1">Connected YouTube</div>
                  {youtube ? (
                    <div className="flex items-center gap-2">
                      {youtube.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={youtube.thumbnailUrl} alt="" className="size-6 rounded-full" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{youtube.title}</div>
                        {youtube.handle && <div className="text-ink-500">@{youtube.handle}</div>}
                      </div>
                    </div>
                  ) : (
                    <Link href="/settings" className="text-brand-600 font-semibold">Connect channel →</Link>
                  )}
                </div>
                <div className="border-t border-[rgb(var(--border))] my-1" />
                <MenuLink href="/profile" icon={<UserIcon size={14} />}>Profile</MenuLink>
                <MenuLink href="/transactions" icon={<Coins size={14} />}>Transactions</MenuLink>
                <MenuLink href="/settings" icon={<SettingsIcon size={14} />}>Settings</MenuLink>
                {youtube && (
                  <MenuLink href="/settings#youtube" icon={<Youtube size={14} />}>YouTube</MenuLink>
                )}
                {user.role === "ADMIN" && (
                  <MenuLink href="/admin" icon={<Shield size={14} />}>Admin</MenuLink>
                )}
                <div className="border-t border-[rgb(var(--border))] my-1" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgb(var(--border))]/60 text-sm text-rose-600"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {openNotif && <NotificationsPopover onClose={() => setOpenNotif(false)} />}
    </header>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgb(var(--border))]/60 text-sm">
      <span className="text-ink-500">{icon}</span>
      {children}
    </Link>
  );
}

function UnreadDot() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/notifications/unread-count", { cache: "no-store" });
        if (!alive) return;
        if (r.ok) {
          const j = await r.json();
          setCount(j.count ?? 0);
        }
      } catch {}
    }
    load();
    const id = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  if (!count) return null;
  return (
    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-[rgb(var(--bg))]" aria-label={`${count} unread`} />
  );
}

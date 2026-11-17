"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CanonicalLink() {
  const pathname = usePathname();

  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://sub2sub.com").replace(/\/$/, "");
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const canonical = `${base}${path}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
  }, [pathname]);

  return null;
}

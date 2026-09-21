"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CanonicalLink() {
  const pathname = usePathname();

  useEffect(() => {
    const canonical = `https://sub2sub.com${pathname}`;
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

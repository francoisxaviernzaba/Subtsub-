import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/admin",
    "/api/",
    "/s2s",
    "/boost",
    "/coins",
    "/settings",
    "/profile",
    "/transactions",
    "/quests",
    "/invite",
    "/support",
    "/leaderboard",
    "/u/",
    "/auth/",
    "/home",
  ];

  return {
    rules: [
      { userAgent: "*", allow: ["/"], disallow },
      { userAgent: "Googlebot", allow: ["/"], disallow },
    ],
    sitemap: "https://sub2sub.com/sitemap.xml",
  };
}

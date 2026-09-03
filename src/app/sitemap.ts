import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL || "https://subtsub.vercel.app";
  const routes = [
    "", "/s2s", "/boost", "/discover", "/coins", "/profile", "/settings",
    "/invite", "/leaderboard", "/quests", "/faq", "/alternatives", "/blog",
    "/login", "/signup",
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: r === "" ? 1 : 0.8,
  }));
}

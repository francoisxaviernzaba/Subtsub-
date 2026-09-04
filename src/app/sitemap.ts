import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sub2sub.com";
  const now = new Date().toISOString();

  const pages = [
    "/",
    "/creator-growth",
    "/video-discovery",
    "/youtube-video-promotion",
    "/youtube-channel-promotion",
    "/sub2sub-vs-sub4sub",
    "/creator-campaigns",
    "/sub4sub",
    "/youtube-growth",
    "/youtube-subscribers",
    "/youtube-views",
    "/social-media-growth",
    "/instagram-growth",
    "/tiktok-growth",
    "/how-it-works",
    "/about",
    "/pricing",
    "/creators",
    "/topics",
    "/guides",
    "/comparisons",
    "/glossary",
    "/faq",
    "/terms",
    "/privacy",
    "/refund",
    "/community-guidelines",
    "/contact",
    "/account-deletion",
    "/login",
    "/register",
    "/free-youtube-subscribers",
    "/youtube-subscriber-tracker",
    "/youtube-title-generator",
    "/youtube-tag-generator",
    "/youtube-thumbnail-maker",
    "/youtube-shorts-upload",
    "/youtube-watch-hours",
    "/tools/watch-time-calculator",
    "/tools/4000-watch-hours-planner",
    "/tools/views-to-watch-hours",
    "/tools/youtube-earnings-rpm",
    "/tools/title-tag-generator",
    "/tools/channel-growth-audit",
  ];

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1.0 : path === "/pricing" || path === "/how-it-works" ? 0.95 : 0.85,
  }));
}

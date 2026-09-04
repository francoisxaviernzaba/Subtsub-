import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/"], disallow: ["/admin", "/api/"] },
      { userAgent: "Googlebot", allow: ["/"] },
      { userAgent: "Googlebot-Image", allow: ["/"], disallow: ["/admin", "/api/"] },
      { userAgent: "Bingbot", allow: ["/"] },
      { userAgent: "GPTBot", allow: ["/"] },
      { userAgent: "ClaudeBot", allow: ["/"] },
      { userAgent: "PerplexityBot", allow: ["/"] },
      { userAgent: "Applebot", allow: ["/"] },
    ],
    sitemap: "https://sub2sub.com/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/marketplace", "/book", "/partners", "/privacy-policy", "/terms", "/support"];
  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date("2026-07-25"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/book" ? 0.9 : 0.5,
  }));
}

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/fpo", "/marketplace/cart", "/marketplace/checkout", "/marketplace/orders", "/marketplace/my-listings", "/marketplace/wishlist", "/marketplace/account", "/marketplace/sell", "/marketplace/notifications"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

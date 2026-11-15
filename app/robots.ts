import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

// Crawling stays allowed even on demo copies: search engines must be able to read the page to see
// its "noindex" tag. Only the real site advertises a sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(INDEXABLE && { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}

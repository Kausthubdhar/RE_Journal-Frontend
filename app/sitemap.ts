import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE ? [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }] : [];
}

import type { MetadataRoute } from "next";
import { siteUrl } from "../config/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-19T00:00:00.000Z");
  return [
    "/",
    "/product/",
    "/solutions/",
    "/pricing/",
    "/demo/",
    "/download/",
    "/privacy/",
    "/terms/",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/download/" ? 0.9 : 0.7,
  }));
}

import type { MetadataRoute } from "next";
import { company } from "@/config/company";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.seo.siteUrl;
  const routes = ["", "/a-propos", "/materiaux", "/realisations", "/contact"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}

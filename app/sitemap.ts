import type { MetadataRoute } from "next";
import { LIVE_STATIONS } from "../lib/worldState";

const siteUrl = "https://kether-warframe-database.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const livePages: MetadataRoute.Sitemap = LIVE_STATIONS.map((station) => ({
    url: `${siteUrl}/live/${station.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.75,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/notifications`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/live`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    ...livePages,
  ];
}

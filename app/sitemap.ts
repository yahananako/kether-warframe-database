import type { MetadataRoute } from "next";
import { LIVE_STATIONS } from "../lib/worldState";
import { questSeries } from "../data/questSeries";
import { sideStoryEras } from "../data/sideStoryFlow";
import { storyChapters } from "../data/storyFlow";

const siteUrl = "https://kether-warframe-database.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const livePages: MetadataRoute.Sitemap = LIVE_STATIONS.map((station) => ({
    url: `${siteUrl}/live/${station.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.75,
  }));

  const storyPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/story`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/story/side`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${siteUrl}/story/series`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.76,
    },
    ...storyChapters.flatMap((chapter) => [
      {
        url: `${siteUrl}/story/${chapter.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...chapter.passages.map((passage) => ({
        url: `${siteUrl}/story/${chapter.slug}/${passage.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.62,
      })),
    ]),
    ...sideStoryEras.flatMap((era) => [
      {
        url: `${siteUrl}/story/side/${era.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.66,
      },
      ...era.stories.map((story) => ({
        url: `${siteUrl}/story/side/${era.slug}/${story.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]),
    ...questSeries.map((series) => ({
      url: `${siteUrl}/story/series/${series.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.68,
    })),
  ];

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
    ...storyPages,
  ];
}

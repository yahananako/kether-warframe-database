import rawData from "./questSeries.json";

export type QuestSeriesEpisode = {
  number: string;
  title: string;
  description: string;
  href: string;
};

export type QuestSeries = {
  slug: string;
  number: string;
  title: string;
  englishTitle: string;
  era: string;
  deck: string;
  accent: string;
  heroImage: string;
  episodes: QuestSeriesEpisode[];
};

const data = rawData as { updatedAt: string; series: QuestSeries[] };

export const QUEST_SERIES_UPDATED_AT = data.updatedAt;
export const questSeries = data.series;
export const getQuestSeries = (slug: string) =>
  questSeries.find((series) => series.slug === slug);

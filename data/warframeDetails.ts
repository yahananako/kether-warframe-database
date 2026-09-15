import rawData from "./warframeDetails.generated.json";

export type WarframeAbilityDetail = {
  number: number;
  name: string;
  description: string;
  imageUrl: string;
};

export type WarframeDropDetail = {
  location: string;
  chance: number | null;
  rarity: string;
};

export type WarframeComponentDetail = {
  name: string;
  drops: WarframeDropDetail[];
};

export type WarframeDetail = {
  slug: string;
  name: string;
  description: string;
  passiveDescription: string;
  imageUrl: string;
  officialUrl: string;
  hasPrime: boolean;
  marketSlug: string;
  stats: {
    health: number;
    shield: number;
    armor: number;
    energy: number;
    sprint: number;
  };
  abilities: WarframeAbilityDetail[];
  components: WarframeComponentDetail[];
};

type WarframeDetailData = {
  source: string;
  updatedAt: string;
  warframes: WarframeDetail[];
};

const data = rawData as WarframeDetailData;

export const WARFRAME_DETAILS_UPDATED_AT = data.updatedAt;
export const WARFRAME_DETAILS_SOURCE = data.source;
export const warframeDetails = data.warframes;
export const warframeDetailMap = new Map(
  warframeDetails.map((warframe) => [warframe.slug, warframe]),
);

export function toWarframeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\bprime\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getWarframeDetail(slugOrName: string) {
  return warframeDetailMap.get(toWarframeSlug(slugOrName));
}

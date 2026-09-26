import catalogJson from "./incarnonWeapons.generated.json";

export type IncarnonCategory = "primary" | "secondary" | "melee";
export type IncarnonKind = "genesis" | "natural";

export type IncarnonAbility = {
  name: string;
  description: string;
  notes?: string;
  variantValues?: Record<string, string>;
};

export type IncarnonEvolution = {
  tier: number;
  unlockCondition: {
    zh: string;
    en: string;
  };
  abilities: IncarnonAbility[];
};

export type IncarnonWeapon = {
  id: string;
  name: string;
  nameZh: string;
  category: IncarnonCategory;
  kind: IncarnonKind;
  rotation: number | null;
  image: string;
  effect: {
    zh: string;
    en: string;
  };
  evolutions: IncarnonEvolution[];
  sourceUrl: string;
};

export type IncarnonCatalog = {
  generatedAt: string;
  source: {
    name: string;
    wiki: string;
    localization: string;
  };
  totals: {
    all: number;
    primary: number;
    secondary: number;
    melee: number;
    genesis: number;
    natural: number;
  };
  weapons: IncarnonWeapon[];
};

export const incarnonCatalog = catalogJson as IncarnonCatalog;


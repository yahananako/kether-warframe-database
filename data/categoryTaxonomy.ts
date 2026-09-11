import type { SheetRow } from "../lib/sheets";

export type ClassifiedDatabaseCategory =
  | "primary"
  | "secondary"
  | "melee"
  | "companions"
  | "archwing";

export type CategoryGroup = {
  key: string;
  label: string;
  description: string;
  accent: "violet" | "pink" | "cyan" | "gold" | "green" | "red";
  patterns: RegExp[];
};

const weaponGroups = (weaponLabel: string): CategoryGroup[] => [
  {
    key: "prime",
    label: `Prime ${weaponLabel}`,
    description: "虛空遺物與 Prime 復興系列",
    accent: "gold",
    patterns: [/prime/i, /p版/i],
  },
  {
    key: "kuva",
    label: `赤毒${weaponLabel}`,
    description: "赤毒玄骸持有的變體武器",
    accent: "red",
    patterns: [/赤毒/i, /kuva/i],
  },
  {
    key: "tenet",
    label: `信條${weaponLabel}`,
    description: "帕爾沃斯姊妹與 Ergo Glast 系列",
    accent: "cyan",
    patterns: [/信條/i, /tenet/i],
  },
  {
    key: "incarnon",
    label: `靈化${weaponLabel}`,
    description: "靈化武器與靈化轉接器玩法",
    accent: "green",
    patterns: [/靈化/i, /incarnon/i],
  },
  {
    key: "standard",
    label: `一般${weaponLabel}`,
    description: "商店、氏族、任務與一般掉落",
    accent: "violet",
    patterns: [],
  },
];

export const CATEGORY_TAXONOMY: Record<
  ClassifiedDatabaseCategory,
  CategoryGroup[]
> = {
  primary: weaponGroups("主要武器"),
  secondary: weaponGroups("次要武器"),
  melee: weaponGroups("近戰武器"),
  companions: [
    {
      key: "sentinel",
      label: "守護",
      description: "Sentinel 與 Prime 守護",
      accent: "cyan",
      patterns: [/守護/i, /sentinel/i, /carrier|dethcube|diriga|djinn|helios|nautilus|oxylus|shade|taxon|wyrm/i],
    },
    {
      key: "moa",
      label: "恐鳥",
      description: "Fortuna 模組化 MOA",
      accent: "gold",
      patterns: [/恐鳥/i, /\bmoa\b/i],
    },
    {
      key: "hound",
      label: "獵犬",
      description: "帕爾沃斯姊妹的模組化獵犬",
      accent: "violet",
      patterns: [/獵犬/i, /hound/i],
    },
    {
      key: "kubrow",
      label: "庫狛",
      description: "庫狛與 Helminth 疾衝者",
      accent: "green",
      patterns: [/庫狛/i, /kubrow/i, /helminth charger/i],
    },
    {
      key: "kavat",
      label: "庫娃",
      description: "庫娃與基因印記孵化系列",
      accent: "pink",
      patterns: [/庫娃/i, /kavat/i],
    },
    {
      key: "vulpaphyla",
      label: "擬狐獸",
      description: "Crescent、Panzer、Sly 擬狐獸",
      accent: "red",
      patterns: [/擬狐獸/i, /vulpaphyla/i, /狐帕菲拉/i],
    },
    {
      key: "predasite",
      label: "孤生獸",
      description: "Medjay、Pharaoh、Vizier 孤生獸",
      accent: "violet",
      patterns: [/孤生獸/i, /predasite/i, /感染獸/i],
    },
    {
      key: "companion-weapon",
      label: "同伴武器",
      description: "守護與同伴使用的專屬武器",
      accent: "cyan",
      patterns: [/同伴武器/i, /companion weapon/i, /burst laser|deconstructor|deth machine rifle|sweeper|verglas/i],
    },
    {
      key: "special",
      label: "特殊同伴",
      description: "專屬、活動與其他特殊同伴",
      accent: "gold",
      patterns: [],
    },
  ],
  archwing: [
    {
      key: "kuva-archgun",
      label: "赤毒曲翼槍",
      description: "赤毒玄骸持有的 Arch-Gun",
      accent: "red",
      patterns: [/赤毒/i, /kuva/i],
    },
    {
      key: "necramech-exalted",
      label: "亡骸專屬武器",
      description: "亡骸機甲技能內建武器",
      accent: "pink",
      patterns: [/亡靈專屬/i, /亡骸專屬/i, /arquebex/i, /ironbride/i, /鉤爪火銃/i, /鐵娘子/i],
    },
    {
      key: "arch-melee",
      label: "曲翼近戰",
      description: "零重力近戰武器",
      accent: "gold",
      patterns: [/曲翼近戰/i, /arch-melee/i],
    },
    {
      key: "archgun",
      label: "曲翼槍",
      description: "Arch-Gun 與亡骸機甲重型武器",
      accent: "cyan",
      patterns: [/曲翼槍/i, /arch-gun/i, /亡靈武器/i, /亡骸武器/i],
    },
    {
      key: "necramech",
      label: "亡骸機甲",
      description: "骨寡婦與虛空魂",
      accent: "violet",
      patterns: [/亡靈機甲/i, /亡骸機甲/i, /necramech/i, /bonewidow/i, /voidrig/i, /骨寡婦/i, /虛空魂/i],
    },
    {
      key: "archwing",
      label: "曲翼",
      description: "可裝備的 Archwing 機體",
      accent: "green",
      patterns: [],
    },
  ],
};

export function supportsCategoryTaxonomy(
  category: string,
): category is ClassifiedDatabaseCategory {
  return category in CATEGORY_TAXONOMY;
}

export function classifyDatabaseRow(category: string, row: SheetRow) {
  if (!supportsCategoryTaxonomy(category)) {
    return {
      key: row.section || "uncategorized",
      label: row.section || "未分類",
      description: "資料表原始區塊",
      accent: "violet" as const,
      patterns: [],
    };
  }

  const groups = CATEGORY_TAXONOMY[category];
  const haystack = [
    row.section,
    row.chineseName,
    row.englishName,
    row.source,
    ...(row.aliases || []),
  ].join(" ");

  return groups.find((group) =>
    group.patterns.some((pattern) => pattern.test(haystack)),
  ) ?? groups[groups.length - 1];
}

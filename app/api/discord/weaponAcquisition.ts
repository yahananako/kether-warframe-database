import {
  WEAPON_ACQUISITION_DATA,
  WEAPON_SERIES_CHOICES,
  WEAPON_TYPE_CHOICES,
} from "./data/weapons";
import type { WeaponAcquisitionRecord } from "./data/weapons";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll("_", "")
    .replaceAll("/", "")
    .replaceAll("／", "")
    .trim();
}

function getEnglishName(record: WeaponAcquisitionRecord) {
  return record.name.split(" / ")[0] ?? record.name;
}

function normalizeFilter(value: string | null | undefined) {
  const normalized = normalize(String(value ?? ""));

  if (!normalized || normalized === "all" || normalized === "全部") return "all";

  const typeChoice = WEAPON_TYPE_CHOICES.find((choice) => {
    return normalize(choice.value) === normalized || normalize(choice.name) === normalized;
  });

  if (typeChoice) return typeChoice.value;

  const seriesChoice = WEAPON_SERIES_CHOICES.find((choice) => {
    return normalize(choice.value) === normalized || normalize(choice.name) === normalized;
  });

  if (seriesChoice) return seriesChoice.value;

  return String(value ?? "").trim();
}

function getSearchableValues(record: WeaponAcquisitionRecord) {
  return [
    record.key,
    record.name,
    getEnglishName(record),
    record.weaponType,
    record.weaponTypeKey,
    record.series,
    record.seriesKey,
    record.source,
    record.parts,
    record.tips,
    record.notes,
    ...record.aliases,
  ];
}

function recordMatchesFilters(
  record: WeaponAcquisitionRecord,
  rawWeaponType: string | null | undefined,
  rawSeries: string | null | undefined,
) {
  const weaponType = normalizeFilter(rawWeaponType);
  const series = normalizeFilter(rawSeries);

  if (weaponType !== "all" && normalize(record.weaponTypeKey) !== normalize(weaponType)) return false;
  if (series !== "all" && normalize(record.seriesKey) !== normalize(series)) return false;

  return true;
}

function findWeapon(
  query: string,
  rawWeaponType: string | null | undefined,
  rawSeries: string | null | undefined,
) {
  const normalized = normalize(query);

  if (!normalized) return null;

  const filtered = WEAPON_ACQUISITION_DATA.filter((record) =>
    recordMatchesFilters(record, rawWeaponType, rawSeries),
  );

  const exactMatch = filtered.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value === normalized);
  });

  if (exactMatch) return exactMatch;

  return filtered.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value.includes(normalized));
  });
}

function buildWeaponListPreview() {
  const grouped = WEAPON_ACQUISITION_DATA.reduce<Record<string, string[]>>((acc, record) => {
    const key = `${record.weaponType}｜${record.series}`;
    acc[key] ??= [];
    acc[key].push(record.name);

    return acc;
  }, {});

  return Object.entries(grouped)
    .slice(0, 8)
    .map(([category, names]) => {
      return `【${category}】\n${names.slice(0, 6).map((name) => `・${name}`).join("\n")}`;
    })
    .join("\n\n");
}

function formatChoiceName(record: WeaponAcquisitionRecord) {
  return `${record.name}｜${record.weaponType}｜${record.series}`;
}

export function searchWeaponAcquisitionChoices(
  rawQuery: string | null | undefined,
  rawWeaponType?: string | null,
  rawSeries?: string | null,
) {
  const query = normalize(String(rawQuery ?? ""));

  const scored = WEAPON_ACQUISITION_DATA
    .filter((record) => recordMatchesFilters(record, rawWeaponType, rawSeries))
    .map((record) => {
      const searchable = getSearchableValues(record).map(normalize);
      const exact = searchable.some((value) => value === query);
      const startsWith = searchable.some((value) => query && value.startsWith(query));
      const includes = searchable.some((value) => query && value.includes(query));

      let score = 0;

      if (!query) score = 1;
      else if (exact) score = 100;
      else if (startsWith) score = 80;
      else if (includes) score = 50;

      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
    .slice(0, 25);

  return scored.map(({ record }) => ({
    name: formatChoiceName(record).slice(0, 100),
    value: getEnglishName(record).slice(0, 100),
  }));
}

export function buildWeaponAcquisitionResponse(
  rawName: string | null | undefined,
  rawWeaponType?: string | null,
  rawSeries?: string | null,
) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    return {
      embeds: [
        {
          title: "⚔️ 武器取得查詢",
          description:
            "請輸入要查詢的武器名稱喵。\n\n" +
            buildWeaponListPreview() +
            "\n\n範例：`/武器取得 名稱:托里德`、`/武器取得 名稱:兇惡`、`/武器取得 名稱:Glaive Prime`",
          color: 0xd6b36a,
          footer: {
            text: "E-14｜武器資料新增＋類型分類＋系列分類＋中文自動補全",
          },
        },
      ],
    };
  }

  const record = findWeapon(name, rawWeaponType, rawSeries);

  if (!record) {
    const examples = WEAPON_ACQUISITION_DATA
      .filter((item) => recordMatchesFilters(item, rawWeaponType, rawSeries))
      .slice(0, 16)
      .map((item) => item.name)
      .join("、");

    return {
      content:
        `找不到「${name}」的武器取得資料喵。\n\n` +
        `可以試試中文、英文或綽號，例如：${examples || "Torid / 托里德、Laetum / 兇惡終結者"}\n\n` +
        "也可以輸入前兩個字使用自動補全。",
    };
  }

  return {
    embeds: [
      {
        title: `⚔️ ${record.name}`,
        description: "KETHER Warframe Database｜武器取得方式",
        color: 0xd6b36a,
        fields: [
          {
            name: "類型",
            value: record.weaponType,
          },
          {
            name: "系列",
            value: record.series,
          },
          {
            name: "取得方式",
            value: record.source,
          },
          {
            name: "製作／部件",
            value: record.parts,
          },
          {
            name: "小希建議",
            value: record.tips,
          },
          {
            name: "備註",
            value: record.notes,
          },
        ],
        footer: {
          text: "E-14｜武器資料新增＋類型分類＋系列分類＋中文自動補全",
        },
      },
    ],
  };
}

import {
  WEAPON_SERIES_CHOICES,
  WEAPON_TYPE_CHOICES,
} from "./data/weapons";
import type { WeaponAcquisitionRecord } from "./data/weapons";
import { ALL_WEAPON_ACQUISITION_DATA } from "./data/allWeapons";

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

  const filtered = ALL_WEAPON_ACQUISITION_DATA.filter((record) =>
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
  const grouped = ALL_WEAPON_ACQUISITION_DATA.reduce<Record<string, string[]>>((acc, record) => {
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

async function getMarketPriceText(record: WeaponAcquisitionRecord) {
  if (record.marketKind !== "lich" || !record.marketSlug) {
    return record.price || (record.marketUrl ? "價格待更新" : "不可交易");
  }

  try {
    const response = await fetch(
      `https://api.warframe.market/v1/auctions/search?type=lich&weapon_url_name=${encodeURIComponent(record.marketSlug)}&buyout_policy=direct&sort_by=price_asc`,
      {
        headers: {
          Accept: "application/json",
          Platform: "pc",
          "User-Agent": "KETHER-Discord-BOT price lookup",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(2_000),
      },
    );

    if (!response.ok) return "即時價格暫時無法取得";

    const payload = await response.json();
    const auctions = Array.isArray(payload?.payload?.auctions) ? payload.payload.auctions : [];
    const prices = auctions
      .filter((auction: any) => {
        const status = auction?.owner?.status;
        return auction?.visible !== false &&
          auction?.closed !== true &&
          auction?.private !== true &&
          auction?.is_direct_sell !== false &&
          (status === "online" || status === "ingame");
      })
      .map((auction: any) => Number(auction?.buyout_price ?? auction?.starting_price ?? 0))
      .filter((price: number) => Number.isFinite(price) && price > 0)
      .sort((left: number, right: number) => left - right);

    return prices[0]
      ? `${prices[0]} 白金（最低線上玄骸拍賣）`
      : "目前沒有線上玄骸拍賣";
  } catch {
    return "即時價格暫時無法取得";
  }
}

export function searchWeaponAcquisitionChoices(
  rawQuery: string | null | undefined,
  rawWeaponType?: string | null,
  rawSeries?: string | null,
) {
  const query = normalize(String(rawQuery ?? ""));

  const scored = ALL_WEAPON_ACQUISITION_DATA
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

export async function buildWeaponAcquisitionResponse(
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
    const examples = ALL_WEAPON_ACQUISITION_DATA
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

  const priceText = await getMarketPriceText(record);

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
          {
            name: record.marketKind === "lich" ? "玄骸拍賣參考" : "白金參考",
            value: priceText,
          },
          ...(record.marketUrl
            ? [{
              name: "交易頁",
              value: `[開啟 Warframe Market${record.marketKind === "lich" ? " 玄骸拍賣" : ""}](${record.marketUrl})${record.tradeNote ? `\n${record.tradeNote}` : ""}`,
            }]
            : []),
        ],
        footer: {
          text: "E-15｜赤毒武器系列＋玄骸拍賣價＋交易連結",
        },
      },
    ],
  };
}

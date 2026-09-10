import { EQUIPMENT_CATALOG } from "../../../../data/equipmentCatalog.generated";
import { KUVA_WEAPONS } from "../../../../data/kuvaWeapons.generated";
import {
  WEAPON_ACQUISITION_DATA,
  type WeaponAcquisitionRecord,
} from "./weapons";

type CatalogWeapon = (typeof EQUIPMENT_CATALOG)[number] | (typeof KUVA_WEAPONS)[number];

function recordKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function marketSlugFromUrl(value: string) {
  const url = String(value || "");

  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("weapon_url_name") || parsed.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return "";
  }
}

function catalogToRecord(item: CatalogWeapon): WeaponAcquisitionRecord {
  const isPrime = /\bPrime\b/i.test(item.englishName);
  const detailed = "weaponType" in item;
  const marketSlug = "marketSlug" in item
    ? item.marketSlug
    : marketSlugFromUrl(item.marketUrl);
  const marketKind = "marketKind" in item
    ? item.marketKind
    : item.marketUrl
      ? "item"
      : undefined;

  return {
    key: recordKey(item.englishName),
    name: `${item.englishName} / ${item.chineseName}`,
    aliases: item.aliases || [],
    weaponType: detailed ? item.weaponType : item.section,
    weaponTypeKey: detailed ? item.weaponTypeKey : item.category,
    series: detailed ? item.series : isPrime ? "P版 / Prime" : item.section,
    seriesKey: detailed ? item.seriesKey : isPrime ? "prime" : item.category,
    source: item.source,
    parts: detailed
      ? item.parts
      : item.marketUrl
        ? "可開啟 Warframe Market 查看可交易套裝或部件。"
        : "依遊戲內來源取得或製作。",
    tips: detailed ? item.tips : item.description,
    notes: detailed ? item.notes : item.note,
    price: item.price,
    marketUrl: item.marketUrl,
    marketKind,
    marketSlug,
    marketName: "marketName" in item ? item.marketName : item.englishName,
    tradeNote: "tradeNote" in item
      ? item.tradeNote
      : item.marketUrl
        ? "白金價格為 Warframe Market 的 PC 參考價。"
        : "此物品目前不可交易。",
  };
}

function buildAllWeaponRecords() {
  const records = new Map<string, WeaponAcquisitionRecord>();

  for (const record of WEAPON_ACQUISITION_DATA.filter(Boolean)) {
    records.set(recordKey(record.name.split(/\s*\/\s*/)[0] || record.key), record);
  }

  for (const item of EQUIPMENT_CATALOG) {
    records.set(recordKey(item.englishName), catalogToRecord(item));
  }

  // 赤毒清單最後寫入，讓官方公開匯出的繁中名稱與最新武器資料成為唯一結果。
  for (const item of KUVA_WEAPONS) {
    records.set(recordKey(item.englishName), catalogToRecord(item));
  }

  return [...records.values()];
}

export const ALL_WEAPON_ACQUISITION_DATA = buildAllWeaponRecords();

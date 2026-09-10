import { NextRequest, NextResponse } from "next/server";
import { WEAPON_ACQUISITION_DATA } from "../../discord/data/weapons";
import { EQUIPMENT_CATALOG } from "../../../../data/equipmentCatalog.generated";

type AnyWeaponRecord = Record<string, unknown>;

function catalogRecordKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getWeaponRecords(): AnyWeaponRecord[] {
  const records = new Map<string, AnyWeaponRecord>();

  for (const record of (WEAPON_ACQUISITION_DATA as AnyWeaponRecord[]).filter(Boolean)) {
    const key = String(record.key || catalogRecordKey(String(record.name || "")));
    records.set(key, record);
  }

  for (const item of EQUIPMENT_CATALOG) {
    const key = catalogRecordKey(item.englishName);
    records.set(key, {
      key,
      name: `${item.chineseName} / ${item.englishName}`,
      aliases: item.aliases,
      weaponType: item.section,
      weaponTypeKey: item.category,
      series: / Prime$/i.test(item.englishName) ? "P版 / Prime" : item.section,
      seriesKey: / Prime$/i.test(item.englishName) ? "prime" : item.category,
      source: item.source,
      parts: item.marketUrl ? "可開啟 Warframe Market 查看可交易套裝或部件。" : "依遊戲內來源取得或製作。",
      tips: item.description,
      notes: item.note,
      price: item.price,
      marketUrl: item.marketUrl,
      marketSlug: item.marketUrl.split("/").filter(Boolean).pop() ?? "",
      marketName: item.englishName,
      tradeNote: item.marketUrl ? "白金價格為 Warframe Market 的 PC 參考價。" : "",
    });
  }

  return [...records.values()];
}

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[｜|／/\\:_\-・，,。.\[\]()（）]/g, "");
}

function pickText(record: AnyWeaponRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join("、");
      if (joined.trim()) return joined;
    }

    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

function getSearchValues(record: AnyWeaponRecord) {
  return Object.values(record)
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      return [value];
    })
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map(normalize);
}

function getDetailRows(record: AnyWeaponRecord) {
  const rows = [
    {
      label: "取得方式",
      value: pickText(record, [
        "acquisition",
        "acquisitionMethod",
        "source",
        "sources",
        "dropSource",
        "obtain",
        "howToGet",
        "location",
      ]),
    },
    {
      label: "製作／部件",
      value: pickText(record, [
        "parts",
        "components",
        "crafting",
        "blueprint",
        "materials",
        "requirements",
      ]),
    },
    {
      label: "小希建議",
      value: pickText(record, [
        "recommendation",
        "recommendations",
        "tips",
        "tip",
        "advice",
        "suggestion",
      ]),
    },
    {
      label: "備註",
      value: pickText(record, ["notes", "note", "remark", "remarks"]),
    },
  ].filter((row) => row.value);

  if (rows.length > 0) return rows;

  return Object.entries(record)
    .filter(([key, value]) => {
      if (["name", "weaponType", "weaponTypeKey", "series", "seriesKey"].includes(key)) {
        return false;
      }

      return typeof value === "string" && value.trim();
    })
    .slice(0, 4)
    .map(([key, value]) => ({
      label: key,
      value: String(value),
    }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return NextResponse.json({
      query,
      count: 0,
      results: [],
    });
  }

  const records = getWeaponRecords()
    .map((record) => {
      const searchable = getSearchValues(record);

      const exact = searchable.some((value) => value === normalizedQuery);
      const startsWith = searchable.some((value) => value.startsWith(normalizedQuery));
      const includes = searchable.some((value) => value.includes(normalizedQuery));

      let score = 0;
      if (exact) score += 100;
      if (startsWith) score += 60;
      if (includes) score += 25;

      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      return String(a.record.name ?? "").localeCompare(String(b.record.name ?? ""), "zh-Hant");
    })
    .slice(0, 1)
    .map(({ record }) => ({
      name: String(record.name ?? "未命名武器"),
      weaponType: String(record.weaponType ?? "未分類"),
      series: String(record.series ?? "未分類"),
      details: getDetailRows(record),
      price: String(record.price ?? ""),
      marketUrl: String(record.marketUrl ?? ""),
      marketSlug: String(record.marketSlug ?? ""),
      marketName: String(record.marketName ?? ""),
      tradeNote: String(record.tradeNote ?? ""),
    }));

  return NextResponse.json({
    query,
    count: records.length,
    results: records,
  });
}

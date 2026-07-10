import { NextRequest, NextResponse } from "next/server";
import { WARFRAME_ACQUISITION_DATA } from "../../discord/data/warframes";

type AnyWarframeRecord = Record<string, unknown>;

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[｜|／/\\:_\-・，,。.\[\]()（）]/g, "");
}

function pickText(record: AnyWarframeRecord, keys: string[]) {
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

function getSearchValues(record: AnyWarframeRecord) {
  return [
    record.key,
    record.name,
    record.category,
    record.source,
    record.parts,
    record.tips,
    record.notes,
    ...(Array.isArray(record.aliases) ? record.aliases : []),
  ].map(normalize);
}

function getDetailRows(record: AnyWarframeRecord) {
  return [
    { label: "分類", value: pickText(record, ["category"]) },
    { label: "取得方式", value: pickText(record, ["source"]) },
    { label: "部件來源", value: pickText(record, ["parts"]) },
    { label: "小希建議", value: pickText(record, ["tips"]) },
    { label: "備註", value: pickText(record, ["notes"]) },
  ].filter((row) => row.value);
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

  const records = (WARFRAME_ACQUISITION_DATA as AnyWarframeRecord[])
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
    .slice(0, 12)
    .map(({ record }) => ({
      name: String(record.name ?? "未命名戰甲"),
      category: String(record.category ?? "未分類"),
      details: getDetailRows(record),
    }));

  return NextResponse.json({
    query,
    count: records.length,
    results: records,
  });
}

import { MATERIAL_ACQUISITION_DATA } from "./data/materials";
import type { MaterialAcquisitionRecord } from "./data/materials";



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

function getEnglishName(record: MaterialAcquisitionRecord) {
  return record.name.split(" / ")[0] ?? record.name;
}

function getSearchableValues(record: MaterialAcquisitionRecord) {
  return [record.key, record.name, getEnglishName(record), record.category, record.source, record.recommended, ...record.aliases];
}

function findMaterial(query: string) {
  const normalized = normalize(query);

  if (!normalized) return null;

  const exactMatch = MATERIAL_ACQUISITION_DATA.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value === normalized);
  });

  if (exactMatch) return exactMatch;

  return MATERIAL_ACQUISITION_DATA.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value.includes(normalized));
  });
}

function buildMaterialListPreview() {
  const grouped = MATERIAL_ACQUISITION_DATA.reduce<Record<string, string[]>>((acc, record) => {
    acc[record.category] ??= [];
    acc[record.category].push(record.name);

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, names]) => {
      return `【${category}】\n${names.slice(0, 8).map((name) => `・${name}`).join("\n")}`;
    })
    .join("\n\n");
}

export function searchMaterialAcquisitionChoices(rawQuery: string | null | undefined) {
  const query = normalize(String(rawQuery ?? ""));

  const scored = MATERIAL_ACQUISITION_DATA.map((record) => {
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
    name: record.name.slice(0, 100),
    value: getEnglishName(record).slice(0, 100),
  }));
}

export function buildMaterialAcquisitionResponse(rawName: string | null | undefined) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    return {
      embeds: [
        {
          title: "🌿 材料取得查詢",
          description:
            "請輸入要查詢的材料名稱喵。\n\n" +
            buildMaterialListPreview() +
            "\n\n範例：`/材料取得 名稱:碲`、`/材料取得 名稱:赤毒`、`/材料取得 名稱:電路`",
          color: 0x9bd67b,
          footer: {
            text: "E-9｜材料資料擴充＋中文搜尋＋中文自動補全",
          },
        },
      ],
    };
  }

  const record = findMaterial(name);

  if (!record) {
    const examples = MATERIAL_ACQUISITION_DATA.slice(0, 16)
      .map((item) => item.name)
      .join("、");

    return {
      content:
        `找不到「${name}」的材料取得資料喵。\n\n` +
        `可以試試中文或英文關鍵字，例如：${examples}\n\n` +
        "也可以輸入前兩個字使用自動補全。",
    };
  }

  return {
    embeds: [
      {
        title: `🌿 ${record.name}`,
        description: "KETHER Warframe Database｜材料取得方式",
        color: 0x9bd67b,
        fields: [
          {
            name: "分類",
            value: record.category,
          },
          {
            name: "主要來源",
            value: record.source,
          },
          {
            name: "推薦刷法",
            value: record.recommended,
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
          text: "E-9｜材料資料擴充＋中文搜尋＋中文自動補全",
        },
      },
    ],
  };
}

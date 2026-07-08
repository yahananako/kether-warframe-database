import { WARFRAME_ACQUISITION_DATA } from "./data/warframes";
import type { WarframeAcquisitionRecord } from "./data/warframes";



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

function getEnglishName(record: WarframeAcquisitionRecord) {
  return record.name.split(" / ")[0] ?? record.name;
}

function getSearchableValues(record: WarframeAcquisitionRecord) {
  return [
    record.key,
    record.name,
    getEnglishName(record),
    record.category,
    record.source,
    record.parts,
    record.tips,
    record.notes,
    ...record.aliases,
  ];
}

function findWarframe(query: string) {
  const normalized = normalize(query);

  if (!normalized) return null;

  const exactMatch = WARFRAME_ACQUISITION_DATA.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value === normalized);
  });

  if (exactMatch) return exactMatch;

  return WARFRAME_ACQUISITION_DATA.find((record) => {
    const searchable = getSearchableValues(record).map(normalize);

    return searchable.some((value) => value.includes(normalized));
  });
}

function buildWarframeListPreview() {
  const grouped = WARFRAME_ACQUISITION_DATA.reduce<Record<string, string[]>>((acc, record) => {
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

export function searchWarframeAcquisitionChoices(rawQuery: string | null | undefined) {
  const query = normalize(String(rawQuery ?? ""));

  const scored = WARFRAME_ACQUISITION_DATA.map((record) => {
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

export function buildWarframeAcquisitionResponse(rawName: string | null | undefined) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    return {
      embeds: [
        {
          title: "⚔️ 戰甲取得查詢",
          description:
            "請輸入要查詢的戰甲名稱喵。\n\n" +
            buildWarframeListPreview() +
            "\n\n範例：`/戰甲取得 名稱:Rhino`、`/戰甲取得 名稱:摸屍`、`/戰甲取得 名稱:蝶甲`",
          color: 0xf6a6d8,
          footer: {
            text: "E-10｜戰甲資料擴充＋中文搜尋＋中文自動補全",
          },
        },
      ],
    };
  }

  const record = findWarframe(name);

  if (!record) {
    const examples = WARFRAME_ACQUISITION_DATA.slice(0, 18)
      .map((item) => item.name)
      .join("、");

    return {
      content:
        `找不到「${name}」的戰甲取得資料喵。\n\n` +
        `可以試試中文、英文或綽號，例如：${examples}\n\n` +
        "也可以輸入前兩個字使用自動補全。",
    };
  }

  return {
    embeds: [
      {
        title: `⚔️ ${record.name}`,
        description: "KETHER Warframe Database｜戰甲取得方式",
        color: 0xf6a6d8,
        fields: [
          {
            name: "分類",
            value: record.category,
          },
          {
            name: "取得方式",
            value: record.source,
          },
          {
            name: "部件來源",
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
          text: "E-10｜戰甲資料擴充＋中文搜尋＋中文自動補全",
        },
      },
    ],
  };
}

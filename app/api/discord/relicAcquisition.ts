type RelicAcquisitionRecord = {
  key: string;
  name: string;
  aliases: string[];
  category: string;
  source: string;
  recommended: string;
  tips: string;
  notes: string;
};

const RELIC_ACQUISITION_DATA: RelicAcquisitionRecord[] = [
  {
    key: "lith",
    name: "Lith Relic / 古紀核桃",
    aliases: ["lith", "古紀", "古纪", "古紀核桃", "古纪核桃", "古紀遺物", "古纪遗物", "l"],
    category: "虛空遺物 / Void Relic",
    source: "常見於低階星圖任務、Void 低階任務、部分防禦／挖掘／捕獲任務獎勵。",
    recommended: "Void Hepit 捕獲、低階挖掘或防禦任務。",
    tips: "想快速刷 Lith 類核桃，優先選能快速結算的捕獲任務。",
    notes: "若查的是特定核桃，例如 Lith S18，本版先回覆 Lith 類推薦刷法，後續可接精準掉落表。",
  },
  {
    key: "meso",
    name: "Meso Relic / 前紀核桃",
    aliases: ["meso", "前紀", "前纪", "前紀核桃", "前纪核桃", "前紀遺物", "前纪遗物", "m"],
    category: "虛空遺物 / Void Relic",
    source: "常見於中低階星圖任務、Void 中階任務、防禦、攔截、挖掘、捕獲等任務獎勵。",
    recommended: "Void Ukko 捕獲、木星 Io 防禦、土星 Helene 防禦。",
    tips: "想順便練武器可刷防禦；想拚速度可刷 Void 捕獲。",
    notes: "推薦點會依效率與隊伍配置不同調整。",
  },
  {
    key: "neo",
    name: "Neo Relic / 中紀核桃",
    aliases: ["neo", "中紀", "中纪", "中紀核桃", "中纪核桃", "中紀遺物", "中纪遗物", "n"],
    category: "虛空遺物 / Void Relic",
    source: "常見於中高階星圖、Void 中高階任務、中斷、攔截、防禦等任務獎勵。",
    recommended: "Void Ukko 捕獲、Sedna / 賽德娜 中斷、Eris / 鬩神星 Xini 攔截。",
    tips: "Neo 類可以跟 Axi 類一起順刷，依節點獎勵池調整。",
    notes: "若只想快刷，優先測 Void 捕獲效率。",
  },
  {
    key: "axi",
    name: "Axi Relic / 後紀核桃",
    aliases: ["axi", "後紀", "后纪", "後紀核桃", "后纪核桃", "後紀遺物", "后纪遗物", "a"],
    category: "虛空遺物 / Void Relic",
    source: "常見於高階星圖任務、中斷、攔截、高階防禦與部分賞金獎勵。",
    recommended: "Lua / 月球 Apollo 中斷、Eris / 鬩神星 Xini 攔截。",
    tips: "Axi 通常刷起來比較花時間，中斷效率常比慢速防禦漂亮。",
    notes: "建議組隊刷，效率會差很多。",
  },
  {
    key: "requiem",
    name: "Requiem Relic / 安魂核桃",
    aliases: ["requiem", "安魂", "安魂核桃", "安魂遺物", "安魂遗物", "安魂relic"],
    category: "特殊遺物",
    source: "主要來自 Kuva Siphon / Kuva Flood 相關內容與赤毒玄骸系統。",
    recommended: "Kuva Flood、Kuva Siphon 任務。",
    tips: "主要用於取得 Requiem Mods，處理 Kuva Lich / 赤毒玄骸時會用到。",
    notes: "這類不是一般 Prime 核桃，別跟 Lith / Meso / Neo / Axi 混在一起喵。",
  },
  {
    key: "aya",
    name: "Aya / 阿耶",
    aliases: ["aya", "阿耶", "aya核桃", "阿耶核桃"],
    category: "Prime Resurgence 相關資源",
    source: "可從部分遺物包、賞金與特定來源取得，主要用於 Prime Resurgence 相關兌換。",
    recommended: "賞金任務、遺物包相關來源。",
    tips: "如果目標是輪替 Prime 物品，要注意 Prime Resurgence 當期內容。",
    notes: "Aya 不是普通核桃，但跟核桃取得路線很接近，所以先放在這個指令裡。",
  },
  {
    key: "void-traces",
    name: "Void Traces / 虛空光體",
    aliases: ["void traces", "voidtrace", "虛空光體", "虚空光体", "光體", "光体", "精煉", "精炼"],
    category: "遺物精煉資源",
    source: "完成 Void Fissure / 虛空裂縫任務時取得。",
    recommended: "刷裂縫任務時順便累積。",
    tips: "用來把核桃精煉成 Exceptional、Flawless、Radiant，提高稀有獎勵機率。",
    notes: "這是開核桃會一起需要的資源，不是核桃本體。",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll("_", "")
    .replaceAll("/", "")
    .trim();
}

function detectTierFromSpecificRelic(query: string) {
  const normalized = normalize(query);

  if (normalized.startsWith("lith") || normalized.startsWith("古紀") || normalized.startsWith("古纪")) return "lith";
  if (normalized.startsWith("meso") || normalized.startsWith("前紀") || normalized.startsWith("前纪")) return "meso";
  if (normalized.startsWith("neo") || normalized.startsWith("中紀") || normalized.startsWith("中纪")) return "neo";
  if (normalized.startsWith("axi") || normalized.startsWith("後紀") || normalized.startsWith("后纪")) return "axi";
  if (normalized.startsWith("requiem") || normalized.startsWith("安魂")) return "requiem";

  return null;
}

function findRelic(query: string) {
  const normalized = normalize(query);
  const detectedTier = detectTierFromSpecificRelic(query);

  if (detectedTier) {
    return RELIC_ACQUISITION_DATA.find((record) => record.key === detectedTier);
  }

  return RELIC_ACQUISITION_DATA.find((record) => {
    if (normalize(record.name).includes(normalized)) return true;
    return record.aliases.some((alias) => normalize(alias) === normalized);
  });
}

export function searchRelicAcquisitionChoices(rawQuery: string | null | undefined) {
  const query = normalize(String(rawQuery ?? ""));

  const scored = RELIC_ACQUISITION_DATA.map((record) => {
    const searchable = [record.name, record.key, ...record.aliases].map(normalize);
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
    value: (record.aliases[0] ?? record.key).slice(0, 100),
  }));
}

export function buildRelicAcquisitionResponse(rawName: string | null | undefined) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    const list = RELIC_ACQUISITION_DATA.map((record) => `・${record.name}`).join("\n");

    return {
      content:
        "請輸入要查詢的核桃名稱或類型喵。\n\n" +
        "目前測試資料：\n" +
        list +
        "\n\n範例：`/核桃取得 名稱:Axi`、`/核桃取得 名稱:Lith S18`",
    };
  }

  const record = findRelic(name);

  if (!record) {
    const list = RELIC_ACQUISITION_DATA.map((item) => item.name).join("、");

    return {
      content:
        `找不到「${name}」的核桃取得資料喵。\n\n` +
        `目前可查：${list}`,
    };
  }

  return {
    embeds: [
      {
        title: `🥜 ${record.name}`,
        description: "KETHER Warframe Database｜核桃取得方式",
        color: 0xd6b36a,
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
          text: "E-4 測試版｜後續可接官方掉落表做精準核桃查詢",
        },
      },
    ],
  };
}

export type SheetRow = {
  section: string;
  chineseName: string;
  englishName: string;
  description: string;
  priority: string;
  price: string;
  tradeText: string;
  owned: string;
  source: string;
  note: string;
  marketUrl: string;
};

export const SHEET_ID = "1ll27z4P_9a9ly2HsxNJdOHW2mzTL8_BHUqLZUtxy9Lc";

export const SHEET_GIDS: Record<string, { gid: string; sheetName: string; title: string; subtitle: string }> = {
  overview: {
    gid: "2143967540",
    sheetName: "總覽",
    title: "總覽",
    subtitle: "總覽統計、完成度與資料庫狀態。"
  },
  warframes: {
    gid: "1252755294",
    sheetName: "戰甲",
    title: "戰甲",
    subtitle: "Prime 戰甲資料、用途、交易價格與取得方式。"
  },
  primary: {
    gid: "1365606609",
    sheetName: "主要武器",
    title: "主要武器",
    subtitle: "主要武器資料、交易價格與市場連結。"
  },
  secondary: {
    gid: "1587192708",
    sheetName: "次要武器",
    title: "次要武器",
    subtitle: "次要武器資料、交易價格與市場連結。"
  },
  melee: {
    gid: "1282903836",
    sheetName: "近戰武器",
    title: "近戰武器",
    subtitle: "近戰武器資料、交易價格與市場連結。"
  },
  companions: {
    gid: "674918338",
    sheetName: "同伴",
    title: "同伴",
    subtitle: "同伴、寵物與相關裝備資料。"
  },
  archwing: {
    gid: "1952688920",
    sheetName: "曲翼",
    title: "曲翼",
    subtitle: "曲翼、曲翼武器、亡靈骸甲與相關資料。"
  },
  mods: {
    gid: "2143967540",
    sheetName: "多分頁彙整",
    title: "MOD資料庫",
    subtitle: "暫時從各資料分頁中彙整疑似 MOD 資料，之後可改接獨立 MOD 分頁。"
  }
};

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows;
}

function makeSlugBase(name: string): string {
  return name
    .trim()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function shouldUseSetLink(name: string, category: string): boolean {
  if (!name.includes(" Prime")) return false;
  if (name.startsWith("Primed ")) return false;
  if (category === "mods") return false;

  return ["warframes", "primary", "secondary", "melee", "companions", "archwing"].includes(category);
}

function toMarketSlug(name: string, category: string): string {
  const base = makeSlugBase(name);
  if (!base) return "";

  if (shouldUseSetLink(name, category) && !base.endsWith("_set")) {
    return `${base}_set`;
  }

  return base;
}

function isMetaText(value: string): boolean {
  const blockedKeywords = [
    "製作者",
    "ヤハ奈々子",
    "Clan Database Core",
    "KETHER OF PARADISO",
    "網站版本",
    "使用說明",
    "更新日期",
    "目前資料數",
    "資料來源",
    "Discord 入口",
    "完成度",
    "多群組支援"
  ];

  return blockedKeywords.some((keyword) => value.includes(keyword));
}

function cleanSectionName(value: string): string {
  const cleaned = value
    .replace(/^[\s▣■◆●▶▷◇★☆\-—=【\[]+/g, "")
    .replace(/[】\]]+$/g, "")
    .trim();

  return cleaned || "未分類";
}

function detectSectionTitle(row: string[]): string | null {
  const first = String(row[0] || "").trim();
  const second = String(row[1] || "").trim();
  const rest = row.slice(1).map((cell) => String(cell || "").trim());
  const nonEmptyRest = rest.filter(Boolean);

  if (!first) return null;
  if (isMetaText(first)) return null;
  if (first === "中文名" || second === "英文名") return null;

  const hasMarker = /^[▣■◆●▶▷◇★☆【\[]/.test(first);
  const onlyFirstCell = nonEmptyRest.length === 0;

  if (hasMarker || onlyFirstCell) {
    return cleanSectionName(first);
  }

  return null;
}

function isHeaderOrFooterRow(row: SheetRow): boolean {
  const joined = [
    row.section,
    row.chineseName,
    row.englishName,
    row.description,
    row.priority,
    row.price,
    row.tradeText,
    row.owned,
    row.source,
    row.note
  ].join(" ").trim();

  if (isMetaText(joined)) return true;
  if (!row.chineseName || !row.englishName) return true;
  if (row.chineseName === "—" || row.englishName === "—") return true;
  if (row.chineseName === "-" || row.englishName === "-") return true;
  if (row.chineseName === "中文名" || row.englishName === "英文名") return true;
  if (row.chineseName.startsWith("▣")) return true;

  return false;
}

function isLikelyMod(row: SheetRow): boolean {
  const text = `${row.section} ${row.chineseName} ${row.englishName} ${row.description} ${row.source} ${row.note}`;

  const modKeywords = [
    "Mod",
    "MOD",
    "Primed ",
    "Archon ",
    "Galvanized ",
    "Amalgam ",
    "Augur ",
    "Gladiator ",
    "Vigilante ",
    "Hunter ",
    "Umbral ",
    "Sacrificial ",
    "Riven",
    "Peculiar",
    "Aura",
    "Stance",
    "角鬥士",
    "激昂",
    "執政官",
    "預言",
    "靈氣",
    "架式",
    "裂罅",
    "犧牲",
    "暗影"
  ];

  return modKeywords.some((keyword) => text.includes(keyword));
}

function normalizeRow(row: string[], category: string, section: string): SheetRow | null {
  const chineseName = String(row[0] || "").trim();
  const englishName = String(row[1] || "").trim();

  if (!chineseName && !englishName) return null;

  const slug = toMarketSlug(englishName, category);

  const item: SheetRow = {
    section: section || "未分類",
    chineseName,
    englishName,
    description: String(row[2] || "").trim(),
    priority: String(row[3] || "").trim(),
    price: String(row[4] || "").trim(),
    tradeText: String(row[5] || "").trim() || "開啟交易",
    owned: String(row[6] || "").trim() || "未購買",
    source: String(row[7] || "").trim(),
    note: String(row[8] || "").trim(),
    marketUrl: slug ? `https://warframe.market/items/${slug}` : ""
  };

  if (isHeaderOrFooterRow(item)) return null;

  return item;
}

async function fetchOneSheet(category: string): Promise<{
  config: typeof SHEET_GIDS[string];
  rows: SheetRow[];
  error?: string;
}> {
  const config = SHEET_GIDS[category] ?? SHEET_GIDS.overview;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${config.gid}`;

  try {
    const response = await fetch(csvUrl, {
      next: { revalidate: 300 }
    });

    const text = await response.text();

    if (!response.ok || text.trim().startsWith("<!DOCTYPE") || text.includes("<html")) {
      return {
        config,
        rows: [],
        error: "讀取失敗：Google Sheets 可能尚未開放「知道連結的任何人可檢視」。"
      };
    }

    const parsed = parseCsv(text);
    const rows: SheetRow[] = [];
    let currentSection = config.title;

    for (const rawRow of parsed) {
      const sectionTitle = detectSectionTitle(rawRow);

      if (sectionTitle) {
        currentSection = sectionTitle;
        continue;
      }

      const item = normalizeRow(rawRow, category, currentSection);
      if (item) rows.push(item);
    }

    return { config, rows };
  } catch {
    return {
      config,
      rows: [],
      error: "讀取失敗：網站暫時無法連線到 Google Sheets。"
    };
  }
}

export async function fetchSheetRows(category: string): Promise<{
  config: typeof SHEET_GIDS[string];
  rows: SheetRow[];
  error?: string;
}> {
  if (category !== "mods") {
    return fetchOneSheet(category);
  }

  const sourceCategories = ["warframes", "primary", "secondary", "melee", "companions", "archwing"];
  const results = await Promise.all(sourceCategories.map((item) => fetchOneSheet(item)));

  const merged = results
    .flatMap((result) => result.rows)
    .filter(isLikelyMod);

  const seen = new Set<string>();
  const uniqueRows = merged.filter((row) => {
    const key = `${row.chineseName}|${row.englishName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((row) => {
    const slug = toMarketSlug(row.englishName, "mods");
    return {
      ...row,
      marketUrl: slug ? `https://warframe.market/items/${slug}` : ""
    };
  });

  return {
    config: SHEET_GIDS.mods,
    rows: uniqueRows
  };
}

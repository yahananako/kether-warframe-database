export type SheetRow = {
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
    sheetName: "總覽",
    title: "MOD資料庫",
    subtitle: "MOD 資料庫頁面預留，之後可拆成獨立分頁或讀取多分頁區塊。"
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

function toMarketSlug(name: string): string {
  const clean = name
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();

  if (!clean) return "";

  if (name.includes(" Prime") && !name.startsWith("Primed ") && !clean.endsWith("_set")) {
    return `${clean}_set`;
  }

  return clean;
}

function normalizeRow(row: string[]): SheetRow | null {
  const chineseName = String(row[0] || "").trim();
  const englishName = String(row[1] || "").trim();

  if (!chineseName && !englishName) return null;
  if (chineseName === "中文名" || englishName === "英文名") return null;
  if (chineseName.startsWith("▣")) return null;
  if (chineseName.includes("分類") && englishName.includes("英文")) return null;

  const slug = toMarketSlug(englishName);

  return {
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
}

export async function fetchSheetRows(category: string): Promise<{
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
    const rows = parsed
      .map(normalizeRow)
      .filter((item): item is SheetRow => Boolean(item));

    return { config, rows };
  } catch (error) {
    return {
      config,
      rows: [],
      error: "讀取失敗：網站暫時無法連線到 Google Sheets。"
    };
  }
}

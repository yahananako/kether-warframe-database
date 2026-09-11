import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data", "equipmentCatalog.generated.ts");
const UPDATED_AT = new Date().toISOString().slice(0, 10);

const ENDPOINTS = {
  items: "https://api.warframestat.us/items",
  market: "https://api.warframe.market/v2/items",
  dictionary: "https://browse.wf/warframe-public-export-plus/dict.tc.json",
  weapons: "https://browse.wf/warframe-public-export-plus/ExportWeapons.json",
  warframes: "https://browse.wf/warframe-public-export-plus/ExportWarframes.json",
};

const linkedCompanions = {
  "Burst Laser Prime": "Shade Prime",
  "Deconstructor Prime": "Helios Prime",
  "Deth Machine Rifle Prime": "Dethcube Prime",
  "Sweeper Prime": "Carrier Prime",
  "Verglas Prime": "Nautilus Prime",
};

const specialPrimeSources = {
  "Gotva Prime": {
    source: "虛空商人 Baro Ki'Teer 輪替（成品）／玩家交易",
    note: "非遺物 Prime 武器；由 Baro Ki'Teer 輪替販售。",
  },
  "Lato Prime": {
    source: "創始人方案限定（已絕版）",
    note: "不可交易，現已無法取得。",
  },
  "Skana Prime": {
    source: "創始人方案限定（已絕版）",
    note: "不可交易，現已無法取得。",
  },
  "Sagek Prime": {
    source: "火衛二黑暗折射區：佩里塔叛亂任務 Rotation A",
    note: "藍圖、槍管與槍機由佩里塔叛亂任務取得；部件可交易。",
  },
  "Galariak Prime": {
    source: "火衛二黑暗折射區：佩里塔叛亂任務 Rotation A",
    note: "藍圖、刀刃與握柄由佩里塔叛亂任務取得；部件可交易。",
  },
  "War Prime": {
    source: "完成《翠玉之影：星座》後，向 Hunhow 製作「Hunhow 的飾品」取得",
    note: "需 12 個 Emerald Talent 與 12 個 Crimson Talent；不可交易且只能持有一把。",
  },
};

const archwingSources = {
  Amesha: "氏族道場 Tenno Lab／天諾實驗室研究製作",
  Elytron: "氏族道場 Tenno Lab／天諾實驗室研究製作",
  Itzal: "氏族道場 Tenno Lab／天諾實驗室研究製作",
  Odonata: "完成《Archwing／曲翼》任務後取得藍圖並製作",
  "Odonata Prime": "虛空遺物／Prime 復興／玩家交易",
  Imperator: "完成《Archwing／曲翼》任務後取得藍圖並製作",
  "Imperator Vandal": "Balor Fomorian／巴洛爾巨人戰艦活動掉落部件",
  "Prisma Dual Decurions": "虛空商人 Baro Ki'Teer 輪替（成品）",
  "Kuva Ayanga": "擊敗持有此武器的 Kuva Lich／赤毒玄骸",
  "Kuva Grattler": "擊敗持有此武器的 Kuva Lich／赤毒玄骸",
  "Corvas Prime": "虛空遺物／Prime 復興／玩家交易",
  "Larkspur Prime": "虛空遺物／Prime 復興／玩家交易",
  Mandonel: "聖所研究所賞金與相關輪次獎勵",
  Arbucep: "曲翼／航道星艦相關任務獎勵與製作",
  Mausolon: "製作第一台亡靈機甲時一併取得",
  Cortege: "Necraloid／亡靈精靈聲望藍圖與隔離庫相關部件",
  Morgha: "Necraloid／亡靈精靈聲望藍圖與隔離庫相關部件",
  Veritux: "完成《Archwing／曲翼》任務後取得",
  "Prisma Veritux": "虛空商人 Baro Ki'Teer 輪替（成品）",
  Voidrig: "完成《Heart of Deimos／火衛二之心》後，使用亡靈精靈藍圖與損壞部件製作",
  Bonewidow: "亡靈精靈聲望藍圖＋隔離庫亡靈機甲損壞部件製作",
  Arquebex: "Voidrig／虛空銳將第 4 技內建專屬武器",
  Ironbride: "Bonewidow／骨骸寡婦第 4 技內建專屬武器",
};

const archwingNotes = {
  Mausolon: "亡靈機甲代表性 Arch-Gun，也可透過 Gravimag 作為重型武器使用。",
  Cortege: "亡靈機甲關聯 Arch-Gun，也可供曲翼與重型武器配置使用。",
  Morgha: "亡靈機甲關聯 Arch-Gun，也可供曲翼與重型武器配置使用。",
  Arquebex: "Voidrig 專屬重砲，不能獨立裝備或交易。",
  Ironbride: "Bonewidow 專屬近戰，不能獨立裝備或交易。",
};

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "KETHER-equipment-catalog/1.0",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
}

function cleanTraditionalChinese(value) {
  return String(value || "")
    .replace(/^（英文：[\s\S]*?）\s*/u, "")
    .replace(/^\(English:[\s\S]*?\)\s*/iu, "")
    .replace(/^<[^>]+>\s*/u, "")
    .trim();
}

function marketName(value) {
  return String(value || "").replace(/\s+一套$/u, "").trim();
}

function makeAliases(item, chineseName) {
  const baseEnglish = item.name.replace(/\s+Prime$/i, "");
  const baseChinese = chineseName.replace(/\s+Prime$/i, "");
  return Array.from(
    new Set([
      item.name,
      chineseName,
      baseEnglish,
      baseChinese,
      `${baseEnglish} P`,
      `${baseChinese} P`,
      item.type,
    ].filter(Boolean)),
  );
}

function equipmentCategory(item) {
  if (item.type === "Companion Weapon") return "companions";
  if (item.category === "Primary") return "primary";
  if (item.category === "Secondary") return "secondary";
  if (item.category === "Melee") return "melee";
  return null;
}

function equipmentSection(category) {
  return {
    primary: "Prime 主要武器",
    secondary: "Prime 次要武器",
    melee: "Prime 近戰武器",
    companions: "Prime 同伴武器",
  }[category];
}

function getExportEntry(item, weaponExport, warframeExport) {
  return weaponExport[item.uniqueName] || warframeExport[item.uniqueName] || null;
}

function getChineseText(item, exportEntry, dictionary, marketItem) {
  const officialName = cleanTraditionalChinese(dictionary[exportEntry?.name]);
  const fallbackName = marketName(marketItem?.i18n?.["zh-hant"]?.name);
  const description = cleanTraditionalChinese(dictionary[exportEntry?.description]);

  return {
    name: officialName || fallbackName || item.name,
    description: description || item.description || "遊戲裝備資料。",
  };
}

function getMarketItem(item, marketItems) {
  const exactSet = marketItems.find(
    (candidate) =>
      candidate.gameRef === item.uniqueName &&
      candidate.tags?.includes("set") &&
      (candidate.tags?.includes("prime") || / Prime Set$/i.test(candidate.i18n?.en?.name || "")),
  );

  if (exactSet) return exactSet;

  const expectedSetName = `${item.name} Set`.toLowerCase();
  const bySetName = marketItems.find(
    (candidate) => String(candidate.i18n?.en?.name || "").toLowerCase() === expectedSetName,
  );

  if (bySetName) return bySetName;

  return marketItems.find(
    (candidate) =>
      candidate.gameRef === item.uniqueName &&
      String(candidate.i18n?.en?.name || "").toLowerCase() === item.name.toLowerCase(),
  );
}

async function mapLimit(values, limit, mapper) {
  const output = new Array(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return output;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchLowestSell(slug) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const payload = await fetchJson(
        `https://api.warframe.market/v2/orders/item/${slug}/top?platform=pc`,
      );
      const prices = (payload?.data?.sell || [])
        .filter((order) =>
          order?.visible !== false &&
          ["online", "ingame"].includes(order?.user?.status) &&
          Number(order?.platinum) > 0,
        )
        .map((order) => Number(order.platinum))
        .sort((a, b) => a - b);

      return prices[0] || null;
    } catch (error) {
      if (attempt < 3 && String(error.message).startsWith("429 ")) {
        await sleep(5000 * attempt);
        continue;
      }

      console.warn(`Price lookup failed for ${slug}: ${error.message}`);
      return null;
    }
  }

  return null;
}

function standardPrimeSource(item) {
  const availability = item.vaulted ? "目前入庫狀態可能受 Prime 復興輪替影響。" : "目前未標記為入庫。";
  return {
    source: "虛空遺物／Prime 復興／玩家交易",
    note: `${availability} 精確核桃請使用 KETHER 核桃查詢。`,
  };
}

function archwingSection(item) {
  if (item.category === "Archwing") return "曲翼";
  if (item.category === "Arch-Melee") return "曲翼近戰武器";
  if (["Mausolon", "Cortege", "Morgha"].includes(item.name)) return "曲翼槍／亡靈武器";
  if (item.category === "Arch-Gun") return "曲翼槍";
  if (["Voidrig", "Bonewidow"].includes(item.name)) return "亡骸機甲";
  return "亡靈專屬武器";
}

function archwingSource(item) {
  if (archwingSources[item.name]) return archwingSources[item.name];
  if (item.category === "Arch-Melee" || item.category === "Arch-Gun") {
    return "商店藍圖＋集團／氏族／曲翼任務相關部件製作";
  }
  return "遊戲內任務、研究或藍圖製作";
}

function marketUrl(slug) {
  return slug ? `https://warframe.market/items/${slug}` : "";
}

async function main() {
  const [items, marketPayload, dictionary, weaponExport, warframeExport] = await Promise.all([
    fetchJson(ENDPOINTS.items),
    fetchJson(ENDPOINTS.market, { Language: "zh-hant", Platform: "pc" }),
    fetchJson(ENDPOINTS.dictionary),
    fetchJson(ENDPOINTS.weapons),
    fetchJson(ENDPOINTS.warframes),
  ]);

  const marketItems = marketPayload.data || [];
  const releasedPrimeWeapons = items
    .filter(
      (item) =>
        item.masterable &&
        / Prime$/i.test(item.name) &&
        ["Primary", "Secondary", "Melee"].includes(item.category) &&
        (!item.releaseDate || item.releaseDate <= UPDATED_AT),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const archwingItems = items
    .filter(
      (item) =>
        item.masterable &&
        ["Archwing", "Arch-Gun", "Arch-Melee"].includes(item.category),
    )
    .filter((item) => !item.releaseDate || item.releaseDate <= UPDATED_AT);

  const necramechs = items.filter((item) =>
    ["Voidrig", "Bonewidow"].includes(item.name) && item.masterable,
  );
  const exaltedNecramechWeapons = items.filter((item) =>
    ["Arquebex", "Ironbride"].includes(item.name),
  );

  const allItems = [
    ...releasedPrimeWeapons,
    ...archwingItems,
    ...necramechs,
    ...exaltedNecramechWeapons,
  ];

  const marketByName = new Map();
  for (const item of allItems) {
    marketByName.set(item.name, getMarketItem(item, marketItems));
  }

  const slugs = Array.from(
    new Set(
      Array.from(marketByName.values())
        .map((item) => item?.slug)
        .filter(Boolean),
    ),
  );
  const prices = await mapLimit(slugs, 1, async (slug, index) => {
    if (index > 0) await sleep(1100);
    return [slug, await fetchLowestSell(slug)];
  });
  const priceMap = new Map(prices);

  const primeCatalog = releasedPrimeWeapons.map((item) => {
    const category = equipmentCategory(item);
    const exportEntry = getExportEntry(item, weaponExport, warframeExport);
    const marketItem = marketByName.get(item.name);
    const chinese = getChineseText(item, exportEntry, dictionary, marketItem);
    const companion = linkedCompanions[item.name];
    const special = specialPrimeSources[item.name];
    const acquisition = special || (companion
      ? {
          source: `隨 ${companion} 製作後取得`,
          note: `Prime 同伴專屬武器；不以獨立套裝交易。`,
        }
      : standardPrimeSource(item));
    const slug = marketItem?.slug || "";
    const price = priceMap.get(slug);

    return {
      category,
      section: equipmentSection(category),
      chineseName: chinese.name,
      englishName: item.name,
      description: chinese.description,
      priority: "待評估",
      price: slug ? (price ? `${price}p` : "待更新") : "不可交易",
      tradeText: slug ? "開啟交易" : "不可交易",
      owned: "未購買",
      source: acquisition.source,
      note: `${acquisition.note} MR ${item.masteryReq ?? "—"}｜推出 ${item.releaseDate || "日期未收錄"}`,
      marketUrl: marketUrl(slug),
      imageUrl: item.imageName ? `https://cdn.warframestat.us/img/${item.imageName}` : "",
      aliases: makeAliases(item, chinese.name),
    };
  });

  const archwingCatalog = [...archwingItems, ...necramechs, ...exaltedNecramechWeapons]
    .map((item) => {
      const exportEntry = getExportEntry(item, weaponExport, warframeExport);
      const marketItem = marketByName.get(item.name);
      const chinese = getChineseText(item, exportEntry, dictionary, marketItem);
      const slug = marketItem?.slug || "";
      const price = priceMap.get(slug);
      const noteParts = [archwingNotes[item.name]];

      if (typeof item.masteryReq === "number") noteParts.push(`MR ${item.masteryReq}`);
      if (item.releaseDate) noteParts.push(`推出 ${item.releaseDate}`);

      return {
        category: "archwing",
        section: archwingSection(item),
        chineseName: chinese.name,
        englishName: item.name,
        description: chinese.description,
        priority: "待評估",
        price: slug ? (price ? `${price}p` : "待更新") : "不可交易",
        tradeText: slug ? "開啟交易" : "不可交易",
        owned: "未購買",
        source: archwingSource(item),
        note: noteParts.filter(Boolean).join("｜") || "曲翼／亡靈裝備資料。",
        marketUrl: marketUrl(slug),
        imageUrl: item.imageName ? `https://cdn.warframestat.us/img/${item.imageName}` : "",
        aliases: Array.from(new Set([
          ...makeAliases(item, chinese.name),
          "曲翼",
          "Archwing",
          ["Voidrig", "Bonewidow", "Arquebex", "Ironbride", "Mausolon", "Cortege", "Morgha"].includes(item.name)
            ? "亡靈 亡骸機甲 Necramech"
            : "",
        ].filter(Boolean))),
      };
    })
    .sort((a, b) => {
      const sectionOrder = ["曲翼", "曲翼槍", "曲翼槍／亡靈武器", "曲翼近戰武器", "亡骸機甲", "亡靈專屬武器"];
      const sectionDiff = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
      return sectionDiff || a.englishName.localeCompare(b.englishName);
    });

  const catalog = [...primeCatalog, ...archwingCatalog];
  const content = `// Generated by scripts/generate-equipment-catalog.mjs.\n// Sources: Warframe Public Export, WarframeStat, and Warframe.Market.\n\nexport type EquipmentCatalogRow = {\n  category: \"primary\" | \"secondary\" | \"melee\" | \"companions\" | \"archwing\";\n  section: string;\n  chineseName: string;\n  englishName: string;\n  description: string;\n  priority: string;\n  price: string;\n  tradeText: string;\n  owned: string;\n  source: string;\n  note: string;\n  marketUrl: string;\n  imageUrl: string;\n  aliases: string[];\n};\n\nexport const EQUIPMENT_CATALOG_UPDATED_AT = ${JSON.stringify(UPDATED_AT)};\n\nexport const EQUIPMENT_CATALOG: EquipmentCatalogRow[] = ${JSON.stringify(catalog, null, 2)};\n`;

  await writeFile(OUTPUT, content, "utf8");

  const counts = catalog.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + 1;
    return map;
  }, {});
  console.log(JSON.stringify({ output: OUTPUT, updatedAt: UPDATED_AT, counts, total: catalog.length }, null, 2));
}

await main();

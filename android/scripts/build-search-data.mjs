import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const androidRoot = path.resolve(here, "..");
const siteRoot = path.resolve(process.argv[2] || path.join(androidRoot, "..", "kether-site-source"));

function readExportedArray(relativePath, exportName) {
  const source = fs.readFileSync(path.join(siteRoot, relativePath), "utf8");
  const marker = new RegExp(`export\\s+const\\s+${exportName}\\b`);
  const markerAt = source.search(marker);
  if (markerAt < 0) throw new Error(`找不到 ${exportName}`);
  const assignment = source.indexOf("=", markerAt);
  const start = source.indexOf("[", assignment);
  let quote = "";
  let escaped = false;
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(start, index + 1);
        return Function(`"use strict"; return (${literal});`)();
      }
    }
  }
  throw new Error(`${exportName} 陣列沒有結尾`);
}

function marketSlug(value) {
  return String(value || "")
    .trim()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function normalizedEnglishName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function marketSlugFromUrl(value) {
  return String(value || "").split("/").filter(Boolean).pop() || "";
}

function primeWarframeMarket(english) {
  const name = `${english} Prime`;
  return {
    marketSlug: `${marketSlug(name)}_set`,
    marketName: `${name} 套裝`,
    tradeNote: "普通版戰甲不可交易；白金價格與交易連結顯示 Prime 套裝。",
  };
}

const extraAliases = {
  Ash: ["灰燼", "忍者甲", "忍者"],
  Atlas: ["石男", "拳甲", "石甲"],
  Baruuk: ["武僧", "和尚", "拳僧"],
  Caliban: ["卡利班", "合一眾甲", "融合甲"],
  Chroma: ["龍甲", "龍男", "元素龍"],
  Citrine: ["水晶妹", "水晶甲"],
  "Cyte-09": ["狙擊甲", "狙擊手", "賽特09"],
  Dagath: ["無頭女", "馬甲", "無頭甲"],
  Dante: ["書甲", "法書甲", "但丁"],
  Ember: ["火女", "火妹", "火甲"],
  Equinox: ["陰陽甲", "日夜甲", "陰陽"],
  Excalibur: ["聖劍", "劍聖", "咖哩棒", "咖喱棒"],
  Frost: ["冰男", "冰甲"],
  Gara: ["玻璃甲", "玻璃女"],
  Garuda: ["血女", "血甲"],
  Gauss: ["跑男", "高斯", "速度甲"],
  Grendel: ["胖子", "肥宅甲", "吞噬甲"],
  Gyre: ["電女", "旋輪甲", "迴旋女"],
  Harrow: ["主教", "鎖鏈甲"],
  Hildryn: ["盾媽", "壯媽", "護盾甲"],
  Hydroid: ["水男", "海賊甲", "章魚"],
  Inaros: ["沙甲", "木乃伊", "沙男"],
  Ivara: ["弓妹", "隱身弓", "間諜甲"],
  Jade: ["翡翠", "翡翠甲", "光女"],
  Khora: ["貓女", "鞭女", "蜘蛛女"],
  Koumei: ["巫女", "命運甲", "籤甲"],
  Kullervo: ["刀男", "庫列沃", "背刺甲"],
  Lavos: ["藥劑師", "蛇男", "煉金甲"],
  Limbo: ["小明", "裂隙甲", "魔術師"],
  Loki: ["洛基", "隱身男", "隱形男"],
  Mag: ["磁妹", "磁女", "磁力甲"],
  Mesa: ["槍女", "女槍", "和平使者"],
  Mirage: ["小丑女", "鏡像女", "幻影女"],
  Nekros: ["摸屍", "摸屍甲", "死靈"],
  Nezha: ["哪吒", "風火輪"],
  Nidus: ["感染甲", "蛆甲", "菌男"],
  Nova: ["諾娃", "核妹", "核彈妹", "加速娃", "減速娃"],
  Nyx: ["精神妹", "腦控妹", "精神甲"],
  Oberon: ["羊男", "奶爸", "聖騎甲"],
  Octavia: ["音樂妹", "樂甲", "DJ甲"],
  Protea: ["時間妹", "工程妹", "炮台妹"],
  Qorvex: ["混凝土甲", "水泥甲", "核男"],
  Revenant: ["夜靈甲", "吸血鬼", "幽魂"],
  Rhino: ["犀牛", "牛", "新手坦"],
  Saryn: ["毒媽", "毒女", "毒甲"],
  Sevagoth: ["影甲", "幽影甲", "船長甲"],
  Styanax: ["斯巴達", "矛男", "盾矛甲"],
  Temple: ["聖殿甲", "音樂甲"],
  Titania: ["蝶妹", "蝶甲", "蝴蝶", "仙女"],
  Trinity: ["奶媽", "補師", "三位一體"],
  Valkyr: ["瓦喵", "女武神", "貓甲", "狂戰士"],
  Vauban: ["工程男", "陷阱甲", "工程甲"],
  Volt: ["電男", "電甲", "伏特"],
  Voruna: ["狼甲", "狼女"],
  Wisp: ["花甲", "花媽", "幽靈甲", "輔助花"],
  Wukong: ["悟空", "猴子", "猴甲"],
  Xaku: ["破碎甲", "虛空甲", "骨架"],
  Yareli: ["水妹", "水女", "浪潮妹"],
  Zephyr: ["鳥姐", "鳥甲", "風女"],
};

const equipmentCatalog = readExportedArray(
  "data/equipmentCatalog.generated.ts",
  "EQUIPMENT_CATALOG",
);
const equipmentByEnglishName = new Map(
  equipmentCatalog.map((item) => [normalizedEnglishName(item.englishName), item]),
);

const detailedWarframes = readExportedArray(
  "app/api/discord/data/warframes.ts",
  "WARFRAME_ACQUISITION_DATA",
);
const regularWarframes = readExportedArray("data/regularWarframes.ts", "regularWarframes");
const detailedByName = new Map(
  detailedWarframes.map((record) => [String(record.name).split(" / ")[0].toLowerCase(), record]),
);

const warframes = regularWarframes.map((regular) => {
  const english = String(regular.name);
  const detailed = detailedByName.get(english.toLowerCase());
  const aliases = [...new Set([english, ...(detailed?.aliases || []), ...(extraAliases[english] || [])])];
  const trade = primeWarframeMarket(english);
  if (detailed) return { ...detailed, aliases, ...trade };
  return {
    key: english.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: english,
    aliases,
    category: "一般戰甲",
    source: regular.acquisition,
    parts: "依取得方式收集主設計圖、頭部神經光元、機體與系統。",
    tips: "可輸入英文名、中文俗稱或一句問題搜尋。",
    notes: "KETHER 一般戰甲資料庫",
    ...trade,
  };
});

warframes.push({
  key: "excalibur-umbra",
  name: "Excalibur Umbra / Umbra",
  aliases: ["excalibur umbra", "umbra", "劍神", "暗影聖劍", "聖劍umbra", "咖哩棒umbra"],
  category: "主線任務戰甲",
  source: "完成主線任務「犧牲」後取得完整 Excalibur Umbra。",
  parts: "任務流程直接取得，不需另外刷部件。",
  tips: "完成任務前需要推進主線並準備相關前置條件。",
  notes: "劍神通常指 Excalibur Umbra。",
});

const detailedWeapons = readExportedArray(
  "app/api/discord/data/weapons.ts",
  "WEAPON_ACQUISITION_DATA",
).filter(Boolean);
const detailedWeaponNames = new Set(
  detailedWeapons.map((record) => {
    const english = String(record.name || "").split(/\s*\/\s*/)[0].trim();
    return normalizedEnglishName(english);
  }),
);
const weapons = detailedWeapons.map((record) => {
  const english = String(record.name || "").split(/\s*\/\s*/)[0].trim();
  const catalog = equipmentByEnglishName.get(normalizedEnglishName(english));
  if (!catalog) return record;
  return {
    ...record,
    aliases: [...new Set([...(record.aliases || []), ...(catalog.aliases || [])])],
    price: catalog.price,
    marketUrl: catalog.marketUrl,
    marketSlug: marketSlugFromUrl(catalog.marketUrl),
    marketName: catalog.englishName,
    tradeNote: catalog.marketUrl ? "白金價格為 Warframe Market 的 PC 參考價。" : "此物品目前不可交易。",
  };
});

for (const catalog of equipmentCatalog) {
  if (detailedWeaponNames.has(normalizedEnglishName(catalog.englishName))) continue;
  const slug = marketSlugFromUrl(catalog.marketUrl);
  const isPrime = /\bPrime\b/i.test(catalog.englishName);
  weapons.push({
    key: marketSlug(catalog.englishName).replace(/_/g, "-"),
    name: `${catalog.englishName} / ${catalog.chineseName}`,
    aliases: catalog.aliases || [],
    weaponType: catalog.section,
    weaponTypeKey: catalog.category,
    series: isPrime ? "P版 / Prime" : catalog.section,
    seriesKey: isPrime ? "prime" : catalog.category,
    source: catalog.source,
    parts: catalog.marketUrl
      ? "可開啟 Warframe Market 查看可交易套裝或部件。"
      : "依遊戲內來源取得或製作。",
    tips: catalog.description,
    notes: catalog.note,
    price: catalog.price,
    marketUrl: catalog.marketUrl,
    marketSlug: slug,
    marketName: catalog.englishName,
    tradeNote: catalog.marketUrl ? "白金價格為 Warframe Market 的 PC 參考價。" : "此物品目前不可交易。",
  });
}

const payload = {
  version: 1,
  generatedFrom: "KETHER website database",
  warframes,
  weapons,
  companions: readExportedArray("app/api/discord/data/companions.ts", "COMPANION_ACQUISITION_DATA").filter(Boolean),
  materials: readExportedArray("app/api/discord/data/materials.ts", "MATERIAL_ACQUISITION_DATA").filter(Boolean),
};

const output = `window.KETHER_SEARCH_DATA=${JSON.stringify(payload)};\n`;
fs.writeFileSync(path.join(androidRoot, "assets", "search-data.js"), output);
console.log(`KETHER 搜尋資料：${warframes.length} 戰甲、${payload.weapons.length} 武器、${payload.companions.length} 同伴、${payload.materials.length} 材料`);

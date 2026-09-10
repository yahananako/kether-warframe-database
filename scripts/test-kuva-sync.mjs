import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readExportedArray(source, exportName) {
  const marker = new RegExp(`export\\s+const\\s+${exportName}\\b`);
  const markerAt = source.search(marker);
  assert.ok(markerAt >= 0, `找不到 ${exportName}`);
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
      if (depth === 0) return Function(`"use strict"; return (${source.slice(start, index + 1)});`)();
    }
  }

  throw new Error(`${exportName} 陣列沒有結尾`);
}

const expectedNames = [
  "Kuva Ayanga",
  "Kuva Brakk",
  "Kuva Bramma",
  "Kuva Chakkhurr",
  "Kuva Drakgoon",
  "Kuva Ghoulsaw",
  "Kuva Grattler",
  "Kuva Hek",
  "Kuva Hind",
  "Kuva Karak",
  "Kuva Kohm",
  "Kuva Kraken",
  "Kuva Nukor",
  "Kuva Ogris",
  "Kuva Quartakk",
  "Kuva Seer",
  "Kuva Shildeg",
  "Kuva Sobek",
  "Kuva Tonkor",
  "Kuva Twin Stubbas",
  "Kuva Zarr",
].sort();

const catalogSource = await readFile(path.join(ROOT, "data", "kuvaWeapons.generated.ts"), "utf8");
const catalog = readExportedArray(catalogSource, "KUVA_WEAPONS");
assert.deepEqual(catalog.map((item) => item.englishName).sort(), expectedNames);
assert.deepEqual(
  Object.fromEntries(["primary", "secondary", "melee", "archwing"].map((category) => [
    category,
    catalog.filter((item) => item.category === category).length,
  ])),
  { primary: 12, secondary: 5, melee: 2, archwing: 2 },
);

for (const item of catalog) {
  assert.match(item.chineseName, /^赤毒\s*/u, `${item.englishName} 缺少繁中赤毒名稱`);
  assert.equal(item.marketKind, "lich");
  assert.equal(item.seriesKey, "kuva");
  assert.equal(item.price, "玄骸拍賣浮動");
  assert.match(item.note, /武器本體不可交易/u);
  assert.match(item.tradeNote, /已轉化赤毒玄骸/u);
  const market = new URL(item.marketUrl);
  assert.equal(market.origin, "https://warframe.market");
  assert.equal(market.pathname, "/auctions/search");
  assert.equal(market.searchParams.get("type"), "lich");
  assert.equal(market.searchParams.get("weapon_url_name"), item.marketSlug);
}

const androidSource = await readFile(path.join(ROOT, "android", "assets", "search-data.js"), "utf8");
const androidContext = vm.createContext({ window: {} });
vm.runInContext(androidSource, androidContext);
const androidKuva = androidContext.window.KETHER_SEARCH_DATA.weapons.filter(
  (item) => item?.seriesKey === "kuva",
);
assert.deepEqual(Array.from(androidKuva, (item) => String(item.name).split(" / ")[0]).sort(), expectedNames);
for (const item of androidKuva) {
  assert.equal(item.marketKind, "lich");
  assert.ok(item.price);
  assert.ok(item.marketSlug);
  assert.match(item.marketUrl, /^https:\/\/warframe\.market\/auctions\/search\?/u);
}

const integrationFiles = {
  website: await readFile(path.join(ROOT, "lib", "sheets.ts"), "utf8"),
  bot: await readFile(path.join(ROOT, "app", "api", "discord", "data", "allWeapons.ts"), "utf8"),
  app: await readFile(path.join(ROOT, "android", "scripts", "build-search-data.mjs"), "utf8"),
};
for (const [surface, source] of Object.entries(integrationFiles)) {
  assert.match(source, /KUVA_WEAPONS|kuvaWeapons\.generated/u, `${surface} 尚未連接赤毒單一資料源`);
}

console.log("KETHER 赤毒同步測試通過：21 把武器已同步到網站、BOT 與 APP 搜尋資料。");

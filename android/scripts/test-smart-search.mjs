import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const body = { querySelector: () => null };
const root = {};
const window = {};
const document = {
  getElementById(id) {
    if (id === "kether-mobile-v5") return root;
    if (id === "k5-body") return body;
    return null;
  },
  createElement() {
    return { textContent: "" };
  },
  head: { appendChild() {} },
};

class MutationObserver {
  observe() {}
}

const context = vm.createContext({ console, document, MutationObserver, window });
for (const file of ["../assets/search-data.js", "../assets/app-v31.js"]) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  vm.runInContext(source, context, { filename: file });
}

function search(query) {
  let results = null;
  window.ketherBotSheetResults = (items) => {
    results = items;
  };
  window.ketherBotSearch(query);
  assert.ok(results, `搜尋「${query}」沒有回傳結果陣列`);
  assert.ok(results.length <= 1, `搜尋「${query}」回傳超過一筆`);
  return results;
}

const nova = search("核妹怎麼取得？");
assert.equal(nova.length, 1);
assert.equal(nova[0].en, "Nova");
assert.equal(nova[0].marketSlug, "nova_prime_set");

assert.equal(search("火妹")[0]?.en, "Ember");
assert.equal(search("瓦喵")[0]?.en, "Valkyr");

const acceltra = search("迅發電漿炮 Prime");
assert.equal(acceltra[0]?.en, "Acceltra Prime");
assert.equal(acceltra[0]?.price, "45p");
assert.equal(
  acceltra[0]?.marketUrl,
  "https://warframe.market/items/acceltra_prime_set",
);

const tradeableWeapons = window.KETHER_SEARCH_DATA.weapons.filter(
  (item) => item?.marketUrl,
);
assert.ok(tradeableWeapons.length >= 100, "可交易武器目錄沒有完整打包進 APP");
for (const item of tradeableWeapons) {
  const english = String(item.name || "").split(/\s*\/\s*/)[0].trim();
  const result = search(english);
  assert.equal(result[0]?.en, english, `精確搜尋「${english}」回傳錯誤裝備`);
  assert.ok(result[0]?.price, `「${english}」缺少白金價格`);
  assert.ok(result[0]?.marketUrl, `「${english}」缺少交易連結`);
}

assert.equal(search("完全不存在的裝備").length, 0);

console.log("KETHER 智慧搜尋測試通過：每次只回傳唯一最佳結果，並包含交易資料。");

import { writeFile } from "node:fs/promises";

const source =
  process.argv[2] ||
  "https://raw.githubusercontent.com/calamity-inc/warframe-public-export/senpai/ExportSortieRewards_tc.json";
const output = new URL("../assets/nightwave-tc.js", import.meta.url);

const response = await fetch(source);
if (!response.ok) {
  throw new Error(`Nightwave 繁中資料下載失敗：${response.status}`);
}

const json = await response.json();
const challenges = json?.ExportNightwave?.challenges;
if (!Array.isArray(challenges) || challenges.length === 0) {
  throw new Error("Nightwave 繁中資料格式不正確");
}

const translated = {};
for (const challenge of challenges) {
  const key = String(challenge.uniqueName || "")
    .split("/")
    .pop()
    .toLowerCase();
  if (!key) continue;
  translated[key] = [
    String(challenge.name || ""),
    String(challenge.description || ""),
    Number(challenge.required || 0),
  ];
}

const payload = {
  source: "Warframe Public Export（繁體中文）",
  challenges: translated,
};

await writeFile(
  output,
  `window.KETHER_NIGHTWAVE_TC=${JSON.stringify(payload)};\n`,
  "utf8",
);

console.log(`已建立 ${Object.keys(translated).length} 筆 Nightwave 繁中翻譯`);

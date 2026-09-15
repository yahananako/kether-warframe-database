import fs from "node:fs/promises";
import path from "node:path";
import OpenCC from "opencc-js";

const API_URL = "https://api.warframestat.us/warframes";
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/warframeDetails.generated.json",
);
const toTraditional = OpenCC.Converter({ from: "cn", to: "tw" });

const componentNames = new Map([
  ["Blueprint", "主設計圖"],
  ["Neuroptics", "頭部神經光元"],
  ["Chassis", "機體"],
  ["Systems", "系統"],
]);

const locationTerms = [
  ["Steel Path", "鋼韌之道"],
  ["Rotation", "輪次"],
  ["Rewards", "獎勵"],
  ["Skirmish", "前哨戰"],
  ["Assassination", "刺殺"],
  ["Sanctuary Onslaught", "聖殿突襲"],
  ["Mirror Defense", "鏡像防禦"],
  ["Disruption", "中斷"],
  ["Survival", "生存"],
  ["Defense", "防禦"],
  ["Earth", "地球"],
  ["Venus", "金星"],
  ["Mercury", "水星"],
  ["Mars", "火星"],
  ["Phobos", "火衛一"],
  ["Ceres", "穀神星"],
  ["Jupiter", "木星"],
  ["Europa", "歐羅巴"],
  ["Saturn", "土星"],
  ["Uranus", "天王星"],
  ["Neptune", "海王星"],
  ["Pluto", "冥王星"],
  ["Eris", "鬩神星"],
  ["Sedna", "賽德娜"],
  ["Deimos", "火衛二"],
  ["Lua", "月球"],
  ["Zariman", "扎日曼"],
  ["Duviri", "渡域"],
];

function cleanText(value) {
  return toTraditional(String(value || ""))
    .replace(/<[^>]+>/g, "")
    .replace(/\|[A-Z0-9_]+\|%?/g, "依技能等級")
    .replace(/\s+/g, " ")
    .trim();
}

function localizeLocation(value) {
  let output = toTraditional(String(value || ""));

  for (const [english, chinese] of locationTerms) {
    output = output.replaceAll(english, chinese);
  }

  return output.replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function imageUrl(imageName) {
  return imageName
    ? `https://cdn.warframestat.us/img/${encodeURIComponent(imageName)}`
    : "";
}

function uniqueDrops(drops) {
  const seen = new Set();

  return (Array.isArray(drops) ? drops : [])
    .filter((drop) => drop?.location)
    .filter((drop) => {
      const key = `${drop.location}|${drop.chance}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4)
    .map((drop) => ({
      location: localizeLocation(drop.location),
      chance: Number.isFinite(Number(drop.chance)) ? Number(drop.chance) : null,
      rarity: cleanText(drop.rarity),
    }));
}

async function fetchLanguage(language) {
  const response = await fetch(`${API_URL}?language=${language}`, {
    headers: { "User-Agent": "KETHER-Warframe-Database generator" },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Warframe Stat API ${language}: HTTP ${response.status}`);
  }

  return response.json();
}

const [englishItems, chineseItems] = await Promise.all([
  fetchLanguage("en"),
  fetchLanguage("zh-hant"),
]);
const chineseByUniqueName = new Map(
  chineseItems.map((item) => [item.uniqueName, item]),
);
const primeBaseNames = new Set(
  englishItems
    .filter((item) => item.isPrime === true && / Prime$/.test(item.name))
    .map((item) => item.name.replace(/ Prime$/, "")),
);

const warframes = englishItems
  .filter(
    (item) =>
      item.isPrime === false &&
      item.productCategory === "Suits" &&
      Array.isArray(item.abilities) &&
      item.abilities.length > 0,
  )
  .map((english) => {
    const chinese = chineseByUniqueName.get(english.uniqueName) || english;
    const chineseAbilityByUniqueName = new Map(
      (chinese.abilities || []).map((ability) => [ability.uniqueName, ability]),
    );
    const hasPrime = primeBaseNames.has(english.name);
    const officialSlug = slugify(english.name).replace(
      "sirius-and-orion",
      "sirius-orion",
    );

    return {
      slug: slugify(english.name),
      name: english.name,
      description: cleanText(chinese.description || english.description),
      passiveDescription: cleanText(
        chinese.passiveDescription || english.passiveDescription,
      ),
      imageUrl: imageUrl(english.imageName),
      officialUrl: `https://www.warframe.com/game/warframes/${officialSlug}`,
      hasPrime,
      marketSlug:
        hasPrime && english.name !== "Excalibur"
          ? `${slugify(english.name).replaceAll("-", "_")}_prime_set`
          : "",
      stats: {
        health: Number(english.health) || 0,
        shield: Number(english.shield) || 0,
        armor: Number(english.armor) || 0,
        energy: Number(english.power) || 0,
        sprint: Number(english.sprintSpeed || english.sprint) || 0,
      },
      abilities: english.abilities.slice(0, 4).map((ability, index) => {
        const localized = chineseAbilityByUniqueName.get(ability.uniqueName);

        return {
          number: index + 1,
          name: ability.name,
          description: cleanText(localized?.description || ability.description),
          imageUrl: imageUrl(ability.imageName),
        };
      }),
      components: (chinese.components || english.components || [])
        .filter((component) => componentNames.has(component.name))
        .map((component) => ({
          name: componentNames.get(component.name),
          drops: uniqueDrops(component.drops),
        })),
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name, "en"));

const output = {
  source: "Warframe Stat API / Digital Extremes public game data",
  updatedAt: new Date().toISOString().slice(0, 10),
  warframes,
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `Generated ${warframes.length} Warframe detail records at ${path.relative(process.cwd(), OUTPUT_PATH)}`,
);

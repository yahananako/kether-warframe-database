import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, "data", "incarnonWeapons.generated.json");
const ABILITY_LOCALIZATION_FILE = path.join(
  ROOT,
  "data",
  "incarnonAbilities.zh-Hant.json",
);
const IMAGE_DIR = path.join(ROOT, "public", "incarnon-weapons");
const USER_AGENT = "KETHER-Warframe-Database/2.2 (https://kether-warframe-database.vercel.app)";
const WIKI_API = "https://wiki.warframe.com/api.php";
const WIKI_BASE = "https://wiki.warframe.com/w/";
const TC_DICTIONARY_URL =
  "https://browse.wf/warframe-public-export-plus/dict.tc.json";

const categoryByName = new Map([
  ...[
    "Boar",
    "Boltor",
    "Braton",
    "Burston",
    "Dera",
    "Dread",
    "Gorgon",
    "Latron",
    "Miter",
    "Paris",
    "Soma",
    "Strun",
    "Sybaris",
    "Torid",
    "Vectis",
  ].map((name) => [name, "primary"]),
  ...[
    "Angstrum",
    "Atomos",
    "Ballistica",
    "Bronco",
    "Cestra",
    "Despair",
    "Dual Toxocyst",
    "Furis",
    "Gammacor",
    "Kunai",
    "Lato",
    "Lex",
    "Sicarus",
    "Stug",
    "Vasto",
    "Zylok",
  ].map((name) => [name, "secondary"]),
  ...[
    "Ack & Brunt",
    "Anku",
    "Bo",
    "Ceramic Dagger",
    "Destreza",
    "Dual Ichor",
    "Furax",
    "Hate",
    "Magistar",
    "Nami Solo",
    "Obex",
    "Okina",
    "Sibear",
    "Skana",
  ].map((name) => [name, "melee"]),
]);

const genesisRotations = [
  ["Braton", "Lato", "Skana", "Paris", "Kunai"],
  ["Boar", "Gammacor", "Angstrum", "Gorgon", "Anku"],
  ["Bo", "Latron", "Furis", "Furax", "Strun"],
  ["Lex", "Magistar", "Boltor", "Bronco", "Ceramic Dagger"],
  ["Torid", "Dual Toxocyst", "Dual Ichor", "Miter", "Atomos"],
  ["Ack & Brunt", "Soma", "Vasto", "Nami Solo", "Burston"],
  ["Zylok", "Sibear", "Dread", "Despair", "Hate"],
  ["Dera", "Sybaris", "Cestra", "Sicarus", "Okina"],
  ["Vectis", "Stug", "Ballistica", "Destreza", "Obex"],
];

const naturalWeapons = [
  {
    name: "Phenmor",
    nameZh: "梵魔",
    category: "primary",
    locName: "/Lotus/Language/Weapons/ZarimanSemiAutoRifleName",
    locDescription: "/Lotus/Language/Weapons/ZarimanSemiAutoRifleDesc",
  },
  {
    name: "Felarx",
    nameZh: "斐獵",
    category: "primary",
    locName: "/Lotus/Language/Weapons/ZarimanPumpShotgunName",
    locDescription: "/Lotus/Language/Weapons/ZarimanPumpShotgunDesc",
  },
  {
    name: "Laetum",
    nameZh: "樂銃",
    category: "secondary",
    locName: "/Lotus/Language/Weapons/ZarimanHeavyPistolName",
    locDescription: "/Lotus/Language/Weapons/ZarimanHeavyPistolDesc",
  },
  {
    name: "Onos",
    nameZh: "荷骨",
    category: "secondary",
    locName: "/Lotus/Language/Weapons/EntratiWristGunWeaponName",
    locDescription: "/Lotus/Language/Weapons/EntratiWristGunWeaponDesc",
  },
  {
    name: "Innodem",
    nameZh: "影絡",
    category: "melee",
    locName: "/Lotus/Language/Weapons/ZarimanDaggerName",
    locDescription: "/Lotus/Language/Weapons/ZarimanDaggerDesc",
  },
  {
    name: "Praedos",
    nameZh: "剝奪",
    category: "melee",
    locName: "/Lotus/Language/Weapons/ZarimanTonfasName",
    locDescription: "/Lotus/Language/Weapons/ZarimanTonfasDesc",
  },
  {
    name: "Ruvox",
    nameZh: "史韻",
    category: "melee",
    locName: "/Lotus/Language/Weapons/EntratiFistIncarnonName",
    locDescription: "/Lotus/Language/Weapons/EntratiFistIncarnonDesc",
  },
  {
    name: "Thalys",
    nameZh: "泰力",
    category: "melee",
    locName: "/Lotus/Language/Weapons/VoidHeavyScytheName",
    locDescription: "/Lotus/Language/Weapons/VoidHeavyScytheDesc",
  },
];

const genesisWeapons = genesisRotations.flatMap((names, rotationIndex) =>
  names.map((name) => ({
    name,
    category: categoryByName.get(name),
    kind: "genesis",
    rotation: rotationIndex + 1,
  })),
);

const definitions = [
  ...genesisWeapons,
  ...naturalWeapons.map((weapon) => ({ ...weapon, kind: "natural", rotation: null })),
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function genesisLocalizationStem(name) {
  return name
    .replace(/&/g, " And ")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(value) {
  return decodeEntities(
    value
      .replace(/<figure\b[\s\S]*?<\/figure>/gi, " ")
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "; ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[\t\r ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/(?:;\s*){2,}/g, "; ")
    .replace(/^[;\s]+|[;\s]+$/g, "")
    .trim();
}

function localizedText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/^（英文：[A-Z &-]+）/, "")
    .trim();
}

function cellsFromRow(rowHtml) {
  return [...rowHtml.matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map(
    (match) => htmlToText(match[1]),
  );
}

function romanToTier(value) {
  return { I: 1, II: 2, III: 3, IV: 4, V: 5 }[value] ?? null;
}

function translateChallenge(value, weaponNameEn, weaponNameZh) {
  const text = value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

  if (/Complete a solo mission with this weapon equipped/i.test(text)) {
    return "裝備此武器完成一場單人任務。";
  }
  if (/Kill 100 enemies with this weapon'?s Incarnon Form/i.test(text)) {
    return "使用此武器的應感形態擊殺 100 名敵人。";
  }
  if (/Activate (?:this weapon'?s )?Incarnon Form 6 times/i.test(text)) {
    return "在一場任務中啟用此武器的應感形態 6 次。";
  }
  if (/Complete a Solo mission with an Incarnon Weapon equipped in every slot/i.test(text)) {
    return "主要、次要與近戰欄位各裝備一把應感武器，並完成一場單人任務。";
  }
  if (/Close 12 Ruptures in Void Flood/i.test(text)) {
    return "在虛空洪流中封閉 12 個裂口。";
  }

  let match;
  if ((match = text.match(/^Activate (?:(?:this weapons?|this weapon's) )?Incarnon [Ff]orm (\d+) times(.*)$/i))) {
    const singleMission = /mission/i.test(match[2]);
    return `${singleMission ? "在單場任務中" : ""}啟用此武器的應感形態 ${match[1]} 次。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies with (?:the )?(.+?)\.?$/i))) {
    const target = match[2].replace(new RegExp(weaponNameEn, "gi"), weaponNameZh);
    if (/Incarnon Form/i.test(target)) return `使用此武器的應感形態擊殺 ${match[1]} 名敵人。`;
    if (/slide attacks?/i.test(target)) return `使用此武器的滑行攻擊擊殺 ${match[1]} 名敵人。`;
    if (/Heavy Attacks?/i.test(target)) return `使用重擊擊殺 ${match[1]} 名敵人。`;
    if (/Bleed status/i.test(target)) return `擊殺 ${match[1]} 名處於流血狀態的敵人。`;
    if (/\d+ or more (?:active )?Status Effects/i.test(target)) {
      const statusCount = target.match(/\d+/)?.[0] ?? "4";
      return `擊殺 ${match[1]} 名帶有至少 ${statusCount} 種狀態效果的敵人。`;
    }
    return `使用${target.replace(/^the /i, "")}擊殺 ${match[1]} 名敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) Eximus(?: enemies)? with (?:the )?(.+?)'?s Incarnon Transmutation\.?$/i))) {
    return `使用${weaponNameZh}的應感轉換擊殺 ${match[1]} 名卓越者。`;
  }
  if ((match = text.match(/^Kill (\d+) Eximus(?: enemies)? with this weapon'?s Incarnon Transmutation\.?$/i))) {
    return `使用此武器的應感轉換擊殺 ${match[1]} 名卓越者。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies without reloading/i))) {
    return `不進行裝填，連續擊殺 ${match[1]} 名敵人${/transformation/i.test(text) ? "（應感形態轉換亦視為裝填）" : ""}。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies within (\d+)m/i))) {
    return `擊殺 ${match[1]} 名距離在 ${match[2]} 公尺內的敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies (?:that are )?(?:at |being at )?least (\d+)m (?:away|above them)/i))) {
    return `擊殺 ${match[1]} 名距離至少 ${match[2]} 公尺的敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies while being at least (\d+)m above them/i))) {
    return `從至少 ${match[2]} 公尺高處擊殺 ${match[1]} 名敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies while airborne/i))) {
    return `在滯空時擊殺 ${match[1]} 名敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies while sliding/i))) {
    return `在滑行時擊殺 ${match[1]} 名敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies with slide attacks/i))) {
    return `以滑行攻擊擊殺 ${match[1]} 名敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies within (\d+) seconds (\d+) times/i))) {
    return `在 ${match[2]} 秒內擊殺 ${match[1]} 名敵人，完成 ${match[3]} 次。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies (?:afflicted with|with) (\d+) or more (?:active )?[Ss]tatus [Ee]ffects/i))) {
    return `擊殺 ${match[1]} 名帶有至少 ${match[2]} 種狀態效果的敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) (?:enemies affected by Lifted Status|Lifted enemies)/i))) {
    return `擊殺 ${match[1]} 名處於浮空狀態的敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) enemies with Bleed status/i))) {
    return `擊殺 ${match[1]} 名處於流血狀態的敵人。`;
  }
  if ((match = text.match(/^Kill (\d+) unalerted enemies with a Finisher Attack/i))) {
    return `以處決攻擊擊殺 ${match[1]} 名未警覺敵人。`;
  }
  if ((match = text.match(/^Get (\d+) consecutive headshots/i))) {
    return `連續達成 ${match[1]} 次爆頭。`;
  }
  if ((match = text.match(/^Get (\d+) headshots in a single mission/i))) {
    return `在單場任務中達成 ${match[1]} 次爆頭。`;
  }
  if ((match = text.match(/^Get (\d+) weakpoint hits .* in a single mission/i))) {
    return `在單場任務中，以此武器的應感形態命中 ${match[1]} 次弱點。`;
  }
  if ((match = text.match(/^Get (\d+) headshots with .* in a single mission/i))) {
    return `在單場任務中，以此武器的應感形態達成 ${match[1]} 次爆頭。`;
  }
  if ((match = text.match(/^Land (\d+) headshots on Void Angels .* without reloading/i))) {
    return `不進行裝填，以主要射擊對虛空天使達成 ${match[1]} 次爆頭。`;
  }
  if ((match = text.match(/^Reach 10x (?:Combo Multiplier|combo) (\d+) times/i))) {
    return `將連擊倍率提升至 10 倍，完成 ${match[1]} 次。`;
  }
  if ((match = text.match(/^Perform (\d+) (?:downed |Ground )Finisher [Aa]ttacks/i))) {
    return `完成 ${match[1]} 次倒地處決攻擊。`;
  }
  if ((match = text.match(/^Perform (\d+) Finisher Attacks with (.+)/i))) {
    return `在${match[2].replace(/only a Melee Weapon equipped/i, "僅裝備近戰武器").replace(/Melee Weapon equipped/i, "裝備近戰武器")}時完成 ${match[1]} 次處決攻擊。`;
  }
  if ((match = text.match(/^Open (\d+) Conduits in Disruption on (.+)/i))) {
    return `在${match[2]}的中斷任務中開啟 ${match[1]} 個導管。`;
  }
  if (/Scathing and Mocking Whispers/i.test(text)) {
    return text.startsWith("Get")
      ? "在阿爾布雷希特的實驗室中，不進行裝填，以主要射擊對「冷嘲」與「熱諷」低語達成 5 次爆頭。"
      : "在阿爾布雷希特的實驗室中，對「冷嘲」與「熱諷」低語命中 3 次重擊。";
  }
  if (/Complete 3 Heavy Attacks on Thrax Centurions or Legates/i.test(text)) {
    return "對禁衛銳將或禁衛軍使命中 3 次重擊。";
  }

  return "";
}

function parseVariables(value) {
  const variables = {};
  for (const match of value.matchAll(/\b([A-Za-z])\s*=\s*([^\n;]+)/g)) {
    variables[match[1].toUpperCase()] = match[2].trim();
  }
  return variables;
}

function normalizeAbilityText(value) {
  return String(value ?? "")
    .replace(/%%+/g, "%")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/;\s*\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function applyVariables(description, value) {
  const variables = parseVariables(value);
  return normalizeAbilityText(Object.entries(variables).reduce(
    (result, [key, replacement]) =>
      result.replace(new RegExp(`\\b${key}\\b`, "gi"), replacement),
    description,
  ));
}

function localizeEvolutions(evolutions, definition, localization) {
  const weaponId = slugify(definition.name);
  return evolutions.map((evolution) => ({
    ...evolution,
    abilities: evolution.abilities.map((ability) => {
      const key = `${weaponId}::${ability.name}`;
      const translated = localization.abilities?.[key];
      if (!translated?.name || !translated?.description) {
        throw new Error(`${definition.name} 的能力缺少繁中翻譯：${ability.name}`);
      }
      return {
        name: translated.name,
        description: translated.description,
        ...(translated.variantValues
          ? { variantValues: translated.variantValues }
          : {}),
        ...(translated.notes || ability.notes
          ? { notes: translated.notes || ability.notes }
          : {}),
      };
    }),
  }));
}

function parseEvolutionTable(pageHtml, definition) {
  const tables = [
    ...pageHtml.matchAll(/<table\b[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/gi),
  ].map((match) => match[0]);
  const table = tables.find((candidate) => /EVO1/i.test(candidate));

  if (!table) {
    throw new Error(`找不到 ${definition.name} 的進化表格`);
  }

  const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map((match) =>
    cellsFromRow(match[0]),
  );
  const header = rows.shift() ?? [];
  const hasVariants = header.length > 2 && header.at(-1) === "Notes";
  const variantHeaders = hasVariants ? header.slice(1, -1) : [];
  const evolutions = new Map();
  const challenges = new Map();
  let currentTier = null;

  for (const cells of rows) {
    if (!cells.length) continue;

    const explicitChallenge = cells[0].match(/^Evolution ([IVX]+) Challenge$/i);
    if (explicitChallenge) {
      const tier = romanToTier(explicitChallenge[1].toUpperCase());
      if (tier) challenges.set(tier, cells.at(-1) ?? "");
      continue;
    }

    if (/^Evolution Challenge$/i.test(cells[0])) {
      if (currentTier) challenges.set(currentTier + 1, cells.at(-1) ?? "");
      continue;
    }

    const tierMatch = cells[0].match(/^EVO(\d)$/i);
    const firstAbilityInTier = Boolean(tierMatch);
    if (tierMatch) currentTier = Number(tierMatch[1]);
    if (!currentTier) continue;

    const offset = firstAbilityInTier ? 1 : 0;
    const name = cells[offset] ?? "";
    const rawDescription = cells[offset + 1] ?? "";
    if (!name || !rawDescription) continue;

    const variantStart = offset + 2;
    const variantValues = {};
    const variantCells = hasVariants ? cells.slice(variantStart, -1) : [];
    if (hasVariants && variantCells.length === variantHeaders.length) {
      variantHeaders.forEach((variant, index) => {
        const value = variantCells[index];
        if (value && value !== "-") variantValues[variant] = value;
      });
    }
    const notes = cells.at(-1) && cells.at(-1) !== "-" ? cells.at(-1) : "";
    const baseVariantValue = variantValues[variantHeaders[0]] ?? "";
    const description = normalizeAbilityText(baseVariantValue
      ? applyVariables(rawDescription, baseVariantValue)
      : rawDescription);
    const ability = {
      name,
      description,
      ...(Object.keys(variantValues).length ? { variantValues } : {}),
      ...(notes ? { notes: normalizeAbilityText(notes) } : {}),
    };
    const evolution = evolutions.get(currentTier) ?? { tier: currentTier, abilities: [] };
    evolution.abilities.push(ability);
    evolutions.set(currentTier, evolution);
  }

  const result = [...evolutions.values()]
    .sort((a, b) => a.tier - b.tier)
    .map((evolution) => {
      const unlockEn =
        challenges.get(evolution.tier) ||
        (definition.kind === "genesis" && evolution.tier === 1
          ? "Install the Incarnon Genesis Adapter on a compatible weapon."
          : "");
      const unlockZh =
        definition.kind === "genesis" && evolution.tier === 1
          ? "在相容武器上安裝應感創件。"
          : translateChallenge(
              unlockEn,
              definition.name,
              definition.nameZh || definition.name,
            );

      return {
        ...evolution,
        unlockCondition: { zh: unlockZh, en: unlockEn },
      };
    });

  if (!result.length) throw new Error(`${definition.name} 沒有可用的進化資料`);
  return result;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function fetchWikiPage(definition) {
  const page =
    definition.kind === "genesis"
      ? `${definition.name} Incarnon Genesis`
      : definition.name;
  const params = new URLSearchParams({
    action: "parse",
    page,
    prop: "text",
    format: "json",
    origin: "*",
  });
  const payload = await fetchJson(`${WIKI_API}?${params}`);
  return { page, html: payload.parse?.text?.["*"] ?? "" };
}

async function fetchPageImages(names) {
  const result = new Map();
  for (let index = 0; index < names.length; index += 45) {
    const params = new URLSearchParams({
      action: "query",
      titles: names.slice(index, index + 45).join("|"),
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "720",
      format: "json",
      origin: "*",
    });
    const payload = await fetchJson(`${WIKI_API}?${params}`);
    Object.values(payload.query?.pages ?? {}).forEach((page) => {
      if (page.title && page.thumbnail?.source) result.set(page.title, page.thumbnail.source);
    });
  }
  return result;
}

async function downloadImage(url, outputPath) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

async function main() {
  console.log(`同步 ${definitions.length} 把應感武器…`);
  const abilityLocalization = JSON.parse(
    await readFile(ABILITY_LOCALIZATION_FILE, "utf8"),
  );
  const dictionary = await fetchJson(TC_DICTIONARY_URL);
  const imageSources = await fetchPageImages(definitions.map((item) => item.name));
  await mkdir(IMAGE_DIR, { recursive: true });

  const weapons = await mapWithConcurrency(definitions, 6, async (definition) => {
    const stem = definition.kind === "genesis" ? genesisLocalizationStem(definition.name) : "";
    const adapterNameKey = `/Lotus/Language/Weapons/${stem}IncarnonUnlockerName`;
    const adapterDescriptionKey = `/Lotus/Language/Weapons/${stem}IncarnonUnlockerDesc`;
    const nameZh =
      definition.nameZh ||
      localizedText(dictionary[adapterNameKey]).replace(/應感創件$/, "") ||
      definition.name;
    const localizedEffect =
      definition.kind === "genesis"
        ? localizedText(dictionary[adapterDescriptionKey])
        : localizedText(dictionary[definition.locDescription]);
    const hydratedDefinition = { ...definition, nameZh };
    const { page, html } = await fetchWikiPage(hydratedDefinition);
    const rawEvolutions = parseEvolutionTable(html, hydratedDefinition);
    const formAbility = rawEvolutions[0]?.abilities?.[0];
    const evolutions = localizeEvolutions(
      rawEvolutions,
      hydratedDefinition,
      abilityLocalization,
    );
    const imageSource = imageSources.get(definition.name);
    const slug = slugify(definition.name);

    if (!imageSource) throw new Error(`找不到 ${definition.name} 的圖片`);
    await downloadImage(imageSource, path.join(IMAGE_DIR, `${slug}.png`));
    console.log(`✓ ${definition.name}`);

    return {
      id: slug,
      name: definition.name,
      nameZh,
      category: definition.category,
      kind: definition.kind,
      rotation: definition.rotation,
      image: `/incarnon-weapons/${slug}.png`,
      effect: {
        zh: localizedEffect,
        en: formAbility
          ? [formAbility.description, formAbility.notes].filter(Boolean).join(" ")
          : "",
      },
      evolutions,
      sourceUrl: `${WIKI_BASE}${encodeURIComponent(page.replaceAll(" ", "_"))}`,
    };
  });

  const categoryOrder = { primary: 0, secondary: 1, melee: 2 };
  weapons.sort(
    (a, b) =>
      categoryOrder[a.category] - categoryOrder[b.category] ||
      a.name.localeCompare(b.name, "en"),
  );

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      name: "Warframe Wiki / Warframe Public Export",
      wiki: "https://wiki.warframe.com/w/Incarnon",
      localization: TC_DICTIONARY_URL,
    },
    totals: {
      all: weapons.length,
      primary: weapons.filter((weapon) => weapon.category === "primary").length,
      secondary: weapons.filter((weapon) => weapon.category === "secondary").length,
      melee: weapons.filter((weapon) => weapon.category === "melee").length,
      genesis: weapons.filter((weapon) => weapon.kind === "genesis").length,
      natural: weapons.filter((weapon) => weapon.kind === "natural").length,
    },
    weapons,
  };

  await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`完成：${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

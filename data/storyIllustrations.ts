export type StoryIllustration = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
};

const art = (file: string) => `https://cdn.warframestat.us/img/${file}.png`;

// 每個故事使用獨立的角色／任務主題圖，不得回退到篇章 heroImage。
const illustrationFiles: Readonly<Record<string, string>> = {
  "golden-empire": "ExcaliburPrime",
  zariman: "MagPrime",
  sentients: "Caliban",
  warframes: "Excalibur",
  betrayal: "Ash",
  awakening: "Volt",
  "vors-prize": "Rhino",
  "sayas-vigil": "Gara",
  "vox-solaris": "Hildryn",
  "once-awake": "Nidus",
  "heart-of-deimos": "Xaku",
  archwing: "Titania",
  natah: "Nyx",
  "second-dream": "Equinox",
  "rising-tide": "Sevagoth",
  "war-within": "Inaros",
  "chains-of-harrow": "Harrow",
  apostasy: "Octavia",
  sacrifice: "ExcaliburUmbra",
  prelude: "Mirage",
  invasion: "Chroma",
  narmer: "Revenant",
  eternalism: "Limbo",
  finale: "Nova",
  "zariman-aftermath": "Gyre",
  duviri: "Kullervo",
  aftermath: "Jade",
  whispers: "Qorvex",
  cavia: "Citrine",
  "lotus-eaters": "Wisp",
  "hex-arrival": "Frumentarius",
  "hex-finale": "Trinity",
  "old-peace": "Valkyr",
  "new-branches": "Pagemaster",
  "current-frontier": "Protea",

  "side-howl-of-the-kubrow": "Khora",
  "side-stolen-dreams": "Ivara",
  "side-the-new-strange": "ChromaPrime",
  "side-a-man-of-few-words": "Vauban",
  "side-patient-zero": "Mesa",
  "side-the-limbo-theorem": "LimboPrime",
  "side-hidden-messages": "MiragePrime",
  "side-sands-of-inaros": "InarosPrime",
  "side-the-silver-grove": "TitaniaPrime",
  "side-the-glast-gambit": "NidusPrime",
  "side-octavias-anthem": "OctaviaPrime",
  "side-the-jordas-precept": "AtlasPrime",
  "side-sayas-vigil": "GaraPrime",
  "side-mask-of-the-revenant": "RevenantPrime",
  "side-vox-solaris": "HildrynPrime",
  "side-the-waverider": "Yareli",
  "side-heart-of-deimos": "Bonewidow",
  "side-koumei-five-fates": "Koumei",
  "side-deadlock-protocol": "ProteaPrime",
  "side-call-of-the-tempestarii": "Wraith",
  "side-veilbreaker": "Styanax",
  "side-jade-shadows": "Harmony",
  "side-the-shadowgrapher": "Vesper77",
  "side-jade-constellations": "Evensong",
  "side-fables-frontiers": "Reconifex",
};

export function getMainStoryIllustration(id: string, title: string): StoryIllustration {
  const file = illustrationFiles[id];
  if (!file) throw new Error(`主線故事 ${id} 尚未設定獨立圖片`);
  return { src: art(file), alt: `${title} 專屬故事圖片`, caption: `${title}｜本章專屬故事視覺` };
}

export function getSideStoryIllustration(slug: string, title: string): StoryIllustration {
  const file = illustrationFiles[`side-${slug}`];
  if (!file) throw new Error(`支線故事 ${slug} 尚未設定獨立圖片`);
  return { src: art(file), alt: `${title} 專屬支線圖片`, caption: `${title}｜本篇專屬故事視覺` };
}

export type StoryIllustration = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
};

const art = (src: string) => src;

// 每個故事使用獨立的角色／任務主題圖，不得回退到篇章 heroImage。
const illustrationFiles: Readonly<Record<string, string>> = {
  "golden-empire": "https://www-static.warframe.com/images/guide/quests/sacrifice-key.jpg",
  zariman: "https://www-static.warframe.com/images/guide/quests/seconddream-key.jpg",
  sentients: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg",
  warframes: "https://www-static.warframe.com/images/guide/quests/warwithin-key.jpg",
  betrayal: "https://www-static.warframe.com/images/guide/quests/prelude-key.jpg",
  awakening: "https://www-static.warframe.com/images/guide/quests/vor-key.jpg",
  "vors-prize": "https://www-static.warframe.com/images/guide/quests/vor-key.jpg",
  "sayas-vigil": "https://www-static.warframe.com/images/guide/quests/saya-key.jpg",
  "vox-solaris": "https://www-static.warframe.com/images/guide/quests/fortuna-key.jpg",
  "once-awake": "https://www-static.warframe.com/images/guide/quests/onceawake-key.jpg",
  "heart-of-deimos": "https://www-static.warframe.com/images/guide/quests/deimos-key.jpg",
  archwing: "https://www-static.warframe.com/images/guide/quests/archwing-key.jpg",
  natah: "https://www-static.warframe.com/images/guide/quests/natah-key.jpg",
  "second-dream": "https://www-static.warframe.com/images/guide/quests/seconddream-key.jpg",
  "rising-tide": "https://www-static.warframe.com/images/guide/quests/risingtide-key.jpg",
  "war-within": "https://www-static.warframe.com/images/guide/quests/warwithin-key.jpg",
  "chains-of-harrow": "https://www-static.warframe.com/images/guide/quests/chains-key.jpg",
  apostasy: "https://www-static.warframe.com/images/guide/quests/apostasy-key.jpg",
  sacrifice: "https://www-static.warframe.com/images/guide/quests/sacrifice-key.jpg",
  prelude: "https://www-static.warframe.com/images/guide/quests/prelude-key.jpg",
  invasion: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg",
  narmer: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg",
  eternalism: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg",
  finale: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg",
  "zariman-aftermath": "https://www-static.warframe.com/images/guide/quests/zariman-key.jpg",
  duviri: "https://www-static.warframe.com/images/guide/quests/duviri-key.jpg",
  aftermath: "https://www-static.warframe.com/images/guide/quests/jadeshadows-key.jpg",
  whispers: "https://www-static.warframe.com/images/guide/quests/whispers-key.jpg",
  cavia: "https://www-static.warframe.com/images/guide/quests/whispers-key.jpg",
  "lotus-eaters": "https://www-static.warframe.com/images/guide/quests/eater-key.jpg",
  "hex-arrival": "https://www-static.warframe.com/images/guide/quests/hex-key.jpg",
  "hex-finale": "https://www-static.warframe.com/images/guide/quests/hex-key.jpg",
  "old-peace": "https://www-static.warframe.com/uploads/thumbnails/42829d3578cce902b9ec4d520159a2db_1600x900.png",
  "new-branches": "https://www-static.warframe.com/images/guide/quests/hex-key.jpg",
  "current-frontier": "https://www-static.warframe.com/images/guide/quests/whispers-key.jpg",

  "side-howl-of-the-kubrow": "https://www.gamepur.com/wp-content/uploads/2021/05/Warframe-Kubrow.jpg",
  "side-stolen-dreams": "https://www.trueachievements.com/customimages/038575.jpg",
  "side-the-new-strange": "https://i.imgur.com/zvqkMX1.jpg",
  "side-a-man-of-few-words": "https://www.gamepur.com/wp-content/uploads/2020/03/23131855/Clem-Warframe.jpg",
  "side-patient-zero": "https://i.imgur.com/uvUUROA.jpg",
  "side-the-limbo-theorem": "https://i.imgur.com/8X4TduF.jpg",
  "side-hidden-messages": "https://thenerdstash.com/wp-content/uploads/2024/03/Warframe-mirage-quest-1.jpg",
  "side-sands-of-inaros": "https://www.keengamer.com/wp-content/uploads/2024/10/Como-desbloquear-a-Inaros-en-Warframe-Las-arenas-de-Inaros-Aventura.png",
  "side-the-silver-grove": "https://www.trueachievements.com/customimages/l/056323.jpg",
  "side-the-glast-gambit": "https://www-static.warframe.com/uploads/thumbnails/f4764ccfb7ac2992eb1600aad7546f5a_1600x900.png",
  "side-octavias-anthem": "https://i.imgur.com/oHFKUqW.jpeg",
  "side-the-jordas-precept": "https://i.imgur.com/LnZD7to.png",
  "side-sayas-vigil": "https://www-static.warframe.com/images/guide/quests/saya-key.jpg",
  "side-mask-of-the-revenant": "https://www-static.warframe.com/images/guide/quests/revenant-key.jpg",
  "side-vox-solaris": "https://www-static.warframe.com/images/guide/quests/fortuna-key.jpg",
  "side-the-waverider": "https://www-static.warframe.com/images/guide/quests/waverider-key.jpg",
  "side-heart-of-deimos": "https://www-static.warframe.com/images/guide/quests/deimos-key.jpg",
  "side-koumei-five-fates": "https://www-static.warframe.com/images/guide/quests/koumei-key.jpg",
  "side-deadlock-protocol": "https://www-static.warframe.com/images/guide/quests/deadlock-key.jpg",
  "side-call-of-the-tempestarii": "https://www-static.warframe.com/images/guide/quests/tempestarii-key.jpg",
  "side-veilbreaker": "https://www-static.warframe.com/images/guide/quests/veilbreaker-key.jpg",
  "side-jade-shadows": "https://www-static.warframe.com/images/guide/quests/jadeshadows-key.jpg",
  "side-the-shadowgrapher": "https://www-static.warframe.com/images/guide/quests/shadowgrapher-key.jpg",
  "side-jade-constellations": "https://www-static.warframe.com/images/guide/quests/constellations-key.jpg",
  "side-fables-frontiers": "https://www-static.warframe.com/images/guide/quests/fables-key.jpg",
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

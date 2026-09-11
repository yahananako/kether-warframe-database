export type TimeLike = {
  eta?: string;
  expiry?: string;
  activation?: string;
  date?: string;
  startString?: string;
  endString?: string;
  timeLeft?: string;
  shortString?: string;
};

export type Cycle = TimeLike & {
  state?: string;
  active?: string;
  isDay?: boolean;
};

export type Reward = {
  asString?: string;
  credits?: number;
  items?: string[];
  countedItems?: Array<{ count?: number; type?: string; key?: string }>;
};

export type Mission = {
  node?: string;
  type?: string;
  missionType?: string;
  faction?: string;
  modifier?: string;
  modifierDescription?: string;
  reward?: Reward;
};

export type Alert = TimeLike & {
  id?: string;
  mission?: Mission;
};

export type Fissure = TimeLike & {
  id?: string;
  node?: string;
  missionType?: string;
  enemy?: string;
  tier?: string;
  tierNum?: number;
  expired?: boolean;
  isStorm?: boolean;
  isHard?: boolean;
};

export type InvasionSide = {
  faction?: string;
  reward?: Reward;
};

export type Invasion = {
  id?: string;
  node?: string;
  desc?: string;
  attackingFaction?: string;
  defendingFaction?: string;
  attacker?: InvasionSide;
  defender?: InvasionSide;
  completion?: number;
  completed?: boolean;
};

export type Sortie = TimeLike & {
  id?: string;
  boss?: string;
  faction?: string;
  variants?: Mission[];
  missions?: Mission[];
};

export type NewsItem = TimeLike & {
  id?: string;
  message?: string;
  link?: string;
  imageLink?: string;
  priority?: boolean;
};

export type WorldState = {
  timestamp?: string;
  news?: NewsItem[];
  alerts?: Alert[];
  fissures?: Fissure[];
  invasions?: Invasion[];
  sortie?: Sortie;
  sorties?: Sortie[];
  archonHunt?: Sortie;
  voidTrader?: TimeLike & {
    character?: string;
    location?: string;
    active?: boolean;
  };
  cetusCycle?: Cycle;
  vallisCycle?: Cycle;
  cambionCycle?: Cycle;
  zarimanCycle?: Cycle;
  duviriCycle?: Cycle;
};

export const LIVE_STATIONS = [
  {
    slug: "cetus",
    group: "星球循環",
    title: "希圖斯晝夜儀",
    shortTitle: "希圖斯",
    kicker: "CETUS DAY / NIGHT",
    description: "追蹤夜靈平野的白晝與夜晚，掌握夜靈狩獵與平原活動時段。",
    guide: "夜晚適合夜靈狩獵；白晝則適合一般賞金、釣魚與資源採集。",
    tone: "day",
    glyph: "☼",
  },
  {
    slug: "vallis",
    group: "星球循環",
    title: "奧布寒熱雷達",
    shortTitle: "奧布山谷",
    kicker: "ORB VALLIS CYCLE",
    description: "監看奧布山谷的溫暖與寒冷循環，安排保育、釣魚與採集。",
    guide: "部分魚類與開放世界資源會受到寒熱循環影響，可先看剩餘時間再出發。",
    tone: "cold",
    glyph: "❄",
  },
  {
    slug: "cambion",
    group: "星球循環",
    title: "魔胎輪迴觀測",
    shortTitle: "魔胎之境",
    kicker: "CAMBION DRIFT CYCLE",
    description: "追蹤魔胎之境的法斯與維姆輪替，規劃保育、釣魚與資源路線。",
    guide: "法斯與維姆會改變魔胎之境的生態與可取得內容，切換前可先完成手上的採集。",
    tone: "void",
    glyph: "◒",
  },
  {
    slug: "zariman",
    group: "星球循環",
    title: "札日曼虛空回聲",
    shortTitle: "札日曼",
    kicker: "ZARIMAN CYCLE",
    description: "接收札日曼號的陣營輪替訊號，快速確認目前掌控狀態與剩餘時間。",
    guide: "把輪替時間和札日曼賞金一起查看，可更有效率地安排虛空內容。",
    tone: "void",
    glyph: "◇",
  },
  {
    slug: "duviri",
    group: "星球循環",
    title: "渡域情緒天氣",
    shortTitle: "渡域",
    kicker: "DUVIRI MOOD",
    description: "觀測渡域目前的情緒螺旋與剩餘時間，安排漂泊者探索路線。",
    guide: "不同情緒會改變渡域氛圍與部分資源出現條件，進場前先確認目前螺旋。",
    tone: "dream",
    glyph: "◈",
  },
  {
    slug: "baro",
    group: "特殊訊號",
    title: "Baro 虛空商人雷達",
    shortTitle: "Baro 商船",
    kicker: "VOID TRADER",
    description: "追蹤 Baro Ki'Teer 是否抵達、所在中繼站及離站或抵達倒數。",
    guide: "準備杜卡德金幣與現金；商人抵達後可從所在中繼站直接檢查本期商品。",
    tone: "baro",
    glyph: "✦",
  },
  {
    slug: "fissures",
    group: "任務戰報",
    title: "虛空裂縫喵眼雷達",
    shortTitle: "虛空裂縫",
    kicker: "VOID FISSURES",
    description: "完整列出目前有效的虛空裂縫、虛空風暴、紀元、任務與剩餘時間。",
    guide: "依手上遺物紀元篩選任務；鋼韌之道與虛空風暴會以額外標籤提示。",
    tone: "void",
    glyph: "✧",
  },
  {
    slug: "invasions",
    group: "任務戰報",
    title: "入侵戰線警報",
    shortTitle: "入侵戰線",
    kicker: "INVASION FRONT",
    description: "查看目前交戰節點、雙方派系、完成進度與兩側任務獎勵。",
    guide: "先比較雙方獎勵再選陣營；完成規定場次後，等待整條戰線結束即可收件。",
    tone: "danger",
    glyph: "⚔",
  },
  {
    slug: "sortie",
    group: "高階任務",
    title: "突擊任務占卜盤",
    shortTitle: "每日突擊",
    kicker: "DAILY SORTIE",
    description: "展開本日三階突擊任務、節點、限制條件、頭目與剩餘時間。",
    guide: "突擊通常需要依序完成三個任務；先查看每階限制，再準備合適武器與戰甲。",
    tone: "danger",
    glyph: "▲",
  },
  {
    slug: "archon-hunt",
    group: "高階任務",
    title: "執政官獵殺封印書",
    shortTitle: "執政官獵殺",
    kicker: "ARCHON HUNT",
    description: "整理本週執政官、三階任務節點與獵殺重置倒數。",
    guide: "執政官獵殺屬高難度週任內容，建議先確認敵方派系、任務類型與隊伍生存能力。",
    tone: "archon",
    glyph: "⬡",
  },
  {
    slug: "alerts",
    group: "特殊訊號",
    title: "特殊警報電波",
    shortTitle: "特殊警報",
    kicker: "TACTICAL ALERTS",
    description: "集中顯示限時警報的節點、任務、派系、獎勵與截止時間。",
    guide: "限時警報可能突然出現或結束；看到需要的藍圖、資源或特殊獎勵時可優先處理。",
    tone: "alert",
    glyph: "!",
  },
  {
    slug: "news",
    group: "通訊中心",
    title: "Tenno 通訊光簡",
    shortTitle: "官方通訊",
    kicker: "TENNO TRANSMISSIONS",
    description: "彙整最新 Warframe 官方通訊、活動消息與可開啟的原始連結。",
    guide: "官方通訊的日期與連結由世界狀態同步；重要活動仍以官方公告內容為準。",
    tone: "default",
    glyph: "◫",
  },
] as const;

export type LiveStationSlug = (typeof LIVE_STATIONS)[number]["slug"];

const factionMap: Record<string, string> = {
  Grineer: "Grineer / 克隆尼",
  Corpus: "Corpus / 科普斯",
  Infested: "Infested / 感染者",
  Infestation: "Infested / 感染者",
  Corrupted: "Corrupted / 墮落者",
  Orokin: "Orokin",
  Sentient: "Sentient",
  Narmer: "Narmer / 納爾梅",
  Tenno: "Tenno / 天諾",
  Neutral: "中立",
};

const missionMap: Record<string, string> = {
  Capture: "捕獲",
  Exterminate: "殲滅",
  Extermination: "殲滅",
  Survival: "生存",
  Defense: "防禦",
  "Mobile Defense": "移動防禦",
  Spy: "間諜",
  Rescue: "救援",
  Sabotage: "破壞",
  Excavation: "挖掘",
  Interception: "攔截",
  Disruption: "中斷",
  Defection: "叛逃",
  Hijack: "劫持",
  Assassination: "刺殺",
  "Crossfire Exterminate": "交戰殲滅",
  "Void Flood": "虛空洪流",
  "Void Cascade": "虛空級聯",
  "Void Armageddon": "虛空決戰",
  Alchemy: "鍊金術",
  "Mirror Defense": "鏡像防禦",
  "Infested Salvage": "感染打撈",
  Assault: "強襲",
  Pursuit: "追擊",
  Rush: "突進",
  Skirmish: "前哨戰",
  Volatile: "揮發物",
  Orphix: "奧影",
};

const cycleMap: Record<string, string> = {
  day: "白晝",
  night: "夜晚",
  warm: "溫暖",
  cold: "寒冷",
  fass: "法斯",
  vome: "維姆",
  corpus: "科普斯掌控",
  grineer: "克隆尼掌控",
  calm: "平靜",
  anger: "憤怒",
  envy: "嫉妒",
  sorrow: "悲傷",
  joy: "喜悅",
  fear: "恐懼",
};

export async function getWorldState(): Promise<WorldState | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.warframestat.us/pc", {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json" },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
export function label(value: unknown, fallback = "資料同步中") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function zhFaction(value?: string) {
  if (!value) return "派系同步中";
  return factionMap[value] ?? value;
}

export function zhMission(value?: string) {
  if (!value) return "任務同步中";
  return missionMap[value] ?? value;
}

export function zhCycle(value?: string) {
  if (!value) return "循環中";
  return cycleMap[value.toLowerCase()] ?? value;
}

export function formatTimeLeft(value?: string) {
  if (!value) return "";
  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return "";
  const difference = end - Date.now();
  if (difference <= 0) return "已結束";
  const totalMinutes = Math.ceil(difference / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}天 ${hours}小時`;
  if (hours > 0) return `${hours}小時 ${minutes}分`;
  return `${minutes}分`;
}

export function formatWorldTime(value?: string, fallback = "等待訊號") {
  if (!value) return fallback;
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return "時間同步中";
  }
}

export function etaText(item?: TimeLike | null, fallback = "時間同步中") {
  if (!item) return fallback;
  const direct = item.eta || item.timeLeft || item.shortString || item.endString || item.startString;
  if (direct && direct.trim()) return direct;
  const fromExpiry = formatTimeLeft(item.expiry);
  if (fromExpiry) return fromExpiry;
  const fromDate = formatWorldTime(item.date, "");
  return fromDate || fallback;
}

export function cycleText(cycle?: Cycle) {
  if (!cycle) return "資料同步中";
  const state = zhCycle(cycle.state || cycle.active);
  const time = cycle.timeLeft || cycle.shortString || formatTimeLeft(cycle.expiry);
  return time ? `${state}｜${time}` : state;
}

export function formatReward(reward?: Reward) {
  if (!reward) return "獎勵同步中";
  if (reward.asString?.trim()) return reward.asString;
  const parts: string[] = [];
  for (const item of reward.countedItems || []) {
    parts.push(`${item.count || 1} × ${item.type || item.key || "物品"}`);
  }
  for (const item of reward.items || []) parts.push(item);
  if (reward.credits) parts.push(`${reward.credits.toLocaleString("zh-TW")} 現金`);
  return parts.join("、") || "獎勵同步中";
}

export function getActiveFissures(data?: WorldState | null) {
  return (data?.fissures || [])
    .filter((item) => !item.expired)
    .sort((a, b) => (a.tierNum ?? 99) - (b.tierNum ?? 99));
}

export function getActiveInvasions(data?: WorldState | null) {
  return (data?.invasions || []).filter((item) => !item.completed);
}

export function getSortie(data?: WorldState | null) {
  return data?.sortie ?? data?.sorties?.[0];
}

export function getStation(slug: string) {
  return LIVE_STATIONS.find((station) => station.slug === slug);
}

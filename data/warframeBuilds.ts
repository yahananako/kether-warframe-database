import type { WarframeRole } from "./warframeRoles";

export type WarframeBuildTemplate = {
  title: string;
  summary: string;
  priorities: string[];
  aura: string;
  exilus: string;
  mods: string[];
  arcanes: string[];
  shards: string[];
};

export const WARFRAME_BUILD_TEMPLATES: Record<
  WarframeRole,
  WarframeBuildTemplate
> = {
  damage: {
    title: "技能輸出通用起始配置",
    summary: "先建立強度與穩定施放循環，再依該戰甲的技能機制調整範圍或持續。",
    priorities: ["強度", "持續／範圍", "能量循環", "保命"],
    aura: "成長之力",
    exilus: "力量竄升",
    mods: [
      "暗影聚精會神",
      "瞬時堅毅",
      "延伸",
      "持久力 PRIME",
      "川流不息 PRIME",
      "簡化",
      "翻滾防護",
      "預言神密",
    ],
    arcanes: ["蛻化昇騰", "蛻現效率"],
    shards: [
      "紅色：技能強度",
      "紅色：技能強度",
      "黃色：施放速度",
      "藍色：最大能量",
      "自由調整",
    ],
  },
  control: {
    title: "範圍群控通用起始配置",
    summary: "優先確保範圍與持續時間，讓控制覆蓋穩定，再補效率與生存。",
    priorities: ["範圍", "持續", "效率", "生存"],
    aura: "短暫喘息",
    exilus: "狡詐竄升",
    mods: [
      "過度延展",
      "延伸",
      "預言通靈",
      "持久力 PRIME",
      "心志偏狹",
      "簡化",
      "翻滾防護",
      "聚精會神",
    ],
    arcanes: ["蛻現效率", "蛻化昇騰"],
    shards: [
      "黃色：施放速度",
      "黃色：施放速度",
      "藍色：最大能量",
      "紅色：技能持續",
      "自由調整",
    ],
  },
  support: {
    title: "隊伍支援通用起始配置",
    summary:
      "維持增益與恢復技能的強度、持續及施放手感，依隊伍內容再換功能型 MOD。",
    priorities: ["持續", "強度", "效率", "隊伍功能"],
    aura: "成長之力",
    exilus: "力量竄升",
    mods: [
      "持久力 PRIME",
      "心志偏狹",
      "暗影聚精會神",
      "預言神密",
      "川流不息 PRIME",
      "簡化",
      "延伸",
      "適應",
    ],
    arcanes: ["蛻現效率", "充沛賦能"],
    shards: [
      "紅色：技能持續",
      "紅色：技能強度",
      "黃色：施放速度",
      "藍色：最大能量",
      "自由調整",
    ],
  },
  survival: {
    title: "高壓生存通用起始配置",
    summary: "先把減傷與容錯建立起來，再補維持核心技能所需的強度與持續。",
    priorities: ["減傷／護盾門", "生命或護甲", "持續", "能量"],
    aura: "短暫喘息",
    exilus: "頂天立地 PRIME",
    mods: [
      "適應",
      "翻滾防護",
      "暗影生命力",
      "暗影纖維",
      "暗影聚精會神",
      "持久力 PRIME",
      "川流不息 PRIME",
      "簡化",
    ],
    arcanes: ["保衛者賦能", "優雅賦能"],
    shards: [
      "藍色：護甲",
      "藍色：最大生命",
      "黃色：施放速度",
      "紅色：技能強度",
      "自由調整",
    ],
  },
  stealth: {
    title: "匿蹤續航通用起始配置",
    summary: "以持續時間與能量循環維持隱形，保留足夠範圍完成控場、標記或移動。",
    priorities: ["持續", "效率", "能量", "必要範圍"],
    aura: "能量虹吸",
    exilus: "準備就緒",
    mods: [
      "持久力 PRIME",
      "心志偏狹",
      "預言啟示",
      "川流不息 PRIME",
      "簡化",
      "延伸",
      "翻滾防護",
      "暗影聚精會神",
    ],
    arcanes: ["充沛賦能", "蛻現效率"],
    shards: [
      "紅色：技能持續",
      "紅色：技能持續",
      "黃色：施放速度",
      "藍色：最大能量",
      "自由調整",
    ],
  },
};

export const AURA_OPTIONS = [
  "成長之力",
  "短暫喘息",
  "腐蝕投射",
  "能量虹吸",
  "鋼鐵充能",
  "戰利品探測器",
  "敵人感應",
];

export const EXILUS_OPTIONS = [
  "力量竄升",
  "狡詐竄升",
  "速度竄升",
  "頂天立地 PRIME",
  "準備就緒",
  "川流不息（漂泊者）",
];

export const MOD_OPTIONS = [
  "暗影聚精會神",
  "暗影生命力",
  "暗影纖維",
  "瞬時堅毅",
  "盲怒",
  "聚精會神",
  "預言神密",
  "持久力 PRIME",
  "心志偏狹",
  "預言啟示",
  "過度延展",
  "延伸",
  "預言通靈",
  "川流不息 PRIME",
  "簡化",
  "彈指瞬技",
  "適應",
  "翻滾防護",
  "均衡點",
  "生命轉換",
];

export const ARCANE_OPTIONS = [
  "蛻化昇騰",
  "蛻現效率",
  "充沛賦能",
  "保衛者賦能",
  "優雅賦能",
  "復仇者賦能",
  "神盾賦能",
];

export const SHARD_OPTIONS = [
  "紅色：技能強度",
  "紅色：技能持續",
  "紅色：主要武器暴擊",
  "紅色：次要武器暴擊",
  "黃色：施放速度",
  "黃色：能量球效率",
  "黃色：跑酷速度",
  "藍色：最大能量",
  "藍色：最大生命",
  "藍色：最大護盾",
  "藍色：護甲",
  "翠綠：腐蝕層數",
  "橙色：爆炸／輻射玩法",
  "紫色：近戰暴擊玩法",
  "自由調整",
];

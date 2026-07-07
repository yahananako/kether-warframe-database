export type WarframeProfile = {
  discordId: string;
  displayName: string;
  warframeId: string;
  platform: string;
  masteryRank: string;
  playtimeHours?: number;
  platinum?: number;
  platinumPrivacy: "private" | "public";
  mainFrame?: string;
  clanRole?: string;
  note?: string;
  updatedAt: string;
};

export const WARFRAME_PROFILES: Record<string, WarframeProfile> = {
  "你的Discord使用者ID": {
    discordId: "你的Discord使用者ID",
    displayName: "小希",
    warframeId: "Yahananako",
    platform: "PC",
    masteryRank: "MR18",
    playtimeHours: 1280,
    platinum: 300,
    platinumPrivacy: "private",
    mainFrame: "Yareli / 雅蕾莉",
    clanRole: "座天使",
    note: "撒滿櫻花的花海",
    updatedAt: "2026/07/07",
  },
};

export function getWarframeProfile(discordId: string) {
  return WARFRAME_PROFILES[discordId] ?? null;
}

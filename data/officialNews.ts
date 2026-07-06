export type OfficialNewsLink = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
};

export const OFFICIAL_NEWS_BOARD = {
  kicker: "WARFRAME OFFICIAL",
  title: "官方新聞摘要",
  description:
    "集中放置官方新聞、更新紀錄與論壇入口。後續可接 RSS／API，自動整理最新公告與活動摘要。",
  mainLinkText: "前往官方新聞",
  mainLinkHref: "https://www.warframe.com/news",
  note: "目前為官方公告看板版；後續可接 RSS／API，升級成自動新聞摘要。",
};

export const OFFICIAL_NEWS_LINKS: OfficialNewsLink[] = [
  {
    id: "news",
    label: "NEWS",
    title: "官方新聞",
    description: "查看最新活動、Prime Access、Devstream 與官方消息。",
    href: "https://www.warframe.com/news",
  },
  {
    id: "updates",
    label: "UPDATE",
    title: "更新紀錄",
    description: "追蹤版本更新、Hotfix、修正項目與平衡調整。",
    href: "https://www.warframe.com/updates",
  },
  {
    id: "forums",
    label: "FORUM",
    title: "官方論壇",
    description: "查看公告、已知問題、活動討論與玩家回報。",
    href: "https://forums.warframe.com",
  },
];

const db = (key: string, label: string, description: string, icon: string) => ({
  href: `/database/${key}`,
  label,
  description,
  image: `/icon-${icon}.png`,
  activeImage: `/icon-${icon}-2.png`,
});
const extra = (key: string, label: string, description: string) => ({
  href: `/${key}`,
  label,
  description,
  image: `/home-icons/nav-${key}.svg`,
  activeImage: `/home-icons/nav-${key}-active.svg`,
});
export const navigationGroups = [
  {
    label: "資料庫分類",
    english: "TENNO ARCHIVE",
    items: [
      db("overview", "資料總覽", "收錄與收藏進度", "overview"),
      db("warframes", "一般戰甲", "定位、技能與取得", "warframe"),
      db("warframes/prime", "Prime 戰甲", "行情與交易", "warframe"),
      {
        href: "/database/incarnon",
        label: "靈化武器",
        description: "進化與解鎖條件",
        image: "/incarnon-weapons/braton.png",
        activeImage: "/incarnon-weapons/braton.png",
      },
      db("primary", "主要武器", "分類與來源", "primary"),
      db("secondary", "次要武器", "分類與來源", "secondary"),
      db("melee", "近戰武器", "分類與來源", "melee"),
      db("mods", "MOD", "模組資料", "mod"),
      db("companions", "同伴", "寵物與機械", "companion"),
      db("archwing", "曲翼與機甲", "空戰資料", "archwing"),
    ],
  },
  {
    label: "故事與氏族",
    english: "KETHER OF PARADISO",
    items: [
      extra("story", "故事書", "主線、支線與系列"),
      {
        href: "/clan",
        label: "KETHER 氏族",
        description: "公告與氏族資訊",
        image: "/kether-clan-logo.png",
        activeImage: "/kether-clan-logo.png",
      },
      extra("profile", "個人中心", "帳號與收藏進度"),
    ],
  },
  {
    label: "電波情報",
    english: "SIGNAL STATION",
    items: [
      extra("live", "電波局", "星圖循環與官方消息"),
      extra("bot", "小希 BOT", "Discord 查詢工具"),
    ],
  },
];

import type { Metadata } from "next";
import "./globals.css";
import MiniMusicPlayer from "../components/MiniMusicPlayer";

const siteUrl = "https://kether-warframe-database.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KETHER OF PARADISO Warframe Database",
    template: "%s | KETHER OF PARADISO",
  },
  description:
    "KETHER OF PARADISO Warframe 資料庫，整理 Warframe 戰甲、武器、MOD、同伴、曲翼、取得方式、交易追價與 Discord 個人進度資料。",
  keywords: [
    "Warframe",
    "Warframe 資料庫",
    "KETHER",
    "KETHER OF PARADISO",
    "戰甲",
    "武器",
    "MOD",
    "同伴",
    "曲翼",
    "Warframe Market",
    "ヤハ奈々子",
  ],
  authors: [{ name: "ヤハ奈々子" }],
  creator: "ヤハ奈々子",
  publisher: "KETHER OF PARADISO",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "KETHER OF PARADISO Warframe Database",
    title: "KETHER OF PARADISO Warframe Database",
    description:
      "Warframe 氏族資料庫，整理戰甲、武器、MOD、同伴、曲翼、交易追價與 Discord 個人進度。",
  },
  twitter: {
    card: "summary_large_image",
    title: "KETHER OF PARADISO Warframe Database",
    description:
      "Warframe 氏族資料庫，整理戰甲、武器、MOD、同伴、曲翼、交易追價與 Discord 個人進度。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
        <MiniMusicPlayer />
      </body>
    </html>
  );
}

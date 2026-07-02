import "./globals.css";

export const metadata = {
  title: "KETHER OF PARADISO Warframe Database",
  description: "Warframe 氏族資料庫首頁"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

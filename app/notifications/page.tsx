import Link from "next/link";
import { Bell, Database, ShieldCheck, Sparkles } from "lucide-react";
import { KETHER_APP_VERSION, KETHER_BOT_VERSION } from "../../data/siteVersion";

const updates = [
  {
    version: KETHER_APP_VERSION,
    title: "電波局與五大裝備分類改版",
    content: "12 座即時情報站皆有獨立美化頁面；主要、次要、近戰、同伴與曲翼加入分類導覽，並補齊擬狐獸、孤生獸、骨寡婦與虛空魂。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "赤毒武器系列同步完成",
    content: "21 把赤毒武器已同步到 Google Sheets、網站、小希 BOT 與 Android APP，並加入已轉化玄骸即時拍賣價及交易頁。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "一般戰甲檔案館上線",
    content: "收錄 60 位一般戰甲的圖片、五種定位、遊戲內故事與入手條件，並移除交易價格與市場連結。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "Prime 戰甲獨立分頁",
    content: "Prime 戰甲已與一般版本分離，獨立保留白金價格、Warframe Market 交易連結與個人持有資料。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "故事書專屬封面更新",
    content: "主線與支線故事各自使用任務專屬封面，修復失效圖片並停止共用主要圖片或戰甲圖片。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "首頁資訊全面同步",
    content: "首頁導覽、漢堡選單、搜尋、鈴鐺與動態跑馬燈皆已更新為最新資料庫結構。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "同步系統維持運作",
    content: `Google Sheets、Discord 個人進度與每日 04:00 價格同步維持運作，BOT 版本為 ${KETHER_BOT_VERSION}。`,
  },
]

export default function NotificationsPage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">KETHER NOTICE</p>
        <h1>
          <Bell size={30} /> 更新公告中心
        </h1>
        <p>
          這裡整理網站版本更新、Discord 個人化資料庫、首頁總覽與後續開發公告。
        </p>

        <div className="auth-actions">
          <Link className="auth-primary" href="/">
            回首頁
          </Link>
        </div>
      </section>

      <section className="summary-panel">
        <div className="card-title">
          <Database size={18} />
          <span>目前狀態</span>
        </div>

        <div className="summary-table">
          <div className="summary-row">
            <span>網站版本</span>
            <b>{KETHER_APP_VERSION}</b>
          </div>
          <div className="summary-row">
            <span>Discord 個人化</span>
            <b>已啟用</b>
          </div>
          <div className="summary-row">
            <span>一般戰甲收錄</span>
            <b>60 位</b>
          </div>
          <div className="summary-row">
            <span>戰甲版本分頁</span>
            <b>一般／Prime 已分離</b>
          </div>
        </div>
      </section>

      <section className="summary-panel">
        <div className="card-title">
          <ShieldCheck size={18} />
          <span>更新紀錄</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {updates.map((item) => (
            <article key={`${item.version}-${item.title}`} className="info-card">
              <strong>{item.version}</strong>
              <h2>
                <Sparkles size={18} /> {item.title}
              </h2>
              <p>{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

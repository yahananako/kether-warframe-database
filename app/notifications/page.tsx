import Link from "next/link";
import { Bell, Database, ShieldCheck, Sparkles } from "lucide-react";

const updates = [
  {
    version: "V2.5.1",
    title: "網站基礎架構完成",
    content: "KETHER 網站基礎架構已完成，後續進入資料內容更新與功能細節優化階段。",
  },
  {
    version: "V2.5.1",
    title: "手機版首頁整理完成",
    content: "手機版首頁、玻璃選單、搜尋、鈴鐺與導覽區已完成整理，主要入口維持既有結構並完成視覺優化。",
  },
  {
    version: "V2.5.1",
    title: "KETHER RADIO 優化",
    content: "音樂播放器已加入循環播放、標題跑馬燈與控制按鍵優化，避免播放清單停在最後一首。",
  },
  {
    version: "V2.5.1",
    title: "分類導覽素材接入",
    content: "分類導覽素材已接入網站，後續依繪師圖確認尺寸、位置與實際顯示效果。",
  },
  {
    version: "V2.5.1",
    title: "同步系統維護中",
    content: "Discord 登入、個人進度與 Google Sheets 資料同步維持運作，BOT 版本同步記錄為 V3.5-E17。",
  },
];

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
            <b>v2.2.0</b>
          </div>
          <div className="summary-row">
            <span>Discord 個人化</span>
            <b>已啟用</b>
          </div>
          <div className="summary-row">
            <span>首頁個人進度</span>
            <b>已接上</b>
          </div>
          <div className="summary-row">
            <span>導航分類狀態</span>
            <b>已整合</b>
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

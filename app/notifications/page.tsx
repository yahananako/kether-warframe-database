import Link from "next/link";
import { Bell, Database, ShieldCheck, Sparkles } from "lucide-react";

const updates = [
  {
    version: "v2.2.0",
    title: "Discord 個人進度啟用",
    content: "首頁已接上 Discord 個人已購買與個人完成度，未登入時顯示表格統計。"
  },
  {
    version: "v2.2.0",
    title: "導航區整合分類狀態",
    content: "首頁導航卡片已整合分類筆數、區塊數、有價格數與完成度。"
  },
  {
    version: "v2.2.0",
    title: "資料庫狀態與備註合併",
    content: "首頁資料庫狀態與備註已整合成單一資訊區塊。"
  },
  {
    version: "v2.2.0",
    title: "Discord 權限驗證完成",
    content: "網站會檢查 Discord Guild ID，Role ID 可選；登出後會自動回首頁。"
  }
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

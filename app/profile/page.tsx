import Link from "next/link";
import {
  UserRound,
  ShieldCheck,
  Database,
  CheckCircle2,
  BarChart3,
  LockKeyhole,
  Users,
  CreditCard
} from "lucide-react";

const progressCards = [
  {
    title: "個人已購買",
    value: "尚未啟用",
    note: "未來每位 Discord 使用者會有自己的已購買紀錄。"
  },
  {
    title: "完成度",
    value: "待登入",
    note: "登入後依個人資料計算，不再共用 Google Sheets 欄位。"
  },
  {
    title: "收藏總價",
    value: "規劃中",
    note: "可依已購買 / 未購買估算所需白金。"
  },
  {
    title: "Discord 權限",
    value: "待接入",
    note: "之後會檢查是否在授權群組與指定身分組。"
  }
];

export default function ProfilePage() {
  return (
    <main className="page-shell profile-page">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <header className="profile-header">
        <Link href="/" className="db-back">← 返回首頁</Link>

        <div>
          <p>KETHER OF PARADISO</p>
          <h1>個人進度中心</h1>
          <span>v2.5.41 個人化資料庫前置架構，準備接入 Discord 與資料庫。</span>
        </div>
      </header>

      <section className="profile-hero">
        <UserRound size={70} strokeWidth={1.4} />
        <h2>你的 Warframe 收藏進度將會在這裡展開</h2>
        <p>
          目前網站仍是 Google Sheets 只讀資料模式。下一階段接上資料庫後，
          每位 Discord 使用者都會擁有自己的已購買紀錄、完成度、缺少清單與收藏統計。
        </p>

        <div className="auth-actions">
          <Link className="auth-primary" href="/login">
            <LockKeyhole size={20} />
            前往登入前置頁
          </Link>
          <Link className="auth-secondary" href="/database/overview">
            查看總覽
          </Link>
        </div>
      </section>

      <section className="profile-progress-grid">
        {progressCards.map((card) => (
          <article key={card.title}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="profile-system-grid">
        <article>
          <Database size={38} />
          <h3>個人資料表</h3>
          <p>未來會建立 user_owned_items，記錄每個 Discord 使用者對每個物品的已購買狀態。</p>
        </article>

        <article>
          <CheckCircle2 size={38} />
          <h3>已購買切換</h3>
          <p>資料頁的已購買按鈕會從只讀顯示，升級成可儲存的個人狀態。</p>
        </article>

        <article>
          <BarChart3 size={38} />
          <h3>完成度統計</h3>
          <p>總覽會依照使用者自己的資料計算戰甲、武器、同伴、MOD 等完成度。</p>
        </article>

        <article>
          <Users size={38} />
          <h3>多群組支援</h3>
          <p>未來每個 Discord 群組會有獨立設定、允許身分組與訂閱狀態。</p>
        </article>

        <article>
          <ShieldCheck size={38} />
          <h3>權限驗證</h3>
          <p>網站會檢查 Discord Guild ID 與 Role ID，通過才開啟個人化功能。</p>
        </article>

        <article>
          <CreditCard size={38} />
          <h3>付費方案預留</h3>
          <p>未來可做群組訂閱、試用狀態、到期日與功能限制。</p>
        </article>
      </section>
    </main>
  );
}

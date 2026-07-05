import Link from "next/link";
import {
  UserRound,
  ShieldCheck,
  Database,
  CheckCircle2,
  BarChart3,
  LockKeyhole,
  Users,
  CreditCard,
  LogOut
} from "lucide-react";
import AuthSessionStatus from "../../components/AuthSessionStatus";

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
    value: "Session 已建立",
    note: "目前已具備 Discord session 讀取與登出 route。"
  }
];

export default function ProfilePage() {
  return (
    <main className="page-shell auth-page">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <header className="auth-header">
        <Link href="/" className="db-back">← 返回首頁</Link>
        <div>
          <p>KETHER OF PARADISO</p>
          <h1>個人進度中心</h1>
          <span>v2.2.0 Discord session 與個人化資料庫前置架構。</span>
        </div>
      </header>

      <section className="auth-hero-card">
        <UserRound size={68} strokeWidth={1.4} />
        <h2>你的 Warframe 收藏進度將會在這裡展開</h2>
        <p>
          目前網站仍是 Google Sheets 只讀資料模式。Discord 登入後，
          每位使用者都會擁有自己的已購買紀錄、完成度、缺少清單與收藏統計。
        </p>

        <div className="auth-actions">
          <Link className="auth-primary" href="/login">
            <ShieldCheck size={20} />
            前往登入頁
          </Link>

          <a className="auth-primary" href="/api/auth/session">
            <Database size={20} />
            查看登入狀態
          </a>

          <a className="auth-primary" href="/api/auth/logout">
            <LogOut size={20} />
            登出 Discord
          </a>
        </div>
      </section>

      <AuthSessionStatus />

      <section className="auth-grid">
        {progressCards.map((card) => (
          <article key={card.title}>
            <CheckCircle2 size={34} />
            <h3>{card.title}</h3>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="auth-flow">
        <h2>個人化資料庫流程</h2>

        <div>
          <span>1</span>
          <p>使用者透過 Discord 登入</p>
        </div>

        <div>
          <span>2</span>
          <p>網站檢查伺服器成員與指定身分組</p>
        </div>

        <div>
          <span>3</span>
          <p>通過後建立 Discord session cookie</p>
        </div>

        <div>
          <span>4</span>
          <p>未來讀寫個人已購買與完成度資料</p>
        </div>
      </section>

      <section className="auth-grid">
        <article>
          <BarChart3 size={34} />
          <h3>完成度統計</h3>
          <p>總覽會依照使用者自己的資料計算戰甲、武器、同伴、MOD 等完成度。</p>
        </article>

        <article>
          <Users size={34} />
          <h3>多群組支援</h3>
          <p>未來每個 Discord 群組會有獨立設定、允許身分組與訂閱狀態。</p>
        </article>

        <article>
          <LockKeyhole size={34} />
          <h3>權限驗證</h3>
          <p>網站會檢查 Discord Guild ID 與 Role ID，通過才開啟個人化功能。</p>
        </article>

        <article>
          <CreditCard size={34} />
          <h3>付費方案預留</h3>
          <p>未來可做群組訂閱、試用狀態、到期日與功能限制。</p>
        </article>
      </section>
    </main>
  );
}

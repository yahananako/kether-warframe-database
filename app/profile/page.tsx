import Link from "next/link";

import {
  UserRound,
  ShieldCheck,
  Database,
  BarChart3,
  Users,
  LogOut
} from "lucide-react";

import AuthSessionStatus from "../../components/AuthSessionStatus";
import ProfileOwnedSummary from "../../components/ProfileOwnedSummary";
import PermissionVerificationStatus from "../../components/PermissionVerificationStatus";
import BillingPlanStatus from "../../components/BillingPlanStatus";

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
        <ProfileOwnedSummary />
      </section>

      <section className="auth-flow">
        <h2>個人化資料庫流程</h2>

        <div>
          <span>1</span>
          <p>使用者透過 Discord 登入</p>
        </div>

        <div>
          <span>2</span>
          <p>網站檢查 Discord Guild ID，並可選擇檢查 Role ID</p>
        </div>

        <div>
          <span>3</span>
          <p>通過後建立 Discord session cookie</p>
        </div>

        <div>
          <span>4</span>
          <p>讀寫個人已購買、完成度與方案狀態資料</p>
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

        <PermissionVerificationStatus />

        <BillingPlanStatus />
      </section>
    </main>
  );
}

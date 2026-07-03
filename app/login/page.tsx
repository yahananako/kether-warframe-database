import Link from "next/link";
import { ShieldCheck, MessageCircle, LockKeyhole, Users, CreditCard } from "lucide-react";

export default function LoginPage() {
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
          <h1>Discord 登入</h1>
          <span>v2.3.9 權限系統前置頁，下一階段會接入 Discord OAuth。</span>
        </div>
      </header>

      <section className="auth-hero-card">
        <ShieldCheck size={68} strokeWidth={1.4} />
        <h2>氏族資料庫權限入口</h2>
        <p>
          目前網站仍是公開只讀資料模式。未來登入後，會依照 Discord 群組與身分組判斷可用權限，
          並啟用個人已購買、完成度、收藏進度等個人化資料。
        </p>

        <div className="auth-actions">
          <a className="auth-primary" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={20} />
            加入 Discord 群組
          </a>
          <button className="auth-disabled" disabled>
            Discord OAuth 尚未啟用
          </button>
        </div>
      </section>

      <section className="auth-grid">
        <article>
          <LockKeyhole size={34} />
          <h3>本氏族權限</h3>
          <p>先支援 KETHER OF PARADISO 成員登入後使用個人化進度。</p>
        </article>

        <article>
          <Users size={34} />
          <h3>多 Discord 群組</h3>
          <p>未來其他 Discord 群組可申請使用自己的資料庫權限。</p>
        </article>

        <article>
          <CreditCard size={34} />
          <h3>付費開通預留</h3>
          <p>未來可依群組、身分組、人數與功能方案做訂閱管理。</p>
        </article>
      </section>

      <section className="auth-flow">
        <h2>未來登入流程</h2>
        <div>
          <span>1</span>
          <p>使用者點 Discord 登入</p>
        </div>
        <div>
          <span>2</span>
          <p>網站取得 Discord 使用者 ID</p>
        </div>
        <div>
          <span>3</span>
          <p>檢查是否在授權群組與指定身分組</p>
        </div>
        <div>
          <span>4</span>
          <p>通過後啟用個人已購買與完成度資料</p>
        </div>
      </section>
    </main>
  );
}

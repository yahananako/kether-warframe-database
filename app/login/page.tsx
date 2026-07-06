import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  LockKeyhole,
  Users,
  CreditCard,
} from "lucide-react";

export default function LoginPage() {
  return (
    <main className="page-shell auth-page">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <header className="auth-header">
        <Link href="/" className="db-back">
          ← 返回首頁
        </Link>

        <div>
          <p>KETHER OF PARADISO</p>
          <h1>Discord 登入</h1>
          <span>
            v2.2.0 權限系統已啟用，首頁公開，其他資料頁需 Discord 權限。
          </span>
        </div>
      </header>

      <section className="auth-hero-card">
        <ShieldCheck size={68} strokeWidth={1.4} />

        <h2>氏族資料庫權限入口</h2>

        <p>
          首頁可公開瀏覽。其他資料頁、個人進度與資料庫狀態需要 Discord
          登入，系統會依 Discord 群組與身分組判斷可用權限。
        </p>

        <div className="auth-actions">
          <a
            className="auth-primary"
            href="https://discord.gg/MFhTb8XMZ"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
            加入 Discord 群組
          </a>

          <a className="auth-primary" href="/api/auth/discord/login">
            <LockKeyhole size={20} />
            使用 Discord 登入
          </a>
        </div>
      </section>

      <section className="auth-grid">
        <article>
          <LockKeyhole size={34} />
          <h3>本氏族權限</h3>
          <p>KETHER OF PARADISO 成員登入後可使用資料庫內頁與個人化進度。</p>
        </article>

        <article>
          <Users size={34} />
          <h3>多 Discord 群組</h3>
          <p>之後可開放其他 Discord 群組申請自己的資料庫權限。</p>
        </article>

        <article>
          <CreditCard size={34} />
          <h3>付費開通預留</h3>
          <p>之後可依群組、身分組、人數與功能方案做訂閱管理。</p>
        </article>
      </section>

      <section className="auth-flow">
        <h2>目前登入流程</h2>

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
          <p>通過後開放資料庫頁面與個人已購買／完成度資料</p>
        </div>
      </section>
    </main>
  );
}

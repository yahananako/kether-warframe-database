import Link from "next/link";
import { Ban, MessageCircle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="page-shell auth-page">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <section className="auth-hero-card unauthorized-card">
        <Ban size={72} strokeWidth={1.4} />
        <h1>尚未取得資料庫權限</h1>
        <p>
          你可能尚未登入 Discord、尚未加入授權群組，或缺少可使用資料庫的身分組。
        </p>

        <div className="auth-actions">
          <Link className="auth-primary" href="/login">
            前往登入頁
          </Link>
          <a className="auth-secondary" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={20} />
            加入 Discord
          </a>
        </div>

        <Link href="/" className="back-link">
          ← 返回首頁
        </Link>
      </section>
    </main>
  );
}

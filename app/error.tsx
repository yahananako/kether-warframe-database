"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="search-empty" role="alert">
      <span className="site-eyebrow">SIGNAL INTERRUPTED</span>
      <h1>資料連線暫時中斷</h1>
      <p>請重新載入這個頁面，或回到首頁選擇其他資料。</p>
      <div className="auth-actions">
        <button onClick={reset}>重新載入</button>
        <Link className="site-button" href="/">
          回首頁
        </Link>
      </div>
    </main>
  );
}

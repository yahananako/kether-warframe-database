import Link from "next/link";
export default function NotFound() {
  return (
    <main className="search-empty">
      <span className="site-eyebrow">404 / ARCHIVE NOT FOUND</span>
      <h1>這份檔案不在目前的航路上</h1>
      <p>連結可能已更新，請回到資料庫搜尋。</p>
      <div className="auth-actions">
        <Link className="site-button primary" href="/search">
          搜尋資料庫
        </Link>
        <Link className="site-button" href="/">
          回首頁
        </Link>
      </div>
    </main>
  );
}

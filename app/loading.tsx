export default function Loading() {
  return (
    <main className="search-empty" role="status" aria-live="polite">
      <span className="site-eyebrow">KETHER ARCHIVE</span>
      <h1>正在讀取資料…</h1>
      <p>正在同步這個頁面的內容。</p>
    </main>
  );
}

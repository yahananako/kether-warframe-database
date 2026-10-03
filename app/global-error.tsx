"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-Hant"><body style={{ margin: 0, background: "#080d18", color: "#f4f7fc", fontFamily: "system-ui, sans-serif" }}>
    <main style={{ maxWidth: 640, margin: "12vh auto", padding: 24, lineHeight: 1.8 }}>
      <p>KETHER OF PARADISO</p><h1>網站暫時無法載入</h1><p>請重新嘗試，或返回首頁。</p>
      <button type="button" onClick={reset} style={{ font: "inherit", padding: "10px 20px", marginRight: 20 }}>重新嘗試</button>
      <a href="/" style={{ color: "#a7d6ff" }}>返回首頁</a>
    </main>
  </body></html>;
}

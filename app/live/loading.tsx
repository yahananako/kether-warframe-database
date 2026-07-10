export default function LiveLoading() {
  return (
    <main className="live-page-shell">
      <section className="live-hero live-loading-hero">
        <p className="live-eyebrow">KETHER NEKO SIGNAL</p>
        <h1>小希正在捕捉星圖訊號</h1>
        <p>
          正在連接 Warframe 星系電波，請稍等片刻。虛空裂縫、入侵戰線與 Baro 商船資料正在同步中喵。
        </p>

        <div className="live-loading-pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}

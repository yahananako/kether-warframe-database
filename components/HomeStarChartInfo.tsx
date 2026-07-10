type HomeStarChartInfoProps = {
  totalRows: number;
  totalPriced: number;
  totalSections: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

export default function HomeStarChartInfo({
  totalRows,
  totalPriced,
  totalSections,
}: HomeStarChartInfoProps) {
  return (
    <section className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-violet-200/30 backdrop-blur">
      <p className="text-xs font-black tracking-[0.24em] text-violet-600">
        KETHER STAR CHART INFO
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        KETHER 星圖航標資訊
      </h2>

      <p className="mt-2 text-sm font-black leading-7 text-slate-500">
        更新日期 2026/7/11　目前版本 V2.5.1 + BOT V3.5-E17
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <article className="rounded-[24px] border border-violet-100 bg-violet-50/80 p-5 shadow-inner">
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">
            01
          </span>

          <h3 className="mt-3 text-xl font-black text-slate-950">
            更新資訊
          </h3>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
            首頁、BOT、總覽與各資料頁上方區塊正在統一成小希風格。
            /live 星圖電波局已上線，網站入口與資料導航持續整理中。
          </p>
        </article>

        <article className="rounded-[24px] border border-sky-100 bg-sky-50/80 p-5 shadow-inner">
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-sky-700">
            02
          </span>

          <h3 className="mt-3 text-xl font-black text-slate-950">
            目前版本
          </h3>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
            網站版本為 <b className="text-slate-950">V2.5.1</b>。
            Discord BOT 版本為 <b className="text-slate-950">V3.5-E17</b>。
          </p>
        </article>

        <article className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50/80 p-5 shadow-inner">
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-fuchsia-700">
            03
          </span>

          <h3 className="mt-3 text-xl font-black text-slate-950">
            資料庫狀態
          </h3>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
            Google Sheets 持續連線中，分頁資料與 Discord 個人進度已啟用。
            目前統計資料 {formatNumber(totalRows)} 筆、區塊 {formatNumber(totalSections)} 個、
            有價格資料 {formatNumber(totalPriced)} 筆。
          </p>
        </article>
      </div>
    </section>
  );
}

import Link from "next/link";

const categoryConfig: Record<string, {
  title: string;
  subtitle: string;
  count: string;
  sheet: string;
}> = {
  overview: {
    title: "總覽",
    subtitle: "個人完成度、總價格、分類統計與收藏進度中心。",
    count: "281",
    sheet: "總覽"
  },
  warframes: {
    title: "戰甲",
    subtitle: "Prime 戰甲資料、交易價格與個人已購買紀錄。",
    count: "待串接",
    sheet: "戰甲"
  },
  primary: {
    title: "主要武器",
    subtitle: "主要武器資料、價格排序與交易連結。",
    count: "待串接",
    sheet: "主要武器"
  },
  secondary: {
    title: "次要武器",
    subtitle: "次要武器資料、價格排序與交易連結。",
    count: "待串接",
    sheet: "次要武器"
  },
  melee: {
    title: "近戰武器",
    subtitle: "近戰武器資料、價格排序與交易連結。",
    count: "待串接",
    sheet: "近戰武器"
  },
  companions: {
    title: "同伴",
    subtitle: "同伴、寵物與相關資料庫頁面。",
    count: "待串接",
    sheet: "同伴"
  },
  archwing: {
    title: "曲翼",
    subtitle: "曲翼、亡靈骸甲與相關武器資料。",
    count: "待串接",
    sheet: "曲翼"
  },
  mods: {
    title: "MOD資料庫",
    subtitle: "P版 MOD、屬性 MOD、系列 MOD 與交易價格。",
    count: "待串接",
    sheet: "MOD"
  }
};

const demoRows = [
  {
    zh: "範例資料 A",
    en: "Example Item A",
    use: "下一階段會由 Google Sheets 自動讀取",
    price: "待更新",
    owned: "未啟用",
    market: "交易連結"
  },
  {
    zh: "範例資料 B",
    en: "Example Item B",
    use: "這裡會顯示中文用途與備註",
    price: "待更新",
    owned: "未啟用",
    market: "交易連結"
  },
  {
    zh: "範例資料 C",
    en: "Example Item C",
    use: "個人已購買會在 v2.0.6 後導入",
    price: "待更新",
    owned: "未啟用",
    market: "交易連結"
  }
];

export default async function CategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = categoryConfig[category] ?? categoryConfig.overview;

  return (
    <main className="page-shell category-page-v04">
      <header className="db-page-header">
        <Link href="/" className="db-back">← 返回首頁</Link>

        <div className="db-title-block">
          <p>KETHER OF PARADISO</p>
          <h1>{data.title}</h1>
          <span>{data.subtitle}</span>
        </div>

        <div className="db-version-chip">網站版本 v2.0.4</div>
      </header>

      <section className="db-kpi-grid">
        <article>
          <span>目前資料數</span>
          <strong>{data.count}</strong>
        </article>
        <article>
          <span>資料來源</span>
          <strong>{data.sheet}</strong>
        </article>
        <article>
          <span>已購買</span>
          <strong>個人化待啟用</strong>
        </article>
        <article>
          <span>完成度</span>
          <strong>v2.0.6 開放</strong>
        </article>
      </section>

      <section className="db-tool-panel">
        <input placeholder="搜尋中文名 / 英文名 / 用途..." />
        <button>全部</button>
        <button>已購買</button>
        <button>未購買</button>
        <button>價格排序</button>
      </section>

      <section className="db-table-card">
        <div className="db-table-title">
          <div>
            <h2>{data.title}資料表</h2>
            <p>目前為版面展示資料，下一階段會改為讀取 Google Sheets。</p>
          </div>
          <span>只讀資料模式</span>
        </div>

        <div className="db-table desktop-table">
          <div className="db-row db-head">
            <span>中文名</span>
            <span>英文名</span>
            <span>用途 / 說明</span>
            <span>交易價格</span>
            <span>已購買</span>
            <span>交易網站</span>
          </div>

          {demoRows.map((row) => (
            <div className="db-row" key={row.zh}>
              <span>{row.zh}</span>
              <span>{row.en}</span>
              <span>{row.use}</span>
              <span>{row.price}</span>
              <span><b className="owned-pill">{row.owned}</b></span>
              <span><button className="link-button">{row.market}</button></span>
            </div>
          ))}
        </div>

        <div className="mobile-cards">
          {demoRows.map((row) => (
            <article className="mobile-data-card" key={row.en}>
              <h3>{row.zh}</h3>
              <p>{row.en}</p>
              <small>{row.use}</small>
              <div>
                <span>價格：{row.price}</span>
                <b>{row.owned}</b>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

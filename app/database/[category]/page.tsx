import Link from "next/link";

const categoryData: Record<string, { title: string; description: string }> = {
  overview: {
    title: "總覽",
    description: "未來這裡會顯示個人完成度、已購買比例、總價格與分類統計。"
  },
  warframes: {
    title: "戰甲",
    description: "未來這裡會讀取 Google Sheets 的戰甲資料。"
  },
  primary: {
    title: "主要武器",
    description: "未來這裡會讀取主要武器資料，並支援價格排序與已購買篩選。"
  },
  secondary: {
    title: "次要武器",
    description: "未來這裡會讀取次要武器資料。"
  },
  melee: {
    title: "近戰武器",
    description: "未來這裡會讀取近戰武器資料。"
  },
  companions: {
    title: "同伴",
    description: "未來這裡會讀取同伴與寵物資料。"
  },
  archwing: {
    title: "曲翼",
    description: "未來這裡會讀取曲翼、亡靈骸甲與相關武器資料。"
  },
  mods: {
    title: "MOD資料庫",
    description: "未來這裡會讀取 P版 MOD、屬性 MOD、系列 MOD 與交易價格。"
  }
};

export default async function CategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = categoryData[category] ?? categoryData.overview;

  return (
    <main className="page-shell category-page">
      <header className="category-header">
        <Link href="/" className="back-link">← 返回首頁</Link>
        <div>
          <p>KETHER OF PARADISO</p>
          <h1>{data.title}</h1>
          <span>{data.description}</span>
        </div>
      </header>

      <section className="category-tools">
        <input placeholder="搜尋中文名 / 英文名..." />
        <button>全部</button>
        <button>已購買</button>
        <button>未購買</button>
      </section>

      <section className="category-table">
        <div className="table-head">
          <span>中文名</span>
          <span>英文名</span>
          <span>交易價格</span>
          <span>已購買</span>
          <span>交易網站</span>
        </div>

        <div className="empty-state">
          <h2>資料頁已建立</h2>
          <p>下一階段會把 Google Sheets 真實資料接進這裡。</p>
        </div>
      </section>
    </main>
  );
}

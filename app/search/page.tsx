import Link from "next/link";
import { Search } from "lucide-react";
import { fetchSheetRows } from "../../lib/sheets";
import type { SheetRow } from "../../lib/sheets";

const categories = [
  { key: "warframes", label: "戰甲" },
  { key: "primary", label: "主要武器" },
  { key: "secondary", label: "次要武器" },
  { key: "melee", label: "近戰武器" },
  { key: "companions", label: "同伴" },
  { key: "archwing", label: "曲翼" },
  { key: "mods", label: "MOD資料庫" }
];

type SearchResult = SheetRow & {
  categoryKey: string;
  categoryLabel: string;
};

function normalize(value: string): string {
  return String(value || "").toLowerCase().trim();
}

function matchRow(row: SheetRow, query: string): boolean {
  const text = [
    row.section,
    row.chineseName,
    row.englishName,
    row.description,
    row.priority,
    row.price,
    row.tradeText,
    row.owned,
    row.source,
    row.note
  ]
    .join(" ")
    .toLowerCase();

  return text.includes(query);
}

function displayPrice(value: string): string {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(number) || number <= 0) return "待更新";
  return `${number} 白金`;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawQuery = params.q;
  const query = normalize(Array.isArray(rawQuery) ? rawQuery[0] || "" : rawQuery || "");

  const fetched = await Promise.all(
    categories.map(async (category) => {
      const result = await fetchSheetRows(category.key);
      return result.rows.map((row) => ({
        ...row,
        categoryKey: category.key,
        categoryLabel: category.label
      }));
    })
  );

  const allRows: SearchResult[] = fetched.flat();
  const results = query
    ? allRows.filter((row) => matchRow(row, query)).slice(0, 80)
    : [];

  return (
    <main className="min-h-screen px-5 py-6">
      <section className="mx-auto max-w-5xl rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm tracking-[0.4em] text-slate-400">KETHER SEARCH</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-800">資料庫搜尋</h1>
            <p className="mt-2 text-sm text-slate-500">
              搜尋中文名、英文名、用途、來源、備註與價格資料。
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
          >
            回首頁
          </Link>
        </div>

        <form action="/search" className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={20} className="text-slate-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="輸入 MOD、戰甲、武器、中文或英文名稱..."
              className="w-full bg-transparent text-base outline-none"
            />
          </div>

          <button className="rounded-2xl bg-slate-800 px-5 py-3 font-bold text-white shadow-sm">
            搜尋
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-500">
          {query ? (
            <span>
              搜尋「{query}」找到 {results.length} 筆資料
            </span>
          ) : (
            <span>請輸入關鍵字，放大鏡魔法陣才會啟動喵。</span>
          )}
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-5xl gap-3">
        {results.map((row, index) => (
          <article
            key={`${row.categoryKey}-${row.englishName}-${row.chineseName}-${index}`}
            className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-slate-400">
                  {row.categoryLabel} / {row.section || "未分類"}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  {row.chineseName || "未命名"}
                </h2>
                <p className="text-sm text-slate-500">{row.englishName || "—"}</p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                {displayPrice(row.price)}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {row.description || row.note || "目前沒有說明。"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/database/${row.categoryKey}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              >
                前往分類
              </Link>

              {row.marketUrl && (
                <a
                  href={row.marketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                >
                  開啟交易
                </a>
              )}
            </div>
          </article>
        ))}

        {query && results.length === 0 && (
          <div className="rounded-[24px] border border-slate-200/70 bg-white/75 p-6 text-center text-slate-500 shadow-sm">
            沒有找到資料，換個關鍵字再召喚一次喵。
          </div>
        )}
      </section>
    </main>
  );
}

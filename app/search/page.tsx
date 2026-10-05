import { Search } from "lucide-react";
import Link from "next/link";
import { incarnonCatalog } from "../../data/incarnonWeapons";
import { regularWarframes } from "../../data/regularWarframes";
import { warframeDetails } from "../../data/warframeDetails";
import { fetchSheetRows } from "../../lib/sheets";
export const metadata = { title: "資料庫搜尋" };
const categories = [
  { key: "warframes", label: "戰甲" },
  { key: "primary", label: "主要武器" },
  { key: "secondary", label: "次要武器" },
  { key: "melee", label: "近戰武器" },
  { key: "incarnon", label: "靈化武器" },
  { key: "companions", label: "同伴" },
  { key: "archwing", label: "曲翼與機甲" },
  { key: "mods", label: "MOD" },
];
type Result = {
  id: string;
  category: string;
  name: string;
  english: string;
  description: string;
  text: string;
  href: string;
  price?: string;
  marketUrl?: string;
};
const aliases: Record<string, string> = {
  瓦喵: "valkyr",
  核妹: "nova",
  蝶妹: "titania",
  水妹: "yareli",
};
function price(value?: string) {
  if (!value) return "";
  if (/不可交易|浮動|拍賣/.test(value)) return value;
  const n = Number(value.replace(/[^\d.]/g, ""));
  return n > 0 ? `${n} 白金` : "價格待更新";
}
export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const single = (key: string) =>
    Array.isArray(params[key]) ? params[key][0] || "" : params[key] || "";
  const query = single("q").trim().slice(0, 200);
  const normalized = aliases[query.toLowerCase()] || query.toLowerCase();
  const category = categories.some((c) => c.key === single("category"))
    ? single("category")
    : "all";
  const failures: string[] = [];
  const rows: Result[] = [];
  if (query) {
    const fetched = await Promise.all(
      categories
        .filter((c) => c.key !== "incarnon")
        .map(async (c) => {
          try {
            const result = await fetchSheetRows(c.key);
            if (result.error) failures.push(c.label);
            return result.rows.map((row, index): Result => ({
              id: `${c.key}-${index}`,
              category: c.key,
              name: row.chineseName || row.englishName,
              english: row.englishName,
              description: row.description || row.note || row.source,
              text: [
                row.section,
                row.chineseName,
                row.englishName,
                row.description,
                row.note,
                row.source,
                row.price,
                ...(row.aliases || []),
              ]
                .join(" ")
                .toLowerCase(),
              href:
                c.key === "warframes"
                  ? "/database/warframes/prime"
                  : `/database/${c.key}`,
              price: row.price,
              marketUrl: row.marketUrl,
            }));
          } catch {
            failures.push(c.label);
            return [];
          }
        }),
    );
    rows.push(...fetched.flat());
    rows.push(
      ...warframeDetails.map((frame) => ({
        id: `frame-${frame.slug}`,
        category: "warframes",
        name: frame.name,
        english: "一般戰甲",
        description: frame.description,
        text: [
          frame.name,
          frame.description,
          regularWarframes.find((r) => r.name === frame.name)?.acquisition,
        ]
          .join(" ")
          .toLowerCase(),
        href: `/database/warframes/${frame.slug}`,
      })),
    );
    rows.push(
      ...incarnonCatalog.weapons.map((weapon) => ({
        id: `incarnon-${weapon.id}`,
        category: "incarnon",
        name: weapon.nameZh || weapon.name,
        english: weapon.name,
        description: weapon.effect.zh,
        text: [
          weapon.name,
          weapon.nameZh,
          "靈化 應感",
          weapon.effect.zh,
          ...weapon.evolutions.flatMap((e) =>
            e.abilities.map((a) => a.description),
          ),
        ]
          .join(" ")
          .toLowerCase(),
        href: `/database/incarnon?q=${encodeURIComponent(weapon.name)}`,
      })),
    );
  }
  const matched = rows.filter((row) => row.text.includes(normalized));
  const filtered =
    category === "all"
      ? matched
      : matched.filter((row) => row.category === category);
  const perPage = 4;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const requestedPage = Number(single("page"));
  const page = Math.min(
    pages,
    Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1),
  );
  const results = filtered.slice((page - 1) * perPage, page * perPage);
  const href = (cat: string, p = 1) =>
    `/search?${new URLSearchParams({ q: query, category: cat, page: String(p) })}`;
  return (
    <main className="search-command-page">
      <header className="search-command-heading">
        <div>
          <span className="site-eyebrow">TENNO ARCHIVE / SEARCH CONSOLE</span>
          <h1>資料搜尋控制台</h1>
          <p>戰甲、武器、MOD、取得來源與靈化能力，一個畫面完成檢索。</p>
        </div>

        <Link className="search-command-overview" href="/database/overview">
          資料總覽
        </Link>
      </header>

      <form action="/search" className="search-command-form">
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="database-query">
          搜尋關鍵字
        </label>
        <input
          id="database-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="輸入中文、英文、戰甲暱稱或能力關鍵字…"
          maxLength={200}
          required
        />
        <input type="hidden" name="category" value={category} />
        <button type="submit">開始查詢</button>
      </form>

      <nav className="search-command-categories" aria-label="搜尋分類">
        <Link
          href={href("all")}
          aria-current={category === "all" ? "page" : undefined}
        >
          <span>全部</span>
          <b>{query ? matched.length : "—"}</b>
        </Link>
        {categories.map((item) => (
          <Link
            key={item.key}
            href={href(item.key)}
            aria-current={category === item.key ? "page" : undefined}
          >
            <span>{item.label}</span>
            <b>
              {query
                ? matched.filter((row) => row.category === item.key).length
                : "—"}
            </b>
          </Link>
        ))}
      </nav>

      <section className="search-command-status" aria-live="polite">
        <p>
          {query
            ? `「${query}」找到 ${filtered.length} 筆資料${filtered.length ? `，目前顯示第 ${page} / ${pages} 頁` : ""}`
            : "輸入一個名字，開始從 KETHER 資料庫定位答案。"}
        </p>

        {failures.length > 0 && (
          <span role="status">
            部分來源暫時無法同步：{failures.join("、")}
          </span>
        )}
      </section>

      <section className="search-command-results" aria-label="搜尋結果">
        {results.map((row) => (
          <article className="search-command-card" key={row.id}>
            <div className="search-command-card-top">
              <span>
                {categories.find((item) => item.key === row.category)?.label}
              </span>
              {price(row.price) && <b>{price(row.price)}</b>}
            </div>

            <h2>
              <Link href={row.href}>{row.name}</Link>
            </h2>
            <small>{row.english}</small>
            <p>{row.description || "開啟資料庫查看詳細資訊。"}</p>

            <div className="search-command-actions">
              <Link href={row.href}>開啟資料</Link>
              {row.marketUrl && (
                <a href={row.marketUrl} target="_blank" rel="noreferrer">
                  交易市場
                </a>
              )}
            </div>
          </article>
        ))}

        {!results.length && (
          <div className="search-command-empty">
            <span className="site-eyebrow">NO SIGNAL FOUND</span>
            <h2>{query ? "尚未找到符合的資料" : "等待搜尋指令"}</h2>
            <p>
              {query
                ? "試試英文名稱、較短的關鍵字，或切換其他分類。"
                : "例如 Valkyr、Nova、水妹、靈化、赤毒或 MOD。"}
            </p>
            <Link href={query ? href("all") : "/database/overview"}>
              {query ? "切換全部分類" : "瀏覽資料總覽"}
            </Link>
          </div>
        )}
      </section>

      <footer className="search-command-pagination" aria-label="搜尋結果分頁">
        <span>
          {filtered.length ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} / ${filtered.length}` : "0 / 0"}
        </span>

        <div>
          {page > 1 ? (
            <Link href={href(category, page - 1)}>‹ 上一頁</Link>
          ) : (
            <span aria-disabled="true">‹ 上一頁</span>
          )}

          <b>{page} / {pages}</b>

          {page < pages ? (
            <Link href={href(category, page + 1)}>下一頁 ›</Link>
          ) : (
            <span aria-disabled="true">下一頁 ›</span>
          )}
        </div>
      </footer>
    </main>
  );
}

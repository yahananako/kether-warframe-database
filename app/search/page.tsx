import { Search, RadioTower, Database, ArrowUpRight } from "lucide-react";
import styles from "./searchCommand.module.css";
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
  const perPage = 24;
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
    <main className={`search-page ${styles.terminal}`}>
      <header className={`search-heading ${styles.header}`}>
        <div>
          <span className="site-eyebrow"><Database size={14} /> TENNO ARCHIVE / SEARCH ENGINE</span>
          <h1>資料庫搜尋</h1>
          <p>統一查詢戰甲、武器、MOD、取得來源與靈化能力。</p>
        </div>
        <div className={styles.headerActions}><Link href="/database/overview"><Database size={15} /> 資料總覽 <ArrowUpRight size={14}/></Link><Link href="/bot"><RadioTower size={15}/> KETHER 氏族 BOT <ArrowUpRight size={14}/></Link></div>
      </header>
      <form action="/search" className={`site-search ${styles.searchInput}`}>
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="database-query">
          搜尋關鍵字
        </label>
        <input
          id="database-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="輸入中文、英文或戰甲暱稱…"
          maxLength={200}
          required
        />
        <input type="hidden" name="category" value={category} />
        <button type="submit">搜尋</button>
      </form>
      {failures.length > 0 && (
        <div className="search-error" role="status">
          部分來源暫時無法同步：{failures.join("、")}
          。目前顯示可取得的資料，稍後可重新搜尋。
        </div>
      )}
      <div className={`search-layout ${styles.layout}`}>
        <nav className={`search-filters ${styles.filters}`} aria-label="搜尋分類">
          <Link
            href={href("all")}
            aria-current={category === "all" ? "page" : undefined}
          >
            全部<span>{query ? matched.length : ""}</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c.key}
              href={href(c.key)}
              aria-current={category === c.key ? "page" : undefined}
            >
              {c.label}
              <span>
                {query
                  ? matched.filter((r) => r.category === c.key).length
                  : ""}
              </span>
            </Link>
          ))}
        </nav>
        <section className={styles.resultsPanel} aria-label="搜尋結果">
          <p role="status">
            {query
              ? `「${query}」找到 ${filtered.length} 筆${filtered.length ? `，顯示 ${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}` : ""}`
              : "從一個名字，開始探索。"}
          </p>
          <div className={`search-results ${styles.resultCards}`}>
            {results.map((row) => (
              <article className="search-result" key={row.id}>
                <div>
                  <span className="site-eyebrow">
                    {categories.find((c) => c.key === row.category)?.label}
                  </span>
                  <h2>
                    <Link href={row.href}>{row.name}</Link>
                  </h2>
                  <small>{row.english}</small>
                </div>
                <strong className="result-price">{price(row.price)}</strong>
                <p>{row.description || "開啟資料庫查看詳細資訊。"}</p>
                <div className="search-result-actions">
                  <Link href={row.href}>開啟資料</Link>
                  {row.marketUrl && (
                    <a href={row.marketUrl} target="_blank" rel="noreferrer">
                      交易市場
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!results.length && (
            <div className="search-empty">
              <h2>{query ? "尚未找到符合的資料" : "想找哪一位戰甲？"}</h2>
              <p>
                {query
                  ? "試試英文名稱、較短的關鍵字，或切換其他分類。"
                  : "可以輸入 Valkyr、Nova、水妹或靈化，也能直接瀏覽資料庫。"}
              </p>
              <Link href={query ? href("all") : "/database/overview"}>
                {query ? "搜尋全部分類" : "瀏覽資料庫"}
              </Link>
            </div>
          )}
          {pages > 1 && (
            <nav className={`search-pagination ${styles.pagination}`} aria-label="搜尋結果分頁">
              {page > 1 && (
                <Link className="site-button" href={href(category, page - 1)}>
                  上一頁
                </Link>
              )}
              <span>
                {page} / {pages}
              </span>
              {page < pages && (
                <Link className="site-button" href={href(category, page + 1)}>
                  下一頁
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { SheetRow } from "../lib/sheets";

type FilterMode = "all" | "owned" | "missing" | "priced" | "unpriced";
type SortMode = "none" | "priceHigh" | "priceLow" | "name";

function priceNumber(value: string): number | null {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function displayPrice(value: string): string {
  const number = priceNumber(value);
  if (number === null) return "待更新";
  return `${number} 白金`;
}

function hasPrice(value: string): boolean {
  return priceNumber(value) !== null;
}

function isOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}

export default function DataTable({ rows }: { rows: SheetRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("none");

  const filteredRows = useMemo(() => {
    let result = rows.filter((row) => {
      const text = [
        row.chineseName,
        row.englishName,
        row.description,
        row.priority,
        row.price,
        row.owned,
        row.source,
        row.note
      ].join(" ").toLowerCase();

      const matchQuery = text.includes(query.trim().toLowerCase());
      const owned = isOwned(row.owned);
      const priced = hasPrice(row.price);

      const matchFilter =
        filter === "all" ||
        (filter === "owned" && owned) ||
        (filter === "missing" && !owned) ||
        (filter === "priced" && priced) ||
        (filter === "unpriced" && !priced);

      return matchQuery && matchFilter;
    });

    if (sortMode === "priceHigh") {
      result = [...result].sort((a, b) => (priceNumber(b.price) ?? -1) - (priceNumber(a.price) ?? -1));
    }

    if (sortMode === "priceLow") {
      result = [...result].sort((a, b) => (priceNumber(a.price) ?? 999999) - (priceNumber(b.price) ?? 999999));
    }

    if (sortMode === "name") {
      result = [...result].sort((a, b) => {
        const nameA = a.englishName || a.chineseName;
        const nameB = b.englishName || b.chineseName;
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [rows, query, filter, sortMode]);

  const pricedCount = rows.filter((row) => hasPrice(row.price)).length;
  const ownedCount = rows.filter((row) => isOwned(row.owned)).length;

  return (
    <>
      <section className="db-tool-panel enhanced-tools">
        <input
          placeholder="搜尋中文名 / 英文名 / 用途 / 價格..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
          全部
        </button>
        <button className={filter === "owned" ? "is-active" : ""} onClick={() => setFilter("owned")}>
          已購買
        </button>
        <button className={filter === "missing" ? "is-active" : ""} onClick={() => setFilter("missing")}>
          未購買
        </button>
        <button className={filter === "priced" ? "is-active" : ""} onClick={() => setFilter("priced")}>
          有價格
        </button>
        <button className={filter === "unpriced" ? "is-active" : ""} onClick={() => setFilter("unpriced")}>
          無價格
        </button>

        <button className={sortMode === "priceHigh" ? "is-active" : ""} onClick={() => setSortMode("priceHigh")}>
          價格高到低
        </button>
        <button className={sortMode === "priceLow" ? "is-active" : ""} onClick={() => setSortMode("priceLow")}>
          價格低到高
        </button>
        <button className={sortMode === "name" ? "is-active" : ""} onClick={() => setSortMode("name")}>
          英文排序
        </button>
      </section>

      <section className="db-table-card">
        <div className="db-table-title">
          <div>
            <h2>資料表</h2>
            <p>
              目前顯示 {filteredRows.length} / {rows.length} 筆資料。
              有價格 {pricedCount} 筆，已購買 {ownedCount} 筆。
            </p>
          </div>
          <span>Google Sheets 只讀模式</span>
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

          {filteredRows.map((row, index) => {
            const priced = hasPrice(row.price);
            const owned = isOwned(row.owned);

            return (
              <div className="db-row" key={`${row.englishName}-${index}`}>
                <span>{row.chineseName || "未命名"}</span>
                <span>{row.englishName || "—"}</span>
                <span>{row.description || row.note || "—"}</span>
                <span>
                  <b className={priced ? "price-pill" : "price-pill price-empty"}>
                    {displayPrice(row.price)}
                  </b>
                </span>
                <span>
                  <b className={owned ? "owned-pill owned-ok" : "owned-pill"}>
                    {row.owned || "未購買"}
                  </b>
                </span>
                <span>
                  {row.marketUrl ? (
                    <a className="link-button" href={row.marketUrl} target="_blank" rel="noreferrer">
                      開啟交易
                    </a>
                  ) : (
                    <button className="link-button" disabled>無連結</button>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mobile-cards">
          {filteredRows.map((row, index) => {
            const priced = hasPrice(row.price);
            const owned = isOwned(row.owned);

            return (
              <article className="mobile-data-card" key={`${row.englishName}-mobile-${index}`}>
                <h3>{row.chineseName || "未命名"}</h3>
                <p>{row.englishName || "—"}</p>
                <small>{row.description || row.note || "—"}</small>
                <div>
                  <span>價格：{displayPrice(row.price)}</span>
                  <b className={owned ? "owned-ok-text" : ""}>{row.owned || "未購買"}</b>
                </div>
                {row.marketUrl && (
                  <a className="mobile-market-link" href={row.marketUrl} target="_blank" rel="noreferrer">
                    開啟交易
                  </a>
                )}
                {!priced && <em className="mobile-hint">價格待更新</em>}
              </article>
            );
          })}
        </div>

        {filteredRows.length === 0 && (
          <div className="empty-state">
            <h2>沒有找到資料</h2>
            <p>請調整搜尋字或篩選條件。</p>
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { SheetRow } from "@/lib/sheets";

type FilterMode = "all" | "owned" | "missing";

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

export default function DataTable({ rows }: { rows: SheetRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortPrice, setSortPrice] = useState(false);

  const filteredRows = useMemo(() => {
    let result = rows.filter((row) => {
      const text = [
        row.chineseName,
        row.englishName,
        row.description,
        row.priority,
        row.source,
        row.note
      ].join(" ").toLowerCase();

      const matchQuery = text.includes(query.toLowerCase());

      const isOwned = row.owned.includes("已購買");
      const matchFilter =
        filter === "all" ||
        (filter === "owned" && isOwned) ||
        (filter === "missing" && !isOwned);

      return matchQuery && matchFilter;
    });

    if (sortPrice) {
      result = [...result].sort((a, b) => priceNumber(b.price) - priceNumber(a.price));
    }

    return result;
  }, [rows, query, filter, sortPrice]);

  return (
    <>
      <section className="db-tool-panel">
        <input
          placeholder="搜尋中文名 / 英文名 / 用途..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button onClick={() => setFilter("all")}>全部</button>
        <button onClick={() => setFilter("owned")}>已購買</button>
        <button onClick={() => setFilter("missing")}>未購買</button>
        <button onClick={() => setSortPrice((value) => !value)}>
          {sortPrice ? "取消價格排序" : "價格排序"}
        </button>
      </section>

      <section className="db-table-card">
        <div className="db-table-title">
          <div>
            <h2>資料表</h2>
            <p>目前顯示 {filteredRows.length} / {rows.length} 筆資料。</p>
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

          {filteredRows.map((row, index) => (
            <div className="db-row" key={`${row.englishName}-${index}`}>
              <span>{row.chineseName || "未命名"}</span>
              <span>{row.englishName || "—"}</span>
              <span>{row.description || row.note || "—"}</span>
              <span>{row.price || "—"}</span>
              <span><b className="owned-pill">{row.owned || "未購買"}</b></span>
              <span>
                {row.marketUrl ? (
                  <a className="link-button" href={row.marketUrl} target="_blank">開啟交易</a>
                ) : (
                  <button className="link-button" disabled>無連結</button>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mobile-cards">
          {filteredRows.map((row, index) => (
            <article className="mobile-data-card" key={`${row.englishName}-mobile-${index}`}>
              <h3>{row.chineseName || "未命名"}</h3>
              <p>{row.englishName || "—"}</p>
              <small>{row.description || row.note || "—"}</small>
              <div>
                <span>價格：{row.price || "—"}</span>
                <b>{row.owned || "未購買"}</b>
              </div>
              {row.marketUrl && (
                <a className="mobile-market-link" href={row.marketUrl} target="_blank">開啟交易</a>
              )}
            </article>
          ))}
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

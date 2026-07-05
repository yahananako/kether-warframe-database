"use client";

import { useEffect, useMemo, useState } from "react";
import type { SheetRow } from "../lib/sheets"; import { fetchUserOwnedItems, toggleUserOwnedItem } from "../lib/userOwnedClient";

type FilterMode = "all" | "owned" | "missing" | "priced" | "unpriced";
type SortMode = "none" | "priceHigh" | "priceLow" | "name";

type OwnedApiItem = {
  item_key: string;
  owned: boolean;
};

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

function textOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}

function makeSlugBase(name: string): string {
  return name
    .trim()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function itemKeyFromRow(row: SheetRow): string {
  if (row.marketUrl) {
    const last = row.marketUrl.split("/").filter(Boolean).pop();
    if (last) return last;
  }

  const base = makeSlugBase(row.englishName || row.chineseName);
  return base || makeSlugBase(`${row.section}-${row.chineseName}`);
}

function displayOwned(value: boolean): string {
  return value ? "已購買" : "未購買";
}

export default function DataTable({
  rows,
  category
}: {
  rows: SheetRow[];
  category: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [section, setSection] = useState("all");
  const [ownedMap, setOwnedMap] = useState<Record<string, boolean>>({});
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [ownedMessage, setOwnedMessage] = useState("尚未登入 Discord 個人進度");

  useEffect(() => {
    let active = true;

    async function loadOwnedItems() {
      try {
        const response = await fetch("/api/user-owned/list", {
          cache: "no-store"
        });

        const data = await response.json();

        if (!active) return;

        if (!data.ok) {
          setOwnedMessage(data.message || "個人已購買資料讀取失敗");
          setLoadingOwned(false);
          return;
        }

        const nextMap: Record<string, boolean> = {};
        for (const item of data.items as OwnedApiItem[]) {
          nextMap[item.item_key] = Boolean(item.owned);
        }

        setOwnedMap(nextMap);
        setOwnedMessage(`已連接個人進度：${data.count ?? 0} 筆`);
        setLoadingOwned(false);
      } catch {
        if (!active) return;
        setOwnedMessage("個人已購買資料讀取失敗");
        setLoadingOwned(false);
      }
    }

    loadOwnedItems();

    return () => {
      active = false;
    };
  }, []);

  const rowsWithOwned = useMemo(() => {
    return rows.map((row) => {
      const key = itemKeyFromRow(row);
      const owned = key in ownedMap ? ownedMap[key] : textOwned(row.owned);

      return {
        ...row,
        itemKey: key,
        personalOwned: owned
      };
    });
  }, [rows, ownedMap]);

  const sectionStats = useMemo(() => {
    const map = new Map<string, { section: string; total: number; priced: number; owned: number }>();

    for (const row of rowsWithOwned) {
      const key = row.section || "未分類";

      if (!map.has(key)) {
        map.set(key, {
          section: key,
          total: 0,
          priced: 0,
          owned: 0
        });
      }

      const current = map.get(key)!;
      current.total += 1;
      if (hasPrice(row.price)) current.priced += 1;
      if (row.personalOwned) current.owned += 1;
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [rowsWithOwned]);

  const sections = sectionStats.map((item) => item.section);

  const filteredRows = useMemo(() => {
    let result = rowsWithOwned.filter((row) => {
      const text = [
        row.section,
        row.chineseName,
        row.englishName,
        row.description,
        row.priority,
        row.price,
        displayOwned(row.personalOwned),
        row.source,
        row.note
      ].join(" ").toLowerCase();

      const matchQuery = text.includes(query.trim().toLowerCase());
      const matchSection = section === "all" || row.section === section;
      const priced = hasPrice(row.price);

      const matchFilter =
        filter === "all" ||
        (filter === "owned" && row.personalOwned) ||
        (filter === "missing" && !row.personalOwned) ||
        (filter === "priced" && priced) ||
        (filter === "unpriced" && !priced);

      return matchQuery && matchSection && matchFilter;
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
  }, [rowsWithOwned, query, filter, sortMode, section]);

  const pricedCount = rowsWithOwned.filter((row) => hasPrice(row.price)).length;
  const ownedCount = rowsWithOwned.filter((row) => row.personalOwned).length;

  async function toggleOwned(row: (typeof rowsWithOwned)[number]) {
    const nextOwned = !row.personalOwned;
    const previous = ownedMap[row.itemKey];

    setSavingKey(row.itemKey);
    setOwnedMap((current) => ({
      ...current,
      [row.itemKey]: nextOwned
    }));

    try {
      const response = await fetch("/api/user-owned/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemKey: row.itemKey,
          category,
          section: row.section || "未分類",
          owned: nextOwned
        })
      });

      const data = await response.json();

      if (!data.ok) {
        setOwnedMap((current) => {
          const clone = { ...current };
          if (previous === undefined) {
            delete clone[row.itemKey];
          } else {
            clone[row.itemKey] = previous;
          }
          return clone;
        });

        setOwnedMessage(data.message || "儲存失敗");
        return;
      }

      setOwnedMessage(`${row.chineseName || row.englishName}：${displayOwned(nextOwned)}`);
    } catch {
      setOwnedMap((current) => {
        const clone = { ...current };
        if (previous === undefined) {
          delete clone[row.itemKey];
        } else {
          clone[row.itemKey] = previous;
        }
        return clone;
      });

      setOwnedMessage("儲存失敗，請稍後再試");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <>
      <section className="owned-sync-banner">
        <span>{loadingOwned ? "讀取個人進度中..." : ownedMessage}</span>
        <b>Discord 個人進度</b>
      </section>

      <section className="section-stats-panel">
        <button
          className={section === "all" ? "section-stat-card is-active" : "section-stat-card"}
          onClick={() => setSection("all")}
        >
          <span>全部區塊</span>
          <strong>{rowsWithOwned.length}</strong>
          <small>有價格 {pricedCount}｜已購買 {ownedCount}</small>
        </button>

        {sectionStats.map((item) => (
          <button
            className={section === item.section ? "section-stat-card is-active" : "section-stat-card"}
            key={item.section}
            onClick={() => setSection(item.section)}
          >
            <span>{item.section}</span>
            <strong>{item.total}</strong>
            <small>有價格 {item.priced}｜已購買 {item.owned}</small>
          </button>
        ))}
      </section>

      <section className="db-tool-panel enhanced-tools">
        <input
          placeholder="搜尋區塊 / 中文名 / 英文名 / 用途 / 價格..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select className="section-select" value={section} onChange={(event) => setSection(event.target.value)}>
          <option value="all">全部區塊</option>
          {sections.map((item) => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>

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
              目前顯示 {filteredRows.length} / {rowsWithOwned.length} 筆資料。
              區塊 {sections.length} 個，有價格 {pricedCount} 筆，個人已購買 {ownedCount} 筆。
            </p>
          </div>
          <span>Discord 個人進度</span>
        </div>

        <div className="db-table desktop-table">
          <div className="db-row db-head">
            <span>區塊</span>
            <span>中文名</span>
            <span>英文名</span>
            <span>用途 / 說明</span>
            <span>交易價格</span>
            <span>已購買</span>
            <span>交易網站</span>
          </div>

          {filteredRows.map((row, index) => {
            const priced = hasPrice(row.price);
            const saving = savingKey === row.itemKey;

            return (
              <div className="db-row" key={`${row.section}-${row.englishName}-${index}`}>
                <span><b className="section-pill">{row.section || "未分類"}</b></span>
                <span>{row.chineseName || "未命名"}</span>
                <span>{row.englishName || "—"}</span>
                <span>{row.description || row.note || "—"}</span>
                <span>
                  <b className={priced ? "price-pill" : "price-pill price-empty"}>
                    {displayPrice(row.price)}
                  </b>
                </span>
                <span>
                  <button
                    className={row.personalOwned ? "owned-toggle owned-ok" : "owned-toggle"}
                    onClick={() => toggleOwned(row)}
                    disabled={Boolean(savingKey)}
                    title={row.itemKey}
                  >
                    {saving ? "儲存中..." : displayOwned(row.personalOwned)}
                  </button>
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
            const saving = savingKey === row.itemKey;

            return (
              <article className="mobile-data-card" key={`${row.section}-${row.englishName}-mobile-${index}`}>
                <b className="section-pill">{row.section || "未分類"}</b>
                <h3>{row.chineseName || "未命名"}</h3>
                <p>{row.englishName || "—"}</p>
                <small>{row.description || row.note || "—"}</small>
                <div>
                  <span>價格：{displayPrice(row.price)}</span>
                  <button
                    className={row.personalOwned ? "owned-toggle owned-ok" : "owned-toggle"}
                    onClick={() => toggleOwned(row)}
                    disabled={Boolean(savingKey)}
                    title={row.itemKey}
                  >
                    {saving ? "儲存中..." : displayOwned(row.personalOwned)}
                  </button>
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
            <p>請調整搜尋字、區塊或篩選條件。</p>
          </div>
        )}
      </section>
    </>
  );
}

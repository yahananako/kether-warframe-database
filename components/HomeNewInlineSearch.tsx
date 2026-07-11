"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PANEL_EVENT = "home-new-panel-open";

const searchItems = [
  {
    label: "戰甲",
    source: "資料庫",
    type: "資料分類",
    description: "查看 Warframe 戰甲資料、取得方式、備註與收藏狀態。",
    keywords: "warframe 戰甲 資料庫 取得 database",
  },
  {
    label: "主要武器",
    source: "資料庫",
    type: "資料分類",
    description: "查看主要武器資料、交易價格、用途與備註。",
    keywords: "primary 主要武器 武器 資料庫",
  },
  {
    label: "次要武器",
    source: "資料庫",
    type: "資料分類",
    description: "查看次要武器資料、交易價格、用途與備註。",
    keywords: "secondary 次要武器 武器 資料庫",
  },
  {
    label: "近戰武器",
    source: "資料庫",
    type: "資料分類",
    description: "查看近戰武器資料、交易價格、用途與備註。",
    keywords: "melee 近戰武器 武器 資料庫",
  },
  {
    label: "同伴",
    source: "資料庫",
    type: "資料分類",
    description: "查看同伴、寵物相關資料與取得方向。",
    keywords: "companion pet 同伴 寵物 資料庫",
  },
  {
    label: "曲翼",
    source: "資料庫",
    type: "資料分類",
    description: "查看曲翼、曲翼武器、亡靈骸甲相關資料。",
    keywords: "archwing necramech 曲翼 亡靈骸甲 資料庫",
  },
  {
    label: "MOD資料庫",
    source: "資料庫",
    type: "資料分類",
    description: "查看 MOD 系列、用途、價格與備註。",
    keywords: "mod 模組 資料庫 primed galvanized archon",
  },
  {
    label: "/price",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢 Warframe Market 交易價格。",
    keywords: "bot price 查價 市場 白金 warframe market",
  },
  {
    label: "/戰甲取得",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢指定戰甲的取得方式。",
    keywords: "bot 戰甲取得 warframe acquisition",
  },
  {
    label: "/武器取得",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢指定武器的取得方式。",
    keywords: "bot 武器取得 weapon acquisition",
  },
  {
    label: "/同伴取得",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢同伴或寵物的取得方式。",
    keywords: "bot 同伴取得 companion pet",
  },
  {
    label: "/材料取得",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢材料來源與推薦刷法。",
    keywords: "bot 材料取得 material farm",
  },
  {
    label: "/核桃取得",
    source: "Bot",
    type: "Discord 指令",
    description: "查詢遺物 / 核桃取得與 Prime 相關資訊。",
    keywords: "bot 核桃取得 relic 遺物 prime",
  },
];

export default function HomeNewInlineSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handlePanelOpen = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== "search") {
        setOpen(false);
      }
    };

    window.addEventListener(PANEL_EVENT, handlePanelOpen);

    return () => {
      window.removeEventListener(PANEL_EVENT, handlePanelOpen);
    };
  }, []);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return searchItems.slice(0, 8);
    }

    return searchItems.filter((item) => {
      const haystack = `${item.label} ${item.source} ${item.type} ${item.description} ${item.keywords}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [query]);

  const toggleSearch = () => {
    setOpen((current) => {
      const next = !current;

      if (next) {
        window.dispatchEvent(new CustomEvent(PANEL_EVENT, { detail: "search" }));
      }

      return next;
    });
  };

  return (
    <div className="home-new-action-wrap">
      <button
        className="home-new-icon-action"
        type="button"
        aria-label={open ? "關閉搜尋" : "開啟搜尋"}
        aria-expanded={open}
        onClick={toggleSearch}
      >
        {open ? <X size={22} /> : <Search size={22} />}
      </button>

      {open ? (
        <>
          <button
            className="home-new-pop-backdrop"
            type="button"
            aria-label="關閉搜尋背景"
            onClick={() => setOpen(false)}
          />

          <section className="home-new-pop-panel home-new-search-panel" aria-label="KETHER 搜尋">
            <div className="home-new-pop-head">
              <p>KETHER SEARCH</p>
              <strong>資料庫 × Bot 搜尋</strong>
            </div>

            <label className="home-new-search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋戰甲、MOD、材料、/price..."
                autoFocus
              />
            </label>

            <div className="home-new-search-results">
              {results.length > 0 ? (
                results.map((item) => (
                  <article key={`${item.source}-${item.label}`} className="home-new-search-result">
                    <span>
                      <em>{item.source}｜{item.type}</em>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                  </article>
                ))
              ) : (
                <div className="home-new-empty-state">沒有找到對應資料喵</div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

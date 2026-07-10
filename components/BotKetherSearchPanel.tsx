"use client";

import { FormEvent, useState } from "react";
import { Loader2, PawPrint, Search, ShieldCheck, Sparkles, Swords } from "lucide-react";

type SearchMode = "weapon" | "warframe" | "companion";

type SearchResult = {
  name: string;
  weaponType?: string;
  series?: string;
  category?: string;
  details: {
    label: string;
    value: string;
  }[];
};

type SearchResponse = {
  query: string;
  count: number;
  results: SearchResult[];
};

const modeConfig: Record<
  SearchMode,
  {
    label: string;
    title: string;
    badge: string;
    icon: typeof Swords;
    placeholder: string;
    quickSearches: string[];
    apiPath: string;
    emptyText: string;
  }
> = {
  weapon: {
    label: "武器取得",
    title: "網站版武器取得查詢",
    badge: "武器",
    icon: Swords,
    placeholder: "輸入武器名稱，例如：托里德、Ocucor、Glaive Prime",
    quickSearches: ["托里德", "Ocucor", "Glaive Prime", "凶惡", "靈化"],
    apiPath: "/api/bot-search/weapon",
    emptyText: "找不到武器取得資料喵，試試英文名、中文名或系列關鍵字。",
  },
  warframe: {
    label: "戰甲取得",
    title: "網站版戰甲取得查詢",
    badge: "戰甲",
    icon: ShieldCheck,
    placeholder: "輸入戰甲名稱，例如：Rhino、摸屍、蝶甲、Yareli",
    quickSearches: ["Rhino", "摸屍", "蝶甲", "Yareli", "Nekros"],
    apiPath: "/api/bot-search/warframe",
    emptyText: "找不到戰甲取得資料喵，試試英文名、中文名或別名。",
  },
  companion: {
    label: "同伴取得",
    title: "網站版同伴取得查詢",
    badge: "同伴",
    icon: PawPrint,
    placeholder: "輸入同伴名稱，例如：庫娃、笑貓、Helios、Carrier",
    quickSearches: ["庫娃", "笑貓", "Helios", "Carrier", "庫狛"],
    apiPath: "/api/bot-search/companion",
    emptyText: "找不到同伴取得資料喵，試試中文名、英文名或分類關鍵字。",
  },
};

export default function BotKetherSearchPanel() {
  const [mode, setMode] = useState<SearchMode>("weapon");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  const config = modeConfig[mode];
  const Icon = config.icon;

  async function runSearch(nextQuery = query, nextMode = mode) {
    const nextConfig = modeConfig[nextMode];
    const value = nextQuery.trim();

    if (!value) {
      setError(`請先輸入${nextConfig.label}名稱或關鍵字喵。`);
      setResults([]);
      setSearched("");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(value);

    try {
      const response = await fetch(`${nextConfig.apiPath}?q=${encodeURIComponent(value)}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("search failed");

      const data = (await response.json()) as SearchResponse;
      setResults(data.results ?? []);
    } catch {
      setError("小希查詢台暫時失聯，請稍後再試喵。");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function handleModeChange(nextMode: SearchMode) {
    setMode(nextMode);
    setQuery("");
    setSearched("");
    setResults([]);
    setError("");
  }

  function handleQuickSearch(value: string) {
    setQuery(value);
    runSearch(value);
  }

  return (
    <section className="kether-bot-search-panel" aria-label="KETHER 小希查詢台">
      <div className="kether-bot-search-head">
        <div>
          <p>
            <Sparkles size={15} />
            KETHER 小希查詢台
          </p>

          <h2>{config.title}</h2>
        </div>

        <span>整合查詢：{config.badge}</span>
      </div>

      <div className="kether-bot-search-tabs" aria-label="查詢分類">
        {(Object.keys(modeConfig) as SearchMode[]).map((item) => {
          const itemConfig = modeConfig[item];
          const TabIcon = itemConfig.icon;

          return (
            <button
              key={item}
              type="button"
              className={mode === item ? "is-active" : ""}
              onClick={() => handleModeChange(item)}
            >
              <TabIcon size={16} />
              {itemConfig.label}
            </button>
          );
        })}
      </div>

      <form className="kether-bot-search-form" onSubmit={handleSubmit}>
        <div className="kether-bot-search-input">
          <Icon size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={config.placeholder}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="kether-bot-search-spin" /> : <Search size={18} />}
          查詢
        </button>
      </form>

      <div className="kether-bot-quick-searches">
        {config.quickSearches.map((item) => (
          <button key={item} type="button" onClick={() => handleQuickSearch(item)}>
            {item}
          </button>
        ))}
      </div>

      {error ? <p className="kether-bot-search-error">{error}</p> : null}

      {!error && searched && !loading && results.length === 0 ? (
        <p className="kether-bot-search-empty">
          找不到「{searched}」的資料喵。{config.emptyText}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="kether-bot-search-results">
          {results.map((result) => {
            const tag = result.weaponType ?? result.category ?? config.badge;

            return (
              <article key={`${mode}-${result.name}-${tag}-${result.series ?? ""}`}>
                <div className="kether-bot-search-result-top">
                  <strong>{result.name}</strong>
                  <span>{tag}</span>
                </div>

                {result.series ? <p className="kether-bot-search-series">{result.series}</p> : null}

                <div className="kether-bot-search-detail-list">
                  {result.details.map((detail) => (
                    <div key={`${mode}-${result.name}-${detail.label}`}>
                      <b>{detail.label}</b>
                      <p>{detail.value}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <style>{`
        .kether-bot-search-panel {
          margin-top: 16px;
          padding: clamp(18px, 4vw, 28px);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(239, 246, 255, 0.76)),
            radial-gradient(circle at 8% 10%, rgba(236, 72, 153, 0.13), transparent 32%),
            radial-gradient(circle at 92% 0%, rgba(124, 58, 237, 0.16), transparent 32%);
          box-shadow:
            0 22px 48px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px) saturate(1.25);
          -webkit-backdrop-filter: blur(18px) saturate(1.25);
        }

        .kether-bot-search-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .kether-bot-search-head p {
          margin: 0 0 7px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .kether-bot-search-head h2 {
          margin: 0;
          color: #172033;
          font-size: clamp(22px, 3vw, 30px);
          letter-spacing: -0.03em;
        }

        .kether-bot-search-head > span {
          flex: 0 0 auto;
          padding: 7px 10px;
          border-radius: 999px;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.1);
          font-size: 11px;
          font-weight: 900;
        }

        .kether-bot-search-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .kether-bot-search-tabs button {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          color: #334155;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
          font-size: 13px;
          font-weight: 900;
        }

        .kether-bot-search-tabs button.is-active {
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.2);
        }

        .kether-bot-search-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }

        .kether-bot-search-input {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(148, 163, 184, 0.18);
          color: #64748b;
        }

        .kether-bot-search-input input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #172033;
          font-size: 14px;
          font-weight: 800;
        }

        .kether-bot-search-form > button,
        .kether-bot-quick-searches button {
          border: 0;
          cursor: pointer;
          font-weight: 900;
        }

        .kether-bot-search-form > button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          border-radius: 18px;
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          box-shadow: 0 14px 28px rgba(124, 58, 237, 0.22);
        }

        .kether-bot-search-form > button:disabled {
          opacity: 0.68;
          cursor: wait;
        }

        .kether-bot-search-spin {
          animation: ketherBotSearchSpin 0.8s linear infinite;
        }

        @keyframes ketherBotSearchSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .kether-bot-quick-searches {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .kether-bot-quick-searches button {
          padding: 7px 10px;
          border-radius: 999px;
          color: #334155;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
          font-size: 12px;
        }

        .kether-bot-search-error,
        .kether-bot-search-empty {
          margin: 14px 0 0;
          padding: 12px 14px;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 850;
          line-height: 1.65;
        }

        .kether-bot-search-error {
          color: #9f1239;
          background: rgba(255, 228, 230, 0.78);
        }

        .kether-bot-search-empty {
          color: #475569;
          background: rgba(255, 255, 255, 0.68);
        }

        .kether-bot-search-results {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .kether-bot-search-results article {
          padding: 15px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.74);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .kether-bot-search-result-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }

        .kether-bot-search-result-top strong {
          color: #172033;
          font-size: 17px;
          letter-spacing: -0.02em;
        }

        .kether-bot-search-result-top span {
          flex: 0 0 auto;
          padding: 5px 8px;
          border-radius: 999px;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.1);
          font-size: 11px;
          font-weight: 900;
        }

        .kether-bot-search-series {
          margin: 6px 0 11px;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.06em;
        }

        .kether-bot-search-detail-list {
          display: grid;
          gap: 8px;
        }

        .kether-bot-search-detail-list div {
          padding-top: 8px;
          border-top: 1px solid rgba(148, 163, 184, 0.16);
        }

        .kether-bot-search-detail-list b {
          color: #172033;
          font-size: 12px;
        }

        .kether-bot-search-detail-list p {
          margin: 4px 0 0;
          color: #475569;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        @media (max-width: 760px) {
          .kether-bot-search-head {
            display: grid;
          }

          .kether-bot-search-head > span {
            width: fit-content;
          }

          .kether-bot-search-form,
          .kether-bot-search-results {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .kether-bot-search-panel {
            border-radius: 24px;
            padding: 16px;
          }

          .kether-bot-search-form > button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

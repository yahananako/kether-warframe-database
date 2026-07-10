"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search, ShieldCheck } from "lucide-react";

type SearchResult = {
  name: string;
  category: string;
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

const quickSearches = ["Rhino", "摸屍", "蝶甲", "Yareli", "Nekros"];

export default function BotWarframeSearchPanel() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  async function runSearch(nextQuery = query) {
    const value = nextQuery.trim();

    if (!value) {
      setError("請先輸入戰甲名稱或關鍵字喵。");
      setResults([]);
      setSearched("");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(value);

    try {
      const response = await fetch(`/api/bot-search/warframe?q=${encodeURIComponent(value)}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("search failed");

      const data = (await response.json()) as SearchResponse;
      setResults(data.results ?? []);
    } catch {
      setError("小希戰甲查詢台暫時失聯，請稍後再試喵。");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function handleQuickSearch(value: string) {
    setQuery(value);
    runSearch(value);
  }

  return (
    <section className="kether-bot-search-panel" aria-label="KETHER 小希戰甲查詢台">
      <div className="kether-bot-search-head">
        <div>
          <p>
            <ShieldCheck size={15} />
            KETHER 小希查詢台
          </p>

          <h2>網站版戰甲取得查詢</h2>
        </div>

        <span>第二階段：戰甲取得</span>
      </div>

      <form className="kether-bot-search-form" onSubmit={handleSubmit}>
        <div className="kether-bot-search-input">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="輸入戰甲名稱，例如：Rhino、摸屍、蝶甲、Yareli"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="kether-bot-search-spin" /> : <Search size={18} />}
          查詢
        </button>
      </form>

      <div className="kether-bot-quick-searches">
        {quickSearches.map((item) => (
          <button key={item} type="button" onClick={() => handleQuickSearch(item)}>
            {item}
          </button>
        ))}
      </div>

      {error ? <p className="kether-bot-search-error">{error}</p> : null}

      {!error && searched && !loading && results.length === 0 ? (
        <p className="kether-bot-search-empty">
          找不到「{searched}」的戰甲取得資料喵，試試英文名、中文名或別名。
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="kether-bot-search-results">
          {results.map((result) => (
            <article key={`${result.name}-${result.category}`}>
              <div className="kether-bot-search-result-top">
                <strong>{result.name}</strong>
                <span>{result.category}</span>
              </div>

              <div className="kether-bot-search-detail-list">
                {result.details.map((detail) => (
                  <div key={`${result.name}-${detail.label}`}>
                    <b>{detail.label}</b>
                    <p>{detail.value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

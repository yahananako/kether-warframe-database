"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type OfficialNewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type OfficialNewsResponse = {
  source?: string;
  updatedAt?: string;
  items: OfficialNewsItem[];
  error?: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "時間同步中";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function HomeNewOfficialNews() {
  const [data, setData] = useState<OfficialNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/official-news", {
        cache: "no-store",
      });

      const payload = (await response.json()) as OfficialNewsResponse;
      setData(payload);
    } catch (error) {
      setData({
        items: [],
        error: error instanceof Error ? error.message : "官方資訊同步失敗",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNews();
  }, []);

  const items = data?.items ?? [];

  return (
    <div className="home-new-official-rss home-new-official-rss-live">
      <div className="home-new-official-rss-head">
        <span>官方資訊 RSS</span>

        <button
          className="home-new-official-refresh"
          type="button"
          onClick={() => void loadNews()}
          disabled={loading}
        >
          <RefreshCw size={15} />
          {loading ? "同步中" : "重新同步"}
        </button>
      </div>

      {items.length > 0 ? (
        <ul className="home-new-official-news-list">
          {items.map((item) => (
            <li key={item.link}>
              <Link href={item.link} target="_blank" rel="noreferrer">
                <em>{formatDate(item.pubDate)}</em>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="home-new-official-news-empty">
          {loading ? "正在接收官方情報訊號喵..." : "官方資訊暫時同步失敗，稍後再試喵"}
        </div>
      )}
    </div>
  );
}

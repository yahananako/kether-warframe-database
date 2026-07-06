"use client";

// compact official news board final sync 20260706

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  OFFICIAL_NEWS_BOARD,
  OFFICIAL_NEWS_ITEMS,
  type OfficialNewsBoardData,
  type OfficialNewsItem,
} from "../data/officialNews";

type OfficialNewsApiResponse = {
  ok: boolean;
  mode: string;
  generatedAt: string;
  board: OfficialNewsBoardData;
  items?: OfficialNewsItem[];
  itemCount?: number;
};

function formatOfficialNewsDate(value: string | null) {
  if (!value) return "待接入";

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatUpdatedAt(value: string) {
  if (!value || value === "本地備援資料") return "本地備援資料";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSourceLabel(mode: string) {
  if (mode === "rss-news-items-source") return "RSS 已同步";
  if (mode === "static-news-items-source") return "本地備援";
  if (mode === "local-fallback") return "本地備援";
  return "載入中";
}

export default function OfficialNewsBoard() {
  const [board, setBoard] = useState<OfficialNewsBoardData>(OFFICIAL_NEWS_BOARD);
  const [items, setItems] = useState<OfficialNewsItem[]>(OFFICIAL_NEWS_ITEMS);
  const [updatedAt, setUpdatedAt] = useState<string>("本地備援資料");
  const [sourceMode, setSourceMode] = useState<string>("local-fallback");

  useEffect(() => {
    let isMounted = true;

    async function loadOfficialNews() {
      try {
        const response = await fetch("/api/official-news", {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`official news api failed: ${response.status}`);
        }

        const data = (await response.json()) as OfficialNewsApiResponse;

        if (!data.ok || !data.board) {
          throw new Error("official news api returned invalid data");
        }

        if (!isMounted) return;

        setBoard(data.board);
        setItems(Array.isArray(data.items) ? data.items : OFFICIAL_NEWS_ITEMS);
        setUpdatedAt(data.generatedAt);
        setSourceMode(data.mode);
      } catch {
        if (!isMounted) return;

        setBoard(OFFICIAL_NEWS_BOARD);
        setItems(OFFICIAL_NEWS_ITEMS);
        setUpdatedAt("本地備援資料");
        setSourceMode("local-fallback");
      }
    }

    loadOfficialNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => items.slice(0, 3), [items]);
  const sourceLabel = getSourceLabel(sourceMode);
  const updatedLabel = formatUpdatedAt(updatedAt);

  return (
    <div className="official-news-summary official-board official-board-compact">
      <div className="official-compact-header">
        <div className="official-compact-title">
          <Bell size={16} />
          <span>最新公告</span>
          <small>{sourceLabel}</small>
        </div>

        <Link
          className="official-compact-more"
          href={board.mainLinkHref}
          target="_blank"
          rel="noreferrer"
        >
          查看更多
        </Link>
      </div>

      <div className="official-news-feed-list official-news-feed-list-compact">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            className="official-news-feed-item official-news-feed-item-compact"
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="official-news-feed-meta">
              {item.category}｜{formatOfficialNewsDate(item.publishedAt)}
            </span>
            <b>{item.title}</b>
          </Link>
        ))}
      </div>

      <p className="official-news-api-status official-news-api-status-compact">
        備註：公告與鈴鐺狀態會隨 RSS / API 更新｜{sourceLabel}｜更新：{updatedLabel}
      </p>
    </div>
  );
}

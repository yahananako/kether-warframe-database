"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  OFFICIAL_NEWS_BOARD,
  OFFICIAL_NEWS_ITEMS,
  OFFICIAL_NEWS_LINKS,
  type OfficialNewsBoardData,
  type OfficialNewsItem,
  type OfficialNewsLink,
} from "../data/officialNews";

type OfficialNewsApiResponse = {
  ok: boolean;
  mode: string;
  generatedAt: string;
  board: OfficialNewsBoardData;
  links: OfficialNewsLink[];
  items?: OfficialNewsItem[];
};

function formatOfficialNewsDate(value: string | null) {
  if (!value) return "待接入 RSS";

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

export default function OfficialNewsBoard() {
  const [board, setBoard] = useState<OfficialNewsBoardData>(OFFICIAL_NEWS_BOARD);
  const [links, setLinks] = useState<OfficialNewsLink[]>(OFFICIAL_NEWS_LINKS);
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

        if (!data.ok || !data.board || !Array.isArray(data.links)) {
          throw new Error("official news api returned invalid data");
        }

        if (!isMounted) return;

        setBoard(data.board);
        setLinks(data.links);
        setItems(Array.isArray(data.items) ? data.items : OFFICIAL_NEWS_ITEMS);
        setUpdatedAt(data.generatedAt);
        setSourceMode(data.mode);
      } catch {
        if (!isMounted) return;

        setBoard(OFFICIAL_NEWS_BOARD);
        setLinks(OFFICIAL_NEWS_LINKS);
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

  return (
    <div className="official-news-summary official-board">
      <div className="official-news-summary-title">
        <Bell size={16} />
        <span>官方公告看板</span>
      </div>

      <div className="official-board-hero">
        <div>
          <span className="official-board-kicker">{board.kicker}</span>
          <h3>{board.title}</h3>
          <p>{board.description}</p>
        </div>

        <Link
          className="official-board-main-link"
          href={board.mainLinkHref}
          target="_blank"
          rel="noreferrer"
        >
          {board.mainLinkText}
        </Link>
      </div>

      <div className="official-news-list official-board-grid">
        {links.map((item) => (
          <Link
            key={item.id}
            className="official-news-item official-board-card"
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="official-board-label">{item.label}</span>
            <b>{item.title}</b>
            <span>{item.description}</span>
          </Link>
        ))}
      </div>

      <div className="official-news-feed-preview">
        <div className="official-news-feed-title">
          <span>最新公告預覽</span>
          <b>{items.length} 筆</b>
        </div>

        <div className="official-news-feed-list">
          {items.map((item) => (
            <Link
              key={item.id}
              className="official-news-feed-item"
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
      </div>

      <p className="official-news-note">{board.note}</p>

      <p className="official-news-api-status">
        API 狀態：{sourceMode}｜更新時間：{updatedAt}
      </p>
    </div>
  );
}

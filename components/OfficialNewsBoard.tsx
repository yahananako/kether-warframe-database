"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { OFFICIAL_NEWS_BOARD, OFFICIAL_NEWS_LINKS } from "../data/officialNews";

type OfficialNewsLink = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
};

type OfficialNewsBoardData = {
  kicker: string;
  title: string;
  description: string;
  mainLinkText: string;
  mainLinkHref: string;
  note: string;
};

type OfficialNewsApiResponse = {
  ok: boolean;
  mode: string;
  generatedAt: string;
  board: OfficialNewsBoardData;
  links: OfficialNewsLink[];
};

export default function OfficialNewsBoard() {
  const [board, setBoard] = useState<OfficialNewsBoardData>(OFFICIAL_NEWS_BOARD);
  const [links, setLinks] = useState<OfficialNewsLink[]>(OFFICIAL_NEWS_LINKS);
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
        setUpdatedAt(data.generatedAt);
        setSourceMode(data.mode);
      } catch {
        if (!isMounted) return;

        setBoard(OFFICIAL_NEWS_BOARD);
        setLinks(OFFICIAL_NEWS_LINKS);
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

      <p className="official-news-note">{board.note}</p>

      <p className="official-news-api-status">
        API 狀態：{sourceMode}｜更新時間：{updatedAt}
      </p>
    </div>
  );
}

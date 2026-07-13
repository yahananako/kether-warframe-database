"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./ProfileOwnedSummary.module.css";

type OwnedItem = {
  item_key?: string;
  category?: string;
  section?: string;
  owned?: boolean;
};

type OwnedListResponse = {
  ok: boolean;
  authenticated?: boolean;
  message?: string;
  items?: OwnedItem[];
};

type SummaryMetric = {
  label: string;
  value: string;
};

export default function ProfileOwnedSummary() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OwnedListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOwnedItems() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user-owned/list", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as OwnedListResponse;

        if (!active) return;

        setData(payload);

        if (!payload.ok) {
          setError(payload.message || "個人已購買資料讀取失敗。");
        }
      } catch {
        if (!active) return;
        setError("個人已購買資料讀取失敗。");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOwnedItems();

    return () => {
      active = false;
    };
  }, []);

  const ownedItems = useMemo(
    () => (data?.items || []).filter((item) => item.owned !== false),
    [data]
  );

  const ownedCount = ownedItems.length;
  const sectionCount = new Set(
    ownedItems.map((item) => item.section || "未分類")
  ).size;

  let metrics: SummaryMetric[];
  let message: string | null = null;

  if (loading) {
    metrics = [
      { label: "個人已購買", value: "讀取中" },
      { label: "完成度", value: "讀取中" },
      { label: "收藏總價", value: "規劃中" },
    ];
  } else if (error || !data?.authenticated) {
    metrics = [
      { label: "個人已購買", value: "未登入" },
      { label: "完成度", value: "待登入" },
      { label: "收藏總價", value: "規劃中" },
    ];
    message = error || "請先登入 Discord 才能讀取個人紀錄。";
  } else {
    metrics = [
      { label: "個人已購買", value: `${ownedCount} 筆` },
      {
        label: "完成度",
        value: ownedCount > 0 ? `${sectionCount} 區塊` : "0 筆",
      },
      { label: "收藏總價", value: "規劃中" },
    ];
  }

  return (
    <article className={styles.summaryCard} aria-label="個人收藏摘要">
      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.label} className={styles.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </article>
  );
}

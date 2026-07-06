"use client";

import { useEffect, useMemo, useState } from "react";

type OwnedItem = {
  item_key?: string;
  owned?: boolean;
};

type OwnedListResponse = {
  ok: boolean;
  authenticated?: boolean;
  message?: string;
  count?: number;
  items?: OwnedItem[];
};

type HomePersonalProgressProps = {
  totalRows: number;
  fallbackOwned: number;
  fallbackCompletion: number;
};

export default function HomePersonalProgress({
  totalRows,
  fallbackOwned,
  fallbackCompletion
}: HomePersonalProgressProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OwnedListResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPersonalProgress() {
      try {
        const response = await fetch("/api/user-owned/list", {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        const payload = (await response.json().catch(() => ({}))) as OwnedListResponse;

        if (!active) return;

        setData(payload);
        setLoading(false);
      } catch {
        if (!active) return;

        setData({
          ok: false,
          authenticated: false,
          message: "個人進度讀取失敗。"
        });
        setLoading(false);
      }
    }

    loadPersonalProgress();

    return () => {
      active = false;
    };
  }, []);

  const ownedCount = useMemo(() => {
    if (!data?.ok || !data.authenticated) return fallbackOwned;

    if (typeof data.count === "number") return data.count;

    return (data.items || []).filter((item) => item.owned !== false).length;
  }, [data, fallbackOwned]);

  const completion = totalRows > 0
    ? Math.round((ownedCount / totalRows) * 100)
    : fallbackCompletion;

  const isPersonal = Boolean(data?.ok && data.authenticated);

  if (loading) {
    return (
      <>
        <article>
          <span>個人已購買</span>
          <strong>讀取中</strong>
          <p>正在讀取 Discord 個人進度。</p>
        </article>

        <article>
          <span>個人完成度</span>
          <strong>讀取中</strong>
          <p>同步個人收藏資料中。</p>
        </article>
      </>
    );
  }

  return (
    <>
      <article>
        <span>{isPersonal ? "個人已購買" : "表格已購買"}</span>
        <strong>{ownedCount.toLocaleString("zh-TW")}</strong>
        <p>{isPersonal ? "Discord 個人進度" : "未登入，顯示表格統計"}</p>
      </article>

      <article>
        <span>{isPersonal ? "個人完成度" : "表格完成度"}</span>
        <strong>{completion}%</strong>
        <p>{isPersonal ? "依個人已購買計算" : "登入後改用個人資料"}</p>
      </article>
    </>
  );
}

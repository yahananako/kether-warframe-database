"use client";

import { useEffect, useMemo, useState } from "react";

type OwnedItem = {
  item_key?: string;
  category?: string;
  section?: string;
  owned?: boolean;
  updated_at?: string;
};

type OwnedListResponse = {
  ok: boolean;
  authenticated?: boolean;
  message?: string;
  count?: number;
  items?: OwnedItem[];
  discordUser?: {
    id: string;
    username: string | null;
    globalName: string | null;
  };
};

export default function ProfileOwnedSummary() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OwnedListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOwnedItems() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-owned/list", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const payload = (await response.json().catch(() => ({}))) as OwnedListResponse;
      setData(payload);

      if (!payload.ok) {
        setError(payload.message || "個人已購買資料讀取失敗。");
      }
    } catch {
      setError("個人已購買資料讀取失敗。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwnedItems();
  }, []);

  const ownedItems = useMemo(() => {
    return (data?.items || []).filter((item) => item.owned !== false);
  }, [data]);

  const ownedCount = ownedItems.length;
  const sectionCount = new Set(ownedItems.map((item) => item.section || "未分類")).size;
  const latestUpdate = ownedItems
    .map((item) => item.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  if (loading) {
    return (
      <>
        <article className="profile-card">
          <h3>個人已購買</h3>
          <strong>讀取中</strong>
          <p>正在讀取 Discord 個人已購買紀錄。</p>
        </article>
        <article className="profile-card">
          <h3>完成度</h3>
          <strong>讀取中</strong>
          <p>等待個人資料同步。</p>
        </article>
        <article className="profile-card">
          <h3>收藏總價</h3>
          <strong>規劃中</strong>
          <p>下一階段會依未購買清單估算白金。</p>
        </article>
        <article className="profile-card">
          <h3>Discord 權限</h3>
          <strong>讀取中</strong>
          <p>正在確認登入狀態。</p>
        </article>
      </>
    );
  }

  if (error || !data?.authenticated) {
    return (
      <>
        <article className="profile-card">
          <h3>個人已購買</h3>
          <strong>未登入</strong>
          <p>{error || "請先登入 Discord 才能讀取個人紀錄。"}</p>
        </article>
        <article className="profile-card">
          <h3>完成度</h3>
          <strong>待登入</strong>
          <p>登入後依個人已購買資料計算。</p>
        </article>
        <article className="profile-card">
          <h3>收藏總價</h3>
          <strong>規劃中</strong>
          <p>登入後可延伸估算未購買項目價格。</p>
        </article>
        <article className="profile-card">
          <h3>Discord 權限</h3>
          <strong>未授權</strong>
          <p>請重新登入 Discord。</p>
        </article>
      </>
    );
  }

  return (
    <>
      <article className="profile-card">
        <h3>個人已購買</h3>
        <strong>{ownedCount} 筆</strong>
        <p>已綁定目前 Discord 使用者的個人紀錄。</p>
      </article>
      <article className="profile-card">
        <h3>完成度</h3>
        <strong>{ownedCount > 0 ? "已啟用" : "0 筆"}</strong>
        <p>目前已記錄 {sectionCount} 個區塊的收藏狀態。</p>
      </article>
      <article className="profile-card">
        <h3>收藏總價</h3>
        <strong>規劃中</strong>
        <p>下一階段會依未購買資料估算所需白金。</p>
      </article>
      <article className="profile-card">
        <h3>Discord 權限</h3>
        <strong>已授權</strong>
        <p>
          {data.discordUser?.globalName || data.discordUser?.username || "Discord 使用者"}
          {latestUpdate ? `，最後更新：${latestUpdate}` : "，個人資料已連接。"}
        </p>
      </article>
    </>
  );
}

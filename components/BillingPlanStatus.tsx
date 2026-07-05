"use client";

import { useEffect, useState } from "react";

type BillingStatus = {
  ok: boolean;
  authenticated: boolean;
  billingEnabled: boolean;
  message?: string;
  plan?: {
    tier: string;
    status: string;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
  };
  features?: {
    personalProgress: boolean;
    discordGuildAccess: boolean;
    roleGate: boolean;
    paidSubscription: boolean;
    priceEstimation: boolean;
  };
};

export default function BillingPlanStatus() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BillingStatus | null>(null);

  async function loadBillingStatus() {
    setLoading(true);

    try {
      const response = await fetch("/api/billing/status", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const payload = (await response.json()) as BillingStatus;
      setStatus(payload);
    } catch {
      setStatus({
        ok: false,
        authenticated: false,
        billingEnabled: false,
        message: "付費方案狀態讀取失敗。"
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBillingStatus();
  }, []);

  const planLabel = status?.plan?.tier === "free" ? "免費版" : status?.plan?.tier || "預留中";
  const paidEnabled = Boolean(status?.features?.paidSubscription);

  return (
    <article className="profile-card">
      <h3>付費方案</h3>

      <strong>
        {loading ? "讀取中" : paidEnabled ? "已啟用" : "預留中"}
      </strong>

      <p>
        {loading
          ? "正在讀取方案狀態。"
          : status?.message || "付費方案功能目前為預留狀態。"}
      </p>

      <div style={{ display: "grid", gap: 8, marginTop: 16, color: "#5d6875" }}>
        <span>
          目前方案：
          <b>{planLabel}</b>
        </span>

        <span>
          登入狀態：
          <b>{status?.authenticated ? "已登入" : "未登入"}</b>
        </span>

        <span>
          個人進度：
          <b>{status?.features?.personalProgress ? "可使用" : "未啟用"}</b>
        </span>

        <span>
          Discord 權限：
          <b>{status?.features?.discordGuildAccess ? "已連接" : "未連接"}</b>
        </span>

        <span>
          Role Gate：
          <b>{status?.features?.roleGate ? "已啟用" : "未啟用，全群成員可用"}</b>
        </span>

        <span>
          到期日：
          <b>{status?.plan?.subscriptionEndsAt || status?.plan?.trialEndsAt || "尚未設定"}</b>
        </span>
      </div>

      <button
        type="button"
        onClick={loadBillingStatus}
        style={{
          marginTop: 18,
          border: "1px solid rgba(15, 23, 42, 0.16)",
          borderRadius: 999,
          padding: "10px 16px",
          background: "rgba(255,255,255,0.72)",
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        重新檢查方案
      </button>
    </article>
  );
}

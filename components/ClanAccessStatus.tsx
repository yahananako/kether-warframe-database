"use client";

import { RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./ClanAccessStatus.module.css";

type SessionResponse = {
  ok?: boolean;
  authenticated?: boolean;
  discordUser?: {
    username?: string | null;
    globalName?: string | null;
    guildNickname?: string | null;
  };
  session?: {
    issuedAt?: string;
    expiresAt?: string;
  };
};

type PermissionResponse = {
  ok?: boolean;
  authenticated?: boolean;
  authorized?: boolean;
  message?: string;
};

type BillingResponse = {
  ok?: boolean;
  authenticated?: boolean;
  message?: string;
  clan?: {
    name?: string;
    slug?: string;
  } | null;
  plan?: {
    tier?: string;
    status?: string;
    subscriptionEndsAt?: string | null;
    updatedAt?: string | null;
  };
};

type OwnedResponse = {
  ok?: boolean;
  items?: Array<{
    updated_at?: string;
  }>;
};

const planLabels: Record<string, string> = {
  none: "尚未設定",
  monthly: "月費制",
  quarterly: "季費制",
  yearly: "年費制"
};

const statusLabels: Record<string, string> = {
  inactive: "未啟用",
  active: "有效",
  paused: "暫停",
  cancelled: "已取消",
  expired: "已到期"
};

export default function ClanAccessStatus() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [owned, setOwned] = useState<OwnedResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [sessionResponse, permissionResponse, billingResponse, ownedResponse] =
        await Promise.all([
          fetch("/api/auth/session", {
            credentials: "include",
            cache: "no-store"
          }),
          fetch("/api/auth/permission", {
            credentials: "include",
            cache: "no-store"
          }),
          fetch("/api/billing/status", {
            credentials: "include",
            cache: "no-store"
          }),
          fetch("/api/user-owned/list", {
            credentials: "include",
            cache: "no-store"
          })
        ]);

      const [sessionData, permissionData, billingData, ownedData] =
        await Promise.all([
          sessionResponse.json().catch(() => ({})),
          permissionResponse.json().catch(() => ({})),
          billingResponse.json().catch(() => ({})),
          ownedResponse.json().catch(() => ({}))
        ]);

      setSession(sessionData as SessionResponse);
      setPermission(permissionData as PermissionResponse);
      setBilling(billingData as BillingResponse);
      setOwned(ownedData as OwnedResponse);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const latestUpdate = useMemo(() => {
    const itemDates = (owned?.items || [])
      .map((item) => item.updated_at)
      .filter((value): value is string => Boolean(value))
      .sort();

    return itemDates.at(-1) || billing?.plan?.updatedAt || session?.session?.issuedAt || null;
  }, [billing?.plan?.updatedAt, owned?.items, session?.session?.issuedAt]);

  const authenticated = session?.authenticated === true;
  const authorized = permission?.authorized === true;

  if (!loading && !authenticated) {
    return null;
  }

  const displayName =
    session?.discordUser?.guildNickname ||
    session?.discordUser?.globalName ||
    session?.discordUser?.username ||
    "Discord 使用者";

  const clanName = billing?.clan?.name || "KETHER OF PARADISO";
  const planTier = billing?.plan?.tier || "none";
  const planStatus = billing?.plan?.status || "inactive";
  const subscriptionEndsAt = billing?.plan?.subscriptionEndsAt || null;

  return (
    <details className="home-new-fold-card kether-clan-fold">
      <summary className="home-new-fold-head">
        <span>
          <em>KETHER CLAN DATABASE ACCESS</em>
          <strong>氏族資料庫權限</strong>
        </span>
        <b aria-hidden="true">⌄</b>
      </summary>

      <section className={`${styles.body} kether-clan-fold-body`}>
        {loading ? (
          <div className={styles.note}>正在讀取氏族權限與訂閱狀態……</div>
        ) : (
          <>
            <div className={styles.hero}>
              <div className={styles.title}>
                {authorized ? <ShieldCheck size={28} /> : <ShieldX size={28} />}

                <div>
                  <h3>Discord 權限</h3>
                  <p>
                    {displayName}
                    {latestUpdate ? `，最後更新：${latestUpdate}` : "，尚無更新時間。"}
                  </p>
                </div>
              </div>

              <span className={styles.badge} data-state={authorized ? "on" : "off"}>
                {authorized ? "已授權" : "未授權"}
              </span>
            </div>

            <div className={styles.grid}>
              <article className={styles.card}>
                <span>氏族資訊</span>
                <strong>{clanName}</strong>
              </article>

              <article className={styles.card}>
                <span>Discord 授權狀態</span>
                <strong>{authorized ? "已授權" : "未授權"}</strong>
              </article>

              <article className={styles.card}>
                <span>KETHER 訂閱狀態</span>
                <strong>{statusLabels[planStatus] || planStatus}</strong>
              </article>

              <article className={styles.card}>
                <span>訂閱方案</span>
                <strong>{planLabels[planTier] || planTier}</strong>
              </article>

              <article className={styles.card}>
                <span>到期日期</span>
                <strong>{subscriptionEndsAt || "尚未設定"}</strong>
              </article>

              <article className={styles.card}>
                <span>Session 到期</span>
                <strong>{session?.session?.expiresAt || "未知"}</strong>
              </article>
            </div>

            <div className={styles.note}>
              月費制、季費制與年費制會依氏族資料庫設定顯示，並由到期日期自動判斷是否過期。
            </div>

            <button
              type="button"
              className={styles.refresh}
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              重新檢查
            </button>
          </>
        )}
      </section>
    </details>
  );
}

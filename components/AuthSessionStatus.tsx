"use client";

import { useEffect, useState } from "react";

type SessionResponse = {
  ok: boolean;
  authenticated?: boolean;
  error?: string;
  discordUser?: {
    id: string;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
  };
  guildAccess?: {
    guildId: string;
    authorized: boolean;
    roleIds: string[];
  };
  session?: {
    issuedAt: string;
    expiresAt: string;
  };
};

export default function AuthSessionStatus() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        const data = (await response.json().catch(() => ({}))) as SessionResponse;

        if (!active) return;

        setSession(data);
        setLoading(false);
      } catch {
        if (!active) return;

        setSession({
          ok: false,
          authenticated: false,
          error: "Discord session 狀態讀取失敗。"
        });
        setLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="auth-hero-card">
        <h2>Discord 登入狀態</h2>
        <p>正在讀取 Discord 通行證狀態...</p>
      </section>
    );
  }

  if (!session?.ok || !session.authenticated) {
    return (
      <section className="auth-hero-card">
        <h2>Discord 登入狀態</h2>
        <p>{session?.error || "目前尚未登入 Discord，個人進度會保持唯讀狀態。"}</p>

        <div className="auth-actions">
          <a className="auth-primary" href="/login">
            前往 Discord 登入
          </a>
        </div>
      </section>
    );
  }

  const displayName =
    session.discordUser?.globalName ||
    session.discordUser?.username ||
    session.discordUser?.id ||
    "Discord 使用者";

  return (
    <section className="auth-hero-card">
      <h2>Discord 登入狀態</h2>

      <p>
        已登入：<strong>{displayName}</strong>
      </p>

      <p>
        Guild：{session.guildAccess?.guildId || "未取得"}，
        權限：{session.guildAccess?.authorized ? "已授權" : "未授權"}
      </p>

      <p>
        Session 到期：{session.session?.expiresAt || "未知"}
      </p>

      <div className="auth-actions">
        <a className="auth-primary" href="/api/auth/session">
          查看 Session JSON
        </a>

        <a className="auth-primary" href="/api/auth/logout">
          登出 Discord
        </a>
      </div>
    </section>
  );
}

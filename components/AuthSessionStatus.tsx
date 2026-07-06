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

function getDiscordAvatarUrl(user?: SessionResponse["discordUser"]) {
  if (!user?.id || !user.avatar) return null;

  const extension = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

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
        <h2>Discord 名片</h2>
        <p>正在讀取 Discord 通行證狀態...</p>
      </section>
    );
  }

  if (!session?.ok || !session.authenticated) {
    return (
      <section className="auth-hero-card">
        <h2>Discord 名片</h2>
        <p>{session?.error || "目前尚未登入 Discord，個人進度會保持唯讀狀態。"}</p>

        <div className="auth-actions">
          <a className="auth-primary" href="/api/auth/discord/login">
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

  const username = session.discordUser?.username || "discord user";
  const avatarUrl = getDiscordAvatarUrl(session.discordUser);
  const isAuthorized = Boolean(session.guildAccess?.authorized);

  return (
    <section className="auth-hero-card">
      <div
        style={{
          display: "grid",
          gap: 22,
          justifyItems: "center",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: "min(100%, 520px)",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: 34,
            padding: 24,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))",
            boxShadow: "0 22px 60px rgba(15, 23, 42, 0.10)"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(148,163,184,0.28))",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14)"
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} 的 Discord 頭像`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              ) : (
                <span style={{ fontSize: 34, fontWeight: 900 }}>
                  {displayName.slice(0, 1)}
                </span>
              )}
            </div>

            <div style={{ minWidth: 220 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  letterSpacing: "0.14em",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 900
                }}
              >
                DISCORD PROFILE CARD
              </p>

              <h2 style={{ margin: 0 }}>Discord 名片</h2>

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#111827"
                }}
              >
                {displayName}
              </p>

              <p style={{ margin: "4px 0 0", color: "#64748b", fontWeight: 700 }}>
                @{username}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            width: "min(100%, 520px)",
            textAlign: "left",
            color: "#5d6875"
          }}
        >
          <span>
            登入狀態：<b>已登入</b>
          </span>

          <span>
            權限狀態：<b>{isAuthorized ? "已授權" : "未授權"}</b>
          </span>

          <span>
            Guild：<b>已隱藏</b>
          </span>

          <span>
            Session 到期：<b>{session.session?.expiresAt || "未知"}</b>
          </span>
        </div>

        <div className="auth-actions">
          <a className="auth-primary" href="/api/auth/session">
            查看 Session JSON
          </a>

          <a className="auth-primary" href="/api/auth/logout">
            登出 Discord
          </a>
        </div>
      </div>
    </section>
  );
}

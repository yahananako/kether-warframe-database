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
    banner?: string | null;
    accentColor?: number | null;
    avatarDecorationAsset?: string | null;
    nameplatePalette?: string | null;
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

function getDiscordBannerUrl(user?: SessionResponse["discordUser"]) {
  if (!user?.id || !user.banner) return null;

  const extension = user.banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${extension}?size=512`;
}

function getAccentHex(accentColor?: number | null) {
  if (typeof accentColor !== "number") return "#f5d0d9";
  return `#${accentColor.toString(16).padStart(6, "0")}`;
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
  const bannerUrl = getDiscordBannerUrl(session.discordUser);
  const accentHex = getAccentHex(session.discordUser?.accentColor);
  const isAuthorized = Boolean(session.guildAccess?.authorized);

  return (
    <section className="auth-hero-card">
      <div
        style={{
          width: "min(100%, 680px)",
          margin: "0 auto",
          borderRadius: 34,
          overflow: "hidden",
          border: "1px solid rgba(15, 23, 42, 0.12)",
          boxShadow: `0 26px 70px ${accentHex}66, 0 18px 48px rgba(15, 23, 42, 0.12)`,
          background: "rgba(255,255,255,0.92)"
        }}
      >
        <div
          style={{
            height: 170,
            background: bannerUrl
              ? `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.28)), url(${bannerUrl}) center / cover`
              : `linear-gradient(135deg, ${accentHex}, #ffffff)`,
            position: "relative"
          }}
        />

        <div
          style={{
            padding: "0 28px 30px",
            background: `linear-gradient(180deg, ${accentHex}cc 0%, ${accentHex}88 42%, rgba(255,255,255,0.96) 100%)`
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 22,
              alignItems: "start"
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 14,
                alignContent: "start",
                justifyItems: "center",
                textAlign: "center",
                padding: "0 10px",
                transform: "translateY(-46px)",
                marginBottom: -28
              }}
            >
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 999,
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.8)",
                  border: "6px solid rgba(255,255,255,0.94)",
                  boxShadow: "0 18px 36px rgba(15, 23, 42, 0.18)"
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
                  <span style={{ fontSize: 40, fontWeight: 900 }}>
                    {displayName.slice(0, 1)}
                  </span>
                )}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    letterSpacing: "0.14em",
                    color: "#64748b",
                    fontSize: 12,
                    fontWeight: 900
                  }}
                >
                  DISCORD PROFILE CARD
                </p>

                <h2 style={{ margin: 0, fontSize: "clamp(30px, 5vw, 44px)" }}>
                  Discord 名片
                </h2>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 24,
                    fontWeight: 950,
                    color: "#111827"
                  }}
                >
                  {displayName}
                </p>

                <p style={{ margin: "4px 0 0", color: "#475569", fontWeight: 850 }}>
                  @{username}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                alignContent: "center",
                marginTop: 28,
                padding: 22,
                borderRadius: 28,
                background: "rgba(255,255,255,0.72)",
                color: "#475569",
                textAlign: "left",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)"
              }}
            >
              <span>
                登入狀態：<b>已登入</b>
              </span>

              <span>
                權限狀態：<b>{isAuthorized ? "已授權" : "未授權"}</b>
              </span>

              <span>
                Session 到期：<b>{session.session?.expiresAt || "未知"}</b>
              </span>
            </div>
          </div>

          <div className="auth-actions" style={{ marginTop: 22 }}>
            <a className="auth-primary" href="/api/auth/logout">
              登出 Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

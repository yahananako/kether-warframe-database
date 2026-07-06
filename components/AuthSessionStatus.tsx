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
  if (typeof accentColor !== "number") return "#e879f9";
  return `#${accentColor.toString(16).padStart(6, "0")}`;
}

function getSoftPalette(palette?: string | null) {
  const palettes: Record<string, string> = {
    crimson: "#fb7185",
    berry: "#f472b6",
    sky: "#38bdf8",
    teal: "#2dd4bf",
    forest: "#4ade80",
    bubble_gum: "#f9a8d4",
    violet: "#a78bfa",
    cobalt: "#60a5fa",
    clover: "#86efac",
    lemon: "#fde047",
    white: "#f8fafc"
  };

  return palette ? palettes[palette] || "#f9a8d4" : "#f9a8d4";
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
  const nameplateColor = getSoftPalette(session.discordUser?.nameplatePalette);
  const isAuthorized = Boolean(session.guildAccess?.authorized);

  return (
    <section className="auth-hero-card">
      <div
        style={{
          width: "min(100%, 640px)",
          margin: "0 auto",
          borderRadius: 34,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(15, 23, 42, 0.12)",
          boxShadow: `0 28px 80px ${accentHex}33, 0 18px 48px rgba(15, 23, 42, 0.12)`,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.58))"
        }}
      >
        <div
          style={{
            height: 180,
            position: "relative",
            background: bannerUrl
              ? `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(255,255,255,0.34)), url(${bannerUrl}) center / cover`
              : `radial-gradient(circle at 18% 20%, ${accentHex}66, transparent 34%), radial-gradient(circle at 82% 18%, ${nameplateColor}66, transparent 30%), linear-gradient(135deg, ${accentHex}55, ${nameplateColor}55)`
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.72), transparent 9%), radial-gradient(circle at 72% 22%, rgba(255,255,255,0.52), transparent 8%), radial-gradient(circle at 88% 72%, rgba(255,255,255,0.42), transparent 7%)",
              mixBlendMode: "screen"
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.36) 42%, transparent 68%)",
              transform: "translateX(-18%)"
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            padding: "0 26px 28px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.92))"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "end",
              flexWrap: "wrap",
              transform: "translateY(-44px)",
              marginBottom: -24
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
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.96), rgba(148,163,184,0.28))",
                border: "6px solid rgba(255,255,255,0.92)",
                boxShadow: `0 0 0 3px ${accentHex}66, 0 16px 32px rgba(15,23,42,0.18)`
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

            <div style={{ minWidth: 220, paddingBottom: 8 }}>
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
                  fontSize: 24,
                  fontWeight: 950,
                  color: "#111827"
                }}
              >
                {displayName}
              </p>

              <p style={{ margin: "4px 0 0", color: "#64748b", fontWeight: 800 }}>
                @{username}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 18,
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
              名片顏色：<b>{accentHex}</b>
            </span>

            <span>
              Session 到期：<b>{session.session?.expiresAt || "未知"}</b>
            </span>
          </div>

          <div className="auth-actions" style={{ marginTop: 22 }}>
            <a className="auth-primary" href="/api/auth/session">
              查看 Session JSON
            </a>

            <a className="auth-primary" href="/api/auth/logout">
              登出 Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

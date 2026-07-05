"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionResponse = {
  ok: boolean;
  authenticated?: boolean;
  discordUser?: {
    id: string;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
  };
};

export default function HomeAuthMini() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

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

        const isAuthed = Boolean(data.ok && data.authenticated);

        setAuthenticated(isAuthed);
        setDisplayName(
          data.discordUser?.globalName ||
            data.discordUser?.username ||
            data.discordUser?.id ||
            null
        );
      } catch {
        if (!active) return;

        setAuthenticated(false);
        setDisplayName(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading || !authenticated) {
    return (
      <Link className="login-mini" href="/login">
        登入
      </Link>
    );
  }

  return (
    <Link
      className="login-mini"
      href="/profile"
      title={displayName ? `已登入：${displayName}` : "已登入 Discord"}
    >
      個人
    </Link>
  );
}

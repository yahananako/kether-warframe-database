"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

type SessionResponse = {
  ok?: boolean;
  authenticated?: boolean;
  discordUser?: {
    id?: string;
    username?: string | null;
    globalName?: string | null;
  };
};

type AuthState = "loading" | "guest" | "authenticated";

export default function HomeAuthAction() {
  const [state, setState] = useState<AuthState>("loading");
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = (await response
          .json()
          .catch(() => ({}))) as SessionResponse;

        if (!active) return;

        const authenticated = Boolean(data.ok && data.authenticated);

        setState(authenticated ? "authenticated" : "guest");
        setDisplayName(
          data.discordUser?.globalName ||
            data.discordUser?.username ||
            data.discordUser?.id ||
            null
        );
      } catch {
        if (!active) return;

        setState("guest");
        setDisplayName(null);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (state === "authenticated") {
    return (
      <Link
        href="/profile"
        className="home-new-round-action"
        aria-label="個人頁面"
        title={displayName ? `已登入：${displayName}` : "已通過 Discord 認證"}
      >
        <UserRound size={18} />
        <span>個人</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="home-new-round-action"
      aria-label="Discord 登入"
      aria-busy={state === "loading"}
    >
      <LogIn size={18} />
      <span>登入</span>
    </Link>
  );
}

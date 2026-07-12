"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

type SessionResponse = {
  ok?: boolean;
  authenticated?: boolean;
};

type SessionState = "loading" | "guest" | "authenticated";

export default function ClanDiscordAccessCard() {
  const [state, setState] = useState<SessionState>("loading");

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
      } catch {
        if (active) {
          setState("guest");
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  /* 讀取中與已認證時都不顯示登入卡片 */
  if (state !== "guest") {
    return null;
  }

  return (
    <article className="kether-clan-card">
      <div className="kether-clan-card-icon">
        <KeyRound size={22} />
      </div>

      <h2>網站登入與權限</h2>

      <p>
        使用 Discord 登入後，網站會依群組與身分組確認個人功能及群組權限。
      </p>

      <Link href="/login">使用 Discord 登入</Link>
    </article>
  );
}

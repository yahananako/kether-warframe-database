"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

type SessionState = "loading" | "guest" | "signed-in";

export default function ClanDiscordAccessCard() {
  const [state, setState] = useState<SessionState>("loading");

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!alive) return;

        if (!res.ok) {
          setState("guest");
          return;
        }

        const data = await res.json();
        setState(data?.user ? "signed-in" : "guest");
      } catch {
        if (alive) setState("guest");
      }
    }

    checkSession();

    return () => {
      alive = false;
    };
  }, []);

  if (state === "loading" || state === "signed-in") {
    return null;
  }

  return (
    <article className="kether-clan-card">
      <div className="kether-clan-card-icon">
        <KeyRound size={22} />
      </div>

      <h2>網站登入與權限</h2>

      <p>
        KETHER 網站使用 Discord 連結登入。登入後會依 Discord 群組與身分組，
        開啟可使用的個人功能與群組功能。
      </p>

      <Link href="/profile">使用 Discord 登入</Link>
    </article>
  );
}

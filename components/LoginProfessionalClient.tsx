"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Database,
  ExternalLink,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";

import HomeNewInlineMenu from "./HomeNewInlineMenu";
import HomeNewInlineNotifications from "./HomeNewInlineNotifications";
import HomeNewInlineSearch from "./HomeNewInlineSearch";
import styles from "./LoginProfessionalClient.module.css";

const POLICY_URL =
  "https://docs.google.com/document/d/13UZy4RiLPUrLqHx-NaWUxS7xhJNTKkKUldMWJmLenOg/edit?usp=drivesdk";

export default function LoginProfessionalClient() {
  const [accepted, setAccepted] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));

        if (!active) return;

        if (response.ok && data?.ok && data?.authenticated) {
          window.location.replace("/profile");
          return;
        }
      } catch {
        // 登入頁仍可正常使用，Discord 登入時會重新驗證。
      }

      if (active) setCheckingSession(false);
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  function startDiscordLogin(event: MouseEvent<HTMLAnchorElement>) {
    if (accepted) return;

    event.preventDefault();
    setNotice("請先閱讀並勾選同意資料使用與隱私說明。");
  }

  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className={styles.topShell} aria-label="KETHER 登入頁導覽列">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />
              <Link href="/">KETHER</Link>
            </div>

            <div className="home-new-hero-actions" aria-label="登入頁快捷入口">
              <HomeNewInlineSearch />
              <HomeNewInlineNotifications />

              <a
                href="/api/auth/discord/login"
                className={`${styles.topLogin} home-new-discord-action`}
                aria-disabled={!accepted}
                onClick={startDiscordLogin}
              >
                <MessageCircle size={18} />
                <span>登入 Discord</span>
              </a>
            </div>
          </div>
        </section>

        <section className={styles.loginStage}>
          <article className={styles.introCard}>
            <div className={styles.eyebrow}>
              <ShieldCheck size={18} />
              KETHER SECURE ACCESS
            </div>

            <h1>Discord 身分驗證</h1>
            <p className={styles.lead}>
              使用 Discord OAuth 驗證 KETHER OF PARADISO 成員資格與身分組，
              通過授權後會自動進入個人頁面。
            </p>

            <div className={styles.featureGrid}>
              <div>
                <UserRoundCheck size={21} />
                <strong>確認本人身分</strong>
                <span>辨識 Discord 帳號與群組內名稱</span>
              </div>

              <div>
                <BadgeCheck size={21} />
                <strong>確認氏族權限</strong>
                <span>依指定 Guild 與身分組開放功能</span>
              </div>

              <div>
                <Database size={21} />
                <strong>連結個人資料</strong>
                <span>提供收藏、進度與氏族資料功能</span>
              </div>
            </div>

            <div className={styles.scopeBox}>
              <span>目前 Discord OAuth 授權範圍</span>
              <div>
                <code>identify</code>
                <code>guilds</code>
                <code>guilds.members.read</code>
              </div>
            </div>
          </article>

          <article className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.authIcon}>
                <LockKeyhole size={25} />
              </div>
              <div>
                <p>MEMBER AUTHORIZATION</p>
                <h2>登入 KETHER</h2>
              </div>
            </div>

            <p className={styles.authSummary}>
              KETHER 只會取得完成登入、氏族成員確認與網站權限所需的資料。
              不會取得 Discord 密碼、私訊、頻道訊息、語音內容、電話號碼或電子郵件。
            </p>

            <label className={styles.consentRow}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => {
                  setAccepted(event.target.checked);
                  setNotice(null);
                }}
              />
              <span>
                我已閱讀並同意下方的資料使用說明、隱私權政策與免責聲明。
              </span>
            </label>

            {notice && (
              <div className={styles.notice} role="alert">
                {notice}
              </div>
            )}

            <a
              href="/api/auth/discord/login"
              className={`${styles.loginButton} ${
                accepted ? "" : styles.loginButtonDisabled
              }`}
              aria-disabled={!accepted || checkingSession}
              onClick={startDiscordLogin}
            >
              <MessageCircle size={20} />
              {checkingSession ? "正在確認登入狀態…" : "使用 Discord 授權登入"}
            </a>

            <p className={styles.redirectHint}>
              授權完成後將自動前往 <strong>個人頁面</strong>。
            </p>
          </article>
        </section>

        <section className={styles.policyCard} aria-label="登入資料與政策說明">
          <div className={styles.policyHeading}>
            <div>
              <p>KETHER DATA & PRIVACY</p>
              <h2>登入前資料告知</h2>
            </div>
            <FileText size={25} />
          </div>

          <div className={styles.policyList}>
            <details>
              <summary>
                <span>Discord 會提供哪些資料</span>
                <b aria-hidden="true">⌄</b>
              </summary>
              <div>
                <p>依目前網站實際登入流程，可能使用：</p>
                <ul>
                  <li>Discord 使用者 ID、使用者名稱與顯示名稱</li>
                  <li>頭像、個人橫幅、主題色、頭像裝飾與名牌樣式</li>
                  <li>KETHER Discord 群組 ID、群組內暱稱與身分組 ID</li>
                  <li>登入工作階段建立時間與到期時間</li>
                </ul>
              </div>
            </details>

            <details>
              <summary>
                <span>資料如何使用與保存</span>
                <b aria-hidden="true">⌄</b>
              </summary>
              <div>
                <ul>
                  <li>建立及維持登入狀態</li>
                  <li>驗證 KETHER 群組成員及網站存取權限</li>
                  <li>顯示個人資料、收藏、已購買狀態與完成度</li>
                  <li>驗證氏族公告閱讀及管理權限</li>
                  <li>維護網站安全、錯誤排除及防止未授權存取</li>
                </ul>
                <p>
                  登入狀態使用簽章保護的 HttpOnly Cookie，清除 Cookie、登出或
                  Session 到期後需重新登入。
                </p>
              </div>
            </details>

            <details>
              <summary>
                <span>不會透過 Discord 登入取得的資料</span>
                <b aria-hidden="true">⌄</b>
              </summary>
              <div>
                <ul>
                  <li>Discord 密碼、雙重驗證密碼或完整權杖</li>
                  <li>私訊、頻道訊息、語音內容或好友名單</li>
                  <li>電話號碼、付款資料或信用卡資料</li>
                  <li>目前未要求 Discord 電子郵件授權</li>
                </ul>
              </div>
            </details>

            <details>
              <summary>
                <span>第三方服務與免責聲明</span>
                <b aria-hidden="true">⌄</b>
              </summary>
              <div>
                <p>
                  KETHER 為玩家自行建立的非官方 Warframe 資料平台，與 Digital
                  Extremes、Discord、Warframe Market 及其他第三方服務沒有官方隸屬關係。
                </p>
                <p>
                  網站部分功能依賴 Discord、Vercel、Neon、Supabase、GitHub、Google
                  與 YouTube。第三方服務中斷、資料延遲或政策變更，可能影響網站功能。
                </p>
              </div>
            </details>

            <details>
              <summary>
                <span>使用者權利與拒絕提供資料的影響</span>
                <b aria-hidden="true">⌄</b>
              </summary>
              <div>
                <p>
                  使用者可依法提出查詢、閱覽、補充、更正、停止蒐集、停止利用或刪除資料的申請。
                </p>
                <p>
                  不同意提供登入必要資料時，將無法使用 Discord 登入、氏族身分組驗證、
                  個人資料中心與其他限制功能，但不影響公開頁面的瀏覽。
                </p>
              </div>
            </details>
          </div>

          <a
            className={styles.policyLink}
            href={POLICY_URL}
            target="_blank"
            rel="noreferrer"
          >
            查看完整《免責聲明、資料使用範圍暨隱私權政策》
            <ExternalLink size={15} />
          </a>
        </section>

        <footer className="home-new-footer">
          <span className="home-new-footer-url">
            https://kether-warframe-database.vercel.app
          </span>
          <span className="home-new-footer-credit">
            builder by ヤハ奈々子、羊咩、凱洛
          </span>
        </footer>
      </div>
    </main>
  );
}

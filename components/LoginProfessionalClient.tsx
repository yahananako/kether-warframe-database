"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Check,
  ExternalLink,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import HomeNewInlineMenu from "./HomeNewInlineMenu";
import HomeNewInlineNotifications from "./HomeNewInlineNotifications";
import HomeNewInlineSearch from "./HomeNewInlineSearch";
import styles from "./LoginProfessionalClient.module.css";

const POLICY_URL =
  "https://docs.google.com/document/d/13UZy4RiLPUrLqHx-NaWUxS7xhJNTKkKUldMWJmLenOg/edit?usp=drivesdk";

const POLICY_SECTIONS = [
  "discord-data",
  "data-usage",
  "not-collected",
  "third-party",
  "user-rights",
] as const;

type PolicySection = (typeof POLICY_SECTIONS)[number];

export default function LoginProfessionalClient() {
  const [accepted, setAccepted] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [readSections, setReadSections] = useState<Set<PolicySection>>(
    () => new Set(),
  );
  const policyCardRef = useRef<HTMLElement | null>(null);

  const allRead = readSections.size === POLICY_SECTIONS.length;
  const loginEnabled = allRead && accepted && !checkingSession;

  const progressText = useMemo(
    () => `已閱讀 ${readSections.size} / ${POLICY_SECTIONS.length}`,
    [readSections.size],
  );

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

  function markSectionRead(section: PolicySection, open: boolean) {
    if (!open) return;

    setReadSections((current) => {
      if (current.has(section)) return current;

      const next = new Set(current);
      next.add(section);
      return next;
    });
  }

  function startDiscordLogin(event: MouseEvent<HTMLAnchorElement>) {
    if (loginEnabled) return;

    event.preventDefault();

    if (checkingSession) {
      setNotice("正在確認目前登入狀態，請稍候。");
      return;
    }

    if (!allRead) {
      setNotice("請先逐一展開並閱讀右側全部 5 項登入前資料告知。");
      policyCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setNotice("請勾選同意資料使用、隱私權政策與免責聲明後再登入。");
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
                aria-disabled={!loginEnabled}
                onClick={startDiscordLogin}
              >
                <MessageCircle size={18} />
                <span>登入 Discord</span>
              </a>
            </div>
          </div>
        </section>

        <section className={styles.loginStage}>
          <article className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.authIcon}>
                <LockKeyhole size={25} />
              </div>
              <div>
                <p>MEMBER AUTHORIZATION</p>
                <h1>登入 KETHER</h1>
              </div>
            </div>

            <p className={styles.authSummary}>
              使用 Discord OAuth 驗證 KETHER OF PARADISO 成員資格與身分組。
              授權完成後將自動前往個人頁面。
            </p>

            <div className={styles.authFacts}>
              <div>
                <BadgeCheck size={18} />
                <span>確認 Discord 帳號與群組內名稱</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>依 Guild 與身分組開放網站權限</span>
              </div>
            </div>

            <div className={styles.scopeBox}>
              <span>Discord OAuth 授權範圍</span>
              <div>
                <code>identify</code>
                <code>guilds</code>
                <code>guilds.members.read</code>
              </div>
            </div>

            <div className={styles.readRequirement} data-complete={allRead}>
              {allRead ? <Check size={18} /> : <FileText size={18} />}
              <div>
                <strong>{allRead ? "登入前資料告知已閱讀完成" : "必須先閱讀登入前資料告知"}</strong>
                <span>{progressText}</span>
              </div>
            </div>

            <label
              className={`${styles.consentRow} ${
                allRead ? "" : styles.consentRowDisabled
              }`}
            >
              <input
                type="checkbox"
                checked={accepted}
                disabled={!allRead}
                onChange={(event) => {
                  setAccepted(event.target.checked);
                  setNotice(null);
                }}
              />
              <span>
                我已閱讀並同意資料使用說明、隱私權政策與免責聲明。
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
                loginEnabled ? "" : styles.loginButtonDisabled
              }`}
              aria-disabled={!loginEnabled}
              onClick={startDiscordLogin}
            >
              <MessageCircle size={20} />
              {checkingSession ? "正在確認登入狀態…" : "使用 Discord 授權登入"}
            </a>

            <p className={styles.redirectHint}>
              Discord 授權成功後自動轉入 <strong>個人頁面</strong>。
            </p>
          </article>

          <article
            ref={policyCardRef}
            className={styles.policyCard}
            aria-label="登入前資料告知"
          >
            <div className={styles.policyHeading}>
              <div>
                <p>KETHER DATA & PRIVACY</p>
                <h2>登入前資料告知</h2>
              </div>
              <div className={styles.policyProgress} data-complete={allRead}>
                {progressText}
              </div>
            </div>

            <p className={styles.policyIntro}>
              請逐一展開並閱讀以下 5 項內容。全部閱讀完成後，左側同意勾選與 Discord 登入才會開放。
            </p>

            <div className={styles.policyList}>
              <details
                onToggle={(event) =>
                  markSectionRead("discord-data", event.currentTarget.open)
                }
              >
                <summary>
                  <span>Discord 會提供哪些資料</span>
                  <span className={styles.summaryMeta}>
                    {readSections.has("discord-data") && <em>已閱讀</em>}
                    <b aria-hidden="true">⌄</b>
                  </span>
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

              <details
                onToggle={(event) =>
                  markSectionRead("data-usage", event.currentTarget.open)
                }
              >
                <summary>
                  <span>資料如何使用與保存</span>
                  <span className={styles.summaryMeta}>
                    {readSections.has("data-usage") && <em>已閱讀</em>}
                    <b aria-hidden="true">⌄</b>
                  </span>
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
                    登入狀態使用簽章保護的 HttpOnly Cookie。登出、清除 Cookie
                    或工作階段到期後，需重新登入。
                  </p>
                </div>
              </details>

              <details
                onToggle={(event) =>
                  markSectionRead("not-collected", event.currentTarget.open)
                }
              >
                <summary>
                  <span>不會透過 Discord 登入取得的資料</span>
                  <span className={styles.summaryMeta}>
                    {readSections.has("not-collected") && <em>已閱讀</em>}
                    <b aria-hidden="true">⌄</b>
                  </span>
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

              <details
                onToggle={(event) =>
                  markSectionRead("third-party", event.currentTarget.open)
                }
              >
                <summary>
                  <span>第三方服務與免責聲明</span>
                  <span className={styles.summaryMeta}>
                    {readSections.has("third-party") && <em>已閱讀</em>}
                    <b aria-hidden="true">⌄</b>
                  </span>
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

              <details
                onToggle={(event) =>
                  markSectionRead("user-rights", event.currentTarget.open)
                }
              >
                <summary>
                  <span>使用者權利與拒絕提供資料的影響</span>
                  <span className={styles.summaryMeta}>
                    {readSections.has("user-rights") && <em>已閱讀</em>}
                    <b aria-hidden="true">⌄</b>
                  </span>
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
          </article>
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

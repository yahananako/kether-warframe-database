"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { HOME_NOTICE_VERSION, homeNotices } from "../data/homeNotices";
import { navigationGroups } from "../data/siteNavigation";
import { KETHER_VERSION_LABEL } from "../data/siteVersion";
import HomeAuthMini from "./HomeAuthMini";
import HomeCinema from "./HomeCinema";
import HomeTicker from "./HomeTicker";

const NOTICE_KEY = "kether-home-new-notice-read-version";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/home-new";
  const [admin, setAdmin] = useState(false);
  const [unread, setUnread] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const notice = useRef<HTMLDetailsElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (home) {
      document.documentElement.classList.remove("kether-viewport-lock");
      document.body.classList.remove("kether-viewport-lock");
      return;
    }

    document.documentElement.classList.add("kether-viewport-lock");
    document.body.classList.add("kether-viewport-lock");

    return () => {
      document.documentElement.classList.remove("kether-viewport-lock");
      document.body.classList.remove("kether-viewport-lock");
    };
  }, [home]);

  useEffect(() => {
    if (home) return;

    try {
      setUnread(localStorage.getItem(NOTICE_KEY) !== HOME_NOTICE_VERSION);
    } catch {
      setUnread(true);
    }

    const controller = new AbortController();

    fetch("/api/admin/access", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setAdmin(data?.authorized === true))
      .catch(() => {});

    return () => controller.abort();
  }, [home, pathname]);

  useEffect(() => {
    if (home) return;

    shell.current
      ?.querySelectorAll<HTMLDetailsElement>(".site-utility[open]")
      .forEach((element) => {
        element.open = false;
      });
  }, [home, pathname]);

  useEffect(() => {
    if (home) return;

    function openMenus() {
      return shell.current?.querySelectorAll<HTMLDetailsElement>(
        ".site-utility[open]",
      );
    }

    function outside(event: PointerEvent) {
      openMenus()?.forEach((element) => {
        if (!element.contains(event.target as Node)) {
          element.open = false;
        }
      });
    }

    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      openMenus()?.forEach((element) => {
        element.open = false;
        element.querySelector("summary")?.focus();
      });
    }

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [home]);

  useEffect(() => {
    if (home) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    function syncBackground() {
      if (document.hidden || reduced.matches) {
        video.current?.pause();
      } else {
        video.current?.play().catch(() => {});
      }
    }

    syncBackground();
    reduced.addEventListener("change", syncBackground);
    document.addEventListener("visibilitychange", syncBackground);

    return () => {
      reduced.removeEventListener("change", syncBackground);
      document.removeEventListener("visibilitychange", syncBackground);
    };
  }, [home]);

  function readNotice() {
    setUnread(false);

    try {
      localStorage.setItem(NOTICE_KEY, HOME_NOTICE_VERSION);
    } catch {}
  }

  if (home) {
    return <>{children}</>;
  }

  return (
    <div ref={shell} className="site-shell site-interior">
      <a href="#site-content" className="site-skip">
        跳至主要內容
      </a>

      <div className="site-cinema" aria-hidden="true">
        <video
          ref={video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/kether-cinema-iceblade-v1.webp"
        >
          <source src="/kether-cinema-iceblade-v1.mp4" type="video/mp4" />
        </video>
        <HomeCinema />
        <div className="site-aurora" />
        <div className="site-light-shafts" />
        <div className="site-grid-effect" />
        <div className="site-beam" />
      </div>

      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="KETHER 首頁">
          <Image
            src="/kether-clan-logo.png"
            width={46}
            height={46}
            alt=""
            priority
          />
          <span>
            <strong>KETHER</strong>
            <small>OF PARADISO · WARFRAME DATABASE</small>
          </span>
        </Link>

        <div className="site-tools">
          <details className="site-utility site-all-menu">
            <summary className="site-icon" aria-label="網站選單">
              <Menu size={21} />
            </summary>
            <nav className="site-utility-panel site-navigation-panel" aria-label="全部頁面">
              <div className="site-panel-heading">
                <span className="site-eyebrow">KETHER NAVIGATION</span>
                <h2>網站選單</h2>
              </div>

              <div className="site-navigation-groups">
                {navigationGroups.map((group) => (
                  <section key={group.label}>
                    <small>{group.english}</small>
                    <h3>{group.label}</h3>
                    <div>
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={
                            pathname === item.href ? "page" : undefined
                          }
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="site-navigation-utility">
                <Link href="/search">資料搜尋</Link>
                <Link href="/login">登入</Link>
                <Link href="/db-status">資料庫狀態</Link>
                {admin && <Link href="/admin/editor">管理後台</Link>}
              </div>
            </nav>
          </details>

          <details
            ref={notice}
            className="site-utility"
            onToggle={(event) => {
              if (event.currentTarget.open) readNotice();
            }}
          >
            <summary className="site-icon" aria-label="通知中心">
              <Bell size={21} />
              {unread && <i className="site-unread" />}
            </summary>
            <section className="site-utility-panel site-notice-panel">
              <div className="site-panel-heading">
                <span className="site-eyebrow">KETHER UPDATE</span>
                <h2>通知中心</h2>
              </div>

              {homeNotices.slice(0, 4).map((item) => (
                <article key={item.title}>
                  <small>{item.tag}</small>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}

              <Link className="site-button" href="/notifications">
                完整通知
              </Link>
            </section>
          </details>

          <div className="site-auth">
            <HomeAuthMini key={pathname} />
          </div>
        </div>
      </header>

      <div className="site-ticker">
        <HomeTicker
          onNotice={() => {
            if (notice.current) {
              notice.current.open = true;
            }
            readNotice();
            notice.current?.querySelector("summary")?.focus();
          }}
        />
      </div>

      <main id="site-content" tabIndex={-1} className="site-content">
        {children}
      </main>

      <footer className="site-footer">
        <span>
          <b>ヤハ奈々子、羊咩、凱洛</b> · 共同開發
        </span>

        <a href="https://kether-warframe-database.vercel.app">
          kether-warframe-database.vercel.app
        </a>

        <details className="site-utility">
          <summary>版本與資料來源</summary>
          <section className="site-utility-panel site-footer-panel">
            <span className="site-eyebrow">KETHER SYSTEM</span>
            <h2>{KETHER_VERSION_LABEL}</h2>
            <p>Warframe 資料、Google Sheets 與即時星圖情報。</p>
            <Link href="/database/overview">資料總覽</Link>
            <Link href="/db-status">同步狀態</Link>
          </section>
        </details>
      </footer>
    </div>
  );
}

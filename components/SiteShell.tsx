"use client";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HOME_NOTICE_VERSION, homeNotices } from "../data/homeNotices";
import { navigationGroups } from "../data/siteNavigation";
import { KETHER_VERSION_LABEL } from "../data/siteVersion";
import HomeAuthMini from "./HomeAuthMini";
import HomeTicker from "./HomeTicker";
import KetherEffectsMenu from "./KetherEffectsMenu";
import { useKetherEffects } from "./KetherEffectsProvider";
const NOTICE_KEY = "kether-home-new-notice-read-version";
function positionNavigation(menu: HTMLDetailsElement) {
  if (!menu.open) return;
  const rect = menu.querySelector("summary")!.getBoundingClientRect();
  const panel = menu.querySelector<HTMLElement>("nav")!;
  const above = rect.top - 16,
    below = innerHeight - rect.bottom - 16;
  panel.style.width = `${Math.min(550, innerWidth - 32)}px`;
  panel.style.maxHeight = `${Math.max(120, above > below ? above : below)}px`;
  panel.style.left = `${Math.max(16, Math.min(rect.left, innerWidth - panel.offsetWidth - 16))}px`;
  panel.style.top = `${above > below ? rect.top - panel.offsetHeight : rect.bottom}px`;
}
export function NavigationGroup({
  group,
}: {
  group: (typeof navigationGroups)[number];
}) {
  const pathname = usePathname();
  return (
    <details
      className="site-menu"
      onToggle={(event) => positionNavigation(event.currentTarget)}
      onMouseEnter={(event) => {
        if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
          event.currentTarget.open = true;
          positionNavigation(event.currentTarget);
        }
      }}
      onMouseLeave={(event) => {
        if (
          matchMedia("(hover: hover) and (pointer: fine)").matches &&
          !event.currentTarget.contains(document.activeElement)
        )
          event.currentTarget.open = false;
      }}
    >
      <summary
        onClick={(event) => {
          if (
            event.detail > 0 &&
            matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            event.preventDefault();
            const menu = event.currentTarget
              .parentElement as HTMLDetailsElement;
            menu.open = true;
            positionNavigation(menu);
          }
        }}
      >
        {group.label}
        <ChevronDown size={15} />
      </summary>
      <nav className="site-menu-panel" aria-label={group.label}>
        <span className="site-eyebrow">{group.english}</span>
        <div className="site-menu-grid">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={(event) =>
                event.currentTarget.closest("details")?.removeAttribute("open")
              }
            >
              <span className="site-nav-art">
                <img src={item.image} alt="" />
                <img src={item.activeImage} alt="" />
              </span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </Link>
          ))}
        </div>
      </nav>
    </details>
  );
}
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "/home-new";
  const {effectiveMode} = useKetherEffects();
  const [admin, setAdmin] = useState(false),
    [unread, setUnread] = useState(false);
  const shell = useRef<HTMLDivElement>(null),
    notice = useRef<HTMLDetailsElement>(null),
    video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    try {
      setUnread(localStorage.getItem(NOTICE_KEY) !== HOME_NOTICE_VERSION);
    } catch {
      setUnread(true);
    }
    const controller = new AbortController();
    fetch("/api/admin/access", { cache: "no-store", signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAdmin(data?.authorized === true))
      .catch(() => {});
    return () => controller.abort();
  }, [pathname]);
  useEffect(() => {
    shell.current
      ?.querySelectorAll<HTMLDetailsElement>(
        ".site-menu[open], .site-utility[open]",
      )
      .forEach((el) => (el.open = false));
  }, [pathname]);
  useEffect(() => {
    const openMenus = () =>
      shell.current?.querySelectorAll<HTMLDetailsElement>(
        ".site-menu[open], .site-utility[open]",
      );
    function outside(event: PointerEvent) {
      openMenus()?.forEach((el) => {
        if (!el.contains(event.target as Node)) el.open = false;
      });
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape")
        openMenus()?.forEach((el) => {
          el.open = false;
          el.querySelector("summary")?.focus();
        });
    }
    function reposition() {
      shell.current
        ?.querySelectorAll<HTMLDetailsElement>(".site-menu[open]")
        .forEach(positionNavigation);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, []);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      if (home || document.hidden || reduced.matches || effectiveMode === "eco") video.current?.pause();
      else video.current?.play().catch(() => {});
    }
    sync();
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [effectiveMode, home]);
  function readNotice() {
    setUnread(false);
    try {
      localStorage.setItem(NOTICE_KEY, HOME_NOTICE_VERSION);
    } catch {}
  }
  return (
    <>
      {home ? children : null}
      <div
      ref={shell}
      className={`site-shell site-interior${home ? " site-shell-inactive" : ""}`}
      aria-hidden={home ? true : undefined}
    >
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <filter id="site-icon-cutout" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 .61 0 0 0 0 .91 0 0 0 0 .90 -.3333 -.3333 -.3333 0 1"
            />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
      </svg>
      <a href="#site-content" className="site-skip">
        跳至主要內容
      </a>
      <div className="site-cinema" aria-hidden="true">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster="/kether-cinema-iceblade-v1.webp"
        >
          <source src="/kether-cinema-iceblade-v1.mp4" type="video/mp4" />
        </video>
      </div>
      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="KETHER 首頁">
          <Image
            src="/kether-clan-logo.png"
            width={42}
            height={42}
            alt=""
            priority
          />
          <span>
            <strong>KETHER</strong>
            <small>OF PARADISO</small>
          </span>
        </Link>
        <div className="site-navigation">
          {navigationGroups.map((group) => (
            <NavigationGroup key={group.label} group={group} />
          ))}
        </div>
        <div className="site-tools">
          <KetherEffectsMenu />
          <Link className="site-icon" href="/search" aria-label="搜尋資料庫">
            <Search size={20} />
          </Link>
          <details
            ref={notice}
            className="site-utility site-notification"
            onToggle={(event) => {
              if (event.currentTarget.open) readNotice();
            }}
          >
            <summary className="site-icon" aria-label="通知中心">
              <Bell size={20} />
              {unread && <i className="site-unread" />}
            </summary>
            <section className="site-utility-panel site-notice-panel">
              <span className="site-eyebrow">KETHER UPDATE</span>
              <h2>通知中心</h2>
              {homeNotices.map((item) => (
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
            <HomeAuthMini />
          </div>
          <details className="site-utility site-all-menu">
            <summary className="site-icon" aria-label="網站選單">
              <Menu size={20} />
            </summary>
            <nav className="site-utility-panel" aria-label="全部頁面">
              <Link href="/">首頁</Link>
              <Link href="/search">資料庫搜尋</Link>
              {navigationGroups.map((group) => (
                <section key={group.label}>
                  <h3>{group.label}</h3>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </section>
              ))}
              <Link href="/login">登入</Link>
              <Link href="/db-status">資料庫狀態</Link>
              {admin && <Link href="/admin/editor">管理後台</Link>}
            </nav>
          </details>
        </div>
      </header>
      <div className="site-ticker">
        <HomeTicker active={!home}
          onNotice={() => {
            if (notice.current) notice.current.open = true;
            readNotice();
            notice.current?.querySelector("summary")?.focus();
          }}
        />
      </div>
      <nav className="site-quicknav" aria-label="內頁三大分類快速導覽">
        {navigationGroups.map((group) => (
          <NavigationGroup key={group.label} group={group} />
        ))}
      </nav>
      <div id="site-content" tabIndex={-1} className="site-content site-viewport-content">
        {home ? null : children}
      </div>
      <footer className="site-footer">
        <span>
          <b>ヤハ奈々子、羊咩、凱洛</b> · 共同開發
        </span>
        <a href="https://kether-warframe-database.vercel.app">
          kether-warframe-database.vercel.app
        </a>
        <details className="site-utility">
          <summary>版本與資料來源</summary>
          <section className="site-utility-panel">
            <h2>{KETHER_VERSION_LABEL}</h2>
            <p>Warframe 資料、Google Sheets 與即時星圖情報。</p>
            <Link href="/database/overview">資料總覽</Link>
            <Link href="/db-status">同步狀態</Link>
          </section>
        </details>
      </footer>
    </div>
    </>
  );
}

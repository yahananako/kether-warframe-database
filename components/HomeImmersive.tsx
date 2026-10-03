"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import HomeCinema from "./HomeCinema";
import HomeTicker from "./HomeTicker";
import { homeNotices, HOME_NOTICE_VERSION } from "../data/homeNotices";
import HomeAuthMini from "./HomeAuthMini";
import { KETHER_VERSION_LABEL } from "../data/siteVersion";

import styles from "./HomeImmersive.module.css";

type Panel = "catalog" | "explore" | "intel" | "menu" | "notice" | "about" | null;
const NOTICE_KEY = "kether-home-new-notice-read-version";

const categories = [
  ["/database/overview", "資料總覽", "全部分類"],
  ["/database/warframes", "一般戰甲", "技能與取得"],
  ["/database/warframes/prime", "Prime 戰甲", "行情與交易"],
  ["/database/incarnon", "靈化武器", "進化能力"],
  ["/database/primary", "主要武器", "分類與來源"],
  ["/database/secondary", "次要武器", "分類與來源"],
  ["/database/melee", "近戰武器", "分類與來源"],
  ["/database/mods", "MOD", "模組資料"],
  ["/database/companions", "同伴", "寵物與機械"],
  ["/database/archwing", "曲翼與機甲", "空戰資料"],
] as const;

const explore = [
  ["/story", "故事書", "主線、支線與系列任務"],
  ["/clan", "KETHER 氏族", "氏族公告與資訊"],
  ["/profile", "個人頁", "登入與個人進度"],
] as const;

const intel = [["/live", "電波局", "循環與官方資訊"], ["/bot", "小希 BOT", "Discord 查詢與功能"]] as const;

const titles = {
  catalog: ["KETHER DATABASE", "資料庫分類"],
  explore: ["KETHER OF PARADISO", "故事與氏族"],
  intel: ["WARFRAME LIVE", "電波情報"],
  menu: ["KETHER NAVIGATION", "網站選單"],
  notice: ["KETHER UPDATE", "近期收錄"],
  about: ["KETHER SYSTEM", "版本與資料來源"],
} as const;


const quickPool = ["Valkyr", "Nova", "Titania", "Volt", "Trinity", "Saryn", "Excalibur Umbra", "Ivara", "Yareli", "靈化", "Prime", "赤毒", "MOD", "同伴"];
const icons: Record<string,string> = {overview:"overview",warframes:"warframe","warframes/prime":"warframe",primary:"primary",secondary:"secondary",melee:"melee",mods:"mod",companions:"companion",archwing:"archwing"};
const extras: Record<string,string> = {"/story":"story","/bot":"bot","/profile":"profile","/live":"live","/notifications":"notifications"};
function NavCard({item}: {item: readonly [string,string,string]}) {
 const [href,label,description]=item; const icon=icons[href.replace('/database/','')];const extra=extras[href];
 const src=icon?`/icon-${icon}.png`:extra?`/home-icons/nav-${extra}.svg`:href==='/clan'?'/kether-clan-logo.png':href==='/database/incarnon'?'/incarnon-weapons/braton.png':null;
 const active=icon?`/icon-${icon}-2.png`:extra?`/home-icons/nav-${extra}-active.svg`:src;
 return <Link href={href} className={src?`${styles.imageLink} ${icon?styles.originalIcon:''}`:undefined} aria-label={label}>{src?<><span className={styles.imagePair}><img src={src} alt=""/><img className={styles.imageActive} src={active!} alt=""/></span><span className={styles.imageLabel}>{label}</span></>:<><b>{label}</b><small>{description}</small></>}</Link>;
}

export default function HomeImmersive() {
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<string[]>([]);
  const [adminVisible, setAdminVisible] = useState(false);
  const [unread, setUnread] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function open(next: Exclude<Panel, null>, trigger: HTMLElement) {
    triggerRef.current = trigger;
    if (next === "notice") {
      try { window.localStorage.setItem(NOTICE_KEY, HOME_NOTICE_VERSION); } catch {}
      setUnread(false);
    }
    setPanel(next);
  }

  function close() {
    setPanel(null);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    try { setUnread(window.localStorage.getItem(NOTICE_KEY) !== HOME_NOTICE_VERSION); } catch { setUnread(true); }
    function refreshQuick() { let previous: string[]=[];try{const value=JSON.parse(localStorage.getItem('kether-last-quick-search')||'[]');if(Array.isArray(value))previous=value;}catch{}
    const available=quickPool.filter(x=>!previous.includes(x));for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}const selected=available.slice(0,3);setQuick(selected);try{localStorage.setItem('kether-last-quick-search',JSON.stringify(selected))}catch{}}
    refreshQuick();const onPageShow=(event:PageTransitionEvent)=>{if(event.persisted)refreshQuick()};window.addEventListener('pageshow',onPageShow);
    let active = true;
    fetch("/api/admin/access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setAdminVisible(data?.authorized === true); })
      .catch(() => { if (active) setAdminVisible(false); });
    return () => { active = false; window.removeEventListener('pageshow',onPageShow); };
  }, []);

  useEffect(() => {
    if (!panel) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanel(null);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const dialog = document.querySelector('[aria-modal="true"]');
        const items = Array.from(dialog?.querySelectorAll<HTMLElement>("button, a[href]") ?? []);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  useEffect(() => {
    function dismissMenus(event: PointerEvent) {
      document.querySelectorAll<HTMLDetailsElement>("[data-home-menu][open]").forEach((menu) => {
        if (!menu.contains(event.target as Node)) menu.open = false;
      });
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") document.querySelectorAll<HTMLDetailsElement>("[data-home-menu][open]").forEach((menu) => { menu.open = false; });
    }
    document.addEventListener("pointerdown", dismissMenus);
    document.addEventListener("keydown", dismissOnEscape);
    return () => { document.removeEventListener("pointerdown", dismissMenus); document.removeEventListener("keydown", dismissOnEscape); };
  }, []);

  const cards = panel === "catalog" ? categories : panel === "explore" ? explore : panel === "menu" ? [
    ["/", "首頁", "KETHER 入口"],
    ["/search", "資料搜尋", "檢索資料"],
    ...explore,
    ...intel,
    ...(adminVisible ? [["/admin/editor", "⚙ 管理後台", "小希與羊咩專用"]] as const : []),
  ] as readonly (readonly [string, string, string])[] : intel;

  return (
    <div className={styles.stage}>
      <svg width="0" height="0" aria-hidden="true" style={{position:'absolute',pointerEvents:'none'}}><defs>{[['home-remove-white','.68',' .91',' .91'],['home-remove-white-active','1','.84','.55']].map(([id,r,g,b])=><filter key={id} id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} -.3333 -.3333 -.3333 0 1`}/><feComposite in2="SourceAlpha" operator="in"/></filter>)}</defs></svg>
      <div className={styles.background} aria-hidden="true">
        <video autoPlay muted loop playsInline preload="metadata" poster="/kether-cinema-iceblade-v1.webp"><source src="/kether-cinema-iceblade-v1.mp4" type="video/mp4" /></video>
        <HomeCinema />
        <div className={styles.aurora}/><div className={styles.lightShafts}/>
        <div className={styles.grid} />
        <div className={styles.beam} />
      </div>

      <div className={styles.frame}>
        <header className={styles.top}>
          <Image src="/kether-clan-logo.png" width={46} height={46} alt="" className={styles.crest} />
          <Link href="/" className={styles.brand} aria-label="KETHER 首頁">
            <strong>KETHER</strong>
            <small>OF PARADISO · WARFRAME DATABASE</small>
          </Link>
          <div className={styles.topActions}>
            <button type="button" className={`${styles.control} ${styles.icon}`} onClick={(e) => open("menu", e.currentTarget)} aria-label="開啟選單">☰</button>
            <a href="/notifications" className={`${styles.control} ${styles.icon}`} onClick={(e) => { e.preventDefault(); open("notice", e.currentTarget); }} aria-label="開啟通知"><Bell size={23}/>{unread && <span className={styles.unread} aria-hidden="true" />}</a>
            <div className={styles.auth}><HomeAuthMini /></div>
          </div>
        </header>
        <HomeTicker onNotice={(button)=>open("notice",button)}/>

        <main className={styles.main}>
          <section className={styles.content}>
            <div className={styles.eyebrow}>TENNO ARCHIVE / 資料檢索</div>
            <h1>從虛空中<br /><em>找到答案。</em></h1>
            <p className={styles.lead}>搜尋戰甲、武器、MOD、靈化能力與取得方式。你的下一步，從這裡開始。</p>
            <form action="/search" method="get" className={styles.search}>
              <label className={styles.sr} htmlFor="home-query">搜尋 KETHER 資料庫</label>
              <input id="home-query" name="q" type="search" placeholder="輸入中文或英文名稱…" required value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit">開始查詢</button>
            </form>
            <div className={styles.chips}>
              <span>快速搜尋</span>
              {quick.map((term) => (
                <button key={term} type="button" className={styles.control} onClick={() => { setQuery(term); document.getElementById("home-query")?.focus(); }}>{term === "Valkyr" ? "瓦喵" : term === "Titania" ? "蝶妹" : term === "Yareli" ? "水妹" : term}</button>
              ))}
            </div>
            <div className={styles.actions}>
              {([['catalog','資料庫分類',categories],['explore','故事與氏族',explore],['intel','電波情報',intel]] as const).map(([key,label,items])=><details key={key} data-home-menu className={styles.actionWrap} onMouseEnter={(e)=>{if(window.matchMedia('(hover: hover) and (pointer: fine)').matches)e.currentTarget.open=true;}} onMouseLeave={(e)=>{if(window.matchMedia('(hover: hover) and (pointer: fine)').matches)e.currentTarget.open=false;}}><summary className={styles.control} onClick={(e)=>{if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){e.preventDefault();(e.currentTarget.parentElement as HTMLDetailsElement).open=true;}}}>{label}</summary><nav className={styles.actionMenu} aria-label={label+'選單'}><div className={styles.actionMenuInner} style={key==='catalog'?undefined:{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}}>{items.map(item=><NavCard key={item[0]} item={item}/>)}</div></nav></details>)}
            </div>
          </section>

          <aside className={styles.side}>
            <div className={styles.banner}>
              <Image src="/home-hero-banner.png" width={1536} height={864} sizes="(max-width: 800px) 0px, 32vw" alt="KETHER OF PARADISO · WARFRAME DATABASE" />
            </div>
            <div className={styles.status}>
              <b>檔案更新</b>
              <p>靈化能力繁體中文化；一般戰甲與 Prime 檔案獨立查閱。</p>
              <button type="button" onClick={(e) => open("notice", e.currentTarget)}>查看近期收錄</button>
            </div>
          </aside>
        </main>

        <footer className={styles.footer}>
          <span className={styles.credit}><b>ヤハ奈々子、羊咩、凱洛</b> · 共同開發</span>
          <a className={styles.siteUrl} href="https://kether-warframe-database.vercel.app/">kether-warframe-database.vercel.app</a>
          <button type="button" onClick={(e) => open("about", e.currentTarget)}>版本與資料來源</button>
        </footer>
      </div>

      {panel && (
        <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section className={`${styles.panel} ${["catalog","explore","intel"].includes(panel)?styles.compactPanel:""}`} role="dialog" aria-modal="true" aria-labelledby="home-panel-title">
            <div className={styles.panelHead}>
              <div><small>{titles[panel][0]}</small><h2 id="home-panel-title">{titles[panel][1]}</h2></div>
              <button ref={closeRef} type="button" className={styles.control} onClick={close} aria-label="關閉面板">×</button>
            </div>
            <div className={styles.panelBody}>
              {panel === "about" ? (
                <div className={styles.aboutGrid}><section><h3>目前版本</h3><strong className={styles.version}>{KETHER_VERSION_LABEL}</strong><h3>資料庫狀態</h3>{[['資料來源','Google Sheets'],['每日更新時間','04:00'],['目前資料總數','一般戰甲 65 位＋Prime 專頁']].map(([key,value])=><div className={styles.dataRow} key={key}><span>{key}</span><b>{value}</b></div>)}<Link href="/database/overview">查看資料總覽</Link></section><section><h3>備註</h3><ul className={styles.updates}><li>戰甲檔案館已拆分為「一般戰甲」與「Prime 戰甲」兩座獨立頁面。</li><li>一般戰甲收錄 65 位，提供定位分類、圖片、技能、故事與遊戲內入手條件。</li><li>Prime 戰甲獨立顯示白金價格、交易連結與個人持有資料。</li><li>故事書新增系列任務航路；主線、支線與系列索引皆可獨立閱讀。</li><li>資料價格每日 04:00 同步；若顯示異常，請重新整理或確認最新部署。</li></ul></section></div>
              ) : panel === "notice" ? (
                <>
                  <ul className={styles.updates}>{homeNotices.map((notice) => <li key={notice.title}><small>{notice.tag}</small><h3>{notice.title}</h3><p>{notice.body}</p></li>)}</ul>
                  <Link className={styles.control} href="/notifications">完整通知</Link>
                </>
              ) : (
                <>

                  <div className={styles.panelGrid} style={panel==='catalog'?undefined:{gridTemplateColumns:`repeat(${panel==='menu'?3:cards.length},minmax(0,1fr))`}}>{cards.map(item=><NavCard key={item[0]} item={item}/>)}</div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  CalendarDays,
  Info,
  ClipboardList,
  Pencil,
  MessageCircle,
  Shield,
  Crosshair,
  Swords,
  Dog,
  Feather,
  Layers,
  Gem
} from "lucide-react";
import { fetchSheetRows } from "../lib/sheets";
import HomeSearchFloating from "../components/HomeSearchFloating";
import HomeNotificationsFloating from "../components/HomeNotificationsFloating"; import HomeMenuFloating from "../components/HomeMenuFloating"; import HomeAuthMini from "../components/HomeAuthMini"; import HomePersonalProgress from "../components/HomePersonalProgress"; import KetherClanWatermark from "../components/KetherClanWatermark";

const navItems = [
  { label: "總覽", key: "overview", href: "/database/overview", icon: Gem },
  { label: "戰甲", key: "warframes", href: "/database/warframes", icon: Shield },
  { label: "主要武器", key: "primary", href: "/database/primary", icon: Crosshair },
  { label: "次要武器", key: "secondary", href: "/database/secondary", icon: Crosshair },
  { label: "近戰武器", key: "melee", href: "/database/melee", icon: Swords },
  { label: "同伴", key: "companions", href: "/database/companions", icon: Dog },
  { label: "曲翼", key: "archwing", href: "/database/archwing", icon: Feather },
  { label: "MOD資料庫", key: "mods", href: "/database/mods", icon: Layers }
];

function isOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}

function hasPrice(value: string): boolean {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0;
}

export default async function HomePage() {
  const dataCategories = navItems.filter((item) => item.key !== "overview");

  const results = await Promise.all(
    dataCategories.map(async (item) => {
      const result = await fetchSheetRows(item.key);
      const rows = result.rows;
      const owned = rows.filter((row) => isOwned(row.owned)).length;
      const priced = rows.filter((row) => hasPrice(row.price)).length;
      const sections = new Set(rows.map((row) => row.section || "未分類"));

      return {
        ...item,
        count: rows.length,
        owned,
        priced,
        sectionCount: sections.size,
        completion: rows.length > 0 ? Math.round((owned / rows.length) * 100) : 0
      };
    })
  );

  const totalRows = results.reduce((sum, item) => sum + item.count, 0);
  const totalOwned = results.reduce((sum, item) => sum + item.owned, 0);
  const totalPriced = results.reduce((sum, item) => sum + item.priced, 0);
  const totalSections = results.reduce((sum, item) => sum + item.sectionCount, 0);
  const totalCompletion = totalRows > 0 ? Math.round((totalOwned / totalRows) * 100) : 0;

  return (<>
    <main style={{ position: "relative", isolation: "isolate" }} className="page-shell homepage-sci-fi">
      
      <div className="home-fixed-bg" aria-hidden="true" />
<div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb home-tech-card home-tech-corner" />

      <header className="topbar">
        <div className="topbar-left">
          <details className="menu-drawer">
            <summary aria-label="開啟選單">
              <HomeMenuFloating />
            </summary>
            <nav className="menu-popup">
              <Link href="/">首頁</Link>
              <Link href="/login">Discord 登入</Link>
              <Link href="/profile">個人進度</Link>
              <Link href="/db-status">資料庫狀態</Link>
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <a href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
                Discord 群組
              </a>
            </nav>
          </details>
          <span>KETHER</span>
        </div>

        <div className="topbar-right">
          <HomeSearchFloating />
          <HomeNotificationsFloating />
          <HomeAuthMini />
          <a className="discord-mini" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Discord
          </a>
        </div>
      </header>

      <section className="home-hero-image-banner" aria-label="KETHER OF PARADISO Warframe Database">
        <div
  style={{
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.72)",
    background: "rgba(255, 255, 255, 0.55)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0
  }}
>
  <img
    src="/home-hero-banner.png"
    alt="KETHER OF PARADISO Warframe Database 首頁橫版圖"
    style={{
      width: "100%",
      height: "auto",
      objectFit: "contain",
      objectPosition: "center",
      display: "block",
      borderRadius: 20
    }}
  />
</div>
      </section>


      <section className="hero">
</section>

      <section className="home-kpi-grid home-zone home-zone-stats">
        <div className="panel-tag">數據區</div>

        <article className="home-kpi-card">
          <span>總資料數</span>
          <strong>{totalRows.toLocaleString("zh-TW")}</strong>
          <p>Google Sheets 全分類資料量</p>
        </article>

        <article className="home-kpi-card">
          <span>有價格資料</span>
          <strong>{totalPriced.toLocaleString("zh-TW")}</strong>
          <p>目前可追價的資料列</p>
        </article>

        <HomePersonalProgress
          totalRows={totalRows}
          fallbackOwned={totalOwned}
          fallbackCompletion={totalCompletion}
        />
      </section>

      <section className="nav-panel home-zone home-zone-nav" id="navigation">
        <div className="panel-tag">導航區</div>

        <div className="nav-grid">
          {navItems.map((item) => {
            const Icon = item.icon;
            const stats = results.find((result) => result.key === item.key);

            return (
              <Link key={item.key} href={item.href} className="nav-card">
                <Icon size={28} />
                <span>{item.label}</span>

                {stats ? (
                  <>
                    <small>
                      {stats.count.toLocaleString("zh-TW")} 筆｜區塊 {stats.sectionCount}｜有價格 {stats.priced}
                    </small>
                    <b>{stats.completion}%</b>
                  </>
                ) : (
                  <>
                    <small>查看全部分類與總覽資料</small>
                    <b>總覽</b>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      

      <section className="dashboard-grid home-zone home-zone-info home-zone-notes">
        <div className="panel-tag">資料區</div>
        
<div className="home-info-split">
  <article className="info-card home-site-info-card">
    <div className="card-title">
      <span>3</span>
      <span>網站資訊區</span>
    </div>

    <div className="home-info-date-row">
      <span>更新日期</span>
      <strong>2026/7/6</strong>
    </div>

    <div className="home-info-subblock">
      <h3>使用說明</h3>
      <ul>
        <li>首頁資料會自動讀取 Google Sheets。</li>
        <li>分類頁支援區塊、搜尋、價格與已購買篩選。</li>
        <li>Discord 登入、權限驗證與個人已購買進度已實裝。</li>
        <li>手機版與電腦版都會持續優化。</li>
      </ul>
    </div>
  </article>

  <article className="info-card home-warframe-info-card">
    <div className="card-title">
      <span>3</span>
      <span>Warframe 官方資訊區</span>
    </div>

    <div className="home-official-links">
      <a href="https://www.warframe.com" target="_blank" rel="noreferrer">
        Warframe 官方網站
      </a>
      <a href="https://www.warframe.com/news" target="_blank" rel="noreferrer">
        官方新聞
      </a>
      <a href="https://www.warframe.com/updates" target="_blank" rel="noreferrer">
        更新紀錄
      </a>
      <a href="https://forums.warframe.com" target="_blank" rel="noreferrer">
        官方論壇
      </a>
    </div>

    <div className="home-info-subblock">
      <h3>官方資訊用途</h3>
      <ul>
        <li>查詢官方更新公告。</li>
        <li>追蹤版本更新與活動消息。</li>
        <li>後續可擴充成官方新聞摘要區。</li>
      </ul>
    </div>
  </article>
</div>


        <article className="info-card summary-card">
          <div className="card-title">
            <ClipboardList size={18} />
            <span>資料庫狀態</span>
          </div>

          <div className="summary-table">
            <div className="summary-row">
              <span>資料來源</span>
              <b>Google Sheets＋Discord 個人進度</b>
            </div>
            <div className="summary-row">
              <span>分頁數</span>
              <b>{results.length}</b>
            </div>
            <div className="summary-row">
              <span>區塊總數</span>
              <b>{totalSections}</b>
            </div>
            <div className="summary-row">
              <span>價格更新</span>
              <b>每日 4:00</b>
            </div>
            <div className="summary-row">
              <span>Discord 個人化</span>
              <b>登入／權限／個人進度已啟用</b>
            </div>
          </div>

          <div className="total-row">
            <span>網站版本</span>
            <b>v2.2.0</b>
          </div>
        </article>

        <article className="info-card notes-card">
          <div className="card-title" style={{ position: "relative", overflow: "hidden", isolation: "isolate" }}>
      
            <Pencil size={18} />
            <span>備註</span>
          </div>

          <p>・v2.2.0 已加入首頁自動資料總控台。</p>
          <p>・Discord 登入、個人進度與權限驗證已完成。</p>
          <p>・首頁已支援個人已購買／個人完成度；未登入時顯示表格統計。</p>
      <KetherClanWatermark />
          <div className="note-lines" />
          <div className="note-lines" />
          <img className="watermark watermark-logo" src="/kether-clan-logo.png" alt="" aria-hidden="true" />
        </article>
      
      
</section>

      <footer className="home-footer-signature">
        <a
          href="https://kether-warframe-database.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="home-footer-link"
        >
          https://kether-warframe-database.vercel.app
        </a>
        <span className="home-footer-divider">｜</span>
        <span className="home-footer-designer">Website by ヤハ奈々子・羊咩・凱洛</span>
      </footer>

    </main>
  </>);
}
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

  return (
    <main className="page-shell homepage-sci-fi">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb home-tech-card home-tech-corner" />

      <header className="topbar">
        <div className="topbar-left">
          <details className="menu-drawer">
            <summary aria-label="開啟選單">
              <Menu size={22} />
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
          <Search size={21} />
          <Bell size={20} />
          <Link className="login-mini" href="/login">登入</Link>
          <a className="discord-mini" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Discord
          </a>
        </div>
      </header>

      <section className="home-hero-image-banner" aria-label="KETHER OF PARADISO Warframe Database">
        <img src="/home-hero-banner.png?v=229" alt="KETHER OF PARADISO Warframe Database 首頁橫版圖" />
      </section>


      <section className="hero">
</section>

      <section className="home-kpi-grid">
        <article>
          <span>總資料數</span>
          <strong>{totalRows.toLocaleString("zh-TW")}</strong>
        </article>
        <article>
          <span>有價格資料</span>
          <strong>{totalPriced.toLocaleString("zh-TW")}</strong>
        </article>
        <article>
          <span>已購買</span>
          <strong>{totalOwned.toLocaleString("zh-TW")}</strong>
        </article>
        <article>
          <span>目前完成度</span>
          <strong>{totalCompletion}%</strong>
        </article>
      </section>

      <section className="nav-panel" id="navigation">
        <div className="panel-tag">1　導航區</div>
        <div className="nav-grid">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="nav-card" key={item.label} href={item.href}>
                <Icon size={52} strokeWidth={1.6} />
                <strong>{item.label}</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-category-panel">
        <div className="card-title">
          <ClipboardList size={18} />
          <span>2　分類資料狀態</span>
        </div>

        <div className="home-category-grid">
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="home-category-card" key={item.key} href={item.href}>
                <Icon size={32} strokeWidth={1.7} />
                <div>
                  <h3>{item.label}</h3>
                  <p>
                    {item.count.toLocaleString("zh-TW")} 筆｜區塊 {item.sectionCount}｜有價格 {item.priced}
                  </p>
                </div>
                <strong>{item.completion}%</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="info-card">
          <div className="card-title">
            <Info size={18} />
            <span>3　資訊區</span>
          </div>

          <div className="info-row">
            <CalendarDays size={34} />
            <span>更新日期</span>
            <b>2026/7/3</b>
          </div>

          <div className="line" />

          <div className="guide">
            <Info size={28} />
            <div>
              <h3>使用說明</h3>
              <p>・首頁資料會自動讀取 Google Sheets。</p>
              <p>・分類頁支援區塊、搜尋、價格與已購買篩選。</p>
              <p>・目前為只讀模式，個人化會在 Discord 登入後實裝。</p>
              <p>・手機版與電腦版都會持續優化。</p>
            </div>
          </div>
        </article>

        <article className="info-card summary-card">
          <div className="card-title">
            <ClipboardList size={18} />
            <span>4　資料庫狀態</span>
          </div>

          <div className="summary-table">
            <div className="summary-row">
              <span>資料來源</span>
              <b>Google Sheets</b>
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
              <span>Discord 入口</span>
              <b>已啟用</b>
            </div>
          </div>

          <div className="total-row">
            <span>網站版本</span>
            <b>v2.4.6</b>
          </div>
        </article>

        <article className="info-card notes-card">
          <div className="card-title">
            <Pencil size={18} />
            <span>5　備註</span>
          </div>

          <p>・v2.4.6 已加入首頁自動資料總控台。</p>
          <p>・下一階段可做 Discord 登入前置與個人化資料庫設計。</p>
          <p>・完成度目前讀取表格欄位，未來會改為個人獨立紀錄。</p>
          <div className="note-lines" />
          <div className="note-lines" />
          <img className="watermark watermark-logo" src="/kether-clan-logo.png" alt="" aria-hidden="true" />
        </article>
      </section>

      <footer>
        <span />
        <b>KETHER OF PARADISO</b>
        <span />
      </footer>
    
      <script
        id="v242-stat-frame-script"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const labels = ["總資料數", "有價格資料", "已購買", "目前完成度"];

              function findLabelElements(label) {
                return [...document.querySelectorAll(".homepage-sci-fi *")].filter((el) => {
                  const ownText = [...el.childNodes]
                    .filter((node) => node.nodeType === Node.TEXT_NODE)
                    .map((node) => node.textContent.trim())
                    .join("");
                  return ownText === label;
                });
              }

              function chooseCard(el, label) {
                let current = el;
                let best = null;

                for (let i = 0; i < 7 && current && current !== document.body; i++) {
                  const rect = current.getBoundingClientRect();
                  const text = current.innerText || "";

                  if (
                    text.includes(label) &&
                    rect.width >= 120 &&
                    rect.height >= 45 &&
                    rect.width <= window.innerWidth * 0.95 &&
                    text.length <= 80
                  ) {
                    best = current;
                  }

                  current = current.parentElement;
                }

                return best;
              }

              function applyFrames() {
                labels.forEach((label) => {
                  const elements = findLabelElements(label);

                  elements.forEach((el) => {
                    const card = chooseCard(el, label);
                    if (card) {
                      card.classList.add("stat-frame-image");
                    }
                  });
                });
              }

              requestAnimationFrame(applyFrames);
              setTimeout(applyFrames, 300);
              setTimeout(applyFrames, 1000);
            })();
          `,
        }}
      />

    
      <script
        id="v244-home-art-layer-script"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const root = document.querySelector(".homepage-sci-fi");
              if (!root) return;

              function findZone(labels) {
                const nodes = [...root.querySelectorAll("section, article, div")];

                const candidates = nodes
                  .map((el) => {
                    const text = (el.innerText || "").replace(/\\s+/g, " ").trim();
                    const rect = el.getBoundingClientRect();
                    return { el, text, rect, area: rect.width * rect.height };
                  })
                  .filter(({ text, rect }) => {
                    return labels.every((label) => text.includes(label)) &&
                      rect.width >= 180 &&
                      rect.height >= 45 &&
                      text.length <= 1800;
                  })
                  .sort((a, b) => a.area - b.area);

                return candidates[0]?.el || null;
              }

              function applyZone(title, labels) {
                const zone = findZone(labels);
                if (!zone) return;

                zone.classList.add("home-art-zone-frame");
                zone.setAttribute("data-zone-title", title);
              }

              // 1 導覽區：分類按鍵區
              applyZone("1  導覽區", ["總覽", "戰甲", "主要武器", "次要武器"]);

              // 2 數據區：四個統計數據
              applyZone("2  數據區", ["總資料數", "有價格資料", "已購買", "目前完成度"]);

              // 3 資料區：資料來源 / 分頁 / 區塊 / 更新資訊
              applyZone("3  資料區", ["資料來源", "分頁數", "區塊"]);

              // 4 備註區：備註內容
              applyZone("4  備註區", ["可在此", "記錄"]);

              // 保險：頂部可點擊元素永遠在最上層
              const topItems = root.querySelectorAll("header, nav, button, a, [role='button']");
              topItems.forEach((el) => {
                el.style.position = "relative";
                el.style.zIndex = "1000";
                el.style.pointerEvents = "auto";
              });

              // 版圖不擋點擊
              const heroImages = root.querySelectorAll("img[src*='home-hero-banner']");
              heroImages.forEach((img) => {
                img.style.pointerEvents = "none";
                img.style.zIndex = "20";
              });
            })();
          `,
        }}
      />

    
      <script
        id="v245-home-art-layer-script"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const root = document.querySelector(".homepage-sci-fi");
              if (!root) return;

              function cleanOldZones() {
                root.querySelectorAll(".home-art-zone-frame").forEach((el) => {
                  el.classList.remove("home-art-zone-frame");
                  el.removeAttribute("data-zone-title");
                });
              }

              function normalize(text) {
                return (text || "").replace(/\\s+/g, " ").trim();
              }

              function findZone(labelGroups) {
                const nodes = [...root.querySelectorAll("section, article, div")];
                const candidates = [];

                for (const el of nodes) {
                  const text = normalize(el.innerText);
                  if (!text) continue;

                  const rect = el.getBoundingClientRect();
                  if (rect.width < 160 || rect.height < 40) continue;

                  let score = 0;
                  for (const group of labelGroups) {
                    const groupHit = group.every((label) => text.includes(label));
                    if (groupHit) score += group.length;
                  }

                  if (score <= 0) continue;

                  // 避免抓到整個首頁太大的容器
                  const area = rect.width * rect.height;
                  const rootArea = window.innerWidth * Math.max(window.innerHeight, 720);
                  if (area > rootArea * 0.85) continue;

                  candidates.push({ el, score, area, textLength: text.length });
                }

                candidates.sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  return a.area - b.area;
                });

                return candidates[0]?.el || null;
              }

              function applyZone(title, labelGroups) {
                const zone = findZone(labelGroups);
                if (!zone) return false;

                zone.classList.add("home-art-zone-frame");
                zone.setAttribute("data-zone-title", title);
                return true;
              }

              function applyAll() {
                cleanOldZones();

                // 1 導覽區
                applyZone("1  導覽區", [
                  ["總覽", "戰甲", "主要武器", "次要武器"],
                  ["近戰武器", "同伴", "曲翼"]
                ]);

                // 2 數據區
                applyZone("2  數據區", [
                  ["總資料數", "有價格資料"],
                  ["已購買", "目前完成度"],
                  ["390", "304", "0%"]
                ]);

                // 3 資料區
                applyZone("3  資料區", [
                  ["資料來源", "分頁數", "區塊"],
                  ["價格更新", "Discord"]
                ]);

                // 4 備註區
                applyZone("4  備註區", [
                  ["備註"],
                  ["v2.", "下一階段"],
                  ["可在此", "記錄"],
                  ["完成度", "個人"]
                ]);

                // 頂部可點擊元素永遠最高
                root.querySelectorAll("header, nav, button, a, [role='button']").forEach((el) => {
                  el.style.position = "relative";
                  el.style.zIndex = "5000";
                  el.style.pointerEvents = "auto";
                });

                // 首頁版圖不可擋點擊
                root.querySelectorAll("img[src*='home-hero-banner']").forEach((img) => {
                  img.style.pointerEvents = "none";
                  img.style.zIndex = "20";
                });
              }

              requestAnimationFrame(applyAll);
              setTimeout(applyAll, 300);
              setTimeout(applyAll, 1000);
            })();
          `,
        }}
      />

    
      <script
        id="v246-home-layer-fix-script"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const root = document.querySelector(".homepage-sci-fi");
              if (!root) return;

              function norm(text) {
                return (text || "").replace(/\\s+/g, " ").trim();
              }

              function getRect(el) {
                try {
                  return el.getBoundingClientRect();
                } catch {
                  return { width: 0, height: 0, top: 9999 };
                }
              }

              function commonAncestor(elements) {
                if (!elements.length) return null;
                const paths = elements.map((el) => {
                  const path = [];
                  let cur = el;
                  while (cur && cur !== document.body) {
                    path.push(cur);
                    cur = cur.parentElement;
                  }
                  return path;
                });

                for (const node of paths[0]) {
                  if (paths.every((p) => p.includes(node))) return node;
                }
                return null;
              }

              function findTextElement(label) {
                const all = [...root.querySelectorAll("*")];
                return all.find((el) => {
                  const own = [...el.childNodes]
                    .filter((n) => n.nodeType === Node.TEXT_NODE)
                    .map((n) => norm(n.textContent))
                    .join("");
                  return own === label;
                }) || all.find((el) => norm(el.innerText) === label);
              }

              function applyZoneByLabels(title, labels) {
                const els = labels.map(findTextElement).filter(Boolean);
                if (!els.length) return false;

                let zone = commonAncestor(els);
                if (!zone) return false;

                // 如果抓到太小，就往上找一層合理容器
                for (let i = 0; i < 5 && zone && zone !== root; i++) {
                  const rect = getRect(zone);
                  const text = norm(zone.innerText);

                  if (
                    rect.width >= 220 &&
                    rect.height >= 60 &&
                    labels.every((l) => text.includes(l))
                  ) {
                    zone.classList.add("home-art-zone-frame");
                    zone.setAttribute("data-zone-title", title);
                    return true;
                  }

                  zone = zone.parentElement;
                }

                return false;
              }

              function applyZoneByText(title, mustHave, maybeHave = []) {
                const candidates = [...root.querySelectorAll("section, article, div")]
                  .map((el) => {
                    const text = norm(el.innerText);
                    const rect = getRect(el);
                    return { el, text, rect, area: rect.width * rect.height };
                  })
                  .filter(({ text, rect }) => {
                    if (!mustHave.every((m) => text.includes(m))) return false;
                    if (maybeHave.length && !maybeHave.some((m) => text.includes(m))) return false;
                    if (rect.width < 180 || rect.height < 60) return false;
                    if (text.length > 2200) return false;
                    return true;
                  })
                  .sort((a, b) => a.area - b.area);

                const target = candidates[0]?.el;
                if (!target) return false;

                target.classList.add("home-art-zone-frame");
                target.setAttribute("data-zone-title", title);
                return true;
              }

              function fixMenuLayer() {
                // 找上方導覽列：通常包含登入 / Discord / 搜尋 / 漢堡
                const candidates = [...root.querySelectorAll("header, nav, div")]
                  .map((el) => {
                    const text = norm(el.innerText);
                    const rect = getRect(el);
                    return { el, text, rect, area: rect.width * rect.height };
                  })
                  .filter(({ text, rect }) => {
                    const hit = text.includes("登入") || text.includes("Discord");
                    return hit && rect.top <= 160 && rect.width >= 200 && rect.height <= 160;
                  })
                  .sort((a, b) => a.area - b.area);

                const bar = candidates[0]?.el;
                if (bar) {
                  bar.classList.add("home-top-overlay");
                }

                // 展開的選單如果是 nav / menu，就變浮層
                root.querySelectorAll("[aria-expanded='true'], [data-state='open'], [role='menu']").forEach((el) => {
                  let panel = el;
                  for (let i = 0; i < 3 && panel; i++) {
                    const rect = getRect(panel);
                    if (rect.width >= 160 && rect.height >= 40) {
                      panel.classList.add("home-menu-floating");
                      break;
                    }
                    panel = panel.parentElement;
                  }
                });
              }

              function restoreWatermark() {
                if (root.querySelector(".home-clan-watermark")) return;
                const wm = document.createElement("div");
                wm.className = "home-clan-watermark";
                wm.textContent = "KETHER OF PARADISO";
                root.appendChild(wm);
              }

              function applyAll() {
                // 清掉舊標題狀態，重新掛
                root.querySelectorAll(".home-art-zone-frame").forEach((el) => {
                  el.classList.remove("home-art-zone-frame");
                  el.removeAttribute("data-zone-title");
                });

                // 1 導覽區
                applyZoneByLabels("1  導覽區", ["總覽", "戰甲", "主要武器", "次要武器"]);

                // 2 數據區
                applyZoneByLabels("2  數據區", ["總資料數", "有價格資料", "已購買", "目前完成度"]);

                // 3 資料區
                applyZoneByText("3  資料區", ["資料來源", "分頁數"], ["區塊", "價格更新", "Discord"]);

                // 4 備註區
                applyZoneByText("4  備註區", ["備註"], ["v2.", "下一階段", "可在此", "記錄", "完成度"]);

                fixMenuLayer();
                restoreWatermark();

                // 版圖不擋點擊
                root.querySelectorAll("img[src*='home-hero-banner']").forEach((img) => {
                  img.style.pointerEvents = "none";
                  img.style.zIndex = "20";
                });
              }

              requestAnimationFrame(applyAll);
              setTimeout(applyAll, 300);
              setTimeout(applyAll, 1000);
              document.addEventListener("click", () => setTimeout(applyAll, 80), true);
            })();
          `,
        }}
      />

    </main>
  );
}

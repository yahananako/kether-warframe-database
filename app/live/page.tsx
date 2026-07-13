import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";

import KetherDynamicInfo from "../../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";

type Cycle = {
  state?: string;
  timeLeft?: string;
  shortString?: string;
  active?: string;
  expiry?: string;
};

type TimeLike = {
  eta?: string;
  expiry?: string;
  activation?: string;
  date?: string;
  startString?: string;
  endString?: string;
  timeLeft?: string;
  shortString?: string;
};

type Fissure = TimeLike & {
  id?: string;
  node?: string;
  missionType?: string;
  enemy?: string;
  tier?: string;
  tierNum?: number;
  expired?: boolean;
};

type Invasion = {
  id?: string;
  node?: string;
  desc?: string;
  attackingFaction?: string;
  defendingFaction?: string;
  completion?: number;
  completed?: boolean;
};

type Sortie = TimeLike & {
  id?: string;
  boss?: string;
  faction?: string;
};

type NewsItem = TimeLike & {
  id?: string;
  message?: string;
  link?: string;
};

type WorldState = {
  timestamp?: string;
  news?: NewsItem[];
  alerts?: Array<unknown>;
  fissures?: Fissure[];
  invasions?: Invasion[];
  sortie?: Sortie;
  sorties?: Sortie[];
  archonHunt?: Sortie;
  voidTrader?: TimeLike & {
    character?: string;
    location?: string;
    active?: boolean;
  };
  cetusCycle?: Cycle;
  vallisCycle?: Cycle;
  cambionCycle?: Cycle;
  zarimanCycle?: Cycle;
  duviriCycle?: Cycle;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const databaseStats = [
  { label: "資料來源", value: "Google Sheets" },
  { label: "資料分頁", value: "7" },
  { label: "資料區塊", value: "41" },
  { label: "同步節奏", value: "每日 04:00" },
];

const navItems = [
  {
    label: "總覽",
    href: "/database/overview",
    image: "/icon-overview.png",
    activeImage: "/icon-overview-2.png",
  },
  {
    label: "戰甲",
    href: "/database/warframes",
    image: "/icon-warframe.png",
    activeImage: "/icon-warframe-2.png",
  },
  {
    label: "主要武器",
    href: "/database/primary",
    image: "/icon-primary.png",
    activeImage: "/icon-primary-2.png",
  },
  {
    label: "次要武器",
    href: "/database/secondary",
    image: "/icon-secondary.png",
    activeImage: "/icon-secondary-2.png",
  },
  {
    label: "近戰武器",
    href: "/database/melee",
    image: "/icon-melee.png",
    activeImage: "/icon-melee-2.png",
  },
  {
    label: "同伴",
    href: "/database/companions",
    image: "/icon-companion.png",
    activeImage: "/icon-companion-2.png",
  },
  {
    label: "曲翼",
    href: "/database/archwing",
    image: "/icon-archwing.png",
    activeImage: "/icon-archwing-2.png",
  },
  {
    label: "MOD",
    href: "/database/mods",
    image: "/icon-mod.png",
    activeImage: "/icon-mod-2.png",
  },
];


const factionMap: Record<string, string> = {
  Grineer: "Grineer / 克隆尼",
  Corpus: "Corpus / 科普斯",
  Infested: "Infested / 感染者",
  Corrupted: "Corrupted / 墮落者",
  Orokin: "Orokin / Orokin",
  Sentient: "Sentient / Sentient",
  Narmer: "Narmer / 納爾梅",
  Tenno: "Tenno / 天諾",
};

const missionMap: Record<string, string> = {
  Capture: "捕獲",
  Exterminate: "殲滅",
  Survival: "生存",
  Defense: "防禦",
  "Mobile Defense": "移動防禦",
  Spy: "間諜",
  Rescue: "救援",
  Sabotage: "破壞",
  Excavation: "挖掘",
  Interception: "攔截",
  Disruption: "中斷",
  Defection: "叛逃",
  Hijack: "劫持",
  Assassination: "刺殺",
  "Crossfire Exterminate": "交戰殲滅",
  "Void Flood": "虛空洪流",
  "Void Cascade": "虛空級聯",
  "Void Armageddon": "虛空決戰",
  Alchemy: "鍊金術",
  "Mirror Defense": "鏡像防禦",
};

const cycleMap: Record<string, string> = {
  day: "白晝",
  night: "夜晚",
  warm: "溫暖",
  cold: "寒冷",
  fass: "Fass",
  vome: "Vome",
  calm: "平靜",
  anger: "憤怒",
  envy: "嫉妒",
  sorrow: "悲傷",
  joy: "喜悅",
  fear: "恐懼",
};

async function getWorldState(): Promise<WorldState | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch("https://api.warframestat.us/pc", {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function label(value: unknown, fallback = "資料同步中") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function zhFaction(value?: string) {
  if (!value) return "派系同步中";
  return factionMap[value] ?? value;
}

function zhMission(value?: string) {
  if (!value) return "任務同步中";
  return missionMap[value] ?? value;
}

function zhCycle(value?: string) {
  if (!value) return "循環中";
  return cycleMap[value] ?? value;
}

function formatTimeLeft(value?: string) {
  if (!value) return "";

  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return "";

  const diff = end - Date.now();
  if (diff <= 0) return "已結束";

  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}天 ${hours}小時`;
  if (hours > 0) return `${hours}小時 ${minutes}分`;
  return `${minutes}分`;
}

function etaText(item?: TimeLike | null, fallback = "時間同步中") {
  if (!item) return fallback;

  const direct =
    item.eta ||
    item.timeLeft ||
    item.shortString ||
    item.endString ||
    item.startString;

  if (direct && direct.trim()) return direct;

  const fromExpiry = formatTimeLeft(item.expiry);
  if (fromExpiry) return fromExpiry;

  const fromDate = formatWorldTime(item.date);
  if (fromDate !== "等待訊號" && fromDate !== "時間同步中") return fromDate;

  return fallback;
}

function cycleText(cycle?: Cycle) {
  if (!cycle) return "資料同步中";
  const state = zhCycle(cycle.state || cycle.active);
  const time = cycle.timeLeft || cycle.shortString || formatTimeLeft(cycle.expiry);
  return time ? `${state}｜${time}` : state;
}

function statusLabel(tone?: string) {
  const labels: Record<string, string> = {
    day: "晝夜",
    cold: "寒熱",
    void: "虛空",
    dream: "情緒",
    baro: "商船",
    "baro-active": "抵達",
    danger: "突擊",
    archon: "封印",
    alert: "警報",
    default: "訊號",
  };

  return labels[tone ?? "default"] ?? "訊號";
}

function formatWorldTime(value?: string) {
  if (!value) return "等待訊號";

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return "時間同步中";
  }
}

function InfoCard({
  title,
  value,
  sub,
  tone = "default",
}: {
  title: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <section className={`live-card live-tech-frame live-card-${tone}`}>
      <span className="live-status-badge">{statusLabel(tone)}</span>
      <p className="live-card-kicker">{title}</p>
      <h2>{value}</h2>
      {sub ? <p className="live-card-sub">{sub}</p> : null}
    </section>
  );
}

export default async function LivePage() {
  const data = await getWorldState();

  const activeFissures =
    data?.fissures?.filter((item) => !item.expired).slice(0, 8) ?? [];

  const activeInvasions =
    data?.invasions?.filter((item) => !item.completed).slice(0, 6) ?? [];

  const latestNews = data?.news?.slice(0, 5) ?? [];
  const sortie = data?.sortie ?? data?.sorties?.[0];

  const signalCards = [
    {
      label: "裂縫訊號",
      value: `${activeFissures.length} 筆`,
      hint: "虛空裂縫監聽中",
      tone: "void",
    },
    {
      label: "入侵戰報",
      value: `${activeInvasions.length} 筆`,
      hint: "戰線變動偵測中",
      tone: "war",
    },
    {
      label: "警報電波",
      value: `${data?.alerts?.length ?? 0} 筆`,
      hint: "特殊警報與活動",
      tone: "alert",
    },
    {
      label: "Baro 狀態",
      value: data?.voidTrader?.active ? "已抵達" : "未抵達",
      hint: label(data?.voidTrader?.location, "虛空商船追蹤中"),
      tone: data?.voidTrader?.active ? "baro-active" : "baro",
    },
  ];

  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />

              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="電波局快捷入口">
              <HomeNewInlineSearch />

              <HomeNewInlineNotifications />

              <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
                <UserRound size={18} />
                <span>個人</span>
              </Link>

              <Link
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="home-new-discord-action"
                aria-label="Discord 入口"
              >
                <MessageCircle size={18} />
                <span>Discord</span>
              </Link>
            </div>
          </div>

          <div className="home-new-banner">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO 小希星圖電波局版圖"
            />
          </div>

          <div className="home-new-dynamic-inside">
            <KetherDynamicInfo />
          </div>
        </section>

        <details className="home-new-fold-card home-new-fold-nav">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER DATABASE NAVIGATION</em>
              <strong>資料庫導覽</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="home-new-nav-card">
            <div className="home-new-nav-grid">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="home-new-nav-item">
                  <span className="home-new-nav-icon">
                    <img className="home-new-nav-icon-normal" src={item.image} alt={item.label} />
                    <img className="home-new-nav-icon-active" src={item.activeImage} alt="" aria-hidden="true" />
                  </span>

                  <span className="home-new-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="home-new-section-divider" aria-hidden="true">
              <span />
            </div>

            <div className="home-new-database-line" aria-label="資料庫狀態">
              {databaseStats.map((item) => (
                <div key={item.label} className="home-new-database-chip">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </details>

        <section className="kether-live-content-shell">
          <section className="live-hero live-tech-frame">
        <p className="live-eyebrow">KETHER NEKO SIGNAL</p>
        <h1>小希星圖電波局</h1>
        <p>
          小希正在監聽 Warframe 星系脈動：平原循環、虛空裂縫、入侵戰線、突擊任務與 Baro Ki'Teer 的虛空商船。
          資料每次進入頁面時重新捕捉，星圖雷達持續閃爍中喵。
        </p>

        <div className="live-sync-badge">
          最後同步：{formatWorldTime(data?.timestamp)}｜刷新節奏：重新進入頁面時更新
        </div>

      </section>

      {!data ? (
        <section className="live-error live-tech-frame">
          星圖電波暫時失聯，外部資料源可能回應過慢，請稍後再讓小希重新捕捉訊號喵。
        </section>
      ) : (
        <>
          <section className="live-signal-strip" aria-label="小希星圖雷達摘要">
            {signalCards.map((card) => (
              <article className={`live-signal-chip live-tech-frame live-signal-${card.tone}`} key={card.label}>
                <span>{card.label}</span>
                <b>{card.value}</b>
                <small>{card.hint}</small>
              </article>
            ))}
          </section>

          <section className="live-grid live-grid-primary">
            <InfoCard title="希圖斯晝夜儀" value={cycleText(data.cetusCycle)} tone="day" />
            <InfoCard title="奧布寒熱雷達" value={cycleText(data.vallisCycle)} tone="cold" />
            <InfoCard title="魔胎輪迴觀測" value={cycleText(data.cambionCycle)} tone="void" />
            <InfoCard title="Zariman 虛空回聲" value={cycleText(data.zarimanCycle)} tone="void" />
            <InfoCard title="Duviri 情緒天氣" value={cycleText(data.duviriCycle)} tone="dream" />
            <InfoCard
              title="Baro 虛空商人雷達"
              value={data.voidTrader?.active ? "已抵達" : "尚未抵達"}
              tone={data.voidTrader?.active ? "baro-active" : "baro"}
              sub={`${label(data.voidTrader?.location, "位置未公布")}｜${etaText(
                data.voidTrader,
                "商船時間追蹤中"
              )}`}
            />
          </section>

          <section className="live-section live-tech-frame">
            <div className="live-section-title">
              <h2>虛空裂縫喵眼雷達</h2>
              <span>{activeFissures.length} 筆訊號</span>
            </div>

            <div className="live-list">
              {activeFissures.length ? (
                activeFissures.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? `${item.node}-${item.expiry ?? item.eta}`}>
                    <b>
                      {label(item.tier)}｜{zhMission(item.missionType)}
                    </b>
                    <span>
                      {label(item.node)}｜{zhFaction(item.enemy)}｜剩餘 {etaText(item)}
                    </span>
                  </article>
                ))
              ) : (
                <p className="live-empty">目前沒有捕捉到可顯示的裂縫訊號。</p>
              )}
            </div>
          </section>

          <section className="live-section live-tech-frame">
            <div className="live-section-title">
              <h2>入侵戰線警報</h2>
              <span>{activeInvasions.length} 筆戰報</span>
            </div>

            <div className="live-list">
              {activeInvasions.length ? (
                activeInvasions.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? item.node}>
                    <b>{label(item.node)}</b>
                    <span>
                      {zhFaction(item.attackingFaction)} vs {zhFaction(item.defendingFaction)}
                      ｜戰線進度 {Math.round(item.completion ?? 0)}%
                    </span>
                  </article>
                ))
              ) : (
                <p className="live-empty">目前戰線安靜，沒有可顯示的入侵情報。</p>
              )}
            </div>
          </section>

          <section className="live-grid">
            <InfoCard
              title="突擊任務占卜盤"
              value={label(sortie?.boss, "資料同步中")}
              tone="danger"
              sub={`${zhFaction(sortie?.faction)}｜${etaText(sortie)}`}
            />
            <InfoCard
              title="執政官獵殺封印書"
              value={label(data.archonHunt?.boss, "資料同步中")}
              tone="archon"
              sub={`${zhFaction(data.archonHunt?.faction)}｜${etaText(data.archonHunt)}`}
            />
            <InfoCard
              title="警報電波"
              value={`${data.alerts?.length ?? 0} 筆`}
              tone="alert"
              sub="特殊警報與限時活動訊號"
            />
          </section>

          <section className="live-section live-tech-frame">
            <div className="live-section-title">
              <h2>Tenno 通訊光簡</h2>
              <span>{latestNews.length} 則</span>
            </div>

            <div className="live-list">
              {latestNews.length ? (
                latestNews.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? item.message}>
                    <b>{label(item.message, "官方新聞")}</b>
                    <span>{etaText(item, "官方通訊")}</span>
                  </article>
                ))
              ) : (
                <p className="live-empty">目前沒有新的通訊光簡。</p>
              )}
            </div>
          </section>
        </>
      )}

          <p className="live-source">
            星圖資料來源：WarframeStat.us Worldstate API｜KETHER 小希電波轉譯中。
          </p>
        </section>

        <footer className="home-new-footer">
          <a
            className="home-new-footer-url"
            href="https://kether-warframe-database.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            https://kether-warframe-database.vercel.app
          </a>

          <p className="home-new-footer-credit">
            builder by ヤハ奈々子、羊咩、凱洛
          </p>
        </footer>
      </div>
    </main>
  );
}

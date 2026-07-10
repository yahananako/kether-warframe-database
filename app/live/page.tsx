type Cycle = {
  state?: string;
  timeLeft?: string;
  shortString?: string;
  active?: string;
  expiry?: string;
};

type WorldState = {
  timestamp?: string;
  news?: Array<{
    id?: string;
    message?: string;
    link?: string;
    date?: string;
    eta?: string;
  }>;
  alerts?: Array<unknown>;
  fissures?: Array<{
    id?: string;
    node?: string;
    missionType?: string;
    enemy?: string;
    tier?: string;
    tierNum?: number;
    eta?: string;
    expired?: boolean;
  }>;
  invasions?: Array<{
    id?: string;
    node?: string;
    desc?: string;
    attackingFaction?: string;
    defendingFaction?: string;
    completion?: number;
    completed?: boolean;
  }>;
  sorties?: Array<{
    id?: string;
    boss?: string;
    faction?: string;
    eta?: string;
  }>;
  archonHunt?: {
    boss?: string;
    faction?: string;
    eta?: string;
  };
  voidTrader?: {
    character?: string;
    location?: string;
    active?: boolean;
    startString?: string;
    endString?: string;
  };
  cetusCycle?: Cycle;
  vallisCycle?: Cycle;
  cambionCycle?: Cycle;
  zarimanCycle?: Cycle;
  duviriCycle?: Cycle;
};

export const revalidate = 60;

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
  "Assassination": "刺殺",
  "Crossfire Exterminate": "交戰殲滅",
  "Void Flood": "虛空洪流",
  "Void Cascade": "虛空級聯",
  "Void Armageddon": "虛空決戰",
  "Alchemy": "鍊金術",
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
  try {
    const res = await fetch("https://api.warframestat.us/pc", {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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

function cycleText(cycle?: Cycle) {
  if (!cycle) return "資料同步中";
  const state = zhCycle(cycle.state || cycle.active);
  const time = cycle.timeLeft || cycle.shortString || "";
  return time ? `${state}｜${time}` : state;
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
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <section className="live-card">
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

  const signalCards = [
    {
      label: "裂縫訊號",
      value: `${activeFissures.length} 筆`,
      hint: "虛空裂縫監聽中",
    },
    {
      label: "入侵戰報",
      value: `${activeInvasions.length} 筆`,
      hint: "戰線變動偵測中",
    },
    {
      label: "警報電波",
      value: `${data?.alerts?.length ?? 0} 筆`,
      hint: "特殊警報與活動",
    },
    {
      label: "Baro 狀態",
      value: data?.voidTrader?.active ? "已抵達" : "未抵達",
      hint: label(data?.voidTrader?.location, "虛空商船追蹤中"),
    },
  ];

  return (
    <main className="live-page-shell">
      <section className="live-hero">
        <p className="live-eyebrow">KETHER NEKO SIGNAL</p>
        <h1>小希星圖電波局</h1>
        <p>
          小希正在監聽 Warframe 星系脈動：平原循環、虛空裂縫、入侵戰線、突擊任務與 Baro Ki'Teer 的虛空商船。
          資料每 60 秒更新一次，星圖雷達持續閃爍中喵。
        </p>
        <div className="live-sync-badge">
          最後同步：{formatWorldTime(data?.timestamp)}｜刷新節奏：60 秒
        </div>

        <div className="live-hero-actions">
          <a className="live-back-link" href="/">
            ← 回到 KETHER 主殿
          </a>

          <a className="live-refresh-link" href="/live">
            重新捕捉訊號
          </a>
        </div>
      </section>

      {!data ? (
        <section className="live-error">
          星圖電波暫時失聯，請稍後再讓小希重新捕捉訊號喵。
        </section>
      ) : (
        <>
          <section className="live-signal-strip" aria-label="小希星圖雷達摘要">
            {signalCards.map((card) => (
              <article className="live-signal-chip" key={card.label}>
                <span>{card.label}</span>
                <b>{card.value}</b>
                <small>{card.hint}</small>
              </article>
            ))}
          </section>

          <section className="live-grid live-grid-primary">
            <InfoCard title="希圖斯晝夜儀" value={cycleText(data.cetusCycle)} />
            <InfoCard title="奧布寒熱雷達" value={cycleText(data.vallisCycle)} />
            <InfoCard title="魔胎輪迴觀測" value={cycleText(data.cambionCycle)} />
            <InfoCard title="Zariman 虛空回聲" value={cycleText(data.zarimanCycle)} />
            <InfoCard title="Duviri 情緒天氣" value={cycleText(data.duviriCycle)} />
            <InfoCard
              title="Baro 虛空商人雷達"
              value={data.voidTrader?.active ? "已抵達" : "尚未抵達"}
              sub={`${label(data.voidTrader?.location, "位置未公布")}｜${label(
                data.voidTrader?.active
                  ? data.voidTrader?.endString
                  : data.voidTrader?.startString,
                "時間同步中"
              )}`}
            />
          </section>

          <section className="live-section">
            <div className="live-section-title">
              <h2>虛空裂縫喵眼雷達</h2>
              <span>{activeFissures.length} 筆訊號</span>
            </div>

            <div className="live-list">
              {activeFissures.length ? (
                activeFissures.map((item) => (
                  <article className="live-row" key={item.id ?? `${item.node}-${item.eta}`}>
                    <b>{label(item.tier)}｜{zhMission(item.missionType)}</b>
                    <span>{label(item.node)}｜{zhFaction(item.enemy)}｜剩餘 {label(item.eta)}</span>
                  </article>
                ))
              ) : (
                <p className="live-empty">目前沒有捕捉到可顯示的裂縫訊號。</p>
              )}
            </div>
          </section>

          <section className="live-section">
            <div className="live-section-title">
              <h2>入侵戰線警報</h2>
              <span>{activeInvasions.length} 筆戰報</span>
            </div>

            <div className="live-list">
              {activeInvasions.length ? (
                activeInvasions.map((item) => (
                  <article className="live-row" key={item.id ?? item.node}>
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
              value={label(data.sorties?.[0]?.boss, "資料同步中")}
              sub={`${zhFaction(data.sorties?.[0]?.faction)}｜${label(
                data.sorties?.[0]?.eta,
                "時間同步中"
              )}`}
            />
            <InfoCard
              title="執政官獵殺封印書"
              value={label(data.archonHunt?.boss, "資料同步中")}
              sub={`${zhFaction(data.archonHunt?.faction)}｜${label(
                data.archonHunt?.eta,
                "時間同步中"
              )}`}
            />
            <InfoCard
              title="警報電波"
              value={`${data.alerts?.length ?? 0} 筆`}
              sub="特殊警報與限時活動訊號"
            />
          </section>

          <section className="live-section">
            <div className="live-section-title">
              <h2>Tenno 通訊光簡</h2>
              <span>{latestNews.length} 則</span>
            </div>

            <div className="live-list">
              {latestNews.length ? (
                latestNews.map((item) => (
                  <article className="live-row" key={item.id ?? item.message}>
                    <b>{label(item.message, "官方新聞")}</b>
                    <span>{label(item.eta, "時間同步中")}</span>
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
    </main>
  );
}

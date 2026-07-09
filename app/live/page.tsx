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

function cycleText(cycle?: Cycle) {
  if (!cycle) return "資料同步中";
  const state = cycle.state || cycle.active || "循環中";
  const time = cycle.timeLeft || cycle.shortString || "";
  return time ? `${state}｜${time}` : state;
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

  return (
    <main className="live-page-shell">
      <section className="live-hero">
        <p className="live-eyebrow">KETHER NEKO SIGNAL</p>
        <h1>小希星圖電波局</h1>
        <p>
          小希正在監聽 Warframe 星系脈動：平原循環、虛空裂縫喵眼雷達、入侵戰線警報戰線、突擊任務與 Baro 虛空商人雷達 的虛空商船。
          資料每 60 秒更新一次，星圖雷達持續閃爍中喵。
        </p>
        <a className="live-back-link" href="/">
          ← 回到 KETHER 主殿
        </a>
      </section>

      {!data ? (
        <section className="live-error">
          星圖電波暫時失聯，請稍後再讓小希重新捕捉訊號喵。
        </section>
      ) : (
        <>
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
              <span>{activeFissures.length} 筆</span>
            </div>

            <div className="live-list">
              {activeFissures.length ? (
                activeFissures.map((item) => (
                  <article className="live-row" key={item.id ?? `${item.node}-${item.eta}`}>
                    <b>{label(item.tier)}｜{label(item.missionType)}</b>
                    <span>{label(item.node)}｜{label(item.enemy)}｜{label(item.eta)}</span>
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
              <span>{activeInvasions.length} 筆</span>
            </div>

            <div className="live-list">
              {activeInvasions.length ? (
                activeInvasions.map((item) => (
                  <article className="live-row" key={item.id ?? item.node}>
                    <b>{label(item.node)}</b>
                    <span>
                      {label(item.attackingFaction)} vs {label(item.defendingFaction)}
                      ｜進度 {Math.round(item.completion ?? 0)}%
                    </span>
                  </article>
                ))
              ) : (
                <p className="live-empty">目前沒有可顯示的入侵戰線警報資料。</p>
              )}
            </div>
          </section>

          <section className="live-grid">
            <InfoCard
              title="突擊任務占卜盤"
              value={label(data.sorties?.[0]?.boss, "資料同步中")}
              sub={`${label(data.sorties?.[0]?.faction, "派系同步中")}｜${label(
                data.sorties?.[0]?.eta,
                "時間同步中"
              )}`}
            />
            <InfoCard
              title="執政官獵殺封印書"
              value={label(data.archonHunt?.boss, "資料同步中")}
              sub={`${label(data.archonHunt?.faction, "派系同步中")}｜${label(
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
                    <b>{label(item.message, "Tenno 通訊光簡")}</b>
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

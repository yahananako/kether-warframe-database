import Link from "next/link";
import { ArrowRight, ArrowUpRight, House, RadioTower } from "lucide-react";

import LiveChrome from "../../components/LiveChrome";
import {
  LIVE_STATIONS,
  cycleText,
  etaText,
  formatWorldTime,
  getActiveFissures,
  getActiveInvasions,
  getSortie,
  getStation,
  getWorldState,
  label,
  zhFaction,
  zhMission,
} from "../../lib/worldState";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function DetailLink({ slug, label = "查看完整頁面" }: { slug: string; label?: string }) {
  return (
    <Link href={`/live/${slug}`} className="live-detail-link">
      <span>{label}</span>
      <ArrowUpRight size={15} aria-hidden="true" />
    </Link>
  );
}
function InfoCard({
  slug,
  title,
  value,
  sub,
  tone = "default",
}: {
  slug: string;
  title: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  const station = getStation(slug);

  return (
    <article className={`live-card live-tech-frame live-card-${tone}`}>
      <div className="live-card-topline">
        <span className="live-status-badge">{station?.glyph ?? "◆"}</span>
        <small>{station?.kicker ?? "LIVE SIGNAL"}</small>
      </div>
      <p className="live-card-kicker">{title}</p>
      <h2>{value}</h2>
      {sub ? <p className="live-card-sub">{sub}</p> : null}
      <DetailLink slug={slug} />
    </article>
  );
}

function SectionHeading({ title, count, slug }: { title: string; count: string; slug: string }) {
  return (
    <div className="live-section-title">
      <div>
        <h2>{title}</h2>
        <span>{count}</span>
      </div>
      <DetailLink slug={slug} />
    </div>
  );
}

export default async function LivePage() {
  const data = await getWorldState();
  const allFissures = getActiveFissures(data);
  const allInvasions = getActiveInvasions(data);
  const activeFissures = allFissures.slice(0, 8);
  const activeInvasions = allInvasions.slice(0, 6);
  const latestNews = data?.news?.slice(0, 5) ?? [];
  const sortie = getSortie(data);

  const signalCards = [
    { slug: "fissures", label: "裂縫訊號", value: `${allFissures.length} 筆`, hint: "虛空裂縫監聽中", tone: "void" },
    { slug: "invasions", label: "入侵戰報", value: `${allInvasions.length} 筆`, hint: "戰線變動偵測中", tone: "war" },
    { slug: "alerts", label: "警報電波", value: `${data?.alerts?.length ?? 0} 筆`, hint: "特殊警報與活動", tone: "alert" },
    {
      slug: "baro",
      label: "Baro 狀態",
      value: data?.voidTrader?.active ? "已抵達" : "未抵達",
      hint: label(data?.voidTrader?.location, "虛空商船追蹤中"),
      tone: data?.voidTrader?.active ? "baro-active" : "baro",
    },
  ];

  const stationGroups = Array.from(new Set(LIVE_STATIONS.map((station) => station.group)));

  return (
    <LiveChrome>
      <section className="kether-live-content-shell">
        <section className="live-hero live-tech-frame live-command-hero">
          <div className="live-hero-title-row">
            <p className="live-eyebrow">KETHER NEKO SIGNAL</p>
            <Link href="/" className="live-home-link" aria-label="回首頁" title="回首頁">
              <House size={17} aria-hidden="true" />
              <span>回首頁</span>
            </Link>
          </div>

          <div className="live-command-copy">
            <div>
              <h1>小希星圖電波局</h1>
              <p>
                十二個獨立監測頁已接上星圖雷達。從平原循環、虛空裂縫，到突擊、執政官獵殺與 Baro 商船，
                每一區都能單獨開啟、完整閱讀。
              </p>
            </div>
            <div className="live-radar-orb" aria-hidden="true"><span><RadioTower size={28} /></span></div>
          </div>

          <div className="live-sync-badge">
            <span>最後同步：{formatWorldTime(data?.timestamp)}</span>
            <b>{data ? "訊號在線" : "等待重連"}</b>
          </div>
        </section>

        {!data ? (
          <section className="live-error live-tech-frame">
            星圖電波暫時失聯，外部資料源可能回應過慢。所有獨立頁面仍可開啟，重新進入時會再次捕捉訊號。
          </section>
        ) : (
          <>
            <section className="live-signal-strip" aria-label="小希星圖雷達摘要">
              {signalCards.map((card) => (
                <Link href={`/live/${card.slug}`} className={`live-signal-chip live-tech-frame live-signal-${card.tone}`} key={card.label}>
                  <span>{card.label}</span>
                  <b>{card.value}</b>
                  <small>{card.hint}</small>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </section>

            <section className="live-station-directory live-tech-frame">
              <div className="live-directory-heading">
                <div>
                  <p>KETHER SIGNAL DIRECTORY</p>
                  <h2>電波局獨立頁面</h2>
                </div>
                <span>12 個監測節點</span>
              </div>

              {stationGroups.map((group) => (
                <div className="live-station-group" key={group}>
                  <h3>{group}</h3>
                  <div className="live-station-grid">
                    {LIVE_STATIONS.filter((station) => station.group === group).map((station) => (
                      <Link key={station.slug} href={`/live/${station.slug}`} className={`live-station-tile live-station-${station.tone}`}>
                        <i aria-hidden="true">{station.glyph}</i>
                        <span>
                          <b>{station.shortTitle}</b>
                          <small>{station.kicker}</small>
                        </span>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="live-grid live-grid-primary">
              <InfoCard slug="cetus" title="希圖斯晝夜儀" value={cycleText(data.cetusCycle)} tone="day" />
              <InfoCard slug="vallis" title="奧布寒熱雷達" value={cycleText(data.vallisCycle)} tone="cold" />
              <InfoCard slug="cambion" title="魔胎輪迴觀測" value={cycleText(data.cambionCycle)} tone="void" />
              <InfoCard slug="zariman" title="札日曼虛空回聲" value={cycleText(data.zarimanCycle)} tone="void" />
              <InfoCard slug="duviri" title="渡域情緒天氣" value={cycleText(data.duviriCycle)} tone="dream" />
              <InfoCard
                slug="baro"
                title="Baro 虛空商人雷達"
                value={data.voidTrader?.active ? "已抵達" : "尚未抵達"}
                tone={data.voidTrader?.active ? "baro-active" : "baro"}
                sub={`${label(data.voidTrader?.location, "位置未公布")}｜${etaText(data.voidTrader, "商船時間追蹤中")}`}
              />
            </section>

            <section className="live-section live-tech-frame">
              <SectionHeading title="虛空裂縫喵眼雷達" count={`${allFissures.length} 筆訊號`} slug="fissures" />
              <div className="live-list">
                {activeFissures.length ? activeFissures.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? `${item.node}-${item.expiry ?? item.eta}`}>
                    <b>{label(item.tier)}｜{zhMission(item.missionType)}</b>
                    <span>{label(item.node)}｜{zhFaction(item.enemy)}｜剩餘 {etaText(item)}</span>
                  </article>
                )) : <p className="live-empty">目前沒有捕捉到可顯示的裂縫訊號。</p>}
              </div>
            </section>

            <section className="live-section live-tech-frame">
              <SectionHeading title="入侵戰線警報" count={`${allInvasions.length} 筆戰報`} slug="invasions" />
              <div className="live-list">
                {activeInvasions.length ? activeInvasions.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? item.node}>
                    <b>{label(item.node)}</b>
                    <span>
                      {zhFaction(item.attackingFaction || item.attacker?.faction)} vs {zhFaction(item.defendingFaction || item.defender?.faction)}
                      ｜戰線進度 {Math.round(item.completion ?? 0)}%
                    </span>
                  </article>
                )) : <p className="live-empty">目前戰線安靜，沒有可顯示的入侵情報。</p>}
              </div>
            </section>

            <section className="live-grid">
              <InfoCard slug="sortie" title="突擊任務占卜盤" value={label(sortie?.boss, "資料同步中")} tone="danger" sub={`${zhFaction(sortie?.faction)}｜${etaText(sortie)}`} />
              <InfoCard slug="archon-hunt" title="執政官獵殺封印書" value={label(data.archonHunt?.boss, "資料同步中")} tone="archon" sub={`${zhFaction(data.archonHunt?.faction)}｜${etaText(data.archonHunt)}`} />
              <InfoCard slug="alerts" title="特殊警報電波" value={`${data.alerts?.length ?? 0} 筆`} tone="alert" sub="節點、任務與限時獎勵訊號" />
            </section>

            <section className="live-section live-tech-frame">
              <SectionHeading title="Tenno 通訊光簡" count={`${latestNews.length} 則預覽`} slug="news" />
              <div className="live-list">
                {latestNews.length ? latestNews.map((item) => (
                  <article className="live-row live-tech-frame" key={item.id ?? item.message}>
                    <b>{label(item.message, "官方新聞")}</b>
                    <span>{etaText(item, "官方通訊")}</span>
                  </article>
                )) : <p className="live-empty">目前沒有新的通訊光簡。</p>}
              </div>
            </section>
          </>
        )}

        <p className="live-source">星圖資料來源：WarframeStat.us Worldstate API｜KETHER 小希電波轉譯中。</p>
      </section>
    </LiveChrome>
  );
}

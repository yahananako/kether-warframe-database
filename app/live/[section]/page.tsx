import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, House, RadioTower } from "lucide-react";
import { notFound } from "next/navigation";

import LiveChrome from "../../../components/LiveChrome";
import {
  LIVE_STATIONS,
  type Cycle,
  type LiveStationSlug,
  type WorldState,
  cycleText,
  etaText,
  formatReward,
  formatWorldTime,
  getActiveFissures,
  getActiveInvasions,
  getSortie,
  getStation,
  getWorldState,
  label,
  zhCycle,
  zhFaction,
  zhMission,
} from "../../../lib/worldState";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return LIVE_STATIONS.map((station) => ({ section: station.slug }));
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  const station = getStation(section);
  if (!station) return {};
  return {
    title: `${station.title}｜小希星圖電波局`,
    description: station.description,
  };
}

function EmptySignal({ children }: { children: string }) {
  return (
    <div className="live-detail-empty">
      <RadioTower size={24} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

function DetailRow({
  title,
  detail,
  meta,
  badges = [],
}: {
  title: string;
  detail: string;
  meta: string;
  badges?: string[];
}) {
  return (
    <article className="live-detail-row">
      <div className="live-detail-row-top">
        <h3>{title}</h3>
        <div>{badges.filter(Boolean).map((badge) => <span key={badge}>{badge}</span>)}</div>
      </div>
      <p>{detail}</p>
      <small><Clock3 size={14} aria-hidden="true" />{meta}</small>
    </article>
  );
}

function CyclePanel({ cycle, guide }: { cycle?: Cycle; guide: string }) {
  return (
    <div className="live-cycle-detail-grid">
      <article className="live-cycle-focus">
        <span>目前狀態</span>
        <strong>{zhCycle(cycle?.state || cycle?.active)}</strong>
        <p>{etaText(cycle, "循環時間同步中")}</p>
        <div className="live-cycle-ring" aria-hidden="true"><i /></div>
      </article>
      <article className="live-detail-guide-card">
        <span>小希行動建議</span>
        <h2>先看剩餘時間，再決定任務路線</h2>
        <p>{guide}</p>
        <dl>
          <div><dt>循環</dt><dd>{cycleText(cycle)}</dd></div>
          <div><dt>切換時間</dt><dd>{formatWorldTime(cycle?.expiry, "時間同步中")}</dd></div>
        </dl>
      </article>
    </div>
  );
}

function DetailContent({ slug, data, guide }: { slug: LiveStationSlug; data: WorldState; guide: string }) {
  const cycleBySlug: Partial<Record<LiveStationSlug, Cycle | undefined>> = {
    cetus: data.cetusCycle,
    vallis: data.vallisCycle,
    cambion: data.cambionCycle,
    zariman: data.zarimanCycle,
    duviri: data.duviriCycle,
  };

  if (slug in cycleBySlug) return <CyclePanel cycle={cycleBySlug[slug]} guide={guide} />;

  if (slug === "baro") {
    return (
      <div className="live-cycle-detail-grid">
        <article className="live-cycle-focus live-baro-focus">
          <span>商船狀態</span>
          <strong>{data.voidTrader?.active ? "已抵達" : "尚未抵達"}</strong>
          <p>{etaText(data.voidTrader, "商船時間同步中")}</p>
          <div className="live-baro-sigil" aria-hidden="true">✦</div>
        </article>
        <article className="live-detail-guide-card">
          <span>VOID TRADER LOCATION</span>
          <h2>{label(data.voidTrader?.location, "位置尚未公布")}</h2>
          <p>{guide}</p>
          <dl>
            <div><dt>商人</dt><dd>{label(data.voidTrader?.character, "Baro Ki'Teer")}</dd></div>
            <div><dt>時間</dt><dd>{etaText(data.voidTrader)}</dd></div>
          </dl>
        </article>
      </div>
    );
  }

  if (slug === "fissures") {
    const fissures = getActiveFissures(data);
    return fissures.length ? (
      <div className="live-detail-list">
        {fissures.map((item) => (
          <DetailRow
            key={item.id ?? `${item.node}-${item.expiry ?? item.eta}`}
            title={`${label(item.tier)}｜${zhMission(item.missionType)}`}
            detail={`${label(item.node)}｜${zhFaction(item.enemy)}`}
            meta={`剩餘 ${etaText(item)}`}
            badges={[item.isStorm ? "虛空風暴" : "虛空裂縫", item.isHard ? "鋼韌之道" : ""]}
          />
        ))}
      </div>
    ) : <EmptySignal>目前沒有捕捉到有效的虛空裂縫。</EmptySignal>;
  }

  if (slug === "invasions") {
    const invasions = getActiveInvasions(data);
    return invasions.length ? (
      <div className="live-detail-list">
        {invasions.map((item) => {
          const attacking = item.attackingFaction || item.attacker?.faction;
          const defending = item.defendingFaction || item.defender?.faction;
          return (
            <article className="live-detail-row live-invasion-row" key={item.id ?? item.node}>
              <div className="live-detail-row-top">
                <h3>{label(item.node)}</h3>
                <span>{Math.round(item.completion ?? 0)}%</span>
              </div>
              <p>{zhFaction(attacking)} vs {zhFaction(defending)}</p>
              <progress max="100" value={Math.abs(item.completion ?? 0)} aria-label="入侵進度" />
              <div className="live-invasion-rewards">
                <span><b>進攻</b>{formatReward(item.attacker?.reward)}</span>
                <span><b>防守</b>{formatReward(item.defender?.reward)}</span>
              </div>
            </article>
          );
        })}
      </div>
    ) : <EmptySignal>目前沒有進行中的入侵戰線。</EmptySignal>;
  }

  if (slug === "sortie") {
    const sortie = getSortie(data);
    const missions = sortie?.variants || sortie?.missions || [];
    return (
      <>
        <section className="live-detail-summary-card">
          <span>本日頭目</span>
          <h2>{label(sortie?.boss, "突擊資料同步中")}</h2>
          <p>{zhFaction(sortie?.faction)}｜剩餘 {etaText(sortie)}</p>
        </section>
        {missions.length ? (
          <div className="live-detail-list live-numbered-list">
            {missions.map((mission, index) => (
              <DetailRow
                key={`${mission.node}-${index}`}
                title={`第 ${index + 1} 階｜${zhMission(mission.missionType || mission.type)}`}
                detail={label(mission.node, "節點同步中")}
                meta={label(mission.modifierDescription || mission.modifier, "特殊條件同步中")}
                badges={[zhFaction(mission.faction || sortie?.faction)]}
              />
            ))}
          </div>
        ) : <EmptySignal>突擊任務階段資料同步中。</EmptySignal>}
      </>
    );
  }

  if (slug === "archon-hunt") {
    const hunt = data.archonHunt;
    const missions = hunt?.missions || hunt?.variants || [];
    return (
      <>
        <section className="live-detail-summary-card live-archon-summary">
          <span>本週執政官</span>
          <h2>{label(hunt?.boss, "執政官資料同步中")}</h2>
          <p>{zhFaction(hunt?.faction)}｜剩餘 {etaText(hunt)}</p>
        </section>
        {missions.length ? (
          <div className="live-detail-list live-numbered-list">
            {missions.map((mission, index) => (
              <DetailRow
                key={`${mission.node}-${index}`}
                title={`封印 ${index + 1}｜${zhMission(mission.missionType || mission.type)}`}
                detail={label(mission.node, "節點同步中")}
                meta={label(mission.modifierDescription || mission.modifier, "執政官獵殺任務")}
              />
            ))}
          </div>
        ) : <EmptySignal>執政官獵殺任務階段同步中。</EmptySignal>}
      </>
    );
  }

  if (slug === "alerts") {
    const alerts = data.alerts || [];
    return alerts.length ? (
      <div className="live-detail-list">
        {alerts.map((item) => (
          <DetailRow
            key={item.id ?? `${item.mission?.node}-${item.expiry}`}
            title={label(item.mission?.node, "特殊警報")}
            detail={`${zhMission(item.mission?.type || item.mission?.missionType)}｜${zhFaction(item.mission?.faction)}`}
            meta={`${formatReward(item.mission?.reward)}｜剩餘 ${etaText(item)}`}
            badges={["限時"]}
          />
        ))}
      </div>
    ) : <EmptySignal>目前沒有特殊警報；本頁會在訊號出現時自動顯示。</EmptySignal>;
  }

  const news = data.news || [];
  return news.length ? (
    <div className="live-news-grid">
      {news.map((item) => {
        const content = (
          <>
            <span>{item.priority ? "重要通訊" : "官方通訊"}</span>
            <h2>{label(item.message, "Warframe 官方新聞")}</h2>
            <p>{formatWorldTime(item.date || item.activation, etaText(item, "時間未提供"))}</p>
            {item.link ? <small>開啟原始公告 <ArrowUpRight size={14} aria-hidden="true" /></small> : null}
          </>
        );
        return item.link ? (
          <a key={item.id ?? item.message} href={item.link} target="_blank" rel="noreferrer" className="live-news-card">{content}</a>
        ) : (
          <article key={item.id ?? item.message} className="live-news-card">{content}</article>
        );
      })}
    </div>
  ) : <EmptySignal>目前沒有新的 Tenno 通訊。</EmptySignal>;
}

export default async function LiveDetailPage({ params }: PageProps) {
  const { section } = await params;
  const station = getStation(section);
  if (!station) notFound();

  const data = await getWorldState();
  const slug = station.slug as LiveStationSlug;

  return (
    <LiveChrome>
      <section className="kether-live-content-shell live-detail-shell">
        <header className={`live-detail-hero live-tech-frame live-station-${station.tone}`}>
          <div className="live-detail-breadcrumbs">
            <Link href="/"><House size={15} aria-hidden="true" />首頁</Link>
            <span>/</span>
            <Link href="/live">電波局</Link>
            <span>/</span>
            <b>{station.shortTitle}</b>
          </div>
          <div className="live-detail-hero-copy">
            <div className="live-detail-glyph" aria-hidden="true">{station.glyph}</div>
            <div>
              <p>{station.kicker}</p>
              <h1>{station.title}</h1>
              <span>{station.description}</span>
            </div>
          </div>
          <div className="live-detail-hero-foot">
            <Link href="/live"><ArrowLeft size={16} aria-hidden="true" />返回電波局</Link>
            <span>同步：{formatWorldTime(data?.timestamp)}</span>
          </div>
        </header>

        <nav className="live-detail-station-nav" aria-label="其他電波局頁面">
          {LIVE_STATIONS.map((item) => (
            <Link key={item.slug} href={`/live/${item.slug}`} className={item.slug === slug ? "is-active" : ""}>
              <i aria-hidden="true">{item.glyph}</i>
              <span>{item.shortTitle}</span>
            </Link>
          ))}
        </nav>

        <section className="live-detail-content live-tech-frame">
          <div className="live-detail-content-heading">
            <div>
              <p>LIVE DATA BOARD</p>
              <h2>即時監測資料</h2>
            </div>
            <span>{data ? "ONLINE" : "RECONNECTING"}</span>
          </div>

          {data ? (
            <DetailContent slug={slug} data={data} guide={station.guide} />
          ) : (
            <EmptySignal>星圖電波暫時失聯，請稍後重新進入此頁。</EmptySignal>
          )}
        </section>

        <aside className="live-detail-guide-strip">
          <RadioTower size={21} aria-hidden="true" />
          <div><b>小希監測備註</b><p>{station.guide}</p></div>
        </aside>

        <p className="live-source">星圖資料來源：WarframeStat.us Worldstate API｜每次進入本頁重新捕捉。</p>
      </section>
    </LiveChrome>
  );
}

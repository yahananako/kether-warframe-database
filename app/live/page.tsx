import Link from "next/link";
import {ArrowRight,ArrowUpRight,RadioTower,Activity,ScanLine,RefreshCw} from "lucide-react";
import {LIVE_STATIONS,cycleText,etaText,formatWorldTime,getActiveFissures,getActiveInvasions,getSortie,getWorldState,label,zhFaction,zhMission} from "../../lib/worldState";
import styles from "./signal-command.module.css";
export const dynamic="force-dynamic";
export const fetchCache="force-no-store";
function StationLink({slug,children}:{slug:string;children:React.ReactNode}){
  return <Link href={"/live/"+slug} className={styles.actionLink}>{children}<ArrowUpRight size={15} aria-hidden="true"/></Link>;
}
export default async function LivePage(){
  const data=await getWorldState();
  const fissures=getActiveFissures(data), invasions=getActiveInvasions(data);
  const sortie=getSortie(data),news=data?.news?.slice(0,5)??[];
  const activeFissures=fissures.slice(0,6),activeInvasions=invasions.slice(0,5);
  const stations=[
    {slug:"cetus",title:"希圖斯晝夜",value:cycleText(data?.cetusCycle),label:"CETUS CYCLE"},
    {slug:"vallis",title:"奧布寒熱",value:cycleText(data?.vallisCycle),label:"ORB VALLIS"},
    {slug:"cambion",title:"魔胎輪迴",value:cycleText(data?.cambionCycle),label:"CAMBION DRIFT"},
    {slug:"zariman",title:"札日曼",value:cycleText(data?.zarimanCycle),label:"ZARIMAN"},
    {slug:"duviri",title:"渡域情緒",value:cycleText(data?.duviriCycle),label:"DUVIRI SPIRAL"},
    {slug:"baro",title:"Baro 商人",value:data?.voidTrader?.active?"已抵達":"尚未抵達",label:"VOID TRADER"},
  ];
  const signalGroups=Array.from(new Set(LIVE_STATIONS.map(station=>station.group)));
  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}><RadioTower size={15}/> KETHER SIGNAL COMMAND / ORIGIN SYSTEM</p>
        <h1>星圖電波 <span>監測中心</span></h1>
        <p>Tenno 的即時任務、循環與戰線，在同一座控制台掌握。</p></div>
      <div className={styles.online}><span className={data?styles.pulse:styles.offlinePulse}/>
        <strong>{data?"訊號在線":"訊號失聯"}</strong>
        <small>同步：{formatWorldTime(data?.timestamp)}</small></div>
    </header>
    <div className={styles.deck}>
      <aside className={styles.directory}>
        <div className={styles.panelHeading}><span>01 / SIGNAL ROUTING</span><h2>監測節點</h2></div>
        <nav className={styles.stationScroll} aria-label="全部星圖電波監測節點">
          {signalGroups.map(group=><section key={group}>
            <h3>{group}</h3>
            {LIVE_STATIONS.filter(station=>station.group===group).map(station=>
              <Link key={station.slug} href={"/live/"+station.slug} className={styles.station}>
                <i aria-hidden="true">{station.glyph}</i>
                <span><strong>{station.shortTitle}</strong><small>{station.kicker}</small></span>
                <ArrowUpRight size={15} aria-hidden="true"/>
              </Link>)}
          </section>)}
        </nav>
        <Link href="/bot" className={styles.bot}><ScanLine size={16}/> KETHER 氏族 BOT 查詢 <ArrowRight size={16}/></Link>
      </aside>
      <section className={styles.radar}>
        <div className={styles.panelHeading}><span>02 / WORLDSTATE</span><h2>始源星系雷達</h2></div>
        <div className={styles.radarScroll}>
          {!data&&<div className={styles.error} role="status"><RefreshCw size={19}/> 即時資料來源暫時失聯，所有監測頁面仍可開啟。</div>}
          <div className={styles.radarVisual} aria-hidden="true"><div className={styles.radarRing}><RadioTower size={32}/></div><span>ORIGIN SYSTEM / SIGNAL GRID</span></div>
          <div className={styles.signalSummary}>
            {[
              {slug:"fissures",label:"虛空裂縫",value:data?String(fissures.length):"—",hint:"訊號"},
              {slug:"invasions",label:"入侵戰線",value:data?String(invasions.length):"—",hint:"戰報"},
              {slug:"alerts",label:"特殊警報",value:data?String(data.alerts?.length??0):"—",hint:"警報"},
              {slug:"news",label:"官方通訊",value:data?String(data.news?.length??0):"—",hint:"訊息"},
            ].map(stat=><Link key={stat.slug} href={"/live/"+stat.slug} className={styles.summaryCard}>
              <small>{stat.label}</small><strong>{stat.value}</strong><span>{stat.hint} <ArrowUpRight size={13}/></span></Link>)}
          </div>
          <section className={styles.cycleSection} aria-label="星球與商人狀態">
            <div className={styles.subhead}><Activity size={16}/><h3>循環與商人速報</h3></div>
            <div className={styles.cycles}>{stations.map(station=>
              <Link key={station.slug} href={"/live/"+station.slug} className={styles.cycle}>
                <span>{station.label}</span><strong>{data?station.value:"等待重連"}</strong>
                <small>{station.title}</small></Link>)}</div>
          </section>
        </div>
      </section>
      <aside className={styles.feed}>
        <div className={styles.panelHeading}><span>03 / LIVE DISPATCH</span><h2>戰區情報流</h2></div>
        <div className={styles.feedScroll}>
          <section className={styles.feedSection}>
            <div className={styles.feedTitle}><h3>虛空裂縫 <small>{data?fissures.length:"—"} 筆</small></h3><StationLink slug="fissures">完整列表</StationLink></div>
            {activeFissures.length?activeFissures.map(item=><article key={item.id??(item.node+"-"+item.expiry)} className={styles.feedItem}>
              <b>{label(item.tier)} · {zhMission(item.missionType)}</b>
              <span>{label(item.node)} · {zhFaction(item.enemy)}</span>
              <small>剩餘 {etaText(item)}</small>
            </article>):<p className={styles.empty}>{data?"目前沒有裂縫訊號":"等待即時星圖資料"}</p>}
          </section>
          <section className={styles.feedSection}>
            <div className={styles.feedTitle}><h3>入侵戰線 <small>{data?invasions.length:"—"} 筆</small></h3><StationLink slug="invasions">完整列表</StationLink></div>
            {activeInvasions.length?activeInvasions.map(item=><article key={item.id??item.node} className={styles.feedItem}>
              <b>{label(item.node)}</b><span>{zhFaction(item.attackingFaction||item.attacker?.faction)} vs {zhFaction(item.defendingFaction||item.defender?.faction)}</span>
              <small>戰線進度 {Math.round(item.completion??0)}%</small>
            </article>):<p className={styles.empty}>{data?"目前沒有進行中的入侵":"等待戰報"}</p>}
          </section>
          <section className={styles.feedSection}>
            <div className={styles.feedTitle}><h3>突擊與執政官</h3><StationLink slug="sortie">突擊詳情</StationLink></div>
            <Link className={styles.feedItemLink} href="/live/sortie">每日突擊 · {label(sortie?.boss,"同步中")}</Link>
            <Link className={styles.feedItemLink} href="/live/archon-hunt">執政官獵殺 · {label(data?.archonHunt?.boss,"同步中")}</Link>
          </section>
          <section className={styles.feedSection}>
            <div className={styles.feedTitle}><h3>Tenno 官方通訊</h3><StationLink slug="news">新聞列表</StationLink></div>
            {news.length?news.map(item=><article className={styles.feedItem} key={item.id??item.message}>
              <b>{label(item.message,"官方新聞")}</b><small>{etaText(item,"官方通訊")}</small>
            </article>):<p className={styles.empty}>目前沒有新通訊。</p>}
          </section>
        </div>
        <footer className={styles.source}>資料來源：WarframeStat.us Worldstate API</footer>
      </aside>
    </div>
  </main>;
}

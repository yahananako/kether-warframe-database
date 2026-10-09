"use client";

import {useState, type CSSProperties} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,BookOpenText,ExternalLink,Gauge,MapPin,ShieldCheck,Sparkles,Wrench} from "lucide-react";
import type {WarframeDetail} from "../data/warframeDetails";
import WarframeMarketCard from "./WarframeMarketCard";
import styles from "./WarframeDossier.module.css";

type DossierTab = "abilities"|"acquisition"|"lore"|"market";
type Lore = {heading:string;era:string;summary:string;paragraphs:string[];source:{url:string;label:string};accent:string};
const tabs:{key:DossierTab;label:string;en:string}[]=[
  {key:"abilities",label:"技能",en:"ABILITIES"},
  {key:"acquisition",label:"取得",en:"ACQUISITION"},
  {key:"lore",label:"傳記",en:"CHRONICLE"},
  {key:"market",label:"交易",en:"MARKET"},
];
export default function WarframeDossier({
  warframe,acquisition,roleLabel,roleEnglish,roleDescription,lore,updatedAt
}:{
  warframe:WarframeDetail;
  acquisition:string;
  roleLabel:string;
  roleEnglish:string;
  roleDescription:string;
  lore:Lore|null;
  updatedAt:string;
}){
  const [tab,setTab]=useState<DossierTab>("abilities");
  const [ability,setAbility]=useState(0);
  const [broken,setBroken]=useState(false);
  const currentAbility=warframe.abilities[ability]??null;
  return <main className={styles.dossier}>
    <div className={styles.toolbar}>
      <Link href="/database/warframes" className={styles.back}><ArrowLeft size={16}/> 返回戰甲檔案庫</Link>
      <span className={styles.systemTag}>KETHER / WARFRAME DOSSIER / {roleEnglish.toUpperCase()}</span>
      <span className={styles.updated}>資料更新 {updatedAt}</span>
    </div>
    <div className={styles.stage}>
      <section className={styles.showcase} aria-labelledby="warframe-dossier-name">
        <div className={styles.showcaseText}>
          <p className={styles.eyebrow}><Sparkles size={15}/> TENNO WARFRAME DOSSIER</p>
          <h1 id="warframe-dossier-name">{warframe.name}</h1>
          <span className={styles.badge}>{roleLabel}型戰甲</span>
          <p className={styles.description}>{warframe.description}</p>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.ring} aria-hidden="true"/>
          <img src={broken?"/icon-warframe-2.png":warframe.imageUrl}
            onError={()=>setBroken(true)} alt={warframe.name+" 戰甲全身圖"} />
          <span className={styles.visualCaption}>{roleDescription}</span>
        </div>
        <div className={styles.bottomActions}>
          <Link className={styles.buildButton} href={"/database/warframes/"+warframe.slug+"/build"}>
            <Wrench size={16}/> 打開獨立配裝 <ArrowRight size={16}/>
          </Link>
          <a href={warframe.officialUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> 官方戰甲頁</a>
          {warframe.name==="Excalibur"&&<Link href="/database/warframes/excalibur-umbra">Umbra 專屬檔案</Link>}
        </div>
      </section>
      <section className={styles.intelligence} aria-label="戰甲資訊分析">
        <div className={styles.stats} aria-label="戰甲基礎數值">
          {([["生命",warframe.stats.health],["護盾",warframe.stats.shield],
            ["護甲",warframe.stats.armor],["能量",warframe.stats.energy],
            ["衝刺",warframe.stats.sprint]] as [string,number][]).map(([label,value])=>
            <div key={label}><Gauge size={16}/><span>{label}</span><strong>{value}</strong></div>
          )}
        </div>
        <div className={styles.workspace}>
          <div className={styles.tabs} role="tablist" aria-label="戰甲資訊分類">
            {tabs.map(item=><button type="button" key={item.key}
              role="tab" id={"dossier-"+item.key} aria-selected={tab===item.key}
              aria-controls="dossier-content" onClick={()=>setTab(item.key)}>
              <b>{item.label}</b><small>{item.en}</small>
            </button>)}
          </div>
          <div className={styles.tabContent} role="tabpanel" id="dossier-content" aria-labelledby={"dossier-"+tab}>
            {tab==="abilities"&&<div className={styles.abilities}>
              <header><p className={styles.eyebrow}>COMBAT ABILITIES</p><h2>技能作戰分析</h2></header>
              {warframe.abilities.length>0?<><div className={styles.abilityNav} role="group" aria-label="選擇戰甲技能">
                {warframe.abilities.map((item,i)=><button type="button" key={item.number}
                  aria-pressed={ability===i} onClick={()=>setAbility(i)}>
                  <span>{String(item.number).padStart(2,"0")}</span>
                  {item.imageUrl?<img src={item.imageUrl} alt=""/>:<Sparkles size={23}/>}
                  <strong>{item.name}</strong>
                </button>)}
              </div>{currentAbility&&<article className={styles.abilityDetail}>
                <small>ABILITY {String(currentAbility.number).padStart(2,"0")}</small>
                <h3>{currentAbility.name}</h3><p>{currentAbility.description}</p>
              </article>}</>:<p>技能資料整理中。</p>}
              <aside className={styles.passive}><Sparkles size={17}/><div><strong>被動技能</strong>
                <p>{warframe.passiveDescription||"被動技能資料整理中。"}</p></div></aside>
            </div>}
            {tab==="acquisition"&&<div className={styles.acquisition}>
              <header><p className={styles.eyebrow}>ACQUISITION ROUTE</p><h2>取得途徑與部件</h2></header>
              <div className={styles.introLine}><MapPin size={19}/><p>{acquisition}</p></div>
              <div className={styles.componentGrid}>
                {warframe.components.length?warframe.components.map(part=><article key={part.name}>
                  <h3>{part.name}</h3>
                  {part.drops.length?<ul>{part.drops.map((drop,i)=><li key={drop.location+"-"+i}>
                    <span>{drop.location}</span>
                    <strong>{drop.chance==null?(drop.rarity||"任務獎勵"):drop.chance.toFixed(2)+"%"}</strong>
                  </li>)}</ul>:<p>依上方任務流程取得。</p>}
                </article>):<p>此戰甲沒有可拆分顯示的部件掉落資料。</p>}
              </div>
            </div>}
            {tab==="lore"&&<div className={styles.chronicle} style={{"--lore-accent":lore?.accent||"#9ce7e5"} as CSSProperties}>
              <header><p className={styles.eyebrow}>CHRONICLE / CODEX</p><h2>故事與角色設定</h2></header>
              {lore?<article><span>{lore.era}</span><h3>{lore.heading}</h3><strong>{lore.summary}</strong>
                {lore.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
                <a href={lore.source.url} target="_blank" rel="noopener noreferrer">
                  {lore.source.label} <ExternalLink size={14}/>
                </a></article>:<p>此角色目前沒有獨立的遊戲內傳記；可從技能及官方資料了解更多。</p>}
            </div>}
            {tab==="market"&&<div className={styles.market}>
              <header><p className={styles.eyebrow}>TENNO TRADING SIGNAL</p><h2>市場與 Prime 情報</h2></header>
              <WarframeMarketCard name={warframe.name} marketSlug={warframe.marketSlug} hasPrime={warframe.hasPrime}/>
              <p className={styles.marketNote}><ShieldCheck size={16}/> 交易資料為外部即時查詢，實際成交價格可能變動。</p>
            </div>}
          </div>
        </div>
      </section>
    </div>
  </main>;
}

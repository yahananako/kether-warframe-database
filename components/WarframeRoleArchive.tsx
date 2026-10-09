"use client";
import {ArrowRight,ArrowUpRight,BookOpenText,ChevronRight,Crosshair,EyeOff,HeartPulse,MapPin,Search,Shield,Sparkles,Wind,X} from "lucide-react";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import type {RegularWarframe} from "../data/regularWarframes";
import {warframeCanonProfileMap} from "../data/warframeCanonProfiles";
import {getWarframeDetail,toWarframeSlug} from "../data/warframeDetails";
import {getWarframeRole,isWarframeName,normalizeWarframeName,WARFRAME_ROLES,type WarframeRole} from "../data/warframeRoles";
import {warframeStories} from "../data/warframeStories";
import type {SheetRow} from "../lib/sheets";
import DataTable from "./DataTable";
import styles from "./WarframeCommandDeck.module.css";
type ArchiveProps =
  | {mode:"regular";regularFrames:RegularWarframe[];rows?:never}
  | {mode:"prime";rows:SheetRow[];regularFrames?:never};
const roles:WarframeRole[]=["damage","control","support","survival","stealth"];
const icons={damage:Crosshair,control:Wind,support:HeartPulse,survival:Shield,stealth:EyeOff};
const overrides:Record<string,string>={Baruuk:"Pacifist.png","Cyte-09":"Frumentarius.png",Dante:"Pagemaster.png",Sevagoth:"Wraith.png"};
function defaultImage(name:string){return "https://cdn.warframestat.us/img/"+(overrides[name]??name.replace(/[^A-Za-z0-9]/g,"")+".png");}
function Artwork({name,src,hero=false}:{name:string;src?:string;hero?:boolean}){
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[name,src]);
  return <img src={failed?"/icon-warframe-2.png":(src||defaultImage(name))} alt={name+" 戰甲外觀"} loading={hero?"eager":"lazy"} onError={()=>setFailed(true)}/>;
}
function priceText(value:string){const s=String(value||"").trim();return !s?"價格待更新":/(白金|待更新|不可交易|拍賣|浮動)/.test(s)?s:s+" 白金";}
export default function WarframeRoleArchive(props:ArchiveProps){
  const [role,setRole]=useState<WarframeRole|"all">("all");
  const [query,setQuery]=useState("");
  const [selectedName,setSelectedName]=useState<string|null>(null);
  const [inspect,setInspect]=useState(false);
  const [showTable,setShowTable]=useState(false);
  const [filtersRestored,setFiltersRestored]=useState(false);
  const filterKey="kether-warframe-filters-v1:"+props.mode;

  useEffect(()=>{
    try {
      const parsed=JSON.parse(sessionStorage.getItem(filterKey)||"null") as
        {role?:string;query?:string;selectedName?:string}|null;
      if(parsed){
        if(parsed.role==="all"||roles.some(item=>item===parsed.role))
          setRole(parsed.role as WarframeRole|"all");
        if(typeof parsed.query==="string")setQuery(parsed.query.slice(0,200));
        if(typeof parsed.selectedName==="string")setSelectedName(parsed.selectedName.slice(0,100));
      }
    } catch {/* A corrupt or blocked session store must not hide the archive. */}
    setFiltersRestored(true);
  },[filterKey]);
  useEffect(()=>{
    if(!filtersRestored)return;
    try {sessionStorage.setItem(filterKey,JSON.stringify({role,query,selectedName}));}catch{}
  },[filterKey,filtersRestored,role,query,selectedName]);

  const stories=useMemo(()=>new Map(warframeStories.map(story=>[normalizeWarframeName(story.name),story])),[]);
  const entries=useMemo(()=>{
    const raw=props.mode==="regular"?
      props.regularFrames.map(frame=>({name:frame.name,chineseName:"一般戰甲",description:"",price:"",marketUrl:"",acquisition:frame.acquisition})):
      props.rows.filter(row=>/\bPrime\b/i.test(row.englishName)&&isWarframeName(row.englishName))
        .map(row=>({name:row.englishName,chineseName:row.chineseName,description:row.description||row.note,price:row.price,marketUrl:row.marketUrl,acquisition:""}));
    return raw.map(entry=>{
      const norm=normalizeWarframeName(entry.name);
      const detail=getWarframeDetail(entry.name);
      return {entry,role:getWarframeRole(entry.name,entry.description),story:norm==="excalibur"?undefined:stories.get(norm),
        profile:warframeCanonProfileMap.get(norm),detailSlug:detail?.slug??toWarframeSlug(entry.name),
        image:detail?.imageUrl||defaultImage(entry.name)};
    });
  },[props,stories]);
  const counts=useMemo(()=>Object.fromEntries(roles.map(key=>[key,entries.filter(item=>item.role===key).length])),[entries]) as Record<WarframeRole,number>;
  const match=query.trim().toLowerCase();
  const visible=entries.filter(item=>(role==="all"||item.role===role)&&
    [item.entry.name,item.entry.chineseName,item.entry.description,item.entry.acquisition].join(" ").toLowerCase().includes(match));
  const selected=visible.find(item=>item.entry.name===selectedName)??visible[0]??null;
  const lore=selected?.story??selected?.profile;
  useEffect(()=>{
    if(!inspect&&!showTable)return;
    const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setInspect(false);setShowTable(false);}};
    document.addEventListener("keydown",escape);
    return ()=>document.removeEventListener("keydown",escape);
  },[inspect,showTable]);
  return <section className={styles.deck} aria-label="KETHER 戰甲分析控制台">
    <header className={styles.topbar}>
      <div><p className={styles.eyebrow}><Sparkles size={13}/> KETHER / TENNO ARMORY / {props.mode.toUpperCase()}</p>
      <h1>{props.mode==="prime"?"Prime 戰甲":"一般戰甲"}<span>戰術圖鑑</span></h1></div>
      <nav className={styles.edition} aria-label="戰甲版本">
        <Link href="/database/warframes" aria-current={props.mode==="regular"?"page":undefined}>一般戰甲</Link>
        <Link href="/database/warframes/prime" aria-current={props.mode==="prime"?"page":undefined}>Prime 戰甲</Link>
      </nav>
    </header>
    <div className={styles.dashboard}>
      <aside className={styles.roles} aria-label="戰甲定位分類">
        <div className={styles.roleIntro}><p className={styles.eyebrow}>TACTICAL CLASSIFICATION</p><h2>戰場定位</h2><p>依戰鬥職責篩選戰甲。</p></div>
        <div className={styles.roleChoices} role="group" aria-label="選擇定位">
          <button type="button" aria-pressed={role==="all"} onClick={()=>setRole("all")}><Sparkles size={21}/><span><b>全部戰甲</b><small>ALL WARFRAMES</small></span><em>{entries.length}</em></button>
          {roles.map(key=>{const Icon=icons[key],info=WARFRAME_ROLES[key];
            return <button type="button" key={key} aria-pressed={role===key} onClick={()=>setRole(key)}>
              <Icon size={21}/><span><b>{info.label}</b><small>{info.english}</small></span><em>{counts[key]}</em></button>;
          })}
        </div>
        <p className={styles.roleHint}>{role==="all"?"選擇一項戰場定位，或瀏覽完整收錄。":WARFRAME_ROLES[role].description}</p>
      </aside>
      <section className={styles.roster} aria-labelledby="roster-title">
        <div className={styles.rosterTop}>
          <div><p className={styles.eyebrow}>UNIT DIRECTORY</p><h2 id="roster-title">{role==="all"?"戰甲全覽":WARFRAME_ROLES[role].label+"型戰甲"}</h2><small>顯示 {visible.length} / {entries.length} 位</small></div>
          <label className={styles.search}><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="搜尋戰甲名稱或用途" placeholder="搜尋戰甲、用途…"/></label>
        </div>
        <div className={styles.cardList} aria-label="戰甲清單">
          {visible.map(item=><button type="button" key={item.entry.name} className={styles.unit} aria-pressed={selected?.entry.name===item.entry.name}
            onClick={()=>{setSelectedName(item.entry.name);setInspect(true);}}>
            <span className={styles.unitImage}><Artwork name={item.entry.name} src={item.image}/></span>
            <span className={styles.unitLabels}><strong>{item.entry.name}</strong><small>{WARFRAME_ROLES[item.role].label}型戰甲</small></span>
            <ChevronRight size={17}/></button>)}
          {visible.length===0&&<p className={styles.empty}>沒有符合條件的戰甲，請調整搜尋條件。</p>}
        </div>
      </section>
      <aside className={styles.focus+(inspect?" "+styles.focusOpen:"")} aria-label="戰甲詳細資訊">
        {selected?<><div className={styles.focusTop}><p className={styles.eyebrow}>UNIT INSPECTION</p>
          <button type="button" className={styles.closeFocus} onClick={()=>setInspect(false)} aria-label="關閉戰甲詳細資訊"><X size={19}/></button></div>
          <div className={styles.focusScroll}>
            <div className={styles.visual}><span className={styles.halo}/><Artwork name={selected.entry.name} src={selected.image} hero/><small>{WARFRAME_ROLES[selected.role].english.toUpperCase()}</small></div>
            <div className={styles.unitProfile}><p>{selected.entry.chineseName||"WARFRAME"}</p><h2>{selected.entry.name}</h2>
              <span>{selected.entry.description||WARFRAME_ROLES[selected.role].description}</span></div>
            {props.mode==="regular"?<section className={styles.infoBox}><h3><MapPin size={17}/> 入手條件</h3><p>{selected.entry.acquisition}</p></section>
            :<section className={styles.infoBox}><h3><Sparkles size={17}/> 交易資訊</h3><b className={styles.price}>{priceText(selected.entry.price)}</b>
              {selected.entry.marketUrl?<a href={selected.entry.marketUrl} target="_blank" rel="noopener noreferrer">前往 Warframe Market <ArrowUpRight size={14}/></a>:<p>尚無交易網站連結</p>}</section>}
            {lore?<details className={styles.lore}><summary><BookOpenText size={16}/> 展開遊戲內故事 <ChevronRight size={16}/></summary>
              <div><h3>{lore.epithet}</h3><p>{lore.summary}</p>{lore.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
                <a href={lore.source.url} target="_blank" rel="noopener noreferrer">{lore.source.label} <ArrowUpRight size={14}/></a></div></details>
            :<p className={styles.noLore}>尚無可確認的遊戲內故事資料。</p>}
          </div>
          <Link className={styles.detailLink} href={"/database/warframes/"+selected.detailSlug}>技能、來源與獨立配裝 <ArrowRight size={18}/></Link>
        </>:<p className={styles.empty}>尚未找到符合條件的戰甲。</p>}
      </aside>
    </div>
    {props.mode==="prime"&&<><button className={styles.tradeAction} type="button" onClick={()=>setShowTable(true)}><BookOpenText size={17}/> 開啟 Prime 交易與個人持有資料表 <ArrowUpRight size={17}/></button>
      {showTable&&<div className={styles.tableOverlay} onMouseDown={e=>{if(e.target===e.currentTarget)setShowTable(false);}}>
        <section className={styles.tableDialog} role="dialog" aria-modal="true" aria-label="Prime 交易與個人持有資料表">
          <header><div><p className={styles.eyebrow}>PERSONAL ARCHIVE / PRIME</p><h2>Prime 交易與收藏進度</h2></div>
            <button type="button" onClick={()=>setShowTable(false)} aria-label="關閉 Prime 資料表"><X size={21}/></button></header>
          <div className={styles.tableContent}><DataTable rows={props.rows} category="warframes"/></div>
        </section></div>}</>}
  </section>;
}

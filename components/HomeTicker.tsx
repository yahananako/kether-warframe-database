"use client";
import {useEffect,useState} from "react";
import {ketherDynamicMessages} from "../data/siteUpdates";
import {useKetherEffects} from "./KetherEffectsProvider";
import styles from "./HomeImmersive.module.css";

const STORAGE_KEY="kether-ticker-state-v1";
type TickerState={index:number;paused:boolean};
export default function HomeTicker({onNotice,active=true}:{onNotice:(button:HTMLButtonElement)=>void;active?:boolean}){
  const {effectiveMode}=useKetherEffects();
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hover,setHover]=useState(false);
  const [restored,setRestored]=useState(false);
  const total=ketherDynamicMessages.length;

  useEffect(()=>{
    if(!active)return;
    try {
      const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null") as TickerState|null;
      if(stored&&Number.isSafeInteger(stored.index)&&total>0)
        setIndex(((stored.index%total)+total)%total);
      if(stored&&typeof stored.paused==="boolean")setPaused(stored.paused);
    } catch {/* Ticker works without storage. */}
    setRestored(true);
  },[total,active]);
  useEffect(()=>{
    if(!restored||!active)return;
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify({index,paused}));}catch{}
  },[index,paused,restored,active]);
  useEffect(()=>{
    if(!active||paused||hover||effectiveMode==="eco"||total===0)return;
    const timer=window.setInterval(()=>{
      if(!document.hidden)setIndex(i=>(i+1)%total);
    },6500);
    return ()=>window.clearInterval(timer);
  },[paused,hover,total,effectiveMode,active]);

  if(total===0)return null;
  return <section className={styles.ticker} aria-label="KETHER 動態資訊"
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
    <b>◉ KETHER 動態資訊</b>
    <button className={styles.tickerText} onClick={e=>onNotice(e.currentTarget)}>{ketherDynamicMessages[index]}</button>
    <button type="button" aria-label="上一則" onClick={()=>setIndex(i=>(i-1+total)%total)}>‹</button>
    <span>{index+1} / {total}</span>
    <button type="button" aria-label="下一則" onClick={()=>setIndex(i=>(i+1)%total)}>›</button>
    <button type="button" aria-label={paused?"播放跑馬燈":"暫停跑馬燈"}
      title={effectiveMode==="eco"?"省電模式會停止自動輪播，仍可手動切換訊息":undefined}
      onClick={()=>setPaused(value=>!value)}>{paused?"▶":"Ⅱ"}</button>
  </section>;
}

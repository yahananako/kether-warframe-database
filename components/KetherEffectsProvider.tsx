"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";

export type KetherEffectsMode = "full" | "balanced" | "eco";
type EffectsContextValue = {
  mode: KetherEffectsMode;
  effectiveMode: KetherEffectsMode;
  reducedMotion: boolean;
  setMode: (mode:KetherEffectsMode)=>void;
};

const STORAGE_KEY = "kether-effects-mode-v1";
const EffectsContext = createContext<EffectsContextValue | null>(null);
export const KETHER_EFFECTS_MODES = [
  {id:"full",name:"華麗",description:"完整背景影片與光效"},
  {id:"balanced",name:"平衡",description:"影片保留，降低背景動態"},
  {id:"eco",name:"省電",description:"靜態背景，保留功能與操作提示"},
] as const;

function isMode(value:unknown):value is KetherEffectsMode {
  return value === "full" || value === "balanced" || value === "eco";
}

export function KetherEffectsProvider({children}:{children:ReactNode}) {
  const [mode,setPreference] = useState<KetherEffectsMode>("balanced");
  const [reducedMotion,setReducedMotion] = useState(false);
  const [saveData,setSaveData] = useState(false);

  useEffect(()=>{
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if(isMode(saved))setPreference(saved);
    } catch {/* Storage can be unavailable; balanced remains available. */}

    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setReducedMotion(media.matches);
    sync();
    media.addEventListener("change",sync);

    // Browsers without NetworkInformation simply use the selected mode.
    const net=(navigator as Navigator & {
      connection?:{saveData?:boolean;addEventListener?:(event:string,listener:()=>void)=>void;removeEventListener?:(event:string,listener:()=>void)=>void}
    }).connection;
    const syncData=()=>setSaveData(Boolean(net?.saveData));
    syncData();
    net?.addEventListener?.("change",syncData);

    const crossTab=(event:StorageEvent)=>{
      if(event.key===STORAGE_KEY&&isMode(event.newValue))setPreference(event.newValue);
    };
    window.addEventListener("storage",crossTab);
    return ()=>{
      media.removeEventListener("change",sync);
      net?.removeEventListener?.("change",syncData);
      window.removeEventListener("storage",crossTab);
    };
  },[]);

  const effectiveMode:KetherEffectsMode = reducedMotion || saveData ? "eco" : mode;
  useEffect(()=>{
    const root=document.documentElement;
    root.dataset.ketherEffects=effectiveMode;
    root.dataset.ketherEffectsChoice=mode;
    return ()=>{
      delete root.dataset.ketherEffects;
      delete root.dataset.ketherEffectsChoice;
    };
  },[effectiveMode,mode]);

  const setMode=useCallback((next:KetherEffectsMode)=>{
    setPreference(next);
    try {localStorage.setItem(STORAGE_KEY,next);} catch {/* Choice still applies in this tab. */}
  },[]);

  const context=useMemo(()=>({mode,effectiveMode,reducedMotion:reducedMotion||saveData,setMode}),
    [mode,effectiveMode,reducedMotion,saveData,setMode]);

  return <EffectsContext.Provider value={context}>{children}</EffectsContext.Provider>;
}

export function useKetherEffects(){
  const context=useContext(EffectsContext);
  if(!context)throw new Error("KetherEffectsProvider is required");
  return context;
}

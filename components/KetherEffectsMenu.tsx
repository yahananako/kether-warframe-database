"use client";
import {Gauge} from "lucide-react";
import {KETHER_EFFECTS_MODES,useKetherEffects} from "./KetherEffectsProvider";

export default function KetherEffectsMenu(){
  const {mode,effectiveMode,reducedMotion,setMode}=useKetherEffects();
  const active=KETHER_EFFECTS_MODES.find(item=>item.id===mode)!;
  return <details className="site-utility site-effects-menu">
    <summary className="site-icon" aria-label={"顯示效能模式：" + active.name} title={"顯示效能模式：" + active.name}>
      <Gauge size={19} aria-hidden="true" />
      <span className="site-effects-status" aria-hidden="true"/>
    </summary>
    <section className="site-utility-panel site-effects-panel" aria-label="顯示效能模式設定">
      <span className="site-eyebrow">KETHER DISPLAY CONTROL</span>
      <h2>顯示效能</h2>
      <p>選擇適合裝置的畫面品質，設定只保存在這個瀏覽器。</p>
      <div role="group" aria-label="特效品質">
        {KETHER_EFFECTS_MODES.map(item=><button type="button" key={item.id}
          aria-pressed={mode===item.id} onClick={event=>{
            setMode(item.id);
            const details=event.currentTarget.closest("details");
            if(details){details.open=false;details.querySelector("summary")?.focus();}
          }}>
          <strong>{item.name}</strong><small>{item.description}</small>
        </button>)}
      </div>
      {reducedMotion&&<p className="site-effects-note" role="status">系統已開啟減少動態效果或節省數據，目前自動套用省電模式。</p>}
      <small className="site-effects-note">目前效果：{KETHER_EFFECTS_MODES.find(item=>item.id===effectiveMode)?.name}</small>
    </section>
  </details>;
}

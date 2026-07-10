"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

const dynamicMessages = [
  "小希電台已上線，左下角點開即可播放 YouTube 清單。",
  "KETHER 目前修繕模式中：先修既有問題，不新增大型功能。",
  "/live 小希星圖電波局已入場，支援 Warframe 即時世界狀態。",
  "鈴鐺公告面板會同步顯示最近修繕與更新進度。",
  "繪師美工圖等待入場中，後續會再替首頁與電波局正式換裝。",
];

export default function KetherDynamicInfo() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % dynamicMessages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="kether-dynamic-info" aria-label="KETHER動態資訊">
      <div className="kether-dynamic-info-badge">
        <Radio size={15} />
        <span>KETHER動態資訊</span>
      </div>

      <div className="kether-dynamic-info-window">
        <p key={activeIndex} className="kether-dynamic-info-message">
          {dynamicMessages[activeIndex]}
        </p>
      </div>

      <div className="kether-dynamic-info-dots" aria-label="KETHER動態資訊頁碼">
        {dynamicMessages.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`查看第 ${index + 1} 則動態資訊`}
          />
        ))}
      </div>
    </section>
  );
}

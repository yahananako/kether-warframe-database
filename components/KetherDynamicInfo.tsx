"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { ketherDynamicMessages } from "../data/siteUpdates";

export default function KetherDynamicInfo() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ketherDynamicMessages.length);
    }, 5000);

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
          {ketherDynamicMessages[activeIndex]}
        </p>
      </div>

      <div className="kether-dynamic-info-dots" aria-label="KETHER動態資訊頁碼">
        {ketherDynamicMessages.map((_, index) => (
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

import { Radio } from "lucide-react";

export default function KetherDynamicInfo() {
  return (
    <section className="kether-dynamic-info" aria-label="KETHER動態資訊">
      <div className="kether-dynamic-info-badge">
        <Radio size={15} />
        <span>KETHER動態資訊</span>
      </div>

      <p>
        小希電台已上線，左下角點開即可播放。KETHER 目前修繕模式中。
      </p>
    </section>
  );
}

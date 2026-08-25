"use client";

import { useMemo, useState } from "react";
import { Crosshair, EyeOff, HeartPulse, Shield, Sparkles, Wind } from "lucide-react";
import type { SheetRow } from "../lib/sheets";
import { getWarframeRole, normalizeWarframeName, WARFRAME_ROLES, type WarframeRole } from "../data/warframeRoles";
import { warframeStories } from "../data/warframeStories";
import styles from "../app/database/warframes/warframes.module.css";

const roleOrder: WarframeRole[] = ["damage", "control", "support", "survival", "stealth"];
const roleIcons = { damage: Crosshair, control: Wind, support: HeartPulse, survival: Shield, stealth: EyeOff };
const imageNameOverrides: Record<string, string> = {
  "Baruuk": "Pacifist.png",
  "Cyte-09": "Frumentarius.png",
  "Dante": "Pagemaster.png",
  "Sevagoth": "Wraith.png",
};
const warframeImageUrl = (name: string) => {
  const imageName = imageNameOverrides[name] ?? `${name.replace(/[^A-Za-z0-9]/g, "")}.png`;
  return `https://cdn.warframestat.us/img/${imageName}`;
};

export default function WarframeRoleArchive({ rows }: { rows: SheetRow[] }) {
  const [role, setRole] = useState<WarframeRole>("damage");
  const [query, setQuery] = useState("");
  const storyMap = useMemo(() => new Map(warframeStories.map((story) => [normalizeWarframeName(story.name), story])), []);
  const classified = useMemo(() => rows.map((row) => ({
    row,
    role: getWarframeRole(row.englishName || row.chineseName, row.description),
    story: storyMap.get(normalizeWarframeName(row.englishName || row.chineseName)),
  })), [rows, storyMap]);
  const counts = useMemo(() => Object.fromEntries(roleOrder.map((item) => [item, classified.filter((entry) => entry.role === item).length])), [classified]);
  const visible = classified.filter((entry) => entry.role === role && [entry.row.chineseName, entry.row.englishName, entry.row.description].join(" ").toLowerCase().includes(query.toLowerCase()));

  return <>
    <section className={styles.rolePanel} aria-label="戰甲定位分類">
      <header><span>WARFRAME COMBAT ROLES</span><h2>選擇戰甲定位</h2><p>先選戰場職責，再尋找適合這次任務的戰甲。</p></header>
      <div className={styles.roleTabs}>{roleOrder.map((item) => {
        const Icon = roleIcons[item]; const info = WARFRAME_ROLES[item];
        return <button key={item} onClick={() => setRole(item)} className={role === item ? styles.activeRole : ""}>
          <Icon aria-hidden="true" /><span><b>{info.label}</b><small>{info.english}</small></span><em>{counts[item]}</em>
        </button>;
      })}</div>
      <div className={styles.roleDescription}><Sparkles /><div><strong>{WARFRAME_ROLES[role].label}型戰甲</strong><p>{WARFRAME_ROLES[role].description}</p></div></div>
    </section>
    <section className={styles.archive}>
      <div className={styles.archiveHead}><div><span>{WARFRAME_ROLES[role].english} WARFRAMES</span><h2>{WARFRAME_ROLES[role].label}戰甲</h2><p>目前顯示 {visible.length} / {counts[role]} 位</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋戰甲名稱或用途…" /></div>
      <div className={styles.frameGrid}>{visible.map(({ row, story }, index) => {
        const name = row.englishName || row.chineseName;
        return <article className={styles.frameCard} key={`${name}-${index}`}>
          <div className={styles.frameVisual}><img src={warframeImageUrl(name)} alt={`${name} 戰甲圖片`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/icon-warframe-2.png"; }} /><span>{WARFRAME_ROLES[role].label}</span></div>
          <div className={styles.frameBody}><p>{row.chineseName || "戰甲"}</p><h3>{name}</h3><small>{row.description || row.note || WARFRAME_ROLES[role].description}</small>
            <div className={styles.frameMeta}><b>{row.price || "價格待更新"}{row.price && !/白金/.test(row.price) ? " 白金" : ""}</b>{row.marketUrl ? <a href={row.marketUrl} target="_blank" rel="noreferrer">交易網站</a> : null}</div>
            {story ? <details className={styles.lore}><summary>展開戰甲故事</summary><strong>{story.epithet}</strong><p>{story.summary}</p>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<footer><span>關鍵人物：{story.characters.join("、")}</span><a href={story.source.url} target="_blank" rel="noreferrer">官方來源</a></footer></details> : <div className={styles.noLore}>尚無可由官方正史證實的個人故事</div>}
          </div>
        </article>;
      })}</div>
      {visible.length === 0 ? <div className={styles.empty}>沒有符合搜尋條件的戰甲。</div> : null}
    </section>
  </>;
}

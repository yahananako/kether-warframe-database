"use client";

import { useMemo, useState } from "react";
import { Crosshair, EyeOff, HeartPulse, MapPin, Shield, Sparkles, Wind } from "lucide-react";
import type { SheetRow } from "../lib/sheets";
import type { RegularWarframe } from "../data/regularWarframes";
import { getWarframeRole, isWarframeName, normalizeWarframeName, WARFRAME_ROLES, type WarframeRole } from "../data/warframeRoles";
import { warframeStories } from "../data/warframeStories";
import { warframeCanonProfileMap } from "../data/warframeCanonProfiles";
import styles from "../app/database/warframes/warframes.module.css";

type ArchiveProps = { mode: "regular"; regularFrames: RegularWarframe[]; rows?: never } | { mode: "prime"; rows: SheetRow[]; regularFrames?: never };
const roleOrder: WarframeRole[] = ["damage", "control", "support", "survival", "stealth"];
const roleIcons = { damage: Crosshair, control: Wind, support: HeartPulse, survival: Shield, stealth: EyeOff };
const imageNameOverrides: Record<string, string> = { Baruuk: "Pacifist.png", "Cyte-09": "Frumentarius.png", Dante: "Pagemaster.png", Sevagoth: "Wraith.png" };
const warframeImageUrl = (name: string) => `https://cdn.warframestat.us/img/${imageNameOverrides[name] ?? `${name.replace(/[^A-Za-z0-9]/g, "")}.png`}`;

export default function WarframeRoleArchive(props: ArchiveProps) {
  const [role, setRole] = useState<WarframeRole>("damage");
  const [query, setQuery] = useState("");
  const storyMap = useMemo(() => new Map(warframeStories.map((story) => [normalizeWarframeName(story.name), story])), []);
  const entries = useMemo(() => props.mode === "regular"
    ? props.regularFrames.map((frame) => ({ name: frame.name, chineseName: "一般戰甲", description: "", price: "", marketUrl: "", acquisition: frame.acquisition }))
    : props.rows.filter((row) => /\bPrime\b/i.test(row.englishName) && isWarframeName(row.englishName)).map((row) => ({ name: row.englishName, chineseName: row.chineseName, description: row.description || row.note, price: row.price, marketUrl: row.marketUrl, acquisition: "" })), [props]);
  const classified = useMemo(() => entries.map((entry) => {
    const normalized = normalizeWarframeName(entry.name);
    return { entry, role: getWarframeRole(entry.name, entry.description), story: normalized === "excalibur" ? undefined : storyMap.get(normalized), profile: warframeCanonProfileMap.get(normalized) };
  }), [entries, storyMap]);
  const counts = useMemo(() => Object.fromEntries(roleOrder.map((item) => [item, classified.filter((entry) => entry.role === item).length])), [classified]);
  const visible = classified.filter(({ entry, role: itemRole }) => itemRole === role && [entry.name, entry.chineseName, entry.description, entry.acquisition].join(" ").toLowerCase().includes(query.toLowerCase()));

  return <>
    <section className={styles.rolePanel} aria-label="戰甲定位分類">
      <header><span>WARFRAME COMBAT ROLES</span><h2>選擇戰甲定位</h2><p>先選戰場職責，再尋找適合這次任務的戰甲。</p></header>
      <div className={styles.roleTabs}>{roleOrder.map((item) => { const Icon = roleIcons[item]; const info = WARFRAME_ROLES[item]; return <button key={item} onClick={() => setRole(item)} className={role === item ? styles.activeRole : ""}><Icon aria-hidden="true" /><span><b>{info.label}</b><small>{info.english}</small></span><em>{counts[item]}</em></button>; })}</div>
      <div className={styles.roleDescription}><Sparkles /><div><strong>{WARFRAME_ROLES[role].label}型戰甲</strong><p>{WARFRAME_ROLES[role].description}</p></div></div>
    </section>
    <section className={styles.archive}>
      <div className={styles.archiveHead}><div><span>{WARFRAME_ROLES[role].english} WARFRAMES</span><h2>{WARFRAME_ROLES[role].label}戰甲</h2><p>目前顯示 {visible.length} / {counts[role]} 位</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋戰甲名稱或用途…" /></div>
      <div className={styles.frameGrid}>{visible.map(({ entry, story, profile }) => <article className={styles.frameCard} key={entry.name}>
        <div className={styles.frameVisual}><img src={warframeImageUrl(entry.name)} alt={`${entry.name} 戰甲圖片`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/icon-warframe-2.png"; }} /><span>{WARFRAME_ROLES[role].label}</span></div>
        <div className={styles.frameBody}><p>{entry.chineseName || (props.mode === "regular" ? "一般戰甲" : "Prime 戰甲")}</p><h3>{entry.name}</h3><small>{entry.description || WARFRAME_ROLES[role].description}</small>
          {props.mode === "regular" ? <div className={styles.acquisition}><MapPin aria-hidden="true" /><div><b>入手條件</b><p>{entry.acquisition}</p></div></div> : <div className={styles.frameMeta}><b>{entry.price || "價格待更新"}{entry.price && !/白金/.test(entry.price) ? " 白金" : ""}</b>{entry.marketUrl ? <a href={entry.marketUrl} target="_blank" rel="noreferrer">交易網站</a> : null}</div>}
          {story ? <details className={styles.lore}><summary>展開戰甲故事</summary><strong>{story.epithet}</strong><p>{story.summary}</p>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<footer><span>關鍵人物：{story.characters.join("、")}</span><a href={story.source.url} target="_blank" rel="noreferrer">{story.source.label}</a></footer></details> : profile ? <details className={styles.lore}><summary>展開遊戲內故事・{profile.sourceType}</summary><strong>{profile.epithet}</strong><p>{profile.summary}</p>{profile.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<footer><span>資料層級：{profile.sourceType}</span><a href={profile.source.url} target="_blank" rel="noreferrer">{profile.source.label}</a></footer></details> : <div className={styles.noLore}>尚無可確認的遊戲內故事資料</div>}
        </div>
      </article>)}</div>
      {visible.length === 0 ? <div className={styles.empty}>沒有符合搜尋條件的戰甲。</div> : null}
    </section>
  </>;
}

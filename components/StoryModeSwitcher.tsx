"use client";

import { useEffect, useState } from "react";
import { BookOpen, Database, Gift, Image as ImageIcon, MapPin, Users } from "lucide-react";
import styles from "../app/story/story.module.css";

type Illustration = { src: string; alt: string; caption: string };
type Scene = { heading?: string; paragraphs: readonly string[]; image?: Illustration };
type Props = {
  summary: string;
  paragraphs: readonly string[];
  characters: readonly string[];
  period: string;
  meaningTitle: string;
  meaningText: string;
  illustration: Illustration;
  prerequisites?: readonly string[];
  rewards?: readonly string[];
  timeline?: readonly string[];
  scenes?: readonly Scene[];
};

export default function StoryModeSwitcher(props: Props) {
  const [mode, setMode] = useState<"story" | "data">("story");
  useEffect(() => {
    const saved = window.localStorage.getItem("kether-story-mode");
    if (saved === "story" || saved === "data") setMode(saved);
  }, []);
  const choose = (next: "story" | "data") => {
    setMode(next);
    window.localStorage.setItem("kether-story-mode", next);
  };
  return <>
    <div className={styles.modeSwitcher} role="tablist" aria-label="閱讀模式">
      <button className={mode === "story" ? styles.modeActive : ""} onClick={() => choose("story")}><BookOpen />📖 故事模式<small>完整小說化劇情</small></button>
      <button className={mode === "data" ? styles.modeActive : ""} onClick={() => choose("data")}><Database />📜 資料模式<small>條件・獎勵・時間線</small></button>
    </div>
    {mode === "story" ? <section className={styles.storyModePanel}>
      <figure className={styles.storyFigure}><img src={props.illustration.src} alt={props.illustration.alt} /><figcaption>{props.illustration.caption}</figcaption></figure>
      {props.scenes?.length ? <div className={styles.storyScenes}>{props.scenes.map((scene, i) => <section className={styles.storyScene} key={i}>{scene.heading && <h2>{scene.heading}</h2>}<div className={styles.prose}>{scene.paragraphs.map((p, j) => <p key={j}>{p}</p>)}</div>{scene.image && <figure className={styles.storyFigure}><img src={scene.image.src} alt={scene.image.alt} /><figcaption>{scene.image.caption}</figcaption></figure>}</section>)}</div> : <div className={styles.prose}>{props.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>}
      <div className={styles.inlineGalleryHint}><ImageIcon /><span>本模式支援多張章節插畫，後續可在段落之間持續加入場景、角色與戰鬥圖片。</span></div>
    </section> : <section className={styles.dataModePanel}>
      <div className={styles.dataGrid}>
        <article><MapPin /><span>年代／位置</span><strong>{props.period}</strong></article>
        <article><Users /><span>主要人物</span><strong>{props.characters.join("・")}</strong></article>
        <article><Database /><span>前置任務</span><strong>{props.prerequisites?.join(" → ") || "依故事書閱讀順序解鎖"}</strong></article>
        <article><Gift /><span>主要獎勵</span><strong>{props.rewards?.join("・") || "依遊戲內任務獎勵為準"}</strong></article>
      </div>
      <div className={styles.timelineCard}><h2>任務時間線</h2><ol>{(props.timeline?.length ? props.timeline : props.paragraphs).map((p, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{p}</p></li>)}</ol></div>
      <div className={styles.meaningCard}><Database /><div><strong>{props.meaningTitle}</strong><p>{props.meaningText}</p></div></div>
    </section>}
  </>;
}

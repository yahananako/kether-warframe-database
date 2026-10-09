import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpenText, Clock3, Layers3,
  ShieldAlert, Sparkles,
} from "lucide-react";
import StoryArtwork from "../../components/StoryArtwork";
import { STORY_BOOK_UPDATED_AT, storyChapters } from "../../data/storyFlow";
import styles from "./story-command.module.css";

export const metadata: Metadata = {
  title: "Warframe 故事全書｜章節目錄｜KETHER",
  description: "Warframe 完整繁體中文圖文故事，依年代與主線篇章閱讀。",
};

export default function StoryDirectoryPage() {
  const totalPassages = storyChapters.reduce(
    (total, chapter) => total + chapter.passages.length, 0,
  );
  const first = storyChapters[0];

  return (
    <main className={styles.commandDeck} aria-label="KETHER 故事資料庫">
      <section className={styles.spotlight} aria-labelledby="story-heading">
        <StoryArtwork
          className={styles.spotlightArt}
          src={first.heroImage}
          alt=""
        />
        <div className={styles.spotlightGrid} aria-hidden="true" />
        <div className={styles.spotlightContent}>
          <p className={styles.microLabel}>
            <Sparkles size={14} aria-hidden="true" />
            KETHER · WARFRAME CHRONICLE
          </p>
          <div className={styles.titleBlock}>
            <span className={styles.chapterTag}>TENNO / ARCHIVE / 001</span>
            <h1 id="story-heading">星海的<span>記憶</span></h1>
            <p className={styles.headlineEn}>THE ORIGIN CHRONICLES</p>
            <p className={styles.intro}>
              從 Orokin 帝國到 Tenno 覺醒，沿著被遺忘的歷史，讀懂始源星系每一道傷痕。
            </p>
            <div className={styles.stats} aria-label="故事收錄統計">
              <div><strong>{storyChapters.length.toString().padStart(2,"0")}</strong><span>篇章</span></div>
              <div><strong>{totalPassages}</strong><span>故事段落</span></div>
              <div><strong>{STORY_BOOK_UPDATED_AT.slice(0,7)}</strong><span>最後整理</span></div>
            </div>
            <Link href={`/story/${first.slug}`} className={styles.primaryAction}>
              <BookOpenText size={20} aria-hidden="true" />
              進入序章
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.archiveLinks} aria-label="其他故事閱讀方式">
            <Link href="/story/side"><Layers3 size={16} aria-hidden="true" /> 支線故事書 <ArrowUpRight size={15} aria-hidden="true" /></Link>
            <Link href="/story/series"><Layers3 size={16} aria-hidden="true" /> 系列任務 <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.directoryPanel} aria-labelledby="directory-heading">
        <div className={styles.directoryHeader}>
          <p className={styles.microLabel}>KETHER CHRONICLE INDEX</p>
          <h2 id="directory-heading">故事篇章 <span>/ {storyChapters.length.toString().padStart(2,"0")}</span></h2>
          <p>選擇篇章，展開每一卷完整故事與章節目錄。</p>
        </div>
        <nav className={styles.chapterList} aria-label="五大篇章目錄">
          {storyChapters.map((chapter, index) => (
            <Link className={styles.chapterItem} href={`/story/${chapter.slug}`} key={chapter.slug}>
              <div className={styles.chapterImage}>
                <StoryArtwork src={chapter.heroImage} alt="" loading={index === 0 ? "eager" : "lazy"} />
                <span>{chapter.number}</span>
              </div>
              <div className={styles.chapterCopy}>
                <span className={styles.chapterUpper}>{chapter.label} · {chapter.englishTitle}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.deck}</p>
                <div className={styles.chapterMeta}>
                  <span><BookOpenText size={12} aria-hidden="true" /> {chapter.passages.length} 章</span>
                  <span><Clock3 size={12} aria-hidden="true" /> {chapter.readTime}</span>
                </div>
              </div>
              <ArrowUpRight className={styles.chapterArrow} size={18} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className={styles.directoryBottom}>
          <ShieldAlert size={16} aria-hidden="true" />
          <span>完整劇透內容 · 建議按 00 → 04 的順序閱讀</span>
        </div>
      </section>
    </main>
  );
}

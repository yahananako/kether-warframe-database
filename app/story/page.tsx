import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Layers3,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import {
  STORY_BOOK_UPDATED_AT,
  storyChapters,
} from "../../data/storyFlow";
import styles from "./story.module.css";

export const metadata: Metadata = {
  title: "Warframe 故事全書｜章節目錄｜KETHER",
  description:
    "Warframe 完整繁體中文圖文故事章節目錄，從 Orokin 起源、Tenno 覺醒到最新 Void War。",
};

export default function StoryDirectoryPage() {
  const totalPassages = storyChapters.reduce(
    (total, chapter) => total + chapter.passages.length,
    0,
  );

  return (
    <main className={styles.bookPage}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/" aria-label="回到 KETHER 首頁">
          <span className={styles.brandMark}>K</span>
          <span>
            <strong>KETHER</strong>
            <small>STORY ARCHIVE</small>
          </span>
        </Link>
        <HomeNewInlineMenu />
      </header>

      <div className={styles.pageShell}>
        <section className={styles.directoryHero}>
          <div className={styles.directoryHeroCopy}>
            <p className={styles.eyebrow}>
              <Sparkles aria-hidden="true" />
              WARFRAME ILLUSTRATED CHRONICLE
            </p>
            <h1>
              Warframe
              <br />
              故事全書
            </h1>
            <p>
              從黃金帝國的原罪，到 1999 年跨越時間的反擊。
              第一頁只作為章節目錄；點進每一卷，閱讀完整圖文故事。
            </p>
            <dl className={styles.directoryStats}>
              <div>
                <dt>章節</dt>
                <dd>{storyChapters.length}</dd>
              </div>
              <div>
                <dt>故事段落</dt>
                <dd>{totalPassages}</dd>
              </div>
              <div>
                <dt>更新</dt>
                <dd>{STORY_BOOK_UPDATED_AT.slice(0, 7)}</dd>
              </div>
            </dl>
            <Link className={styles.startReading} href={"/story/" + storyChapters[0].slug}>
              從序章開始閱讀
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.coverStack} aria-label="Warframe 章節封面預覽">
            {[storyChapters[3], storyChapters[2], storyChapters[4]].map(
              (chapter, index) => (
                <figure key={chapter.slug} data-layer={index}>
                  <img src={chapter.heroImage} alt={chapter.heroAlt} />
                  <figcaption>
                    <span>{chapter.number}</span>
                    {chapter.title}
                  </figcaption>
                </figure>
              ),
            )}
          </div>
        </section>

        <aside className={styles.directoryNotice}>
          <ShieldAlert aria-hidden="true" />
          <div>
            <strong>這是一套完整劇透故事書</strong>
            <p>
              章節目錄不會暴露重大轉折；進入章節後則會直接顯示完整故事。
              建議新玩家依 00 → 04 順序閱讀。
            </p>
          </div>
        </aside>

        <section className={styles.chapterDirectory} aria-labelledby="chapter-directory-title">
          <header className={styles.directoryHeading}>
            <div>
              <p className={styles.eyebrow}>
                <Layers3 aria-hidden="true" />
                CHAPTER DIRECTORY
              </p>
              <h2 id="chapter-directory-title">章節目錄</h2>
            </div>
            <p>每一張封面都是一個獨立頁面，內含章內導覽、官方圖片與詳細正文。</p>
          </header>

          <div className={styles.chapterGrid}>
            {storyChapters.map((chapter) => (
              <Link
                className={styles.chapterCard}
                href={"/story/" + chapter.slug}
                key={chapter.slug}
                style={{ "--card-accent": chapter.accent } as CSSProperties}
              >
                <div className={styles.chapterCardImage}>
                  <img src={chapter.heroImage} alt="" />
                  <span>{chapter.number}</span>
                </div>
                <div className={styles.chapterCardBody}>
                  <p>{chapter.label}</p>
                  <h3>{chapter.title}</h3>
                  <small>{chapter.englishTitle}</small>
                  <strong>{chapter.era}</strong>
                  <span className={styles.chapterDeck}>{chapter.deck}</span>
                  <footer>
                    <span>
                      <BookOpenText aria-hidden="true" />
                      {chapter.passages.length} 節
                    </span>
                    <span>
                      <Clock3 aria-hidden="true" />
                      {chapter.readTime}
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </footer>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className={styles.bookFooter}>
          <div>
            <span className={styles.brandMark}>K</span>
            <p>
              <strong>KETHER STORY ARCHIVE</strong>
              <small>更新至 {STORY_BOOK_UPDATED_AT}</small>
            </p>
          </div>
          <Link href="/">回到資料庫</Link>
        </footer>
      </div>
    </main>
  );
}

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Clock3,
  GitBranch,
  Sparkles,
} from "lucide-react";

import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import {
  QUEST_SERIES_UPDATED_AT,
  questSeries,
} from "../../../data/questSeries";
import styles from "../story.module.css";

export const metadata = {
  title: "Warframe 系列任務故事書｜KETHER",
  description: "依連續劇情與解鎖脈絡整理的 Warframe 系列任務故事路線。",
};

export default function QuestSeriesDirectory() {
  const total = questSeries.reduce(
    (sum, series) => sum + series.episodes.length,
    0,
  );

  return (
    <main className={styles.bookPage}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>K</span>
          <span>
            <strong>KETHER</strong>
            <small>QUEST SERIES ARCHIVE</small>
          </span>
        </Link>
        <HomeNewInlineMenu />
      </header>

      <div className={styles.pageShell}>
        <section className={styles.directoryHero}>
          <div className={styles.directoryHeroCopy}>
            <p className={styles.eyebrow}>
              <Sparkles /> QUEST SERIES CHRONICLE
            </p>
            <h1>
              系列任務
              <br />
              故事書
            </h1>
            <p>
              不按更新年份散讀，而是把互相承接的任務排成六條故事航路。
              選一條系列，就能沿著事件順序一路讀到現在。
            </p>
            <dl className={styles.directoryStats}>
              <div>
                <dt>故事系列</dt>
                <dd>{questSeries.length} 條</dd>
              </div>
              <div>
                <dt>任務節點</dt>
                <dd>{total} 章</dd>
              </div>
              <div>
                <dt>更新</dt>
                <dd>{QUEST_SERIES_UPDATED_AT.slice(0, 7)}</dd>
              </div>
            </dl>
            <Link
              className={styles.startReading}
              href={`/story/series/${questSeries[0].slug}`}
            >
              從覺醒者之路開始 <ArrowRight />
            </Link>
          </div>

          <div className={styles.coverStack} aria-label="系列任務封面預覽">
            {[questSeries[2], questSeries[3], questSeries[5]].map(
              (series, index) => (
                <figure key={series.slug} data-layer={index}>
                  <img src={series.heroImage} alt={`${series.title}系列封面`} />
                  <figcaption>
                    <span>{series.number}</span>
                    {series.title}
                  </figcaption>
                </figure>
              ),
            )}
          </div>
        </section>

        <section className={styles.chapterDirectory}>
          <header className={styles.directoryHeading}>
            <div>
              <p className={styles.eyebrow}>
                <GitBranch /> CONNECTED QUEST DIRECTORY
              </p>
              <h2>系列航路</h2>
            </div>
            <p>
              每條航路會連回故事全書中的完整篇章；同一段正文只維護一份，網站與
              App 會共用相同閱讀順序。
            </p>
          </header>
          <div className={styles.chapterGrid}>
            {questSeries.map((series) => (
              <Link
                className={styles.chapterCard}
                href={`/story/series/${series.slug}`}
                key={series.slug}
                style={{ "--card-accent": series.accent } as CSSProperties}
              >
                <div className={styles.chapterCardImage}>
                  <img src={series.heroImage} alt={`${series.title}系列封面`} />
                  <span>{series.number.replace("S-", "")}</span>
                </div>
                <div className={styles.chapterCardBody}>
                  <p>{series.number}</p>
                  <h3>{series.title}</h3>
                  <small>{series.englishTitle}</small>
                  <strong>{series.era}</strong>
                  <span className={styles.chapterDeck}>{series.deck}</span>
                  <footer>
                    <span>
                      <BookOpenText /> {series.episodes.length} 章
                    </span>
                    <span>
                      <Clock3 /> 依序閱讀
                    </span>
                    <ArrowRight />
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
              <strong>KETHER QUEST SERIES ARCHIVE</strong>
              <small>連續任務閱讀航路</small>
            </p>
          </div>
          <Link href="/story">
            <ArrowLeft /> 故事全書
          </Link>
        </footer>
      </div>
    </main>
  );
}

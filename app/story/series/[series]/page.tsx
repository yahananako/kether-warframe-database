import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, GitBranch } from "lucide-react";
import { notFound } from "next/navigation";

import { getQuestSeries, questSeries } from "../../../../data/questSeries";
import styles from "../../story.module.css";

export function generateStaticParams() {
  return questSeries.map((series) => ({ series: series.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const route = await params;
  const series = getQuestSeries(route.series);
  return series
    ? {
        title: `${series.title}｜系列任務故事書｜KETHER`,
        description: series.deck,
      }
    : { title: "找不到系列任務｜KETHER" };
}

export default async function QuestSeriesPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const route = await params;
  const series = getQuestSeries(route.series);
  if (!series) notFound();

  const seriesIndex = questSeries.findIndex(
    (item) => item.slug === series.slug,
  );
  const previous = questSeries[seriesIndex - 1];
  const next = questSeries[seriesIndex + 1];

  return (
    <main
      className={styles.bookPage}
      style={{ "--chapter-accent": series.accent } as CSSProperties}
    >
      <div className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="麵包屑">
          <Link href="/story">故事全書</Link>
          <ChevronRight />
          <Link href="/story/series">系列任務</Link>
          <ChevronRight />
          <span>{series.title}</span>
        </nav>

        <section className={styles.chapterHero}>
          <img src={series.heroImage} alt={`${series.title}系列封面`} />
          <div className={styles.chapterHeroShade} />
          <div className={styles.chapterHeroContent}>
            <p>
              <span>{series.number.replace("S-", "")}</span> QUEST SERIES
            </p>
            <h1>{series.title}</h1>
            <small>{series.englishTitle}</small>
            <strong>{series.era}</strong>
            <p className={styles.chapterIntro}>{series.deck}</p>
            <div className={styles.chapterMeta}>
              <span>
                <GitBranch /> {series.episodes.length} 個連續節點
              </span>
            </div>
          </div>
        </section>

        <section className={styles.seriesTimeline}>
          <header>
            <p>READING ROUTE</p>
            <h2>依序閱讀</h2>
            <span>點選節點，進入故事全書的完整正文。</span>
          </header>
          <div>
            {series.episodes.map((episode) => (
              <Link
                href={episode.href}
                key={`${series.slug}-${episode.number}`}
              >
                <span>{episode.number}</span>
                <div>
                  <h3>{episode.title}</h3>
                  <p>{episode.description}</p>
                </div>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>

        <nav className={styles.chapterPager}>
          <Link
            href={previous ? `/story/series/${previous.slug}` : "/story/series"}
          >
            <ArrowLeft />
            <span>
              <small>{previous ? "上一條航路" : "返回"}</small>
              <strong>{previous?.title ?? "系列總目錄"}</strong>
            </span>
          </Link>
          <Link href={next ? `/story/series/${next.slug}` : "/story/series"}>
            <span>
              <small>{next ? "下一條航路" : "系列讀完"}</small>
              <strong>{next?.title ?? "回到系列總目錄"}</strong>
            </span>
            <ArrowRight />
          </Link>
        </nav>
      </div>
    </main>
  );
}

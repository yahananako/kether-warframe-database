import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenText, ChevronRight, Clock3, ShieldAlert } from "lucide-react";

import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import { getStoryChapter, storyChapters } from "../../../data/storyFlow";
import styles from "../story.module.css";

type Props = { params: Promise<{ chapter: string }> };

export function generateStaticParams() {
  return storyChapters.map((chapter) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = getStoryChapter((await params).chapter);
  return chapter
    ? { title: chapter.title + "｜Warframe 故事全書｜KETHER", description: chapter.deck }
    : { title: "找不到故事篇章｜KETHER" };
}

export default async function StoryVolumePage({ params }: Props) {
  const chapter = getStoryChapter((await params).chapter);
  if (!chapter) notFound();
  const volumeIndex = storyChapters.findIndex((entry) => entry.slug === chapter.slug);
  const previous = storyChapters[volumeIndex - 1];
  const next = storyChapters[volumeIndex + 1];

  return (
    <main className={styles.bookPage} style={{ "--chapter-accent": chapter.accent } as CSSProperties}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>STORY ARCHIVE</small></span></Link>
        <HomeNewInlineMenu />
      </header>
      <div className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="麵包屑"><Link href="/">首頁</Link><ChevronRight /><Link href="/story">故事全書</Link><ChevronRight /><span>{chapter.title}</span></nav>
        <article>
          <header className={styles.chapterHero}>
            <img src={chapter.heroImage} alt={chapter.heroAlt} /><div className={styles.chapterHeroShade} />
            <div className={styles.chapterHeroContent}>
              <p><span>{chapter.number}</span>{chapter.label}</p><h1>{chapter.title}</h1><small>{chapter.englishTitle}</small><strong>{chapter.era}</strong>
              <p className={styles.chapterIntro}>{chapter.deck}</p>
              <div className={styles.chapterMeta}><span><BookOpenText />{chapter.passages.length} 個章節</span><span><Clock3 />{chapter.readTime}</span></div>
            </div>
          </header>
          <aside className={styles.fullSpoilerWarning}><ShieldAlert /><div><strong>篇章目錄無重大劇透</strong><p>選擇章節後才會進入完整故事正文；建議依編號閱讀。</p></div></aside>
          <section className={styles.volumeDirectory} aria-labelledby="volume-directory-title">
            <header><p>VOLUME DIRECTORY</p><h2 id="volume-directory-title">{chapter.label}章節目錄</h2><span>{chapter.era}</span></header>
            <div className={styles.volumeChapterGrid}>
              {chapter.passages.map((passage, index) => (
                <Link href={`/story/${chapter.slug}/${passage.id}`} key={passage.id} className={styles.volumeChapterCard}>
                  <span className={styles.volumeChapterNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div><p>{passage.kicker}</p><h3>{passage.title}</h3><small>{passage.englishTitle}</small><strong>{passage.period}</strong><span>{passage.summary}</span></div>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </section>
          <nav className={styles.chapterPager} aria-label="前後篇章">
            <Link href={previous ? `/story/${previous.slug}` : "/story"}><ArrowLeft /><span><small>{previous ? "上一卷" : "返回"}</small><strong>{previous?.title ?? "總目錄"}</strong></span></Link>
            <Link href={next ? `/story/${next.slug}` : "/story"}><span><small>{next ? "下一卷" : "閱讀完成"}</small><strong>{next?.title ?? "回到總目錄"}</strong></span><ArrowRight /></Link>
          </nav>
        </article>
        <footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER STORY ARCHIVE</strong><small>Warframe 圖文故事全書</small></p></div><Link href="/story">五卷總目錄</Link></footer>
      </div>
    </main>
  );
}

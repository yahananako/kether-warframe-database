import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, ShieldAlert, Sparkles, Users } from "lucide-react";

import HomeNewInlineMenu from "../../../../components/HomeNewInlineMenu";
import type { StoryChapter, StoryPassage } from "../../../../data/storyFlow";
import { storyChapters } from "../../../../data/storyFlow";
import styles from "../../story.module.css";

type Props = { params: Promise<{ chapter: string; passage: string }> };

export function generateStaticParams() {
  return storyChapters.flatMap((chapter) => chapter.passages.map((passage) => ({ chapter: chapter.slug, passage: passage.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter, passage } = await params;
  const volume = storyChapters.find((item) => item.slug === chapter);
  const story = volume?.passages.find((item) => item.id === passage);
  return volume && story ? { title: story.title + "｜" + volume.title + "｜KETHER", description: story.summary } : { title: "找不到故事章節｜KETHER" };
}

export default async function StoryPassagePage({ params }: Props) {
  const route = await params;
  const chapter = storyChapters.find((item) => item.slug === route.chapter);
  const passage = chapter?.passages.find((item) => item.id === route.passage);
  if (!chapter || !passage) notFound();
  const readingOrder = storyChapters.flatMap<{ chapter: StoryChapter; passage: StoryPassage }>((volume) =>
    volume.passages.map((entry) => ({ chapter: volume, passage: entry })),
  );
  const readingIndex = readingOrder.findIndex((item) => item.chapter.slug === chapter.slug && item.passage.id === passage.id);
  const previous = readingOrder[readingIndex - 1];
  const next = readingOrder[readingIndex + 1];
  const passageIndex = chapter.passages.findIndex((item) => item.id === passage.id);

  return (
    <main className={styles.bookPage} style={{ "--chapter-accent": chapter.accent } as CSSProperties}>
      <header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>STORY ARCHIVE</small></span></Link><HomeNewInlineMenu /></header>
      <div className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="麵包屑"><Link href="/story">故事全書</Link><ChevronRight /><Link href={`/story/${chapter.slug}`}>{chapter.title}</Link><ChevronRight /><span>{passage.title}</span></nav>
        <article className={styles.singlePassage}>
          <header className={styles.passageHeader}><div className={styles.passageNumber}>{String(passageIndex + 1).padStart(2, "0")}</div><div><p>{chapter.number}・{chapter.label}／{passage.kicker}</p><h1>{passage.title}</h1><small>{passage.englishTitle}</small><strong>{passage.period}</strong></div></header>
          <p className={styles.passageLead}>{passage.summary}</p>
          <aside className={styles.fullSpoilerWarning}><ShieldAlert /><div><strong>{chapter.spoilerLevel}</strong><p>以下為完整故事正文，會直接說明事件真相與結局。</p></div></aside>
          {passage.image ? <figure className={styles.storyFigure}><img src={passage.image.src} alt={passage.image.alt} /><figcaption>{passage.image.caption}</figcaption></figure> : null}
          <div className={styles.prose}>{passage.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className={styles.meaningCard}><Sparkles /><div><strong>{passage.meaning.title}</strong><p>{passage.meaning.text}</p></div></div>
          <div className={styles.characterRow}><Users /><span>本章人物</span><div>{passage.characters.map((character) => <small key={character}>{character}</small>)}</div></div>
          <section className={styles.chapterSources}><div><p>OFFICIAL REFERENCES</p><h2>本卷官方資料</h2><span>任務順序與內容依 Digital Extremes 官方資料校對。</span></div><div>{chapter.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLink /></a>)}</div></section>
          <nav className={styles.chapterPager} aria-label="前後章節">
            <Link href={previous ? `/story/${previous.chapter.slug}/${previous.passage.id}` : `/story/${chapter.slug}`}><ArrowLeft /><span><small>{previous ? "上一章" : "返回"}</small><strong>{previous?.passage.title ?? chapter.title}</strong></span></Link>
            <Link href={next ? `/story/${next.chapter.slug}/${next.passage.id}` : "/story"}><span><small>{next ? "下一章" : "全書讀完"}</small><strong>{next?.passage.title ?? "回到總目錄"}</strong></span><ArrowRight /></Link>
          </nav>
        </article>
        <footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER STORY ARCHIVE</strong><small>{chapter.title}</small></p></div><Link href={`/story/${chapter.slug}`}>本卷目錄</Link></footer>
      </div>
    </main>
  );
}

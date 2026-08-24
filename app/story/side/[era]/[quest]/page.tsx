import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, Sparkles, Users } from "lucide-react";
import HomeNewInlineMenu from "../../../../../components/HomeNewInlineMenu";
import { getSideStory, sideStoryEras, sideStoryReadingOrder } from "../../../../../data/sideStoryFlow";
import styles from "../../../story.module.css";

type Props = { params: Promise<{ era: string; quest: string }> };
export function generateStaticParams() { return sideStoryEras.flatMap((era) => era.stories.map((story) => ({ era: era.slug, quest: story.slug }))); }
export default async function SideStoryPage({ params }: Props) {
  const route = await params; const found = getSideStory(route.era, route.quest); if (!found) notFound(); const { era, story } = found;
  const index = sideStoryReadingOrder.findIndex((item) => item.era.slug === era.slug && item.story.slug === story.slug); const previous = sideStoryReadingOrder[index - 1]; const next = sideStoryReadingOrder[index + 1];
  return <main className={styles.bookPage} style={{ "--chapter-accent": era.accent } as CSSProperties}><header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>SIDE STORY ARCHIVE</small></span></Link><HomeNewInlineMenu /></header><div className={styles.pageShell}>
    <nav className={styles.breadcrumb}><Link href="/story/side">支線故事書</Link><ChevronRight /><Link href={`/story/side/${era.slug}`}>{era.title}</Link><ChevronRight /><span>{story.title}</span></nav>
    <article className={styles.singlePassage}><header className={styles.passageHeader}><div className={styles.passageNumber}>{era.number}</div><div><p>{era.title}</p><h1>{story.title}</h1><small>{story.englishTitle}</small><strong>{story.period}</strong></div></header><p className={styles.passageLead}>{story.deck}</p><div className={styles.prose}>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className={styles.meaningCard}><Sparkles /><div><strong>本章意義</strong><p>{story.meaning}</p></div></div><div className={styles.characterRow}><Users /><span>本章人物</span><div>{story.characters.map((character) => <small key={character}>{character}</small>)}</div></div>
      <section className={styles.chapterSources}><div><p>OFFICIAL REFERENCE</p><h2>官方資料</h2><span>正文為繁體中文整理與敘事改寫。</span></div><div><a href={story.source} target="_blank" rel="noreferrer">查看官方任務資料<ExternalLink /></a></div></section>
      <nav className={styles.chapterPager}><Link href={previous ? `/story/side/${previous.era.slug}/${previous.story.slug}` : `/story/side/${era.slug}`}><ArrowLeft /><span><small>{previous ? "上一章" : "返回"}</small><strong>{previous?.story.title ?? era.title}</strong></span></Link><Link href={next ? `/story/side/${next.era.slug}/${next.story.slug}` : "/story/side"}><span><small>{next ? "下一章" : "支線讀完"}</small><strong>{next?.story.title ?? "回到年代目錄"}</strong></span><ArrowRight /></Link></nav>
    </article><footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER SIDE STORY ARCHIVE</strong><small>{story.title}</small></p></div><Link href={`/story/side/${era.slug}`}>本卷目錄</Link></footer>
  </div></main>;
}

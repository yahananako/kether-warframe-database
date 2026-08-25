import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import HomeNewInlineMenu from "../../../../components/HomeNewInlineMenu";
import { getSideStoryEra, sideStoryEras } from "../../../../data/sideStoryFlow";
import { getSideStoryIllustration } from "../../../../data/storyIllustrations";
import styles from "../../story.module.css";

type Props = { params: Promise<{ era: string }> };
export function generateStaticParams() { return sideStoryEras.map((era) => ({ era: era.slug })); }
export default async function SideStoryEraPage({ params }: Props) {
  const era = getSideStoryEra((await params).era); if (!era) notFound();
  return <main className={styles.bookPage} style={{ "--chapter-accent": era.accent } as CSSProperties}><header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>SIDE STORY ARCHIVE</small></span></Link><HomeNewInlineMenu /></header><div className={styles.pageShell}>
    <nav className={styles.breadcrumb}><Link href="/story/side">支線故事書</Link><ChevronRight /><span>{era.title}</span></nav>
    <header className={styles.chapterHero}><img src={era.heroImage} alt={`${era.title}篇章封面`} /><div className={styles.chapterHeroShade} /><div className={styles.chapterHeroContent}><p><span>{era.number}</span>支線篇章</p><h1>{era.title}</h1><small>{era.englishTitle}</small><strong>{era.era}</strong><p className={styles.chapterIntro}>{era.deck}</p></div></header>
    <section className={styles.volumeDirectory}><header><p>VOLUME DIRECTORY</p><h2>本卷章節</h2><span>{era.stories.length} 個支線故事</span></header><div className={styles.volumeChapterGrid}>{era.stories.map((story, index) => <Link href={`/story/side/${era.slug}/${story.slug}`} key={story.slug} className={styles.volumeChapterCard}><img className={styles.sideStoryThumb} src={getSideStoryIllustration(story.slug, story.title).src} alt={`${story.title}專屬支線圖片`} /><span className={styles.volumeChapterNumber}>{String(index + 1).padStart(2, "0")}</span><div><p>{story.period}</p><h3>{story.title}</h3><small>{story.englishTitle}</small><span>{story.deck}</span></div><ArrowRight /></Link>)}</div></section>
    <footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER SIDE STORY ARCHIVE</strong><small>{era.title}</small></p></div><Link href="/story/side"><ArrowLeft />年代總目錄</Link></footer>
  </div></main>;
}

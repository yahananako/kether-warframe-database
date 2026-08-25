import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, ShieldAlert, Sparkles, Users } from "lucide-react";
import HomeNewInlineMenu from "../../../../components/HomeNewInlineMenu";
import { getWarframeStory, warframeStories } from "../../../../data/warframeStories";
import styles from "../../story.module.css";

type Props = { params: Promise<{ warframe: string }> };
export const generateStaticParams = () => warframeStories.map(({ slug }) => ({ warframe: slug }));
export async function generateMetadata({ params }: Props) { const story = getWarframeStory((await params).warframe); return story ? { title: `${story.name} 的故事｜KETHER`, description: story.summary } : { title: "找不到戰甲故事｜KETHER" }; }

export default async function WarframeStoryPage({ params }: Props) {
  const story = getWarframeStory((await params).warframe); if (!story) notFound();
  const index = warframeStories.findIndex((item) => item.slug === story.slug); const previous = warframeStories[index - 1]; const next = warframeStories[index + 1];
  return <main className={styles.bookPage} style={{ "--chapter-accent": story.accent } as CSSProperties}>
    <header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>WARFRAME LORE</small></span></Link><HomeNewInlineMenu /></header>
    <div className={styles.pageShell}><nav className={styles.breadcrumb}><Link href="/story">故事全書</Link><ChevronRight /><Link href="/story/warframes">戰甲故事</Link><ChevronRight /><span>{story.name}</span></nav>
      <article className={styles.singlePassage}><header className={styles.passageHeader}><div className={styles.passageNumber}>{String(index + 1).padStart(2, "0")}</div><div><p>{story.era}／{story.epithet}</p><h1>{story.name}</h1><small>{story.englishName}</small></div></header><p className={styles.passageLead}>{story.summary}</p>
        <aside className={styles.fullSpoilerWarning}><ShieldAlert /><div><strong>完整身世劇透</strong><p>以下會直接說明相關任務、人物真相與結局。</p></div></aside>
        <figure className={styles.storyFigure}><img src={story.image} alt={story.imageAlt} /><figcaption>{story.name}——{story.epithet}</figcaption></figure>
        <div className={styles.prose}>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className={styles.meaningCard}><Sparkles /><div><strong>這段故事留下什麼</strong><p>{story.meaning}</p></div></div>
        <div className={styles.characterRow}><Users /><span>關鍵人物</span><div>{story.characters.map((character) => <small key={character}>{character}</small>)}</div></div>
        <section className={styles.chapterSources}><div><p>OFFICIAL REFERENCE</p><h2>官方資料</h2><span>人物身世依 Digital Extremes 官方敘事整理。</span></div><div><a href={story.source.url} target="_blank" rel="noreferrer">{story.source.label}<ExternalLink /></a></div></section>
        <nav className={styles.chapterPager}><Link href={previous ? `/story/warframes/${previous.slug}` : "/story/warframes"}><ArrowLeft /><span><small>{previous ? "上一位" : "返回"}</small><strong>{previous?.name ?? "戰甲目錄"}</strong></span></Link><Link href={next ? `/story/warframes/${next.slug}` : "/story/warframes"}><span><small>{next ? "下一位" : "閱讀完成"}</small><strong>{next?.name ?? "回到戰甲目錄"}</strong></span><ArrowRight /></Link></nav>
      </article><footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER WARFRAME LORE</strong><small>{warframeStories.length} 位戰甲首批收錄</small></p></div><Link href="/story/warframes">戰甲目錄</Link></footer>
    </div>
  </main>;
}

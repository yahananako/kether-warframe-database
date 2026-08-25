import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, ShieldAlert, Sparkles } from "lucide-react";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import { warframeStories } from "../../../data/warframeStories";
import styles from "../story.module.css";

export const metadata = { title: "Warframe 戰甲故事書｜KETHER", description: "依官方任務與敘事整理的戰甲身世圖文故事。" };

export default function WarframeStoryDirectory() {
  return <main className={styles.bookPage}>
    <header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>WARFRAME LORE ARCHIVE</small></span></Link><HomeNewInlineMenu /></header>
    <div className={styles.pageShell}>
      <section className={styles.directoryHero}>
        <div className={styles.directoryHeroCopy}><p className={styles.eyebrow}><Sparkles />WARFRAME LORE CHRONICLE</p><h1>戰甲<br />故事書</h1><p>戰甲從來不只是能力與數值。在金屬、感染與夢境之下，仍有人曾經守護、背叛、失去，並為自己的最後一戰留下名字。</p><dl className={styles.directoryStats}><div><dt>首批收錄</dt><dd>{warframeStories.length} 位</dd></div><div><dt>內容依據</dt><dd>官方正史</dd></div></dl><Link className={styles.startReading} href={`/story/warframes/${warframeStories[0].slug}`}>從 Umbra 開始<ArrowRight /></Link></div>
        <div className={styles.coverStack} aria-label="戰甲故事封面預覽">{[warframeStories[1], warframeStories[6], warframeStories[12]].map((story, index) => <figure key={story.slug} data-layer={index}><img src={story.image} alt={story.imageAlt} /><figcaption><span>{story.era}</span>{story.name}</figcaption></figure>)}</div>
      </section>
      <aside className={styles.directoryNotice}><ShieldAlert /><div><strong>只收錄能由官方敘事證實的身世</strong><p>沒有明確個人故事的戰甲不會被硬編傳記；新任務、Leverian 與 Prime 敘事會持續補進書庫。</p></div></aside>
      <section className={styles.chapterDirectory}><header className={styles.directoryHeading}><div><p className={styles.eyebrow}>FRAME DIRECTORY</p><h2>戰甲目錄</h2></div><p>每張卡片都是一篇獨立人物故事，內含完整劇透、角色關係、故事意義與官方來源。</p></header>
        <div className={styles.chapterGrid}>{warframeStories.map((story, index) => <Link className={styles.chapterCard} href={`/story/warframes/${story.slug}`} key={story.slug} style={{ "--card-accent": story.accent } as CSSProperties}><div className={styles.chapterCardImage}><img src={story.image} alt={story.imageAlt} /><span>{String(index + 1).padStart(2, "0")}</span></div><div className={styles.chapterCardBody}><p>{story.era}</p><h3>{story.name}</h3><small>{story.englishName}</small><strong>{story.epithet}</strong><span className={styles.chapterDeck}>{story.summary}</span><footer><span><BookOpenText />完整故事</span><ArrowRight /></footer></div></Link>)}</div>
      </section>
      <footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER WARFRAME LORE</strong><small>戰甲身世圖文故事</small></p></div><Link href="/story"><ArrowLeft />故事全書</Link></footer>
    </div>
  </main>;
}

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Clock3, Layers3, Sparkles } from "lucide-react";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import { sideStoryEras } from "../../../data/sideStoryFlow";
import styles from "../story.module.css";

export const metadata = { title: "Warframe 支線故事書｜KETHER", description: "依故事年代排列的 Warframe 完整支線任務圖文故事書。" };

export default function SideStoryDirectory() {
  const total = sideStoryEras.reduce((sum, era) => sum + era.stories.length, 0);
  return <main className={styles.bookPage}>
    <header className={styles.siteHeader}><Link className={styles.brand} href="/"><span className={styles.brandMark}>K</span><span><strong>KETHER</strong><small>SIDE STORY ARCHIVE</small></span></Link><HomeNewInlineMenu /></header>
    <div className={styles.pageShell}>
      <section className={styles.directoryHero}>
        <div className={styles.directoryHeroCopy}><p className={styles.eyebrow}><Sparkles />SIDE STORY CHRONICLE</p><h1>支線<br />故事書</h1><p>主線之外，每一個被帝國遺忘的人仍有自己的戰爭。依故事年代翻閱完整支線，不必在星圖與更新紀錄之間迷路。</p><dl className={styles.directoryStats}><div><dt>年代篇章</dt><dd>{sideStoryEras.length} 卷</dd></div><div><dt>完整故事</dt><dd>{total} 章</dd></div></dl><Link className={styles.startReading} href={`/story/side/${sideStoryEras[0].slug}`}>從最早支線開始<ArrowRight /></Link></div>
        <div className={styles.coverStack} aria-label="Warframe 支線篇章封面預覽">
          {[sideStoryEras[1], sideStoryEras[2], sideStoryEras[4]].map((era, index) => (
            <figure key={era.slug} data-layer={index}>
              <img src={era.heroImage} alt={`${era.title}篇章封面`} />
              <figcaption><span>第 {era.number} 卷</span>{era.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className={styles.chapterDirectory}><header className={styles.directoryHeading}><div><p className={styles.eyebrow}><Layers3 />CHRONOLOGICAL DIRECTORY</p><h2>年代目錄</h2></div><p>按故事發生與解鎖脈絡排列；主線已有的任務在這裡提供更完整版本。</p></header>
        <div className={styles.chapterGrid}>{sideStoryEras.map((era) => <Link className={styles.chapterCard} href={`/story/side/${era.slug}`} key={era.slug} style={{ "--card-accent": era.accent } as CSSProperties}><div className={styles.chapterCardImage}><img src={era.heroImage} alt={`${era.title}篇章封面`} /><span>{era.number}</span></div><div className={styles.chapterCardBody}><p>第 {era.number} 卷</p><h3>{era.title}</h3><small>{era.englishTitle}</small><strong>{era.era}</strong><span className={styles.chapterDeck}>{era.deck}</span><footer><span><BookOpenText />{era.stories.length} 章</span><span><Clock3 />依序閱讀</span><ArrowRight /></footer></div></Link>)}</div>
      </section>
      <footer className={styles.bookFooter}><div><span className={styles.brandMark}>K</span><p><strong>KETHER SIDE STORY ARCHIVE</strong><small>支線任務完整故事</small></p></div><Link href="/story"><ArrowLeft />主線故事全書</Link></footer>
    </div>
  </main>;
}

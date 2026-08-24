import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ChevronRight,
  Clock3,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import {
  getStoryChapter,
  storyChapters,
} from "../../../data/storyFlow";
import styles from "../story.module.css";

type StoryChapterPageProps = {
  params: Promise<{ chapter: string }>;
};

export function generateStaticParams() {
  return storyChapters.map((chapter) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({
  params,
}: StoryChapterPageProps): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = getStoryChapter(slug);

  if (!chapter) {
    return { title: "找不到故事章節｜KETHER" };
  }

  return {
    title: chapter.title + "｜Warframe 故事全書｜KETHER",
    description: chapter.deck,
    openGraph: {
      title: chapter.title + "｜Warframe 故事全書",
      description: chapter.deck,
      images: [{ url: chapter.heroImage, alt: chapter.heroAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: chapter.title + "｜Warframe 故事全書",
      description: chapter.deck,
      images: [chapter.heroImage],
    },
  };
}

export default async function StoryChapterPage({
  params,
}: StoryChapterPageProps) {
  const { chapter: slug } = await params;
  const chapter = getStoryChapter(slug);

  if (!chapter) {
    notFound();
  }

  const chapterIndex = storyChapters.findIndex(
    (entry) => entry.slug === chapter.slug,
  );
  const previousChapter =
    chapterIndex > 0 ? storyChapters[chapterIndex - 1] : undefined;
  const nextChapter =
    chapterIndex < storyChapters.length - 1
      ? storyChapters[chapterIndex + 1]
      : undefined;

  return (
    <main
      className={styles.bookPage}
      style={{ "--chapter-accent": chapter.accent } as CSSProperties}
    >
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
        <nav className={styles.breadcrumb} aria-label="麵包屑">
          <Link href="/">首頁</Link>
          <ChevronRight aria-hidden="true" />
          <Link href="/story">故事全書</Link>
          <ChevronRight aria-hidden="true" />
          <span>{chapter.title}</span>
        </nav>

        <article>
          <header className={styles.chapterHero}>
            <img src={chapter.heroImage} alt={chapter.heroAlt} />
            <div className={styles.chapterHeroShade} />
            <div className={styles.chapterHeroContent}>
              <p>
                <span>{chapter.number}</span>
                {chapter.label}
              </p>
              <h1>{chapter.title}</h1>
              <small>{chapter.englishTitle}</small>
              <strong>{chapter.era}</strong>
              <p className={styles.chapterIntro}>{chapter.deck}</p>
              <div className={styles.chapterMeta}>
                <span>
                  <BookOpenText aria-hidden="true" />
                  {chapter.passages.length} 節故事
                </span>
                <span>
                  <Clock3 aria-hidden="true" />
                  {chapter.readTime}
                </span>
              </div>
            </div>
          </header>

          <aside className={styles.fullSpoilerWarning}>
            <ShieldAlert aria-hidden="true" />
            <div>
              <strong>{chapter.spoilerLevel}</strong>
              <p>
                這一頁是完整故事正文，會直接說明角色身分、事件真相與任務結局。
              </p>
            </div>
          </aside>

          <nav className={styles.chapterToc} aria-label={chapter.title + "章內目錄"}>
            <p>
              <Sparkles aria-hidden="true" />
              本章內容
            </p>
            <ol>
              {chapter.passages.map((passage, index) => (
                <li key={passage.id}>
                  <a href={"#" + passage.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {passage.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.narrative}>
            {chapter.passages.map((passage, index) => (
              <section
                className={styles.passage}
                id={passage.id}
                key={passage.id}
              >
                <header className={styles.passageHeader}>
                  <div className={styles.passageNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p>{passage.kicker}</p>
                    <h2>{passage.title}</h2>
                    <small>{passage.englishTitle}</small>
                    <strong>{passage.period}</strong>
                  </div>
                </header>

                <p className={styles.passageLead}>{passage.summary}</p>

                {passage.image ? (
                  <figure className={styles.storyFigure}>
                    <img src={passage.image.src} alt={passage.image.alt} />
                    <figcaption>{passage.image.caption}</figcaption>
                  </figure>
                ) : null}

                <div className={styles.prose}>
                  {passage.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className={styles.meaningCard}>
                  <Sparkles aria-hidden="true" />
                  <div>
                    <strong>{passage.meaning.title}</strong>
                    <p>{passage.meaning.text}</p>
                  </div>
                </div>

                <div className={styles.characterRow}>
                  <Users aria-hidden="true" />
                  <span>本節人物</span>
                  <div>
                    {passage.characters.map((character) => (
                      <small key={character}>{character}</small>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className={styles.chapterSources}>
            <div>
              <p>OFFICIAL REFERENCES</p>
              <h2>本章官方資料</h2>
              <span>
                正文為繁體中文整理與敘事改寫；任務順序、前置與最新內容依 Digital
                Extremes 官方資料校對。
              </span>
            </div>
            <div>
              {chapter.sources.map((source) => (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  key={source.url}
                >
                  {source.label}
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <nav className={styles.chapterPager} aria-label="前後章節">
            {previousChapter ? (
              <Link href={"/story/" + previousChapter.slug}>
                <ArrowLeft aria-hidden="true" />
                <span>
                  <small>上一章</small>
                  <strong>{previousChapter.title}</strong>
                </span>
              </Link>
            ) : (
              <Link href="/story">
                <ArrowLeft aria-hidden="true" />
                <span>
                  <small>返回</small>
                  <strong>章節目錄</strong>
                </span>
              </Link>
            )}

            {nextChapter ? (
              <Link href={"/story/" + nextChapter.slug}>
                <span>
                  <small>下一章</small>
                  <strong>{nextChapter.title}</strong>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/story">
                <span>
                  <small>閱讀完成</small>
                  <strong>回到章節目錄</strong>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </nav>
        </article>

        <footer className={styles.bookFooter}>
          <div>
            <span className={styles.brandMark}>K</span>
            <p>
              <strong>KETHER STORY ARCHIVE</strong>
              <small>Warframe 圖文故事全書</small>
            </p>
          </div>
          <Link href="/story">章節目錄</Link>
        </footer>
      </div>
    </main>
  );
}

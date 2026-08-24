import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ExternalLink,
  GitBranch,
  LockKeyhole,
  Map,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import {
  STORY_UPDATED_AT,
  currentBranches,
  officialSources,
  retiredLore,
  sideStories,
  storyArcs,
} from "../../data/storyFlow";
import styles from "./story.module.css";

export const metadata: Metadata = {
  title: "Warframe 完整故事流程｜KETHER",
  description:
    "繁體中文 Warframe 劇情流程：主線任務、關鍵支線、歷史事件、前置條件與可收合劇透摘要。",
};

const mainQuestCount = storyArcs.reduce(
  (total, arc) => total + arc.steps.filter((step) => step.kind === "主線").length,
  0,
);

const allStepCount = storyArcs.reduce(
  (total, arc) => total + arc.steps.length,
  0,
);

export default function StoryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/" aria-label="回到 KETHER 首頁">
          <span className={styles.brandMark}>K</span>
          <span>
            <strong>KETHER</strong>
            <small>WARFRAME DATABASE</small>
          </span>
        </Link>
        <HomeNewInlineMenu />
      </header>

      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="麵包屑">
          <Link href="/">首頁</Link>
          <ChevronRight aria-hidden="true" />
          <span>故事流程</span>
        </nav>

        <section className={styles.hero} aria-labelledby="story-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <Sparkles aria-hidden="true" />
              TENNO STORY ARCHIVE
            </p>
            <h1 id="story-title">
              從第一場夢，
              <br />
              走到虛空戰爭
            </h1>
            <p className={styles.lead}>
              這不是任務名稱堆疊，而是一條可以照著玩的繁體中文故事路線。
              先看前置與無雷摘要；想知道真相時，再自己打開劇透。
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#awakening">
                從覺醒開始
                <ArrowDown aria-hidden="true" />
              </a>
              <a className={styles.secondaryAction} href="#latest">
                查看最新章節
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>

          <dl className={styles.heroStats}>
            <div>
              <dt>官方主線</dt>
              <dd>{mainQuestCount}</dd>
              <span>個任務節點</span>
            </div>
            <div>
              <dt>完整路線</dt>
              <dd>{allStepCount}</dd>
              <span>含歷史與關鍵支線</span>
            </div>
            <div>
              <dt>資料版本</dt>
              <dd>2026.08</dd>
              <span>已納入最新故事</span>
            </div>
          </dl>
        </section>

        <aside className={styles.spoilerNotice}>
          <ShieldAlert aria-hidden="true" />
          <div>
            <strong>劇透保護已開啟</strong>
            <p>
              所有重大轉折預設收合。任務名稱、前置與無雷摘要會直接顯示，
              點「展開劇透摘要」才會看到真相。
            </p>
          </div>
        </aside>

        <nav className={styles.arcNav} aria-label="故事章節快速導覽">
          {storyArcs.map((arc) => (
            <a href={"#" + arc.id} key={arc.id}>
              <span>{arc.number}</span>
              <strong>{arc.title}</strong>
              <small>{arc.era}</small>
            </a>
          ))}
        </nav>

        <section className={styles.readingGuide} aria-labelledby="reading-guide-title">
          <div className={styles.sectionIcon}>
            <Map aria-hidden="true" />
          </div>
          <div>
            <p className={styles.sectionKicker}>HOW TO READ</p>
            <h2 id="reading-guide-title">兩條時間線，不要混在一起</h2>
            <p>
              頁面主體採「建議遊玩順序」，讓新玩家知道下一步去哪裡；
              第 00 章則是「世界內年代」，用來補 Orokin、Zariman 與 Old War 的遠古歷史。
              限時活動造成的斷層集中放在頁面後段。
            </p>
          </div>
        </section>

        {storyArcs.map((arc) => (
          <section className={styles.arcSection} id={arc.id} key={arc.id}>
            <header className={styles.arcHeader}>
              <div className={styles.arcNumber}>{arc.number}</div>
              <div>
                <p className={styles.sectionKicker}>{arc.kicker}</p>
                <h2>{arc.title}</h2>
                <p className={styles.arcEra}>{arc.era}</p>
                <p className={styles.arcSummary}>{arc.summary}</p>
              </div>
            </header>

            <div className={styles.timeline}>
              {arc.steps.map((step, index) => (
                <article className={styles.storyCard} key={step.id}>
                  <div className={styles.timelineRail} aria-hidden="true">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardHeading}>
                      <div>
                        <span className={styles.kindBadge} data-kind={step.kind}>
                          {step.kind}
                        </span>
                        <h3>{step.title}</h3>
                        <p className={styles.englishTitle}>{step.englishTitle}</p>
                      </div>
                      <CircleDot aria-hidden="true" />
                    </div>

                    <div className={styles.metaGrid}>
                      <div>
                        <GitBranch aria-hidden="true" />
                        <span>
                          <small>前置條件</small>
                          <strong>{step.prerequisite}</strong>
                        </span>
                      </div>
                      <div>
                        <CheckCircle2 aria-hidden="true" />
                        <span>
                          <small>完成後</small>
                          <strong>{step.unlock}</strong>
                        </span>
                      </div>
                    </div>

                    <p className={styles.stepSummary}>{step.summary}</p>

                    {step.note ? (
                      <p className={styles.routeNote}>
                        <BookOpenText aria-hidden="true" />
                        {step.note}
                      </p>
                    ) : null}

                    <details className={styles.spoilerBox}>
                      <summary>
                        <span>
                          <LockKeyhole aria-hidden="true" />
                          展開劇透摘要
                        </span>
                        <ChevronDown aria-hidden="true" />
                      </summary>
                      <div>
                        {step.spoilers.map((spoiler) => (
                          <p key={spoiler}>{spoiler}</p>
                        ))}
                      </div>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.catalogSection} id="side-stories">
          <header className={styles.catalogHeader}>
            <div>
              <p className={styles.sectionKicker}>OPTIONAL BUT MEANINGFUL</p>
              <h2>關鍵支線插入位置</h2>
            </div>
            <p>
              不會全部卡住主線，但它們會補完角色、陣營與 Warframe 傳說。
              依右側的「建議插入」遊玩，劇情比較不會跳針。
            </p>
          </header>

          <div className={styles.sideGrid}>
            {sideStories.map((story) => (
              <article key={story.englishTitle}>
                <span>{story.era}</span>
                <h3>{story.title}</h3>
                <p className={styles.englishTitle}>{story.englishTitle}</p>
                <div>
                  <small>建議插入</small>
                  <strong>{story.insertAfter}</strong>
                </div>
                <p>{story.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.historySection} id="events">
          <header>
            <div className={styles.sectionIcon}>
              <GitBranch aria-hidden="true" />
            </div>
            <div>
              <p className={styles.sectionKicker}>MISSING CHAPTERS</p>
              <h2>遊戲裡為什麼像少了一段？</h2>
              <p>
                Warframe 早年用限時行動推進世界。部分劇情今天無法完整重玩，
                所以角色關係偶爾會突然改變；以下是最常遇到的斷層。
              </p>
            </div>
          </header>

          <div className={styles.eventList}>
            {retiredLore.map((event) => (
              <article key={event.title}>
                <span>{event.status}</span>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.latestSection} id="latest">
          <header className={styles.latestHeader}>
            <div>
              <p className={styles.sectionKicker}>CURRENT FRONTIER</p>
              <h2>2025–2026 最新可玩章節</h2>
            </div>
            <p>
              這些內容不全是一條直線，因此以「實際前置」標示。
              Tau 大型篇章仍在未來，這裡不會把尚未推出的內容寫成已上線。
            </p>
          </header>

          <div className={styles.latestGrid}>
            {currentBranches.map((branch) => (
              <article key={branch.englishTitle}>
                <div className={styles.latestTopline}>
                  <span>{branch.kind}</span>
                  <time dateTime={branch.date.split(".").join("-")}>
                    <CalendarDays aria-hidden="true" />
                    {branch.date}
                  </time>
                </div>
                <h3>{branch.title}</h3>
                <p className={styles.englishTitle}>{branch.englishTitle}</p>
                <p className={styles.latestSummary}>{branch.summary}</p>
                <dl>
                  <div>
                    <dt>前置</dt>
                    <dd>{branch.prerequisite}</dd>
                  </div>
                  <div>
                    <dt>位置</dt>
                    <dd>{branch.placement}</dd>
                  </div>
                </dl>
                <a href={branch.sourceUrl} target="_blank" rel="noreferrer">
                  查看官方資料
                  <ExternalLink aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sourcesSection} aria-labelledby="sources-title">
          <div>
            <p className={styles.sectionKicker}>OFFICIAL SOURCES</p>
            <h2 id="sources-title">資料依據</h2>
            <p>
              主線順序以 Digital Extremes 官方 Quest Guide 為準；
              最新支線則依各更新公告的實際前置補入。更新日期：{STORY_UPDATED_AT}。
            </p>
          </div>
          <div className={styles.sourceLinks}>
            {officialSources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span>
                  <strong>{source.label}</strong>
                  <small>{source.description}</small>
                </span>
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <span className={styles.brandMark}>K</span>
            <p>
              <strong>KETHER STORY ARCHIVE</strong>
              <small>跟著任務走，也看懂每一次選擇。</small>
            </p>
          </div>
          <Link href="/">
            回到資料庫
            <ArrowRight aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}

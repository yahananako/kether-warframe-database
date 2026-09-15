import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ExternalLink,
  Gauge,
  MapPin,
  Sparkles,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";

import WarframeMarketCard from "../../../../components/WarframeMarketCard";
import { regularWarframes } from "../../../../data/regularWarframes";
import { warframeCanonProfileMap } from "../../../../data/warframeCanonProfiles";
import {
  getWarframeDetail,
  toWarframeSlug,
  WARFRAME_DETAILS_UPDATED_AT,
  warframeDetails,
} from "../../../../data/warframeDetails";
import {
  getWarframeRole,
  WARFRAME_ROLES,
} from "../../../../data/warframeRoles";
import { warframeStories } from "../../../../data/warframeStories";
import styles from "./warframeDetail.module.css";

export function generateStaticParams() {
  return warframeDetails.map((warframe) => ({ slug: warframe.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const route = await params;
  const warframe = getWarframeDetail(route.slug);
  return warframe
    ? {
        title: `${warframe.name}｜技能、入手與配裝｜KETHER`,
        description: `${warframe.name} 的技能說明、基礎數值、取得來源、Prime 市價與獨立配裝頁。`,
      }
    : { title: "找不到戰甲｜KETHER" };
}

export default async function WarframeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const route = await params;
  const warframe = getWarframeDetail(route.slug);
  if (!warframe) notFound();

  const acquisition =
    regularWarframes.find((item) => item.name === warframe.name)?.acquisition ??
    (warframe.name === "Excalibur Umbra"
      ? "完成主線系列任務「犧牲」後取得完整 Excalibur Umbra 與專屬武器。"
      : "取得條件仍在整理中，請以遊戲內 Codex 與官方更新說明為準。");
  const role = getWarframeRole(warframe.name, warframe.description);
  const roleInfo = WARFRAME_ROLES[role];
  const story = warframeStories.find(
    (item) => toWarframeSlug(item.name) === warframe.slug,
  );
  const profile = warframeCanonProfileMap.get(
    warframe.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  const lore = story ?? profile;
  const loreParagraphs = lore?.paragraphs ?? [];
  const loreAccent = story?.accent ?? "#70dcff";
  const loreType = story?.era ?? profile?.sourceType;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.topbar}>
          <Link href="/database/warframes">
            <ArrowLeft /> 一般戰甲資料庫
          </Link>
          <span>資料更新 {WARFRAME_DETAILS_UPDATED_AT}</span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p>KETHER WARFRAME DOSSIER・{roleInfo.english}</p>
            <h1>{warframe.name}</h1>
            <span className={styles.roleBadge}>{roleInfo.label}型戰甲</span>
            <p className={styles.description}>{warframe.description}</p>
            <div className={styles.heroActions}>
              <Link href={`/database/warframes/${warframe.slug}/build`}>
                <Wrench /> 開啟獨立配裝頁
              </Link>
              {warframe.name === "Excalibur" ? (
                <Link href="/database/warframes/excalibur-umbra">
                  Excalibur Umbra 檔案
                </Link>
              ) : null}
              <a href={warframe.officialUrl} target="_blank" rel="noreferrer">
                官方戰甲頁 <ExternalLink />
              </a>
            </div>
          </div>
          <figure className={styles.heroArt}>
            <div />
            <img src={warframe.imageUrl} alt={`${warframe.name} 戰甲全身圖`} />
            <figcaption>{roleInfo.description}</figcaption>
          </figure>
        </section>

        <section className={styles.statGrid} aria-label="基礎數值">
          {[
            ["生命", warframe.stats.health],
            ["護盾", warframe.stats.shield],
            ["護甲", warframe.stats.armor],
            ["能量", warframe.stats.energy],
            ["衝刺", warframe.stats.sprint],
          ].map(([label, value]) => (
            <article key={label}>
              <Gauge />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p>ABILITIES・CLICK TO EXPAND</p>
              <h2>技能資料</h2>
            </div>
            <span>點擊技能卡展開說明</span>
          </header>
          <div className={styles.abilityGrid}>
            {warframe.abilities.map((ability) => (
              <details key={`${warframe.slug}-${ability.number}`}>
                <summary>
                  <span>{String(ability.number).padStart(2, "0")}</span>
                  {ability.imageUrl ? (
                    <img src={ability.imageUrl} alt="" />
                  ) : null}
                  <strong>{ability.name}</strong>
                  <i>＋</i>
                </summary>
                <p>{ability.description}</p>
              </details>
            ))}
          </div>
          <aside className={styles.passive}>
            <Sparkles />
            <div>
              <strong>被動技能</strong>
              <p>{warframe.passiveDescription || "被動技能資料整理中。"}</p>
            </div>
          </aside>
        </section>

        <div className={styles.infoColumns}>
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <div>
                <p>ACQUISITION</p>
                <h2>取得方式</h2>
              </div>
            </header>
            <div className={styles.acquisition}>
              <MapPin />
              <p>{acquisition}</p>
            </div>
            <div className={styles.componentList}>
              {warframe.components.length ? (
                warframe.components.map((component) => (
                  <article key={component.name}>
                    <h3>{component.name}</h3>
                    {component.drops.length ? (
                      <ul>
                        {component.drops.map((drop) => (
                          <li key={`${drop.location}-${drop.chance}`}>
                            <span>{drop.location}</span>
                            <b>
                              {drop.chance === null
                                ? drop.rarity || "任務獎勵"
                                : `${drop.chance.toFixed(2)}%`}
                            </b>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>依上方任務流程取得。</p>
                    )}
                  </article>
                ))
              ) : (
                <p className={styles.muted}>
                  此戰甲沒有可拆分顯示的部件掉落資料。
                </p>
              )}
            </div>
          </section>

          <div className={styles.market}>
            <WarframeMarketCard
              name={warframe.name}
              marketSlug={warframe.marketSlug}
              hasPrime={warframe.hasPrime}
            />
          </div>
        </div>

        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p>LORE PROFILE</p>
              <h2>故事與角色設定</h2>
            </div>
          </header>
          {lore ? (
            <article
              className={styles.lore}
              style={{ "--lore-accent": loreAccent } as CSSProperties}
            >
              <BookOpenText />
              <div>
                <span>{loreType}</span>
                <h3>{lore.epithet}</h3>
                <strong>{lore.summary}</strong>
                {loreParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <a href={lore.source.url} target="_blank" rel="noreferrer">
                  {lore.source.label} <ExternalLink />
                </a>
              </div>
            </article>
          ) : (
            <div className={styles.emptyLore}>
              此角色目前沒有獨立的遊戲內傳記；技能與官方角色資料已完整保留在本頁。
            </div>
          )}
        </section>

        <section className={styles.buildCta}>
          <div>
            <p>ARCHON SHARDS・MOD SLOTS・ARCANES</p>
            <h2>替 {warframe.name} 建立一頁自己的配置</h2>
            <span>
              含 8 格 MOD、靈氣、特殊功能、2 格賦能與 5
              顆執政官寶石；設定會留在目前裝置。
            </span>
          </div>
          <Link href={`/database/warframes/${warframe.slug}/build`}>
            進入配裝頁 <ArrowRight />
          </Link>
        </section>
      </div>
    </main>
  );
}

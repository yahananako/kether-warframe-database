"use client";

import { ExternalLink, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";

import type {
  IncarnonCategory,
  IncarnonKind,
  IncarnonWeapon,
} from "../data/incarnonWeapons";
import { incarnonCatalog } from "../data/incarnonWeapons";
import styles from "./IncarnonWeaponArchive.module.css";

type CategoryFilter = IncarnonCategory | "all";
type KindFilter = IncarnonKind | "all";

const categoryOptions: Array<{
  value: CategoryFilter;
  label: string;
  shortLabel: string;
}> = [
  { value: "all", label: "全部武器", shortLabel: "全部" },
  { value: "primary", label: "主要武器", shortLabel: "主要" },
  { value: "secondary", label: "次要武器", shortLabel: "次要" },
  { value: "melee", label: "近戰武器", shortLabel: "近戰" },
];

const sectionMeta: Array<{
  value: IncarnonCategory;
  eyebrow: string;
  title: string;
  description: string;
}> = [
  {
    value: "primary",
    eyebrow: "PRIMARY INCARNON",
    title: "主要武器",
    description: "步槍、霰彈槍、弓與其他主要欄位的應感武器。",
  },
  {
    value: "secondary",
    eyebrow: "SECONDARY INCARNON",
    title: "次要武器",
    description: "手槍、投擲武器與腕式次要武器的應感進化。",
  },
  {
    value: "melee",
    eyebrow: "MELEE INCARNON",
    title: "近戰武器",
    description: "刀劍、拳套、長柄與其他近戰武器的應感能力。",
  },
];

const kindOptions: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "全部類型" },
  { value: "genesis", label: "應感創件" },
  { value: "natural", label: "原生應感" },
];

const searchTextCache = new Map<string, string>();

function searchableText(weapon: IncarnonWeapon) {
  const cached = searchTextCache.get(weapon.id);
  if (cached) return cached;

  const text = [
    weapon.name,
    weapon.nameZh,
    weapon.effect.zh,
    weapon.effect.en,
    ...weapon.evolutions.flatMap((evolution) => [
      evolution.unlockCondition.zh,
      evolution.unlockCondition.en,
      ...evolution.abilities.flatMap((ability) => [
        ability.name,
        ability.description,
        ability.notes ?? "",
      ]),
    ]),
  ]
    .join(" ")
    .toLocaleLowerCase("zh-Hant");
  searchTextCache.set(weapon.id, text);
  return text;
}

function WeaponCard({
  weapon,
  eager,
}: {
  weapon: IncarnonWeapon;
  eager: boolean;
}) {
  const kindLabel = weapon.kind === "genesis" ? "應感創件" : "原生應感";

  return (
    <article className={styles.weaponCard} data-kind={weapon.kind}>
      <details className={styles.weaponDetails}>
        <summary className={styles.weaponSummary}>
          <span className={styles.imageStage}>
            <Image
              src={weapon.image}
              alt={`${weapon.nameZh}（${weapon.name}）武器圖片`}
              width={260}
              height={260}
              sizes="(max-width: 700px) 42vw, (max-width: 1100px) 24vw, 220px"
              priority={eager}
            />
            <span className={styles.imageGlow} aria-hidden="true" />
          </span>

          <span className={styles.weaponIntro}>
            <span className={styles.badgeRow}>
              <span className={styles.kindBadge}>{kindLabel}</span>
              {weapon.rotation ? (
                <span className={styles.rotationBadge}>
                  輪替 {weapon.rotation}
                </span>
              ) : null}
            </span>

            <span className={styles.weaponName}>
              <strong>{weapon.nameZh}</strong>
              <small>{weapon.name}</small>
            </span>

            <span className={styles.effectBlock}>
              <span>靈化特效</span>
              <b>{weapon.effect.zh}</b>
            </span>

            <span className={styles.expandHint}>
              <Sparkles size={15} aria-hidden="true" />
              查看 {weapon.evolutions.length} 階進化條件與能力
            </span>
          </span>
        </summary>

        <div className={styles.evolutionBody}>
          <div className={styles.evolutionList}>
            {weapon.evolutions.map((evolution) => (
              <section key={evolution.tier} className={styles.evolutionCard}>
                <div className={styles.evolutionHeading}>
                  <span>進化 {evolution.tier}</span>
                  <strong>
                    {evolution.tier === 1 ? "靈化形態" : "進化能力"}
                  </strong>
                </div>

                <div className={styles.unlockBox}>
                  <span>進化解鎖條件</span>
                  <strong>
                    {evolution.unlockCondition.zh ||
                      evolution.unlockCondition.en}
                  </strong>
                </div>

                <div className={styles.abilityList}>
                  {evolution.abilities.map((ability) => (
                    <div
                      key={`${evolution.tier}-${ability.name}`}
                      className={styles.abilityItem}
                    >
                      <div>
                        <strong>{ability.name}</strong>
                        <p>{ability.description}</p>
                      </div>

                      {ability.variantValues ? (
                        <details className={styles.subDetails}>
                          <summary>查看各版本數值</summary>
                          <dl>
                            {Object.entries(ability.variantValues).map(
                              ([variant, value]) => (
                                <div key={variant}>
                                  <dt>{variant}</dt>
                                  <dd>{value}</dd>
                                </div>
                              ),
                            )}
                          </dl>
                        </details>
                      ) : null}

                      {ability.notes ? (
                        <details className={styles.subDetails}>
                          <summary>能力備註</summary>
                          <p>{ability.notes}</p>
                        </details>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <a
            className={styles.sourceLink}
            href={weapon.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Warframe Wiki 原始資料
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </details>
    </article>
  );
}

export default function IncarnonWeaponArchive({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const weapons = incarnonCatalog.weapons;
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [rotation, setRotation] = useState("all");

  const filteredWeapons = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase("zh-Hant");
    return weapons.filter((weapon) => {
      if (category !== "all" && weapon.category !== category) return false;
      if (kind !== "all" && weapon.kind !== kind) return false;
      if (rotation !== "all" && weapon.rotation !== Number(rotation))
        return false;
      return (
        !normalizedQuery || searchableText(weapon).includes(normalizedQuery)
      );
    });
  }, [category, deferredQuery, kind, rotation, weapons]);

  const activeSections = sectionMeta.filter(
    (section) => category === "all" || section.value === category,
  );

  return (
    <div className={styles.archive}>
      <section className={styles.controls} aria-label="應感武器搜尋與篩選">
        <div className={styles.stationLabel}><Sparkles size={15} aria-hidden="true" /> KETHER / INCARNON CONTROL</div>
        <label className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.screenReaderOnly}>搜尋應感武器</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋中英文名稱、特效或進化能力…"
            type="search"
          />
        </label>

        <div className={styles.categoryTabs} aria-label="武器欄位">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                category === option.value ? styles.activeTab : undefined
              }
              aria-pressed={category === option.value}
              onClick={() => setCategory(option.value)}
            >
              <span>{option.label}</span>
              <small>{option.shortLabel}</small>
            </button>
          ))}
        </div>

        <div className={styles.selectRow}>
          <label>
            <span>靈化類型</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as KindFilter)}
            >
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>鋼韌巡迴輪替</span>
            <select
              value={rotation}
              onChange={(event) => setRotation(event.target.value)}
            >
              <option value="all">全部輪替</option>
              {Array.from({ length: 9 }, (_, index) => index + 1).map(
                (week) => (
                  <option key={week} value={week}>
                    第 {week} 組
                  </option>
                ),
              )}
            </select>
          </label>

          <p aria-live="polite">
            顯示 <strong>{filteredWeapons.length}</strong> / {weapons.length} 把
          </p>
        </div>
      </section>

      <div className={styles.results} aria-label="靈化武器檔案清單">
      {filteredWeapons.length ? (
        activeSections.map((section) => {
          const sectionWeapons = filteredWeapons.filter(
            (weapon) => weapon.category === section.value,
          );
          if (!sectionWeapons.length) return null;

          return (
            <section key={section.value} className={styles.categorySection}>
              <header className={styles.sectionHeader}>
                <div>
                  <p>{section.eyebrow}</p>
                  <h2>{section.title}</h2>
                  <span>{section.description}</span>
                </div>
                <strong>{sectionWeapons.length}</strong>
              </header>

              <div className={styles.weaponGrid}>
                {sectionWeapons.map((weapon, index) => (
                  <WeaponCard
                    key={weapon.id}
                    weapon={weapon}
                    eager={index === 0}
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <section className={styles.emptyState}>
          <Sparkles size={28} aria-hidden="true" />
          <h2>找不到符合的應感武器</h2>
          <p>試著清除搜尋文字，或切換武器欄位與輪替條件。</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setKind("all");
              setRotation("all");
            }}
          >
            清除全部篩選
          </button>
        </section>
      )}
      </div>
    </div>
  );
}

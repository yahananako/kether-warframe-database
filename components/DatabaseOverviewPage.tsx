"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BookOpenText,
  Database, Gem, Layers3, RadioTower, ShieldCheck, Sparkles,
} from "lucide-react";
import type { SheetRow } from "../lib/sheets";
import styles from "./DatabaseCommandCenter.module.css";

export type OverviewCategoryStat = {
  key: string;
  label: string;
  total: number;
  priced: number;
  owned: number;
  value: number;
  error?: string | null;
};

type Metric = "total" | "priced" | "owned" | "value";

const metrics: { key: Metric; label: string; suffix: string }[] = [
  { key: "total", label: "收錄數量", suffix: "筆" },
  { key: "priced", label: "已標價", suffix: "筆" },
  { key: "owned", label: "表格已購買", suffix: "筆" },
  { key: "value", label: "參考估值", suffix: "白金" },
];

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}
function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-TW").format(value);
}
function percent(part: number, total: number): number {
  return total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;
}
function isOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}
function target(key: string): string {
  return "/database/" + key;
}

export default function DatabaseOverviewPage({
  rows,
  title,
  subtitle,
  error,
  categoryStats = [],
}: {
  rows: SheetRow[];
  title: string;
  subtitle: string;
  error?: string | null;
  categoryStats?: OverviewCategoryStat[];
}) {
  const [metric, setMetric] = useState<Metric>("total");

  const summary = useMemo(() => {
    const total = rows.length;
    const priced = rows.filter((row) => priceNumber(row.price) > 0).length;
    const owned = rows.filter((row) => isOwned(row.owned)).length;
    const value = rows.reduce((sum, row) => sum + priceNumber(row.price), 0);
    const categoryTotal = categoryStats.reduce((sum, row) => sum + row.total, 0);
    const categoryPriced = categoryStats.reduce((sum, row) => sum + row.priced, 0);
    const categoryOwned = categoryStats.reduce((sum, row) => sum + row.owned, 0);
    const categoryValue = categoryStats.reduce((sum, row) => sum + row.value, 0);
    const failed = categoryStats.filter((item) => Boolean(item.error)).length;
    return {
      total, priced, owned, value,
      categoryTotal, categoryPriced, categoryOwned, categoryValue, failed,
    };
  }, [rows, categoryStats]);

  const maxMetric = Math.max(1, ...categoryStats.map((row) => row[metric]));
  const priceRate = percent(summary.categoryPriced, summary.categoryTotal);
  const ownedRate = percent(summary.categoryOwned, summary.categoryTotal);
  const allFailed = summary.failed === categoryStats.length && categoryStats.length > 0;
  const hasWarnings = Boolean(error) || summary.failed > 0;

  return (
    <section className={styles.commandDeck} aria-label="KETHER 資料庫控制中心">
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <p className={styles.eyebrow}><Database size={15} aria-hidden="true" /> TENNO DATA SYSTEM</p>
          <div className={styles.brandTitle}>
            <h1>資料庫<span>控制中心</span></h1>
            <img src="/kether-clan-logo.png" alt="" aria-hidden="true" />
          </div>
          <p>{subtitle}</p>
          <div className={styles.syncInfo}>
            <span className={styles.syncPulse} aria-hidden="true" />
            {hasWarnings ? "部分資料源暫時無法讀取" : "資料庫統計已載入"}
          </div>
        </div>

        <div className={styles.sidebarTitle}>
          <span>分類檔案庫</span>
          <small>ARCHIVE DIRECTORY · {categoryStats.length.toString().padStart(2, "0")}</small>
        </div>
        <nav className={styles.categoryLinks} aria-label="資料庫分類">
          {categoryStats.map((item, index) => (
            <Link href={target(item.key)} key={item.key} className={styles.categoryLink}>
              <span className={styles.categoryIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.categoryName}>
                <strong>{item.label}</strong>
                <small>{item.error ? "資料讀取異常" : "開啟資料分類"}</small>
              </span>
              <span className={styles.categoryTotal}>{formatNumber(item.total)}</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Sparkles size={16} aria-hidden="true" />
          <span>資料查詢與跨平台同步遵守 KETHER 共通資料規格</span>
        </div>
      </aside>

      <section className={styles.workspace} aria-label="全分類資料與統計">
        <header className={styles.workspaceHead}>
          <div>
            <p className={styles.eyebrow}><Activity size={15} aria-hidden="true" /> LIVE ARCHIVE STATUS</p>
            <h2>{title || "資料總覽"} <span>/ SYSTEM OVERVIEW</span></h2>
          </div>
          <Link href="/search" className={styles.searchAction}>
            搜尋資料庫 <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </header>

        {hasWarnings ? (
          <p role="status" className={styles.warning}>
            {error ? "總覽讀取異常：" + error : "部分分類資料源讀取失敗，統計可能不完整。"}
            {summary.failed ? "（" + summary.failed + " 個分類異常）" : ""}
          </p>
        ) : null}

        <section className={styles.metricGrid} aria-label="資料庫主要統計">
          <article className={styles.metricCard}>
            <span><Database size={16} aria-hidden="true" /> 全分類收錄</span>
            <strong>{allFailed ? "—" : formatNumber(summary.categoryTotal)}</strong>
            <small>{categoryStats.length} 個分類資料來源</small>
          </article>
          <article className={styles.metricCard}>
            <span><ShieldCheck size={16} aria-hidden="true" /> 已標價資料</span>
            <strong>{allFailed ? "—" : formatNumber(summary.categoryPriced)}</strong>
            <small>{allFailed ? "等待重新連線" : "價格完成度 " + priceRate + "%"}</small>
          </article>
          <article className={styles.metricCard}>
            <span><BookOpenText size={16} aria-hidden="true" /> 表格已購買</span>
            <strong>{allFailed ? "—" : formatNumber(summary.categoryOwned)}</strong>
            <small>統計來源為表格，非 Discord 私人收藏</small>
          </article>
          <article className={styles.metricCard}>
            <span><Gem size={16} aria-hidden="true" /> 分類參考估值</span>
            <strong>{allFailed ? "—" : formatNumber(summary.categoryValue)}</strong>
            <small>白金 · 僅計已填入價格項目</small>
          </article>
        </section>

        <div className={styles.analyticsGrid}>
          <section className={styles.analyticsPanel} aria-labelledby="chart-heading">
            <header className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}><BarChart3 size={15} aria-hidden="true" /> DATABASE TELEMETRY</p>
                <h3 id="chart-heading">分類數據分析</h3>
              </div>
              <span className={styles.nodeCount}>NODE / {String(categoryStats.length).padStart(2, "0")}</span>
            </header>
            <div className={styles.metricTabs} role="group" aria-label="圖表統計項目">
              {metrics.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={metric === item.key}
                  onClick={() => setMetric(item.key)}
                  className={metric === item.key ? styles.activeTab : ""}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.chartList} aria-live="polite" aria-atomic="true">
              {categoryStats.length === 0 ? (
                <p className={styles.empty}>目前沒有可顯示的分類資料。</p>
              ) : categoryStats.map((item) => {
                const current = item[metric];
                const width = current > 0 ? Math.max(3, (current / maxMetric) * 100) : 0;
                const unit = metrics.find((entry) => entry.key === metric)?.suffix ?? "筆";
                return (
                  <div className={styles.chartRow} key={item.key}>
                    <div className={styles.chartLabel}>
                      <strong>{item.label}</strong>
                      <span>{item.error ? "讀取異常" : formatNumber(current) + " " + unit}</span>
                    </div>
                    <div className={styles.chartTrack}>
                      <i style={{ width: width + "%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <footer className={styles.panelFoot}>選擇上方指標即可立即切換統計視角。</footer>
          </section>

          <section className={styles.insightsPanel} aria-labelledby="insights-heading">
            <header className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}><Layers3 size={15} aria-hidden="true" /> KETHER PROGRESS MATRIX</p>
                <h3 id="insights-heading">資料完整度</h3>
              </div>
              <span className={styles.nodeCount}>PROGRESS</span>
            </header>
            <div className={styles.progressBody}>
              <div className={styles.ringBlock}>
                <div
                  className={styles.ring}
                  style={{ "--progress": priceRate + "%" } as CSSProperties}
                  role="img"
                  aria-label={"標價完成度 " + priceRate + "%"}
                >
                  <div><strong>{allFailed ? "—" : priceRate + "%"}</strong><small>價格完成度</small></div>
                </div>
                <p>跨分類價格狀態<br /><span>根據已載入表格計算</span></p>
              </div>
              <div className={styles.progressRows}>
                <div className={styles.progressRow}>
                  <span>標價覆蓋率 <b>{allFailed ? "—" : priceRate + "%"}</b></span>
                  <div className={styles.progressTrack}><i style={{ width: priceRate + "%" }} /></div>
                </div>
                <div className={styles.progressRow}>
                  <span>表格購買記錄 <b>{allFailed ? "—" : ownedRate + "%"}</b></span>
                  <div className={styles.progressTrack}><i style={{ width: ownedRate + "%" }} /></div>
                </div>
                <div className={styles.progressRow}>
                  <span>總覽分頁 <b>{error ? "讀取異常" : formatNumber(summary.total) + " 筆"}</b></span>
                  <div className={styles.progressTrack}>
                    <i style={{ width: percent(summary.priced, summary.total) + "%" }} />
                  </div>
                </div>
              </div>
              <div className={styles.referenceNote}>
                <RadioTower size={17} aria-hidden="true" />
                <span>上述統計僅為資料概況；私人收藏請至個人中心查看。</span>
              </div>
            </div>
            <Link href="/db-status" className={styles.statusAction}>
              查看資料同步狀態 <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </section>
    </section>
  );
}

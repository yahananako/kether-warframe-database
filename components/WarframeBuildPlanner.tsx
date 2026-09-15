"use client";

import { useEffect, useMemo, useState } from "react";
import type { WarframeRole } from "../data/warframeRoles";
import {
  ARCANE_OPTIONS,
  AURA_OPTIONS,
  EXILUS_OPTIONS,
  MOD_OPTIONS,
  SHARD_OPTIONS,
  WARFRAME_BUILD_TEMPLATES,
} from "../data/warframeBuilds";
import styles from "./WarframeBuildPlanner.module.css";

type BuildState = {
  aura: string;
  exilus: string;
  mods: string[];
  arcanes: string[];
  shards: string[];
};

function initialBuild(role: WarframeRole): BuildState {
  const template = WARFRAME_BUILD_TEMPLATES[role];
  return {
    aura: template.aura,
    exilus: template.exilus,
    mods: [...template.mods],
    arcanes: [...template.arcanes],
    shards: [...template.shards],
  };
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const choices = Array.from(new Set([value, ...options].filter(Boolean)));
  return (
    <label className={styles.slot}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">尚未配置</option>
        {choices.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function WarframeBuildPlanner({
  frameName,
  role,
}: {
  frameName: string;
  role: WarframeRole;
}) {
  const storageKey = useMemo(
    () => `kether-warframe-build:${frameName.toLowerCase()}`,
    [frameName],
  );
  const [build, setBuild] = useState<BuildState>(() => initialBuild(role));
  const [ready, setReady] = useState(false);
  const template = WARFRAME_BUILD_TEMPLATES[role];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setBuild(JSON.parse(saved));
    } catch {
      // Local storage is optional; the template remains usable without it.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(build));
  }, [build, ready, storageKey]);

  const updateArray = (
    key: "mods" | "arcanes" | "shards",
    index: number,
    value: string,
  ) => {
    setBuild((current) => {
      const next = [...current[key]];
      next[index] = value;
      return { ...current, [key]: next };
    });
  };

  return (
    <section className={styles.planner}>
      <header className={styles.heading}>
        <div>
          <span>KETHER BUILD MATRIX</span>
          <h2>{template.title}</h2>
          <p>{template.summary}</p>
        </div>
        <button type="button" onClick={() => setBuild(initialBuild(role))}>
          重設通用範本
        </button>
      </header>

      <div className={styles.priorityRow}>
        {template.priorities.map((priority, index) => (
          <span key={priority}>
            {index + 1}. {priority}
          </span>
        ))}
      </div>

      <div className={styles.specialSlots}>
        <OptionSelect
          label="靈氣槽"
          value={build.aura}
          options={AURA_OPTIONS}
          onChange={(value) =>
            setBuild((current) => ({ ...current, aura: value }))
          }
        />
        <OptionSelect
          label="特殊功能槽"
          value={build.exilus}
          options={EXILUS_OPTIONS}
          onChange={(value) =>
            setBuild((current) => ({ ...current, exilus: value }))
          }
        />
      </div>

      <section className={styles.group}>
        <header>
          <span>MOD CONFIGURATION</span>
          <h3>8 格 MOD 插槽</h3>
        </header>
        <div className={styles.modGrid}>
          {build.mods.map((value, index) => (
            <OptionSelect
              key={`mod-${index}`}
              label={`MOD ${index + 1}`}
              value={value}
              options={MOD_OPTIONS}
              onChange={(next) => updateArray("mods", index, next)}
            />
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <header>
          <span>ARCANE SLOTS</span>
          <h3>2 格賦能</h3>
        </header>
        <div className={styles.arcaneGrid}>
          {build.arcanes.map((value, index) => (
            <OptionSelect
              key={`arcane-${index}`}
              label={`賦能 ${index + 1}`}
              value={value}
              options={ARCANE_OPTIONS}
              onChange={(next) => updateArray("arcanes", index, next)}
            />
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <header>
          <span>ARCHON SHARDS</span>
          <h3>5 顆執政官寶石</h3>
        </header>
        <div className={styles.shardGrid}>
          {build.shards.map((value, index) => (
            <OptionSelect
              key={`shard-${index}`}
              label={`寶石 ${index + 1}`}
              value={value}
              options={SHARD_OPTIONS}
              onChange={(next) => updateArray("shards", index, next)}
            />
          ))}
        </div>
      </section>

      <p className={styles.savedNote}>
        ◆ 此裝置會自動保存 {frameName}{" "}
        的配置；通用範本是起點，可依技能與任務自行替換。
      </p>
    </section>
  );
}

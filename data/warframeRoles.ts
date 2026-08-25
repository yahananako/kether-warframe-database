export type WarframeRole = "damage" | "control" | "support" | "survival" | "stealth";

export const WARFRAME_ROLES: Record<WarframeRole, { label: string; english: string; description: string }> = {
  damage: { label: "傷害", english: "DAMAGE", description: "以技能爆發、持續傷害或武器增幅快速清除敵人。" },
  control: { label: "群控", english: "CROWD CONTROL", description: "限制、聚集、減速或癱瘓敵群，掌握戰場節奏。" },
  support: { label: "支援", english: "SUPPORT", description: "提供治療、能量、護盾、增益或團隊資源。" },
  survival: { label: "生存", english: "SURVIVAL", description: "依靠減傷、護甲、護盾、無敵或自我恢復承受壓力。" },
  stealth: { label: "匿蹤", english: "STEALTH", description: "隱形、欺敵或避開警戒，適合潛入與精準狩獵。" },
};

const roleMap: Record<string, WarframeRole> = {
  ash: "stealth", atlas: "survival", banshee: "damage", baruuk: "survival", caliban: "control",
  chroma: "damage", citrine: "support", cyte09: "stealth", dagath: "damage", dante: "support",
  ember: "damage", equinox: "control", excalibur: "damage", frost: "control", gara: "survival",
  garuda: "damage", gauss: "damage", grendel: "survival", gyre: "damage", harrow: "support",
  hildryn: "survival", hydroid: "control", inaros: "survival", ivara: "stealth", jade: "support",
  khora: "control", koumei: "control", kullervo: "damage", lavos: "damage", limbo: "control",
  loki: "stealth", mag: "control", mesa: "damage", mirage: "damage", nekros: "support",
  nezha: "survival", nidus: "survival", nova: "control", nyx: "control", oberon: "support",
  octavia: "support", qorvex: "survival", protea: "support", revenant: "survival", rhino: "survival",
  saryn: "damage", sevagoth: "survival", styanax: "support", temple: "damage", titania: "damage",
  trinity: "support", valkyr: "survival", vauban: "control", volt: "damage", voruna: "damage",
  wisp: "support", wukong: "survival", xaku: "damage", yareli: "survival", zephyr: "control",
};

export function normalizeWarframeName(name: string) {
  return name.toLowerCase().replace(/prime/g, "").replace(/umbra/g, "").replace(/[^a-z0-9]/g, "").trim();
}

export function getWarframeRole(name: string, description = ""): WarframeRole {
  const normalized = normalizeWarframeName(name);
  if (roleMap[normalized]) return roleMap[normalized];
  const text = description.toLowerCase();
  if (/隱形|匿蹤|stealth|invisible/.test(text)) return "stealth";
  if (/治療|能量|支援|增益|support|heal/.test(text)) return "support";
  if (/控場|群控|減速|聚集|control/.test(text)) return "control";
  if (/減傷|護甲|生存|坦|surviv|armor/.test(text)) return "survival";
  return "damage";
}

export function isWarframeName(name: string): boolean {
  return Boolean(roleMap[normalizeWarframeName(name)]);
}

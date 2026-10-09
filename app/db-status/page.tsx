import Link from "next/link";
import { Database, ShieldCheck, XCircle, CheckCircle2, KeyRound, Crown, Activity, ArrowUpRight, RadioTower } from "lucide-react";
import { KETHER_APP_VERSION, KETHER_BOT_VERSION } from "../../data/siteVersion";
import styles from "./db-status-command.module.css";

const KETHER_GUILD_ID = "1033399126936789023";

type DbCheck = {
  ok: boolean;
  label: string;
  detail: string;
};

type GuildPlan = {
  ok: boolean;
  guildName: string;
  guildId: string;
  subscriptionStatus: string;
  planName: string;
  planStatus: string;
  maxMembers: string;
  paidRequired: string;
  expiresAt: string;
  detail: string;
};

async function supabaseFetch(path: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    },
    cache: "no-store"
  });
}

async function checkSupabase(): Promise<DbCheck[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  const checks: DbCheck[] = [
    {
      ok: Boolean(supabaseUrl),
      label: "SUPABASE_URL",
      detail: supabaseUrl ? "已設定" : "尚未設定"
    },
    {
      ok: Boolean(supabaseAnonKey),
      label: "SUPABASE_ANON_KEY",
      detail: supabaseAnonKey ? "已設定" : "尚未設定"
    }
  ];

  if (!supabaseUrl || !supabaseAnonKey) {
    checks.push({
      ok: false,
      label: "Supabase 連線",
      detail: "環境變數缺少，無法測試連線。"
    });

    return checks;
  }

  try {
    const response = await supabaseFetch("users?select=id&limit=1");

    if (response.ok) {
      checks.push({
        ok: true,
        label: "Supabase 連線",
        detail: "連線成功，資料庫可被網站讀取。"
      });
    } else {
      const text = await response.text();

      checks.push({
        ok: false,
        label: "Supabase 連線",
        detail: `連線失敗：HTTP ${response.status} ${text.slice(0, 120)}`
      });
    }
  } catch {
    checks.push({
      ok: false,
      label: "Supabase 連線",
      detail: "連線失敗：網站無法連到 Supabase。"
    });
  }

  return checks;
}

async function checkKetherPlan(): Promise<GuildPlan> {
  try {
    const guildResponse = await supabaseFetch(
      `guilds?select=id,discord_guild_id,guild_name,subscription_status&discord_guild_id=eq.${KETHER_GUILD_ID}&limit=1`
    );

    if (!guildResponse.ok) {
      const text = await guildResponse.text();

      return {
        ok: false,
        guildName: "KETHER OF PARADISO",
        guildId: KETHER_GUILD_ID,
        subscriptionStatus: "未知",
        planName: "未知",
        planStatus: "未知",
        maxMembers: "未知",
        paidRequired: "未知",
        expiresAt: "未知",
        detail: `無法讀取 guilds：HTTP ${guildResponse.status} ${text.slice(0, 120)}`
      };
    }

    const guilds = await guildResponse.json();
    const guild = guilds?.[0];

    if (!guild) {
      return {
        ok: false,
        guildName: "KETHER OF PARADISO",
        guildId: KETHER_GUILD_ID,
        subscriptionStatus: "未找到",
        planName: "未找到",
        planStatus: "未找到",
        maxMembers: "未找到",
        paidRequired: "未知",
        expiresAt: "未知",
        detail: "找不到 KETHER Discord 群組資料。請確認 guilds 表格是否已寫入。"
      };
    }

    const planResponse = await supabaseFetch(
      `subscription_plans?select=plan_name,status,max_members,enabled_features,expires_at&guild_id=eq.${guild.id}&limit=1`
    );

    if (!planResponse.ok) {
      const text = await planResponse.text();

      return {
        ok: false,
        guildName: guild.guild_name,
        guildId: guild.discord_guild_id,
        subscriptionStatus: guild.subscription_status,
        planName: "未知",
        planStatus: "未知",
        maxMembers: "未知",
        paidRequired: "未知",
        expiresAt: "未知",
        detail: `無法讀取 subscription_plans：HTTP ${planResponse.status} ${text.slice(0, 120)}`
      };
    }

    const plans = await planResponse.json();
    const plan = plans?.[0];

    if (!plan) {
      return {
        ok: false,
        guildName: guild.guild_name,
        guildId: guild.discord_guild_id,
        subscriptionStatus: guild.subscription_status,
        planName: "未找到",
        planStatus: "未找到",
        maxMembers: "未找到",
        paidRequired: "未知",
        expiresAt: "未知",
        detail: "找不到 KETHER 免費方案資料。"
      };
    }

    const paidRequired = Boolean(plan.enabled_features?.paid_required);
    const ok = guild.subscription_status === "free" && plan.plan_name === "kether_free" && plan.status === "active" && !paidRequired;

    return {
      ok,
      guildName: guild.guild_name,
      guildId: guild.discord_guild_id,
      subscriptionStatus: guild.subscription_status,
      planName: plan.plan_name,
      planStatus: plan.status,
      maxMembers: String(plan.max_members ?? "未知"),
      paidRequired: String(paidRequired),
      expiresAt: plan.expires_at ?? "無",
      detail: ok ? "KETHER Discord 免費方案已啟用。" : "KETHER 方案資料存在，但狀態需要檢查。"
    };
  } catch {
    return {
      ok: false,
      guildName: "KETHER OF PARADISO",
      guildId: KETHER_GUILD_ID,
      subscriptionStatus: "未知",
      planName: "未知",
      planStatus: "未知",
      maxMembers: "未知",
      paidRequired: "未知",
      expiresAt: "未知",
      detail: "網站無法讀取 KETHER 方案狀態。"
    };
  }
}

export default async function DbStatusPage() {
  const [checks, ketherPlan] = await Promise.all([checkSupabase(), checkKetherPlan()]);
  const allOk = checks.every((item) => item.ok) && ketherPlan.ok;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p><Activity size={15}/> KETHER / INFRASTRUCTURE DIAGNOSTICS</p>
          <h1>資料連線<span>診斷中心</span></h1>
          <small>伺服器環境、Supabase 連線與氏族方案狀態即時檢查。</small>
        </div>
        <Link href="/database/overview" className={styles.back}><Database size={16}/> 資料庫總覽 <ArrowUpRight size={14}/></Link>
      </header>
      <div className={styles.dashboard}>
        <section className={styles.healthPane} aria-labelledby="system-health-title">
          <div className={styles.panelHeader}><p>01 / CONNECTION HEALTH</p><h2 id="system-health-title">系統健康監測</h2></div>
          <div className={styles.healthScroll}>
            <article className={allOk?styles.healthGood:styles.healthWarning}>
              {allOk?<CheckCircle2 size={37}/>:<XCircle size={37}/>}
              <div><h3>{allOk?"資料庫與方案已完成檢查":"部分連線或方案需要檢查"}</h3>
                <p>檢查結果僅代表目前回應狀態，詳細資訊請查看下方檢測項目。</p></div>
            </article>
            <div className={styles.metricRow}>
              <article><span>網站</span><strong>{KETHER_APP_VERSION}</strong></article>
              <article><span>Discord BOT</span><strong>{KETHER_BOT_VERSION}</strong></article>
              <article><span>檢測通過</span><strong>{checks.filter(item=>item.ok).length} / {checks.length}</strong></article>
            </div>
            <div className={styles.testList}>
              {checks.map(item=>(
                <article key={item.label} className={item.ok?styles.testOk:styles.testError}>
                  {item.ok?<ShieldCheck size={21}/>:<XCircle size={21}/>}
                  <div><h3>{item.label}</h3><p>{item.detail}</p></div>
                  <strong>{item.ok?"PASS":"CHECK"}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>
        <aside className={styles.planPane} aria-labelledby="clan-plan-title">
          <div className={styles.panelHeader}><p>02 / CLAN SUBSCRIPTION</p><h2 id="clan-plan-title">氏族方案情報</h2></div>
          <div className={styles.planScroll}>
            <article className={ketherPlan.ok?styles.planSuccess:styles.planWarning}>
              <Crown size={28}/><div><h3>{ketherPlan.ok?"KETHER 方案已啟用":"方案狀態需要確認"}</h3>
                <p>{ketherPlan.detail}</p></div>
            </article>
            <dl className={styles.planData}>
              {[
                ["Discord 伺服器 ID",ketherPlan.guildId],
                ["群組名稱",ketherPlan.guildName],
                ["訂閱狀態",ketherPlan.subscriptionStatus],
                ["方案",ketherPlan.planName],
                ["方案狀態",ketherPlan.planStatus],
                ["人數上限",ketherPlan.maxMembers],
                ["需要付款",ketherPlan.paidRequired],
                ["到期日",ketherPlan.expiresAt],
              ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            <Link href="/clan" className={styles.clanLink}><RadioTower size={17}/> 前往氏族指揮中心 <ArrowUpRight size={15}/></Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

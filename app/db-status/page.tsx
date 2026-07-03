import Link from "next/link";
import { Database, ShieldCheck, XCircle, CheckCircle2, KeyRound, Crown } from "lucide-react";

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
  const checks = await checkSupabase();
  const ketherPlan = await checkKetherPlan();
  const allOk = checks.every((item) => item.ok) && ketherPlan.ok;

  return (
    <main className="page-shell db-status-page">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <header className="profile-header">
        <Link href="/" className="db-back">← 返回首頁</Link>

        <div>
          <p>KETHER OF PARADISO</p>
          <h1>資料庫連線狀態</h1>
          <span>v2.4.0 Supabase 與 KETHER 免費方案測試頁。</span>
        </div>
      </header>

      <section className={allOk ? "db-status-hero ok" : "db-status-hero error"}>
        {allOk ? <CheckCircle2 size={76} strokeWidth={1.4} /> : <XCircle size={76} strokeWidth={1.4} />}
        <h2>{allOk ? "資料庫與免費方案已啟用" : "資料庫狀態需要檢查"}</h2>
        <p>
          這裡會檢查 Vercel 環境變數、Supabase 連線，以及 KETHER Discord 是否為免費方案。
        </p>
      </section>

      <section className="db-status-grid">
        {checks.map((item) => (
          <article className={item.ok ? "status-card ok" : "status-card error"} key={item.label}>
            {item.ok ? <ShieldCheck size={34} /> : <XCircle size={34} />}
            <div>
              <h3>{item.label}</h3>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={ketherPlan.ok ? "kether-plan-card ok" : "kether-plan-card error"}>
        <Crown size={46} strokeWidth={1.5} />
        <div>
          <h2>KETHER Discord 免費方案</h2>
          <p>{ketherPlan.detail}</p>

          <div className="plan-table">
            <div><span>Discord 伺服器 ID</span><b>{ketherPlan.guildId}</b></div>
            <div><span>群組名稱</span><b>{ketherPlan.guildName}</b></div>
            <div><span>訂閱狀態</span><b>{ketherPlan.subscriptionStatus}</b></div>
            <div><span>方案</span><b>{ketherPlan.planName}</b></div>
            <div><span>方案狀態</span><b>{ketherPlan.planStatus}</b></div>
            <div><span>人數上限</span><b>{ketherPlan.maxMembers}</b></div>
            <div><span>需要付款</span><b>{ketherPlan.paidRequired}</b></div>
            <div><span>到期日</span><b>{ketherPlan.expiresAt}</b></div>
          </div>
        </div>
      </section>

      <section className="db-status-next">
        <Database size={38} />
        <div>
          <h2>下一階段</h2>
          <p>免費方案確認後，可以開始做個人已購買資料 API 與測試寫入。</p>
        </div>
        <KeyRound size={34} />
      </section>
    </main>
  );
}

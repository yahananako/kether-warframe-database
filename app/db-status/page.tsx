import Link from "next/link";
import { Database, ShieldCheck, XCircle, CheckCircle2, KeyRound } from "lucide-react";

type DbCheck = {
  ok: boolean;
  label: string;
  detail: string;
};

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
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      },
      cache: "no-store"
    });

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
  } catch (error) {
    checks.push({
      ok: false,
      label: "Supabase 連線",
      detail: "連線失敗：網站無法連到 Supabase。"
    });
  }

  return checks;
}

export default async function DbStatusPage() {
  const checks = await checkSupabase();
  const allOk = checks.every((item) => item.ok);

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
          <span>v2.1.5 Supabase 連線測試頁。</span>
        </div>
      </header>

      <section className={allOk ? "db-status-hero ok" : "db-status-hero error"}>
        {allOk ? <CheckCircle2 size={76} strokeWidth={1.4} /> : <XCircle size={76} strokeWidth={1.4} />}
        <h2>{allOk ? "Supabase 連線成功" : "Supabase 尚未完全連線"}</h2>
        <p>
          這裡會檢查 Vercel 環境變數，以及網站是否能連到 Supabase users 資料表。
          目前仍是只讀測試，不會寫入個人資料。
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

      <section className="db-status-next">
        <Database size={38} />
        <div>
          <h2>下一階段</h2>
          <p>連線成功後，就可以開始做個人已購買資料寫入、Discord 使用者綁定與完成度個人化。</p>
        </div>
        <KeyRound size={34} />
      </section>
    </main>
  );
}

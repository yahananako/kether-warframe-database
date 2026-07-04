import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";

const updates = [
  {
    version: "v2.5.36",
    title: "首頁工具列啟用",
    content: "放大鏡接上全站搜尋，鈴鐺接上更新公告中心。"
  },
  {
    version: "v2.5.35",
    title: "開發者署名更新",
    content: "網站開發成員更新為 ヤハ奈々子・羊咩・凱洛。"
  },
  {
    version: "v2.5.34",
    title: "網站整理版",
    content: "整理網站頁面、版本文字、首頁備註與舊檔歸檔。"
  },
  {
    version: "v2.5.33",
    title: "首頁自動資料總控台",
    content: "首頁開始讀取 Google Sheets，顯示資料數、價格狀態與完成度。"
  }
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen px-5 py-6">
      <section className="mx-auto max-w-4xl rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm tracking-[0.4em] text-slate-400">KETHER NOTICE</p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
              <Bell size={24} />
              更新公告中心
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              這裡會放網站版本更新、資料庫狀態與後續開發公告。
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
          >
            回首頁
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-7 text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles size={18} />
            目前狀態
          </div>
          <p className="mt-2">
            Discord OAuth 暫停。現在先整理網站、首頁、搜尋、公告與手機版顯示。
          </p>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-4xl gap-3">
        {updates.map((item) => (
          <article
            key={item.version}
            className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-bold tracking-[0.25em] text-slate-400">
              {item.version}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.content}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

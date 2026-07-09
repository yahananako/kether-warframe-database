import Link from "next/link";
import {
  Bot,
  ChevronLeft,
  CircleDollarSign,
  Database,
  Dog,
  Gem,
  MessageCircle,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";

const commandGroups = [
  {
    title: "交易功能",
    icon: CircleDollarSign,
    color: "from-amber-300/30 to-yellow-500/10",
    commands: [
      {
        name: "/查價",
        usage: "/查價 物品:激昂射擊 MOD等級:Rank 0",
        description: "查 Warframe Market 物品白金價格，支援中文物品名稱與自動補全。",
      },
    ],
  },
  {
    title: "資料查詢",
    icon: Database,
    color: "from-pink-300/30 to-fuchsia-500/10",
    commands: [
      {
        name: "/核桃取得",
        usage: "/核桃取得 名稱:Wisp Prime",
        description: "查核桃內容、Prime 部件反查、中文關鍵字與稀有度排序。",
      },
      {
        name: "/材料取得",
        usage: "/材料取得 名稱:赤毒",
        description: "查材料來源、推薦刷法，支援中文、英文與綽號搜尋。",
      },
      {
        name: "/戰甲取得",
        usage: "/戰甲取得 名稱:摸屍",
        description: "查戰甲取得方式、部件來源，支援中文、英文與綽號搜尋。",
      },
      {
        name: "/夥伴取得",
        usage: "/夥伴取得 名稱:庫娃",
        description: "查守護、庫娃、庫狛、MOA、獵犬與火衛二寵物取得方式。",
      },
      {
        name: "/武器取得",
        usage: "/武器取得 類型:全部 系列:全部 名稱:托里德",
        description: "查主要、次要、近戰、曲翼、亡靈骸甲武器取得方式，可依類型與系列篩選。",
      },
    ],
  },
  {
    title: "氏族功能",
    icon: Shield,
    color: "from-sky-300/30 to-cyan-500/10",
    commands: [
      {
        name: "/戰甲名片",
        usage: "/戰甲名片",
        description: "查看成員 Warframe 名片與氏族資料。",
      },
      {
        name: "/官方資料",
        usage: "/官方資料",
        description: "官方玩家資料測試功能，目前以可取得資料為準。",
      },
      {
        name: "/說明",
        usage: "/說明",
        description: "打開小希 Bot 的完整指令導航。",
      },
    ],
  },
];

const weaponSteps = [
  {
    title: "1. 先選類型",
    text: "主要武器、次要武器、近戰武器、曲翼武器、亡靈骸甲武器，或選全部。",
  },
  {
    title: "2. 再選系列",
    text: "P版 / Prime、商店、氏族、集團、赤毒、信條、靈化、活動 / 特殊、任務 / 掉落。",
  },
  {
    title: "3. 最後輸入名稱",
    text: "名稱欄位支援中英雙語自動補全，例如托里德、兇惡、Glaive Prime。",
  },
];

export default function BotPage() {
  return (
    <main className="min-h-screen bg-[#080812] text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-pink-300/60 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            回首頁
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-sm text-pink-100">
            <Sparkles className="h-4 w-4" />
            KETHER Discord Bot
          </div>
        </div>

        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-cyan-500/10 p-6 shadow-2xl shadow-pink-950/20 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/80">
                <Bot className="h-4 w-4 text-pink-200" />
                小希 Bot 指令中心
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                  把 Warframe 資料庫搬進 Discord 喵
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                  小希 Bot 可以查核桃、材料、戰甲、夥伴、武器與市場價格。
                  網站負責總覽與資料整理，Discord 負責快速查詢，兩邊一起開工像雙持資料刃。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/database/overview"
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#111122] transition hover:bg-pink-100"
                >
                  查看資料庫總覽
                </Link>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-pink-300/60"
                >
                  <MessageCircle className="h-4 w-4" />
                  前往 Discord
                </a>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-400/20">
                  <Bot className="h-6 w-6 text-pink-100" />
                </div>
                <div>
                  <p className="text-sm text-white/50">目前功能</p>
                  <p className="font-bold">資料查詢核心已上線</p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-white/75">
                <div className="rounded-2xl bg-white/5 p-3">✅ 中文化指令</div>
                <div className="rounded-2xl bg-white/5 p-3">✅ 中英雙語自動補全</div>
                <div className="rounded-2xl bg-white/5 p-3">✅ 武器類型與系列篩選</div>
                <div className="rounded-2xl bg-white/5 p-3">✅ 台灣用語：靈化</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {weaponSteps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-2 font-bold text-pink-100">{step.title}</h2>
              <p className="text-sm leading-7 text-white/65">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5">
          {commandGroups.map((group) => {
            const Icon = group.icon;

            return (
              <article
                key={group.title}
                className={`rounded-[2rem] border border-white/10 bg-gradient-to-br ${group.color} p-5 md:p-6`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-pink-100" />
                  </div>
                  <h2 className="text-xl font-black">{group.title}</h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {group.commands.map((command) => (
                    <div key={command.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-pink-400/20 px-3 py-1 text-sm font-bold text-pink-100">
                          {command.name}
                        </span>
                      </div>
                      <code className="block rounded-xl bg-black/35 px-3 py-2 text-xs text-cyan-100">
                        {command.usage}
                      </code>
                      <p className="mt-3 text-sm leading-7 text-white/65">{command.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/60">
          <div className="mb-2 flex items-center gap-2 font-bold text-white">
            <Swords className="h-4 w-4 text-pink-100" />
            小希提示
          </div>
          Discord 指令顯示中文，但內部 value 保留英文名稱，這樣比較穩，不容易因為翻譯改字就壞掉喵。
        </footer>
      </section>
    </main>
  );
}

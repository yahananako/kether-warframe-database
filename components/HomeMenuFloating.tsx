"use client";

import { useEffect, useState } from "react";

const links = [
  ["首頁", "/", "回到 KETHER 首頁"],
  ["小希 Bot 指令", "/bot", "Discord Bot 功能總覽"],
  ["總覽", "/database/overview", "資料庫統計與完成度"],
  ["戰甲", "/database/warframes", "Warframe 戰甲資料"],
  ["主要武器", "/database/primary", "主要武器清單"],
  ["次要武器", "/database/secondary", "次要武器清單"],
  ["近戰武器", "/database/melee", "近戰武器清單"],
  ["同伴", "/database/companions", "同伴與寵物資料"],
  ["曲翼", "/database/archwing", "曲翼與相關裝備"],
  ["MOD 資料庫", "/database/mods", "MOD 系列與追價資料"],
  ["個人進度", "/profile", "登入與收藏進度"],
  ["資料庫狀態", "/db-status", "資料來源與同步狀態"],
];

export default function HomeMenuFloating() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);

  return (
    <>
      <button className="k-menu-btn" onClick={() => setOpen(true)} aria-label="開啟網站導覽">
        ☰
      </button>

      {open && (
        <div className="k-menu-bg" onClick={() => setOpen(false)}>
          <div className="k-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="k-menu-head">
              <div>
                <p>KETHER MENU</p>
                <h2>網站導覽</h2>
                <span>前往資料庫分類、個人進度與系統狀態。</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="關閉網站導覽">×</button>
            </div>

            <nav className="k-menu-list">
              {links.map(([name, href, note]) => (
                <a key={href} href={href} onClick={() => setOpen(false)}>
                  <b>{name}</b>
                  <small>{note}</small>
                </a>
              ))}
            </nav>

            <a className="k-discord" href="https://discord.gg" target="_blank" rel="noreferrer">
              Discord 入口
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .k-menu-btn {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.72);
          background: rgba(255,255,255,.58);
          color: #1f2937;
          font-size: 22px;
          line-height: 1;
          box-shadow: 0 12px 28px rgba(15,23,42,.14);
          backdrop-filter: blur(14px) saturate(150%);
          -webkit-backdrop-filter: blur(14px) saturate(150%);
        }

        .k-menu-bg {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background:
            radial-gradient(circle at 16% 10%, rgba(255, 183, 213, .42), transparent 34%),
            radial-gradient(circle at 88% 18%, rgba(170, 210, 255, .34), transparent 30%),
            rgba(15, 23, 42, .34);
          backdrop-filter: blur(28px) saturate(170%);
          -webkit-backdrop-filter: blur(28px) saturate(170%);
        }

        .k-menu-panel {
          position: fixed;
          top: 72px;
          left: 12px;
          width: min(92vw, 430px);
          max-height: calc(100vh - 92px);
          overflow-y: auto;
          padding: 16px;
          border-radius: 26px;
          border: 1px solid rgba(255,255,255,.78);
          background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(238,247,255,.70));
          box-shadow: 0 30px 88px rgba(15,23,42,.30);
          backdrop-filter: blur(30px) saturate(165%);
          -webkit-backdrop-filter: blur(30px) saturate(165%);
        }

        .k-menu-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .k-menu-head p {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          color: #d9468f;
        }

        .k-menu-head h2 {
          margin: 0;
          font-size: 22px;
          color: #1f2937;
        }

        .k-menu-head span {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          color: #667085;
        }

        .k-menu-head button {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.86);
          background: rgba(255,255,255,.7);
          font-size: 24px;
          color: #334155;
        }

        .k-menu-list {
          display: grid;
          gap: 10px;
        }

        .k-menu-list a {
          display: block;
          min-height: 74px;
          padding: 17px 18px;
          border-radius: 24px;
          border: 1.5px solid rgba(255,255,255,.92);
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(244,249,255,.78));
          color: #1f2937;
          text-decoration: none;
          box-shadow:
            0 16px 34px rgba(15,23,42,.12),
            inset 0 1px 0 rgba(255,255,255,.96);
          backdrop-filter: blur(22px) saturate(175%);
          -webkit-backdrop-filter: blur(22px) saturate(175%);
        }

        .k-menu-list b {
          display: block;
          font-size: 18px;
          line-height: 1.25;
          font-weight: 950;
          color: #1e293b;
          letter-spacing: .02em;
        }

        .k-menu-list small {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 650;
          color: #64748b;
        }

        .k-discord {
          display: block;
          margin-top: 14px;
          padding: 16px;
          border-radius: 20px;
          text-align: center;
          color: white;
          text-decoration: none;
          font-weight: 950;
          background: linear-gradient(135deg, rgba(255,126,185,.95), rgba(148,163,255,.88));
          box-shadow: 0 16px 34px rgba(217,70,143,.25);
        }


        /* KETHER 柔霧玻璃選單卡 */
        .k-menu-panel {
          background: linear-gradient(145deg, rgba(255,255,255,.42), rgba(238,247,255,.24)) !important;
          box-shadow:
            0 30px 88px rgba(15,23,42,.22),
            inset 0 1px 0 rgba(255,255,255,.72) !important;
          backdrop-filter: blur(30px) saturate(170%) !important;
          -webkit-backdrop-filter: blur(30px) saturate(170%) !important;
        }

        .k-menu-list {
          gap: 12px !important;
          margin-top: 12px !important;
        }

        .k-menu-list a {
          display: block !important;
          width: 100% !important;
          min-height: 82px !important;
          padding: 18px 20px !important;
          border-radius: 26px !important;
          border: 1.5px solid rgba(255,255,255,.88) !important;
          background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(246,250,255,.54)) !important;
          color: #172033 !important;
          box-shadow:
            0 18px 38px rgba(15,23,42,.13),
            inset 0 1px 0 rgba(255,255,255,.92) !important;
          backdrop-filter: blur(22px) saturate(175%) !important;
          -webkit-backdrop-filter: blur(22px) saturate(175%) !important;
        }

        .k-menu-list b {
          font-size: 20px !important;
          line-height: 1.25 !important;
          font-weight: 950 !important;
          color: #172033 !important;
        }

        .k-menu-list small {
          margin-top: 9px !important;
          font-size: 14px !important;
          line-height: 1.45 !important;
          font-weight: 700 !important;
          color: #475569 !important;
        }

      `}</style>
    </>
  );
}

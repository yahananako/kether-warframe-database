"use client";

const buttons = [
  ["登入 Discord", "/login", "開啟個人資料與進度同步", "main"],
  ["個人進度", "/profile", "查看收藏、完成度與已購買資料", "soft"],
  ["小希 Bot 指令", "/bot", "Discord Bot 功能總覽", "soft"],
  ["資料庫狀態", "/db-status", "查看資料來源與同步狀態", "soft"],
];

export default function HomePriorityActions() {
  return (
    <section className="home-actions">
      <div className="home-actions-grid">
        {buttons.map(([title, href, note, type]) => (
          <a key={href} href={href} className={"home-action " + type}>
            <b>{title}</b>
            <span>{note}</span>
          </a>
        ))}
      </div>

      <a className="home-discord" href="https://discord.gg" target="_blank" rel="noreferrer">
        Discord 入口
      </a>

      <style jsx>{`
        .home-actions {
          margin: 18px 0 22px;
        }

        .home-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .home-action,
        .home-discord {
          text-decoration: none;
        }

        .home-action {
          min-height: 82px;
          padding: 18px 20px;
          border-radius: 26px;
          border: 1.5px solid rgba(255,255,255,.88);
          background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(246,250,255,.54));
          box-shadow: 0 18px 38px rgba(15,23,42,.13), inset 0 1px 0 rgba(255,255,255,.92);
          backdrop-filter: blur(22px) saturate(175%);
          -webkit-backdrop-filter: blur(22px) saturate(175%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .home-action.main {
          background: linear-gradient(135deg, rgba(112,91,255,.94), rgba(77,131,255,.88));
          box-shadow: 0 18px 34px rgba(71,85,255,.24);
        }

        .home-action b {
          font-size: 19px;
          font-weight: 950;
          color: #172033;
        }

        .home-action span {
          margin-top: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        .home-action.main b,
        .home-action.main span {
          color: white;
        }

        .home-discord {
          display: block;
          margin-top: 14px;
          padding: 16px 18px;
          border-radius: 22px;
          text-align: center;
          font-size: 15px;
          font-weight: 950;
          color: white;
          border: 1px solid rgba(255,255,255,.78);
          background: linear-gradient(135deg, rgba(255,126,185,.95), rgba(148,163,255,.88));
          box-shadow: 0 16px 34px rgba(217,70,143,.24);
        }

        @media (max-width: 720px) {
          .home-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

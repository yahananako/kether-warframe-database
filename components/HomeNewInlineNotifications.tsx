"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

const PANEL_EVENT = "home-new-panel-open";
const NOTICE_STORAGE_KEY = "kether-home-new-notice-read-version";

/**
 * 鈴鐺公告內容有更新時，只改這一行版本。
 * 使用者讀過目前版本後，紅點會消失。
 * 下次公告內容更新，版本改掉，紅點才會重新出現。
 */
const NOTICES_VERSION = "warframe-dossiers-v2.6.3-2026-09-15";

const notices = [
  {
    tag: "版本",
    title: "KETHER V2.6.3 已上線",
    body: "戰甲獨立詳情／配裝頁、系列任務故事書與 Android 3.0.10 已同步完成。",
  },
  {
    tag: "電波局",
    title: "12 座情報站各自成頁",
    body: "循環、虛空商人、裂縫、入侵、突擊、執政官、警報與新聞都能從區塊直接進入完整頁面。",
  },
  {
    tag: "分類",
    title: "五大裝備頁重新分類",
    body: "主要、次要、近戰、同伴與曲翼加入清楚的系列篩選與分類標籤。",
  },
  {
    tag: "補齊",
    title: "同伴與亡骸機甲資料補齊",
    body: "新增擬狐獸、孤生獸分類，曲翼頁明確列出骨寡婦與虛空魂。",
  },
  {
    tag: "赤毒",
    title: "21 把赤毒武器補齊",
    body: "包含 12 把主要、5 把次要、2 把近戰與 2 把曲翼槍，並收錄最新赤毒屍鬼輪鋸。",
  },
  {
    tag: "交易",
    title: "玄骸拍賣價與連結",
    body: "查詢會顯示已轉化玄骸的最低線上拍賣價，並直達對應 Warframe Market 拍賣頁。",
  },
  {
    tag: "戰甲",
    title: "一般戰甲檔案館開放",
    body: "已收錄 65 位一般戰甲，包含獨立技能、來源、Prime 行情與配裝頁。",
  },
  {
    tag: "Prime",
    title: "Prime 戰甲獨立成頁",
    body: "Prime 戰甲已與一般版本分離，保留白金價格、交易網站與個人持有資料。",
  },
  {
    tag: "故事",
    title: "系列任務故事書",
    body: "新增六條連續任務航路，可依因果順序讀完覺醒、夢與真相、新世戰爭、扎日曼與虛空前線。",
  },
  {
    tag: "同步",
    title: "首頁跑馬燈同步更新",
    body: "首頁動態資訊已更新為戰甲雙版本、故事封面與目前資料庫狀態。",
  },
]

export default function HomeNewInlineNotifications() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const readVersion = window.localStorage.getItem(NOTICE_STORAGE_KEY);
    setHasUnread(readVersion !== NOTICES_VERSION);
  }, []);

  useEffect(() => {
    const handlePanelOpen = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== "notice") {
        setOpen(false);
      }
    };

    window.addEventListener(PANEL_EVENT, handlePanelOpen);

    return () => {
      window.removeEventListener(PANEL_EVENT, handlePanelOpen);
    };
  }, []);

  const markNoticeAsRead = () => {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, NOTICES_VERSION);
    setHasUnread(false);
  };

  const toggleNotice = () => {
    setOpen((current) => {
      const next = !current;

      if (next) {
        markNoticeAsRead();
        window.dispatchEvent(new CustomEvent(PANEL_EVENT, { detail: "notice" }));
      }

      return next;
    });
  };

  return (
    <div className="home-new-action-wrap">
      <button
        className="home-new-icon-action home-new-bell-button"
        type="button"
        aria-label={open ? "關閉通知" : "開啟通知"}
        aria-expanded={open}
        onClick={toggleNotice}
      >
        {open ? <X size={22} /> : <Bell size={22} />}
        {hasUnread ? <span aria-hidden="true" /> : null}
      </button>

      {open ? (
        <>
          <button
            className="home-new-pop-backdrop"
            type="button"
            aria-label="關閉通知背景"
            onClick={() => setOpen(false)}
          />

          <section className="home-new-pop-panel home-new-notice-panel" aria-label="KETHER 通知">
            <div className="home-new-pop-head">
              <p>KETHER NOTICE</p>
              <strong>小希情報鈴</strong>
            </div>

            <div className="home-new-notice-list">
              {notices.map((notice) => (
                <article key={notice.title} className="home-new-notice-item">
                  <span>{notice.tag}</span>
                  <h3>{notice.title}</h3>
                  <p>{notice.body}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

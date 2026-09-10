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
const NOTICES_VERSION = "kuva-weapons-v2.6.1-2026-09-10";

const notices = [
  {
    tag: "版本",
    title: "KETHER V2.6.1 已上線",
    body: "赤毒武器系列已同步到原始表格、網站、小希 BOT 與 Android APP。",
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
    body: "已收錄 60 位一般戰甲，包含圖片、五種定位、遊戲內故事與入手條件。",
  },
  {
    tag: "Prime",
    title: "Prime 戰甲獨立成頁",
    body: "Prime 戰甲已與一般版本分離，保留白金價格、交易網站與個人持有資料。",
  },
  {
    tag: "故事",
    title: "主線與支線專屬封面",
    body: "故事書各篇章改用任務專屬封面，不再以主要圖片或戰甲圖片代替。",
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

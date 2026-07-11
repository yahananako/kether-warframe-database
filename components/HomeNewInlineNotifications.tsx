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
const NOTICES_VERSION = "site-foundation-2026-07-12";

const notices = [
  {
    tag: "系統",
    title: "網站基礎架構完成",
    body: "KETHER 網站基礎架構已完成，後續進入資料內容更新與功能細節優化階段。",
  },
  {
    tag: "手機",
    title: "首頁介面整理完成",
    body: "手機版首頁、玻璃選單、搜尋、鈴鐺與導覽區已完成整理。",
  },
  {
    tag: "音樂",
    title: "KETHER RADIO 優化",
    body: "音樂播放器已加入循環播放、標題跑馬燈與控制按鍵優化。",
  },
  {
    tag: "導覽",
    title: "分類素材已接入",
    body: "分類導覽素材已接入，後續依繪師圖確認尺寸、位置與顯示效果。",
  },
  {
    tag: "資料",
    title: "同步系統維持運作",
    body: "Discord 登入、個人進度與 Google Sheets 資料同步將持續維護。",
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

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
const NOTICES_VERSION = "2026-07-11-home-new-notice-002";

const notices = [
  {
    tag: "首頁",
    title: "新版首頁建置中",
    body: "目前正在 /home-new 逐步重建新版首頁，確認穩定後才會替換正式首頁。",
  },
  {
    tag: "資料庫",
    title: "資料庫導覽已完成",
    body: "總覽、戰甲、主要武器、次要武器、近戰武器、同伴、曲翼、MOD 資料庫已整理成兩行入口。",
  },
  {
    tag: "系統",
    title: "銀白科技玻璃框架",
    body: "首頁版圖、導覽區與數據庫狀態已改成銀白透明玻璃質感。",
  },
  {
    tag: "小希",
    title: "功能接線中",
    body: "選單、搜尋、鈴鐺會先在新首頁測試頁確認，再接回正式首頁。",
  },
];

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

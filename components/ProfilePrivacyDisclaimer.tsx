import {
  Cookie,
  Database,
  ExternalLink,
  FileWarning,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import styles from "./ClanPrivacyDisclaimer.module.css";

const POLICY_URL =
  "https://docs.google.com/document/d/13UZy4RiLPUrLqHx-NaWUxS7xhJNTKkKUldMWJmLenOg/edit?usp=drivesdk";

export default function ProfilePrivacyDisclaimer() {
  return (
    <details className="home-new-fold-card kether-clan-fold">
      <summary className="home-new-fold-head">
        <span>
          <em>KETHER PROFILE PRIVACY & DISCLAIMER</em>
          <strong>個人資料使用與免責聲明</strong>
        </span>
        <b aria-hidden="true">⌄</b>
      </summary>

      <section className={`${styles.body} kether-clan-fold-body`}>
        <div className={styles.intro}>
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <h3>個人頁資料使用摘要</h3>
            <p>
              本區說明 KETHER 個人頁進行 Discord 登入、個人收藏同步與方案狀態顯示時，
              可能使用或保存的資料。所有項目預設收起，可逐項展開閱讀。
            </p>
          </div>
        </div>

        <div className={styles.sections}>
          <details className={styles.item}>
            <summary>
              <MessageCircle size={19} aria-hidden="true" />
              <span>Discord 可能提供的資料</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <ul>
                <li>Discord 使用者 ID、使用者名稱、顯示名稱與群組內暱稱。</li>
                <li>Discord 頭像、橫幅、主題色及支援的個人裝飾資料。</li>
                <li>KETHER Discord Guild ID、身分組 ID 與授權狀態。</li>
                <li>登入工作階段建立時間、到期時間與有效狀態。</li>
              </ul>
              <p>
                本網站目前不會透過 Discord 登入取得 Discord 密碼、聊天訊息、
                語音內容、好友名單或完整付款資料。
              </p>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <Database size={19} aria-hidden="true" />
              <span>個人頁可能保存的資料</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <ul>
                <li>已購買或未購買狀態、收藏項目與完成度資料。</li>
                <li>個人備註、追蹤清單、偏好設定與自訂顯示內容。</li>
                <li>個人資料更新時間、方案狀態及功能使用所需紀錄。</li>
              </ul>
              <p>
                個人收藏與進度資料可能保存於網站使用的資料庫服務；網站僅於提供個人化功能、
                權限驗證、錯誤排除與安全維護所必要的範圍內使用。
              </p>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <Cookie size={19} aria-hidden="true" />
              <span>Cookie 與登入工作階段</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <p>
                本網站可能使用 Cookie、Local Storage 或 Session Storage 維持 Discord 登入、
                保存介面偏好、公告狀態及播放器續播資訊。
              </p>
              <p>
                清除或停用相關資料後，登入、個人收藏、偏好設定或其他需要驗證的功能可能無法正常使用。
              </p>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <LockKeyhole size={19} aria-hidden="true" />
              <span>使用者權利與拒絕提供的影響</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <p>
                使用者可透過 KETHER 正式管理員聯絡管道提出資料查詢、閱覽、補充、更正、
                停止利用或刪除申請。為避免冒名操作，管理團隊可能要求合理的身分確認。
              </p>
              <p>
                拒絕提供登入與個人化功能所必要的資料時，可能無法使用個人資料中心、
                保存收藏進度或進入其他需要 Discord 認證的頁面。
              </p>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <FileWarning size={19} aria-hidden="true" />
              <span>第三方服務與免責聲明</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <p>
                KETHER 為玩家自行建立的非官方 Warframe 社群資料網站，與 Digital Extremes、
                Discord、Vercel、Supabase、Neon 或其他第三方服務不存在官方隸屬或背書關係。
              </p>
              <p>
                第三方服務中斷、API 變更、網路異常或資料更新延遲，可能造成登入、收藏同步、
                方案狀態或個人頁功能暫時無法使用。
              </p>
            </div>
          </details>
        </div>

        <a
          className={styles.policyLink}
          href={POLICY_URL}
          target="_blank"
          rel="noreferrer"
        >
          閱讀完整《免責聲明、資料使用範圍暨隱私權政策》
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>
    </details>
  );
}

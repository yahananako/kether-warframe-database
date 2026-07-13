import {
  Database,
  ExternalLink,
  FileWarning,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import styles from "./ClanPrivacyDisclaimer.module.css";

const POLICY_URL =
  "https://docs.google.com/document/d/13UZy4RiLPUrLqHx-NaWUxS7xhJNTKkKUldMWJmLenOg/edit?usp=drivesdk";

export default function ClanPrivacyDisclaimer() {
  return (
    <details className="home-new-fold-card kether-clan-fold">
      <summary className="home-new-fold-head">
        <span>
          <em>KETHER CLAN PRIVACY & DISCLAIMER</em>
          <strong>免責聲明與資料使用說明</strong>
        </span>
        <b aria-hidden="true">⌄</b>
      </summary>

      <section className={`${styles.body} kether-clan-fold-body`}>
        <div className={styles.intro}>
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <h3>氏族頁資料使用摘要</h3>
            <p>
              本區說明 KETHER 氏族頁進行 Discord 身分驗證、公告管理與權限判斷時，
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
                <li>Discord 使用者 ID、使用者名稱與顯示名稱。</li>
                <li>KETHER 群組內暱稱與頭像。</li>
                <li>KETHER Discord Guild ID 與身分組 ID 清單。</li>
                <li>登入、授權與工作階段有效狀態。</li>
              </ul>
              <p>
                本網站不會因目前的 Discord 登入流程取得 Discord 密碼、聊天訊息、
                語音內容、好友名單或完整付款資料。
              </p>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <UserRoundCheck size={19} aria-hidden="true" />
              <span>資料使用目的</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <ul>
                <li>確認使用者是否屬於 KETHER OF PARADISO。</li>
                <li>依 Discord 身分組判斷一般成員與公告管理權限。</li>
                <li>顯示群組內名稱、Discord 授權狀態及氏族資料庫權限。</li>
                <li>維持登入狀態、防止未授權存取及排除系統錯誤。</li>
              </ul>
            </div>
          </details>

          <details className={styles.item}>
            <summary>
              <Database size={19} aria-hidden="true" />
              <span>氏族頁可能保存的資料</span>
              <b aria-hidden="true">⌄</b>
            </summary>
            <div className={styles.itemBody}>
              <ul>
                <li>氏族公告標題、內容、圖片、發布者及發布時間。</li>
                <li>公告草稿、置頂、發布、下架與刪除狀態。</li>
                <li>Discord 授權、氏族權限及管理身分組設定。</li>
                <li>KETHER 訂閱方案、訂閱狀態與到期日期。</li>
              </ul>
              <p>
                公告文字與權限資料可能保存於 Neon；公告圖片可能保存於 Vercel
                Private Blob，並透過網站權限驗證後提供。
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
                使用者可透過 KETHER 正式管理員聯絡管道，提出資料查詢、更正、
                停止利用或刪除申請。為避免冒名操作，管理團隊可能要求合理的身分確認。
              </p>
              <p>
                拒絕提供身分驗證所必要的 Discord 資料時，可能無法使用氏族頁、
                公告閱讀、公告管理、個人資料中心或其他需要登入的功能。
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
                KETHER 為玩家自行建立的非官方 Warframe 社群資料網站，與 Digital
                Extremes、Discord、Vercel、Neon 或其他第三方服務不存在官方隸屬或背書關係。
              </p>
              <p>
                第三方服務中斷、API 變更、權限調整、網路異常或資料更新延遲，可能造成登入、
                公告、圖片及氏族功能暫時無法使用。氏族管理員發布的公告與圖片，應由發布者
                對內容合法性、正確性及授權負責。
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

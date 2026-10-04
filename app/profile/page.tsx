import Link from "next/link";

import {
  MessageCircle,
  UserRound,
} from "lucide-react";

import AuthSessionStatus from "../../components/AuthSessionStatus";
import BillingPlanStatus from "../../components/BillingPlanStatus";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";
import ProfileOwnedSummary from "../../components/ProfileOwnedSummary";
import ProfilePrivacyDisclaimer from "../../components/ProfilePrivacyDisclaimer";





export default function ProfilePage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        

        

        <section className="kether-overview-intro-card">
          <p>KETHER PROFILE CENTER</p>
          <h1>個人進度中心</h1>
          <span>
            Discord 個人名片、收藏摘要、方案狀態與資料使用說明集中於此。
            除 Discord 名片外，其餘內容預設收起。
          </span>
        </section>

        <AuthSessionStatus />

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER PERSONAL COLLECTION</em>
              <strong>個人收藏摘要</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section style={{ padding: 18 }}>
            <ProfileOwnedSummary />
          </section>
        </details>

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>PERSONAL DATABASE FLOW</em>
              <strong>個人化資料庫流程</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="auth-flow" style={{ margin: 18 }}>
            <div>
              <span>1</span>
              <p>使用者透過 Discord 登入</p>
            </div>

            <div>
              <span>2</span>
              <p>網站檢查 Discord Guild ID，並依設定檢查 Role ID</p>
            </div>

            <div>
              <span>3</span>
              <p>通過後建立 Discord session cookie</p>
            </div>

            <div>
              <span>4</span>
              <p>讀寫個人已購買、完成度與方案狀態資料</p>
            </div>
          </section>
        </details>

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER PERSONAL PLAN</em>
              <strong>個人方案狀態</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="auth-grid" style={{ padding: 18 }}>
            <BillingPlanStatus />
          </section>
        </details>

        <ProfilePrivacyDisclaimer />

        
      </div>
    </main>
  );
}

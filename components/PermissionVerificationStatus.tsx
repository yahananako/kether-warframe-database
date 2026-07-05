"use client";

import { useEffect, useState } from "react";

type PermissionStatus = {
  ok: boolean;
  authenticated: boolean;
  authorized: boolean;
  message?: string;
  configured?: {
    guildIdConfigured: boolean;
    sessionSecretConfigured: boolean;
    roleCheckEnabled: boolean;
    allowedRoleCount: number;
  };
  guildAccess?: {
    guildIdMatches: boolean;
    roleCheckEnabled: boolean;
    hasAllowedRole: boolean;
    authorized: boolean;
    roleCount: number;
    matchedRoleCount: number;
  } | null;
};

export default function PermissionVerificationStatus() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PermissionStatus | null>(null);

  async function loadStatus() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/permission", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const payload = (await response.json()) as PermissionStatus;
      setStatus(payload);
    } catch {
      setStatus({
        ok: false,
        authenticated: false,
        authorized: false,
        message: "權限驗證狀態讀取失敗。"
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const configured = status?.configured;
  const guildAccess = status?.guildAccess;

  return (
    <article className="profile-card">
      <h3>權限驗證</h3>

      <strong>
        {loading ? "檢查中" : status?.authorized ? "已通過" : "未通過"}
      </strong>

      <p>
        {loading
          ? "正在確認 Discord Guild ID 與 Role ID 驗證狀態。"
          : status?.message || "尚無權限驗證資料。"}
      </p>

      <div style={{ display: "grid", gap: 8, marginTop: 16, color: "#5d6875" }}>
        <span>
          Guild ID：
          <b>{configured?.guildIdConfigured ? "已設定" : "未設定"}</b>
        </span>

        <span>
          Role ID 檢查：
          <b>
            {configured?.roleCheckEnabled
              ? `已啟用，允許 ${configured.allowedRoleCount} 組`
              : "未啟用，全群成員可用"}
          </b>
        </span>

        <span>
          登入狀態：
          <b>{status?.authenticated ? "已登入" : "未登入"}</b>
        </span>

        <span>
          伺服器驗證：
          <b>
            {guildAccess
              ? guildAccess.guildIdMatches
                ? "已通過"
                : "未通過"
              : "尚未驗證"}
          </b>
        </span>

        <span>
          身分組驗證：
          <b>
            {guildAccess
              ? guildAccess.roleCheckEnabled
                ? guildAccess.hasAllowedRole
                  ? `已通過，符合 ${guildAccess.matchedRoleCount} 組`
                  : "未通過"
                : "未啟用"
              : "尚未驗證"}
          </b>
        </span>
      </div>

      <button
        type="button"
        onClick={loadStatus}
        style={{
          marginTop: 18,
          border: "1px solid rgba(15, 23, 42, 0.16)",
          borderRadius: 999,
          padding: "10px 16px",
          background: "rgba(255,255,255,0.72)",
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        重新檢查權限
      </button>
    </article>
  );
}

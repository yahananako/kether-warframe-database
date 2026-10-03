/** Only return local content pages; never bounce back into the OAuth flow. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || value.length > 500 || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/profile";
  try {
    const url = new URL(value, "https://kether.invalid");
    const path = decodeURIComponent(url.pathname);
    if (url.origin !== "https://kether.invalid" || /[\\\x00-\x20]/.test(path) || path.startsWith("//") || /^\/(?:api|login|unauthorized)(?:\/|$)/.test(path)) return "/profile";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return "/profile"; }
}

export const AUTH_MESSAGES: Record<string, string> = {
  cancelled: "已取消 Discord 授權。準備好後可以重新登入。",
  expired: "登入驗證已過期或不一致，請重新開始 Discord 授權。",
  configuration: "登入服務暫時無法使用，請稍後重試或聯絡管理員。",
  token: "Discord 授權已失效，請重新登入。",
  profile: "暫時無法取得 Discord 個人資料，請重新登入。",
  membership: "無法確認群組成員資格，請確認已加入 KETHER Discord 後重試。",
  role: "目前身分組尚未取得網站權限，請聯絡管理員確認後重新登入。",
  unavailable: "Discord 連線逾時或暫時中斷，請稍後重新登入。",
};

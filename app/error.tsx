"use client";
import PageState from "../components/PageState";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageState title="頁面暫時無法載入" message="請重新嘗試；若問題持續發生，可以先返回首頁。"><button type="button" onClick={reset}>重新嘗試</button></PageState>;
}

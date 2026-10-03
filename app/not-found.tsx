import Link from "next/link";
import PageState from "../components/PageState";
export default function NotFound() {
  return <PageState title="找不到這個頁面" message="連結可能已變更，或這筆資料尚未收錄。"><Link href="/search">搜尋資料</Link></PageState>;
}

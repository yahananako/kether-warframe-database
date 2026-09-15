import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import WarframeBuildPlanner from "../../../../../components/WarframeBuildPlanner";
import {
  getWarframeDetail,
  warframeDetails,
} from "../../../../../data/warframeDetails";
import {
  getWarframeRole,
  WARFRAME_ROLES,
} from "../../../../../data/warframeRoles";
import styles from "../warframeDetail.module.css";

export function generateStaticParams() {
  return warframeDetails.map((warframe) => ({ slug: warframe.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const route = await params;
  const warframe = getWarframeDetail(route.slug);
  return warframe
    ? {
        title: `${warframe.name} 配裝頁｜KETHER`,
        description: `${warframe.name} MOD、賦能與執政官寶石配置器。`,
      }
    : { title: "找不到配裝頁｜KETHER" };
}

export default async function WarframeBuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const route = await params;
  const warframe = getWarframeDetail(route.slug);
  if (!warframe) notFound();
  const role = getWarframeRole(warframe.name, warframe.description);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.topbar}>
          <Link href={`/database/warframes/${warframe.slug}`}>
            <ArrowLeft /> 返回 {warframe.name} 詳情
          </Link>
          <span>裝置內自動保存</span>
        </nav>
        <section className={styles.buildHero}>
          <div>
            <p>KETHER BUILD MATRIX・{WARFRAME_ROLES[role].english}</p>
            <h1>{warframe.name}</h1>
            <span>{WARFRAME_ROLES[role].label}型起始配置</span>
          </div>
          <img src={warframe.imageUrl} alt={`${warframe.name} 戰甲圖片`} />
        </section>
        <aside className={styles.buildNotice}>
          <ShieldCheck />
          <p>
            這是可調整的通用起始配置，不是唯一答案。不同技能流派、賦能等級與任務內容會改變最終選擇。
          </p>
        </aside>
        <WarframeBuildPlanner frameName={warframe.name} role={role} />
      </div>
    </main>
  );
}

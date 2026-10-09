import Link from "next/link";
import {ArrowLeft,ShieldCheck,Sparkles} from "lucide-react";
import {notFound} from "next/navigation";
import WarframeBuildPlanner from "../../../../../components/WarframeBuildPlanner";
import {getWarframeDetail,warframeDetails} from "../../../../../data/warframeDetails";
import {getWarframeRole,WARFRAME_ROLES} from "../../../../../data/warframeRoles";
import styles from "./buildConsole.module.css";

export function generateStaticParams(){return warframeDetails.map(warframe=>({slug:warframe.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const route=await params,warframe=getWarframeDetail(route.slug);
  return warframe?{title:warframe.name+" 配裝頁｜KETHER",
    description:warframe.name+" MOD、賦能與執政官寶石配置器。"}:{title:"找不到配裝頁｜KETHER"};
}
export default async function WarframeBuildPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,warframe=getWarframeDetail(slug);
  if(!warframe)notFound();
  const role=getWarframeRole(warframe.name,warframe.description);
  return <main className={styles.page}>
    <div className={styles.toolbar}><Link href={"/database/warframes/"+warframe.slug}><ArrowLeft size={16}/> 返回 {warframe.name} 戰甲資料</Link>
      <span>KETHER / MOD ENGINE / LOCAL CONFIGURATION</span></div>
    <div className={styles.layout}>
      <aside className={styles.showcase}>
        <div className={styles.showcaseHead}><p><Sparkles size={14}/> TENNO BUILD LAB</p>
          <h1>{warframe.name}</h1><b>{WARFRAME_ROLES[role].label}型起始配置</b></div>
        <div className={styles.visual}><span aria-hidden="true"/><img src={warframe.imageUrl} alt={warframe.name+" 戰甲圖"}/></div>
        <div className={styles.notice}><ShieldCheck size={19}/><p>以通用範本為起點，自由調整 MOD、賦能與執政官寶石。此頁在裝置內保存，不會修改氏族的資料庫。</p></div>
      </aside>
      <section className={styles.editor} aria-label="戰甲配裝控制台">
        <WarframeBuildPlanner frameName={warframe.name} role={role}/>
      </section>
    </div>
  </main>;
}

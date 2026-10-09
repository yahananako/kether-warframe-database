import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowUpRight,Database,Layers3,ShieldCheck,Swords} from "lucide-react";
import DataTable from "../../../components/DataTable";
import {fetchSheetRows,SHEET_GIDS} from "../../../lib/sheets";
import styles from "../../../components/CatalogCommandConsole.module.css";

const categories=[
  {key:"primary",label:"主要武器",type:"PRIMARY"},
  {key:"secondary",label:"次要武器",type:"SECONDARY"},
  {key:"melee",label:"近戰武器",type:"MELEE"},
  {key:"mods",label:"MOD 模組",type:"MOD"},
  {key:"companions",label:"同伴",type:"COMPANIONS"},
  {key:"archwing",label:"曲翼與機甲",type:"ARCHWING"},
];
export default async function DatabaseCategoryPage({params}:{params:Promise<{category:string}>}){
  const {category}=await params;
  if(!SHEET_GIDS[category])notFound();
  const {config,rows,error}=await fetchSheetRows(category);
  const current=categories.find(item=>item.key===category);
  return <main className={styles.page}>
    <section className={styles.console} aria-label="KETHER 裝備資料控制台">
      <aside className={styles.navigator}>
        <div className={styles.navTitle}>
          <p><Database size={15}/> KETHER / DATABASE</p>
          <h2>裝備檔案庫</h2>
          <small>選擇不同武器、模組與同伴資料分類</small>
        </div>
        <nav aria-label="裝備分類切換" className={styles.navItems}>
          {categories.map(item=><Link key={item.key} href={"/database/"+item.key}
            aria-current={item.key===category?"page":undefined}>
            <span><Swords size={17}/></span>
            <span className={styles.navCopy}><b>{item.label}</b><small>{item.type}</small></span>
            <ArrowUpRight size={16}/>
          </Link>)}
          <Link href="/database/warframes"><span><ShieldCheck size={17}/></span>
            <span className={styles.navCopy}><b>戰甲圖鑑</b><small>WARFRAME ARCHIVE</small></span>
            <ArrowUpRight size={16}/></Link>
        </nav>
        <div className={styles.navFooter}><Layers3 size={16}/>
          KETHER 資料庫與氏族 BOT 共用資料來源，使用者持有進度由 Discord 驗證。
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.hero}>
          <div>
            <p><Layers3 size={15}/> {current?.type??"DATABASE"} / EQUIPMENT MATRIX</p>
            <h1>{config.title}<span> · 裝備檢索控制台</span></h1>
            <small>{config.subtitle} · 搜尋分類、價格與持有進度。</small>
          </div>
          <div className={styles.record}><b>{error?"—":rows.length.toLocaleString("zh-TW")}</b><span>資料筆數</span></div>
        </header>
        {error?<section className={styles.error} role="alert"><h2>資料來源暫時無法讀取</h2><p>{error}</p>
          <Link href="/db-status">查看資料同步狀態 <ArrowUpRight size={16}/></Link></section>:
          <div className={styles.board}><DataTable rows={rows} category={category}/></div>}
      </div>
    </section>
  </main>;
}

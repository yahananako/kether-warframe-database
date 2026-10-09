import Link from "next/link";
import {notFound} from "next/navigation";
import WarframeDossier from "../../../../components/WarframeDossier";
import {regularWarframes} from "../../../../data/regularWarframes";
import {warframeCanonProfileMap} from "../../../../data/warframeCanonProfiles";
import {getWarframeDetail,toWarframeSlug,WARFRAME_DETAILS_UPDATED_AT,warframeDetails} from "../../../../data/warframeDetails";
import {getWarframeRole,WARFRAME_ROLES} from "../../../../data/warframeRoles";
import {warframeStories} from "../../../../data/warframeStories";

export function generateStaticParams(){return warframeDetails.map(item=>({slug:item.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,warframe=getWarframeDetail(slug);
  return warframe?{title:warframe.name+"｜技能、入手與配裝｜KETHER",
    description:warframe.name+" 的技能說明、基礎數值、取得方式與 Prime 市場資料。"}:
    {title:"找不到戰甲｜KETHER"};
}
export default async function WarframeDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const warframe=getWarframeDetail(slug);
  if(!warframe)notFound();
  const acquisition=regularWarframes.find(item=>item.name===warframe.name)?.acquisition??
    (warframe.name==="Excalibur Umbra"?
      "完成主線系列任務「犧牲」後取得完整 Excalibur Umbra 與專屬武器。":
      "取得條件仍在整理中，請以遊戲內 Codex 與官方更新說明為準。");
  const role=getWarframeRole(warframe.name,warframe.description);
  const story=warframeStories.find(item=>toWarframeSlug(item.name)===warframe.slug);
  const profile=warframeCanonProfileMap.get(warframe.name.toLowerCase().replace(/[^a-z0-9]/g,""));
  const lore=story?{
    heading:story.epithet,era:story.era,summary:story.summary,
    paragraphs:story.paragraphs,source:story.source,accent:story.accent
  }:profile?{
    heading:profile.epithet,era:profile.sourceType,summary:profile.summary,
    paragraphs:profile.paragraphs,source:profile.source,accent:"#70dcff"
  }:null;
  return <WarframeDossier warframe={warframe} acquisition={acquisition}
    roleLabel={WARFRAME_ROLES[role].label} roleEnglish={WARFRAME_ROLES[role].english}
    roleDescription={WARFRAME_ROLES[role].description} lore={lore}
    updatedAt={WARFRAME_DETAILS_UPDATED_AT}/>;
}

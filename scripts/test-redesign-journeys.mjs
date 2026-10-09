#!/usr/bin/env node
// Browser journeys cover user-visible actions omitted by simple page screenshot smoke.
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import fs from "node:fs/promises";
import {chromium} from "playwright";

const base=process.env.KETHER_TEST_BASE_URL||"http://127.0.0.1:3000";
const secret=process.env.KETHER_TEST_SESSION_SECRET;
if(!secret)throw new Error("KETHER_TEST_SESSION_SECRET is required for isolated local CI authentication");
function signedSession(){
  const now=Math.floor(Date.now()/1000);
  const payload={
    sub:"kether-ci-test-user",username:"kether-ci",globalName:"KETHER QA",
    guildNickname:"測試成員",avatar:null,banner:null,accentColor:null,
    avatarDecorationAsset:null,nameplatePalette:null,
    guildId:"kether-ci-guild",roleIds:["kether-ci-role"],iat:now,exp:now+3600
  };
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature=createHmac("sha256",secret).update(body).digest("base64url");
  return body+"."+signature;
}
await fs.mkdir("qa/screenshots",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
const passed=[],failed=[];
async function task(page,name,run){
  try {
    await run();
    passed.push(name);
    console.log("PASS",name);
  }catch(error){
    const failure={name,error:String(error?.stack||error)};
    failed.push(failure);
    console.error("FAIL",name,failure.error);
    try{await page.screenshot({path:"qa/screenshots/journey-error-"+name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".png",animations:"disabled"});}catch{}
  }
}
try {
  const desktop=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:"reduce"});
  await desktop.addCookies([{name:"kether_discord_session",value:signedSession(),url:base}]);
  const page=await desktop.newPage();
  page.setDefaultTimeout(9000);
  const url=path=>new URL(path,base).href;

  await task(page,"persistent-client-navigation",async()=>{
    await page.goto(url("/story"),{waitUntil:"domcontentloaded"});
    await page.waitForSelector(".site-navigation .site-menu summary");
    await page.waitForFunction(()=>Boolean(document.querySelector(".site-shell")));
    await page.evaluate(()=>{window.__ketherSavedShell=document.querySelector(".site-shell")});
    const tools=page.locator(".site-tools a[aria-label='搜尋資料庫']");
    await tools.click();
    await page.waitForURL("**/search**");
    const same=await page.evaluate(()=>window.__ketherSavedShell===document.querySelector(".site-shell"));
    assert.equal(same,true,"shared shell was remounted on client navigation");
    assert.equal(new URL(page.url()).pathname,"/search");
  });

  await task(page,"armory-role-search-and-details",async()=>{
    await page.goto(url("/database/warframes"),{waitUntil:"domcontentloaded"});
    const input=page.getByRole("textbox",{name:"搜尋戰甲名稱或用途"});
    await input.fill("Valkyr");
    const card=page.locator("button[aria-pressed]").filter({hasText:"Valkyr"}).last();
    await card.click();
    await page.getByRole("link",{name:/技能、來源與獨立配裝/}).click();
    await page.waitForURL("**/database/warframes/valkyr");
    assert.match(await page.locator("h1").first().innerText(),/Valkyr/i);
    await page.getByRole("link",{name:/打開獨立配裝/}).click();
    await page.waitForURL("**/database/warframes/valkyr/build");
  });

  await task(page,"build-mod-and-arcane-persist-after-reload",async()=>{
    await page.goto(url("/database/warframes/valkyr/build"),{waitUntil:"domcontentloaded"});
    const firstMod=page.getByLabel("MOD 1");
    await firstMod.waitFor({state:"visible"});
    await firstMod.selectOption({label:"盲怒"});
    await page.getByRole("button",{name:"賦能 × 2"}).click();
    const arcane=page.getByLabel("賦能 1");
    await arcane.selectOption({label:"神盾賦能"});
    const key="kether-warframe-build:valkyr";
    await page.waitForFunction(key=>{
      try{
        const saved=JSON.parse(localStorage.getItem(key)||"null");
        return saved?.mods?.[0]==="盲怒"&&saved?.arcanes?.[0]==="神盾賦能";
      }catch{return false;}
    },key,{timeout:9000});
    await page.reload({waitUntil:"domcontentloaded"});
    // Server output initially contains the default template. Wait for React to
    // hydrate and restore localStorage before asserting the displayed selection.
    await page.waitForFunction(()=>{
      const label=[...document.querySelectorAll("label")]
        .find(item=>item.textContent?.trim().startsWith("MOD 1"));
      return label?.querySelector("select")?.value==="盲怒";
    },undefined,{timeout:9000});
    assert.equal(await page.getByLabel("MOD 1").inputValue(),"盲怒");
    await page.getByRole("button",{name:"賦能 × 2"}).click();
    assert.equal(await page.getByLabel("賦能 1").inputValue(),"神盾賦能");
  });

  await task(page,"incarnon-filters-and-explicit-query",async()=>{
    await page.goto(url("/database/incarnon?q=Braton"),{waitUntil:"domcontentloaded"});
    const input=page.getByRole("searchbox",{name:"搜尋應感武器"});
    await input.waitFor({state:"visible"});
    assert.equal(await input.inputValue(),"Braton");
    await input.fill("Latron");
    await page.waitForFunction(()=>{
      try{return JSON.parse(sessionStorage.getItem("kether-incarnon-filters-v1")||"null")?.query==="Latron";}
      catch{return false;}
    });
    await page.goto(url("/story"),{waitUntil:"domcontentloaded"});
    await page.goto(url("/database/incarnon"),{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>{
      const input=document.querySelector('input[type="search"]');
      return input?.value==="Latron";
    });
    await page.goto(url("/database/incarnon?q=Braton"),{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>{
      const input=document.querySelector('input[type="search"]');
      return input?.value==="Braton";
    });
  });

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  await mobile.addCookies([{name:"kether_discord_session",value:signedSession(),url:base}]);
  const phone=await mobile.newPage();
  phone.setDefaultTimeout(9000);
  await task(phone,"mobile-notification-opens-and-closes",async()=>{
    await phone.goto(url("/story"),{waitUntil:"domcontentloaded"});
    const popup=phone.locator(".site-notification");
    await popup.locator("summary").click();
    await popup.locator(".site-notice-panel").waitFor({state:"visible"});
    const rect=await popup.locator(".site-notice-panel").boundingBox();
    assert.ok(rect,"notification panel has no visible bounding box");
    assert.ok(rect.x>=-2&&rect.y>=-2&&rect.x+rect.width<=392&&rect.y+rect.height<=846,
      "notification panel clipped outside 390px viewport: "+JSON.stringify(rect));
    await phone.keyboard.press("Escape");
    assert.equal(await popup.getAttribute("open"),null,"Escape did not close notification");
  });

  await task(phone,"mobile-armory-detail-close",async()=>{
    await phone.goto(url("/database/warframes"),{waitUntil:"domcontentloaded"});
    const buttons=phone.locator("button[aria-pressed]").filter({hasText:"Valkyr"});
    await buttons.last().click();
    await phone.getByRole("button",{name:"關閉戰甲詳細資訊"}).click();
    assert.equal(await phone.locator(".site-viewport-content button[aria-label='關閉戰甲詳細資訊']").isVisible(),false,
      "mobile detail overlay failed to close");
  });
  await mobile.close();
  await desktop.close();
}finally{
  await browser.close();
  const result={startedAt:new Date().toISOString(),passed,failed};
  await fs.writeFile("qa/journeys.json",JSON.stringify(result,null,2));
  console.log("KETHER interaction journeys:",passed.length,"passed;",failed.length,"failed");
  if(failed.length)process.exitCode=1;
}

#!/usr/bin/env node
// Real Chromium smoke test; no authenticated or destructive actions.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {createHmac} from "node:crypto";
import {chromium} from "playwright";

const base=process.env.KETHER_TEST_BASE_URL||"http://127.0.0.1:3000";
const testSecret=process.env.KETHER_TEST_SESSION_SECRET;
if(!testSecret)throw new Error("Authenticated browser smoke requires isolated CI test secret.");
const testGuild="kether-ci-guild";
const testRole="kether-ci-role";
function session(roleIds){
  const now=Math.floor(Date.now()/1000);
  const payload={sub:"kether-ci-test-user",username:"kether-ci",
    globalName:"KETHER QA",guildNickname:"測試成員",avatar:null,banner:null,accentColor:null,
    avatarDecorationAsset:null,nameplatePalette:null,
    guildId:testGuild,roleIds,iat:now,exp:now+3600};
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig=createHmac("sha256",testSecret).update(body).digest("base64url");
  return body+"."+sig;
}
const protectedPaths=new Set([
  "/database/overview","/database/warframes","/database/incarnon",
  "/live","/clan","/search","/notifications","/profile","/db-status"
]);
await fs.mkdir("qa/screenshots",{recursive:true});
const paths=["/","/story","/database/overview","/database/warframes",
  "/database/incarnon","/live","/clan","/search?q=Valkyr",
  "/notifications","/profile","/login","/db-status","/unauthorized"];
const views=[
  {name:"desktop-1440",width:1440,height:900,paths},
  {name:"laptop-1280",width:1280,height:800,paths:paths.slice(0,8)},
  {name:"mobile-390",width:390,height:844,paths},
  {name:"mobile-360",width:360,height:740,paths:paths.slice(0,8)}
];
const report={startedAt:new Date().toISOString(),passed:[],failed:[],warnings:[]};
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
let shot=0;
const safe=v=>v.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase();
const failure=(screen,path,error)=>report.failed.push({screen,path,error:String(error?.stack||error)});
try{
  for(const view of views){
    const context=await browser.newContext({
      viewport:{width:view.width,height:view.height},reducedMotion:"reduce"});
    await context.addCookies([{name:"kether_discord_session",value:session([testRole]),url:base}]);
    const publicContext=await browser.newContext({viewport:{width:view.width,height:view.height},reducedMotion:"reduce"});
    const page=await context.newPage();
    const publicPage=await publicContext.newPage();
    page.setDefaultTimeout(10000);
    for(const path of view.paths){
      try{
        const target=(path==="/login"||path==="/unauthorized")?publicPage:page;
        const response=await target.goto(new URL(path,base).href,{waitUntil:"domcontentloaded",timeout:30000});
        assert.ok(response&&response.status()<500,"HTTP "+response?.status());
        const route=new URL(path,base).pathname;
        assert.equal(new URL(target.url()).pathname,route,
          "Page unexpectedly redirected. Authenticated content not verified.");
        const home=path==="/";
        await target.waitForSelector(home?"[data-kether-home]":".site-viewport-content",{timeout:15000});
        await target.waitForTimeout(250);
        const dims=await target.evaluate(()=>{
          const root=document.documentElement,body=document.body;
          const headerGroups=document.querySelectorAll(".site-header .site-navigation .site-menu").length;
          const duplicateNav=document.querySelectorAll(".site-quicknav").length;
          const content=document.querySelector(".site-viewport-content");
          return {width:innerWidth,height:innerHeight,
            docH:root.scrollHeight,bodyH:body.scrollHeight,
            docW:root.scrollWidth,bodyW:body.scrollWidth,
            headerGroups,duplicateNav,
            contentH:content?.getBoundingClientRect().height||0,
            hasHome:!!document.querySelector("[data-kether-home]")};
        });
        assert.ok(Math.max(dims.docW,dims.bodyW)<=dims.width+3,"horizontal page overflow "+JSON.stringify(dims));
        assert.ok(Math.max(dims.docH,dims.bodyH)<=dims.height+3,"vertical page overflow "+JSON.stringify(dims));
        assert.equal(dims.hasHome,home,"homepage/internals mismatch");
        if(path==="/live"&&view.width<=740){
          const navHeight=await target.locator('nav[aria-label="全部星圖電波監測節點"]').evaluate(
            element=>element.parentElement?.getBoundingClientRect().height||0);
          assert.ok(navHeight>=40&&navHeight<=78,
            "mobile radar nav wastes vertical space: "+navHeight);
        }
        if(!home){
          assert.equal(dims.headerGroups,3,"Header should retain exactly 3 category menus");
          assert.equal(dims.duplicateNav,0,"duplicate category toolbar must not return");
          assert.ok(dims.contentH>=40,"inner content clipped "+JSON.stringify(dims));
        }
        const title=await target.locator("h1").first().textContent();
        const expected={
          "/database/warframes":"一般戰甲",
          "/live":"星圖電波",
          "/clan":"氏族",
          "/notifications":"通知中心",
          "/profile":"個人",
          "/db-status":"資料連線",
        };
        if(expected[route])assert.ok(title?.includes(expected[route]),
          "Expected real route content, not a shared login/denied page: "+String(title));
        report.passed.push({screen:view.name,path,status:response.status(),realRoute:true});
        if(["/","/story","/database/warframes","/live","/clan","/login"].includes(path)){
          const name=String(++shot).padStart(2,"0")+"-"+view.name+"-"+safe(path)+".png";
          await target.screenshot({path:"qa/screenshots/"+name,animations:"disabled"});
        }
      }catch(error){
        failure(view.name,path,error);
        try{await page.screenshot({path:"qa/screenshots/error-"+view.name+"-"+safe(path)+".png",animations:"disabled"});}catch{}
      }
    }
    await publicContext.close();
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  await context.addCookies([{name:"kether_discord_session",value:session([testRole]),url:base}]);
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  try{
    await page.goto(new URL("/story",base).href,{waitUntil:"domcontentloaded"});
    await page.waitForSelector(".site-navigation .site-menu summary");
    await page.locator(".site-effects-menu summary").click();
    await page.locator(".site-effects-panel button").filter({hasText:"省電"}).click();
    await page.waitForFunction(()=>document.documentElement.dataset.ketherEffects==="eco");
    await page.goto(new URL("/notifications",base).href,{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.documentElement.dataset.ketherEffects==="eco");
    report.passed.push({screen:"interaction",path:"performance-mode persistence"});
    const headerMenu=page.locator(".site-navigation .site-menu").first();
    await headerMenu.locator("summary").click();
    assert.equal(await headerMenu.getAttribute("open"),"","Header category menu did not open");
    await page.keyboard.press("Escape");
    assert.equal(await headerMenu.getAttribute("open"),null,"Escape did not close Header menu");
    report.passed.push({screen:"interaction",path:"Header category menu and Escape"});
  }catch(error){failure("interaction","effects and keyboard menus",error);}
  await context.close();
  const denied=await browser.newContext();
  const deniedPage=await denied.newPage();
  try{
    await deniedPage.goto(new URL("/database/warframes",base).href,{waitUntil:"domcontentloaded"});
    assert.equal(new URL(deniedPage.url()).pathname,"/login",
      "Unauthenticated database access was not redirected to login");
    report.passed.push({screen:"security",path:"login required for private catalog"});
    await denied.addCookies([{name:"kether_discord_session",value:session(["wrong-role"]),url:base}]);
    await deniedPage.goto(new URL("/database/warframes",base).href,{waitUntil:"domcontentloaded"});
    assert.equal(new URL(deniedPage.url()).pathname,"/unauthorized",
      "Insufficient Discord role was not blocked");
    report.passed.push({screen:"security",path:"wrong-role blocked"});
  }catch(error){failure("security","role/guild access",error);}
  await denied.close();
}finally{
  await browser.close();
  report.finishedAt=new Date().toISOString();
  await fs.writeFile("qa/report.json",JSON.stringify(report,null,2));
  console.log("KETHER browser smoke:",report.passed.length,"passed;",report.failed.length,"failed");
  for(const issue of report.failed)console.error("FAIL",issue.screen,issue.path,issue.error);
  if(report.failed.length)process.exitCode=1;
}

#!/usr/bin/env node
// KETHER QA: isolated player lifecycle and safe authentication UI regression checks.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";

const base=process.env.KETHER_TEST_BASE_URL||"http://127.0.0.1:3000";
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
const report={run:"player-and-auth-regression",passed:[],failed:[]};
const task=async(name,page,fn)=>{
  try{await fn();report.passed.push(name);console.log("PASS",name);}
  catch(error){const msg=String(error?.stack||error);report.failed.push({name,error:msg});console.error("FAIL",name,msg);
    try{await fs.mkdir("qa/screenshots",{recursive:true});await page.screenshot({path:"qa/screenshots/regression-"+name+".png",animations:"disabled"});}catch{}}
};
try{
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:"reduce"});
  await context.addInitScript(()=>{
    window.__ketherMockPlayerStats={created:0,plays:0,pauses:0,next:0,previous:0,destroyed:0,cued:0};
    window.YT={
      PlayerState:{ENDED:0,PLAYING:1,PAUSED:2,CUED:5},
      Player:class {
        constructor(_id,{events}){
          window.__ketherMockPlayerStats.created++;
          this.state=5;
          window.setTimeout(()=>events?.onReady?.(),30);
          this.events=events;
        }
        playVideo(){window.__ketherMockPlayerStats.plays++;this.state=1;this.events?.onStateChange?.({data:1});}
        pauseVideo(){window.__ketherMockPlayerStats.pauses++;this.state=2;this.events?.onStateChange?.({data:2});}
        nextVideo(){window.__ketherMockPlayerStats.next++;}
        previousVideo(){window.__ketherMockPlayerStats.previous++;}
        cuePlaylist(){window.__ketherMockPlayerStats.cued++;}
        getVideoData(){return {title:"KETHER QA 模擬電台",video_id:"qa-mock-video"};}
        getPlayerState(){return this.state;}
        getPlaylist(){return ["one","two","three"];}
        getPlaylistIndex(){return 0;}
        playVideoAt(index){window.__ketherMockPlayerStats.next+=index===1?1:0;window.__ketherMockPlayerStats.previous+=index===2?1:0;}
        destroy(){window.__ketherMockPlayerStats.destroyed++;}
      }
    };
  });
  const page=await context.newPage();
  page.setDefaultTimeout(12000);

  await task("player-initially-idle",page,async()=>{
    await page.goto(new URL("/story",base).href,{waitUntil:"domcontentloaded"});
    await page.locator(".kether-mini-bubble").waitFor();
    assert.equal(await page.evaluate(()=>window.__ketherMockPlayerStats.created),0,
      "YouTube player should not initialize before user interaction");
  });

  await task("player-single-instance-after-page-navigation",page,async()=>{
    await page.locator(".kether-mini-bubble").click();
    await page.waitForFunction(()=>window.__ketherMockPlayerStats.created===1&&document.querySelector(".kether-mini-play:not([disabled])"));
    await page.locator(".kether-mini-play").click();
    await page.waitForFunction(()=>window.__ketherMockPlayerStats.plays>=1);
    await page.waitForFunction(()=>document.querySelector(".kether-mini-title")?.textContent?.includes("KETHER QA 模擬電台"));
    const title=await page.locator(".kether-mini-title").innerText();
    assert.match(title,/KETHER QA 模擬電台/);
    await page.locator(".site-tools a[aria-label='搜尋資料庫']").click();
    await page.waitForURL("**/search**");
    await page.waitForTimeout(350);
    const stat=await page.evaluate(()=>window.__ketherMockPlayerStats);
    assert.equal(stat.created,1,"Player reinitialized during client navigation");
    assert.equal(stat.destroyed,0,"Player destroyed during client navigation");
    assert.ok(stat.plays>=1,"Playback state lost");
    await page.locator(".kether-mini-close").click();
    assert.ok(await page.locator(".kether-mini-bubble").isVisible(),"floating player lost after collapse");
    await page.locator(".kether-mini-bubble").click();
    assert.equal(await page.evaluate(()=>window.__ketherMockPlayerStats.created),1);
  });

  await task("player-controls-forward-back-pause",page,async()=>{
    await page.locator(".kether-mini-skip").last().click();
    await page.locator(".kether-mini-skip").first().click();
    await page.locator(".kether-mini-play").click();
    const stat=await page.evaluate(()=>window.__ketherMockPlayerStats);
    assert.ok(stat.next>=1,"Next action not forwarded");
    assert.ok(stat.previous>=1,"Previous action not forwarded");
    assert.ok(stat.pauses>=1,"Pause action not forwarded");
  });

  await context.close();
  const publicContext=await browser.newContext({viewport:{width:1280,height:800}});
  const login=await publicContext.newPage();
  login.setDefaultTimeout(12000);
  await task("login-policy-five-gates-no-premature-auth",login,async()=>{
    await login.goto(new URL("/login?next=%2Fprofile",base).href,{waitUntil:"domcontentloaded"});
    const gate=login.locator("a[aria-disabled]").filter({hasText:"Discord"});
    await gate.waitFor();
    assert.equal(await gate.getAttribute("aria-disabled"),"true");
    assert.equal(await login.locator("input[type=checkbox]").isDisabled(),true);
    const sections=login.locator("article[aria-label='登入前資料告知'] details");
    assert.equal(await sections.count(),5,"Login disclosure must include five policy items");
    for(let i=0;i<5;i++)await sections.nth(i).locator("summary").click();
    await login.locator("[class*=policyProgress][data-complete=true]").waitFor({state:"visible"});
    await login.locator("input[type=checkbox]").check();
    assert.equal(await gate.getAttribute("aria-disabled"),"false");
    const href=await gate.getAttribute("href");
    assert.ok(href?.includes("/api/auth/discord/login?next=%2Fprofile"),"next path not preserved");
    // No live OAuth request is made during CI.
  });
  await task("admin-no-session-cannot-view-access-api",login,async()=>{
    const response=await publicContext.request.get(new URL("/api/admin/access",base).href,{maxRedirects:0});
    assert.ok(response.status()===401||response.status()===403||
      (response.status()>=300&&response.status()<400),
      "Unauthorized admin access responded "+response.status());
    const state=await publicContext.request.get(new URL("/api/visual-overrides?stage=draft&path=%2F",base).href,{maxRedirects:0});
    assert.ok(state.status()===401||state.status()===403||
      (state.status()>=300&&state.status()<400),
      "Unauthorized draft read responded "+state.status());
  });
  await publicContext.close();
}finally{
  await browser.close();
  await fs.mkdir("qa",{recursive:true});
  await fs.writeFile("qa/player-auth-regressions.json",JSON.stringify(report,null,2));
  console.log("KETHER player/auth:",report.passed.length,"passed;",report.failed.length,"failed");
  if(report.failed.length)process.exitCode=1;
}

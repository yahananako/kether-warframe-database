#!/usr/bin/env node
// Structural guardrails for the accepted KETHER redesign rules.
// This is a source-level check, not a substitute for a browser/a11y test.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const tests=[
  ["persistent provider",()=>assert.match(read("app/layout.tsx"),/KetherEffectsProvider[\s\S]*<SiteShell>/)],
  ["three real display modes",()=>{
    const code=read("components/KetherEffectsProvider.tsx");
    for(const name of ["full","balanced","eco","localStorage","prefers-reduced-motion"])
      assert.ok(code.includes(name),name);
  }],
  ["display control in site navigation",()=>{
    const shell=read("components/SiteShell.tsx");
    assert.ok(shell.includes("<KetherEffectsMenu />"));
    assert.ok(shell.includes("effectiveMode === \"eco\""));
    assert.ok(shell.includes('className="site-navigation"'));
    assert.ok(!shell.includes('className="site-quicknav"'));
    assert.ok(!read("app/kether-redesign.css").includes(".site-quicknav"));
  }],
  ["reduced motion and save data fallback",()=>{
    const mode=read("components/KetherEffectsProvider.tsx");
    assert.match(mode,/reducedMotion \|\| saveData \? "eco" : mode/);
  }],
  ["homepage honours mode",()=>{
    assert.ok(read("components/HomeImmersive.tsx").includes("cinemaVideo"));
    assert.ok(read("components/HomeCinema.tsx").includes('effectiveMode==="eco"'));
  }],
  ["ticker restore and pause",()=>{
    const source=read("components/HomeTicker.tsx");
    assert.ok(source.includes("localStorage.getItem"));
    assert.ok(source.includes('effectiveMode==="eco"'));
  }],
  ["filter persistence excludes private collection state",()=>{
    const table=read("components/DataTable.tsx");
    assert.match(table,/sessionStorage\.setItem\(filterKey,JSON\.stringify\(\{query,filter,sortMode,section\}\)\)/);
    assert.ok(!table.includes("JSON.stringify({ownedMap"));
  }],
  ["cross-home persistent chrome",()=>{
    const source=read("components/SiteShell.tsx");
    assert.ok(source.includes("{home ? children : null}"));
    assert.ok(source.includes('site-shell-inactive'));
    assert.ok(source.includes("active={!home}"));
    assert.ok(read("app/kether-redesign.css").includes(".site-shell-inactive"));
  }],
  ["viewport shell and eco fallback",()=>{
    const css=read("app/kether-redesign.css");
    assert.ok(css.includes(".site-viewport-content"));
    assert.ok(css.includes('data-kether-effects="eco"'));
    assert.ok(css.includes("overflow: hidden;"));
  }],
  ["previous admin and user APIs untouched",()=>{
    assert.ok(read("components/SiteShell.tsx").includes("/api/admin/access"));
    assert.ok(read("components/DataTable.tsx").includes("toggleUserOwnedItem"));
  }],
];
let passed=0;
for(const [label,fn] of tests){
  try {fn();console.log("✓",label);passed++;}
  catch(error){console.error("✗",label,error.message);process.exitCode=1;}
}
console.log("KETHER source-contract checks:",passed,"/",tests.length);

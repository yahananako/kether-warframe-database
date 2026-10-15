import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { NextRequest } from "next/server";
import { incarnonCatalog } from "../data/incarnonWeapons";
import { INCARNON_WEAPONS } from "../data/incarnonAcquisition";
import { ALL_WEAPON_ACQUISITION_DATA } from "../app/api/discord/data/allWeapons";
import { searchWeaponAcquisitionChoices, buildWeaponAcquisitionResponse } from "../app/api/discord/weaponAcquisition";
import { POST } from "../app/api/discord/route";
import { GET } from "../app/api/bot-search/weapon/route";
import { classifyDatabaseRow } from "../data/categoryTaxonomy";
import { fetchSheetRows } from "../lib/sheets";

async function main() {
  assert.equal(INCARNON_WEAPONS.length, 53);
  const records = ALL_WEAPON_ACQUISITION_DATA.filter(w => w.seriesKey === "incarnon");
  assert.equal(records.length, incarnonCatalog.weapons.length);
  assert.equal(new Set(records.map(w => w.key)).size, 53);
  const expectedCounts = { primary: 17, secondary: 18, melee: 18 };
  for (const [category, count] of Object.entries(expectedCounts)) {
    const choices = searchWeaponAcquisitionChoices("", category, "incarnon");
    assert.equal(choices.length, count, `${category} autocomplete is incomplete`);
    assert.equal(new Set(choices.map(c => c.value)).size, count);
  }
  // Reproduce the screenshot's actual signed autocomplete request at the route boundary.
  const originalKey = process.env.DISCORD_PUBLIC_KEY;
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  try {
    process.env.DISCORD_PUBLIC_KEY = publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("hex");
    const body = JSON.stringify({ type: 4, data: { name: "weapon-obtain", options: [
      { name: "weapon_type", type: 3, value: "melee" },
      { name: "series", type: 3, value: "incarnon" },
      { name: "name", type: 3, value: "", focused: true },
    ] } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = sign(null, Buffer.from(timestamp + body), privateKey).toString("hex");
    const response = await POST(new Request("https://kether.test/api/discord", { method: "POST", body,
      headers: { "x-signature-ed25519": signature, "x-signature-timestamp": timestamp } }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.type, 8);
    assert.equal(payload.data.choices.length, 18);
    for (const name of ["Ceramic Dagger Incarnon", "Hate Incarnon", "Ruvox", "Thalys"]) {
      assert.ok(payload.data.choices.some((choice: any) => choice.value === name));
    }
  } finally {
    if (originalKey === undefined) delete process.env.DISCORD_PUBLIC_KEY;
    else process.env.DISCORD_PUBLIC_KEY = originalKey;
  }

  const context = { window: {} as any };
  vm.runInNewContext(await readFile("android/assets/search-data.js", "utf8"), context);
  const android: any = Object.values(context.window)[0];
  assert.equal(android.weapons.filter((w: any) => w.seriesKey === "incarnon").length, 53);
  for (const item of INCARNON_WEAPONS) {
    assert.equal(classifyDatabaseRow(item.category, item).key, "incarnon");
    const response = await GET(new NextRequest(`https://kether.test/api/bot-search/weapon?q=${encodeURIComponent(item.englishName)}`));
    const payload = await response.json();
    assert.equal(payload.count, 1);
    assert.equal(payload.results[0].name, item.name);
    assert.equal(payload.results[0].marketUrl, "");
    const choices = searchWeaponAcquisitionChoices(item.chineseName, item.category, "incarnon");
    assert.equal(choices[0]?.value, item.englishName);
    const discord: any = await buildWeaponAcquisitionResponse(item.englishName, item.category, "incarnon");
    assert.ok(discord.embeds[0].title.includes(item.chineseName));
    const offline = android.weapons.filter((w: any) => w.name === item.name && w.seriesKey === "incarnon");
    assert.equal(offline.length, 1);
    assert.equal(offline[0].source, item.source);
  }
  const byName = (name: string) => INCARNON_WEAPONS.find(w => w.englishName === name)!;
  assert.match(byName("Innodem").source, /Cavalero/);
  assert.doesNotMatch(byName("Innodem").source, /Circuit|巡迴/);
  assert.match(byName("Ruvox").source, /Armatus.*Loid/);
  assert.match(byName("Thalys").source, /Acrithis/);
  assert.equal(byName("Innodem").chineseName, "影絡");
  assert.equal(byName("Praedos").chineseName, "剝奪");
  const prime = ALL_WEAPON_ACQUISITION_DATA.find(w => w.name.startsWith("Skana Prime /"))!;
  assert.equal(prime.seriesKey, "prime");
  assert.ok(prime.price);
  const boltorPrime = ALL_WEAPON_ACQUISITION_DATA.find(w => w.name.startsWith("Boltor Prime /"))!;
  assert.equal(boltorPrime.marketUrl, "https://warframe.market/items/boltor_prime_set");

  const primeResponse = await GET(new NextRequest("https://kether.test/api/bot-search/weapon?q=Braton%20Prime"));
  assert.ok((await primeResponse.json()).results[0].name.startsWith("Braton Prime /"));
  assert.equal(searchWeaponAcquisitionChoices("Braton Prime", "primary", "incarnon")[0]?.value, "Braton Incarnon");

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("<html>unavailable</html>", { status: 503 });
    for (const [category, count] of Object.entries(expectedCounts)) {
      const { rows } = await fetchSheetRows(category);
      assert.equal(rows.filter(w => w.section === `靈化${{ primary: "主要武器", secondary: "次要武器", melee: "近戰武器" }[category]}`).length, count);
    }
  } finally { globalThis.fetch = originalFetch; }
  console.log("通過：Discord 實際簽章自動補全回傳 18 把近戰；53 組靈化資料、三分類、網站／BOT／Android 一致，原生來源與 Prime 交易不混淆。");
}
main().catch(error => { console.error(error); process.exitCode = 1; });

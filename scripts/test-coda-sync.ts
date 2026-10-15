import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { NextRequest } from "next/server";
import { classifyDatabaseRow } from "../data/categoryTaxonomy";
import { CODA_WEAPONS } from "../data/codaWeapons";
import { ALL_WEAPON_ACQUISITION_DATA } from "../app/api/discord/data/allWeapons";
import { buildWeaponAcquisitionResponse, searchWeaponAcquisitionChoices } from "../app/api/discord/weaponAcquisition";
import { GET } from "../app/api/bot-search/weapon/route";
import { fetchSheetRows } from "../lib/sheets";

async function main() {
  const expected = ["Coda Bassocyst", "Coda Bubonico", "Coda Hema", "Coda Sporothrix", "Coda Synapse", "Coda Catabolyst", "Coda Pox", "Coda Tysis", "Dual Coda Torxica", "Coda Caustacyst", "Coda Hirudo", "Coda Mire", "Coda Motovore", "Coda Pathocyst"].sort();
  assert.deepEqual(CODA_WEAPONS.map(w => w.englishName).sort(), expected);
  assert.deepEqual(["primary", "secondary", "melee"].map(c => CODA_WEAPONS.filter(w => w.category === c).length), [5, 4, 5]);
  assert.deepEqual(["A", "B"].map(b => CODA_WEAPONS.filter(w => w.rotationBatch === b).length), [7, 7]);
  assert.equal(CODA_WEAPONS.find(w => w.englishName === "Coda Bubonico")?.rotationBatch, "B");

  const context = { window: {} as any };
  vm.runInNewContext(await readFile("android/assets/search-data.js", "utf8"), context);
  const android: any = Object.values(context.window)[0];
  assert.equal(android.weapons.filter((w: any) => w.seriesKey === "coda").length, 14);
  assert.equal(ALL_WEAPON_ACQUISITION_DATA.filter(w => w.seriesKey === "coda").length, 14);

  for (const weapon of CODA_WEAPONS) {
    assert.equal(classifyDatabaseRow(weapon.category, weapon).key, "coda");
    for (const query of [weapon.chineseName, weapon.chineseName.replaceAll(" ", ""), weapon.englishName]) {
      const response = await GET(new NextRequest(`https://kether.test/api/bot-search/weapon?q=${encodeURIComponent(query)}`));
      const payload = await response.json();
      assert.equal(payload.count, 1);
      assert.equal(payload.results[0].name, `${weapon.englishName} / ${weapon.chineseName}`);
      assert.equal(payload.results[0].series, "勾瘩");
      assert.equal(payload.results[0].price, "不可交易");
      assert.equal(payload.results[0].marketUrl, "");
      const discord: any = await buildWeaponAcquisitionResponse(query, weapon.category, "coda");
      assert.ok(discord.embeds?.[0]?.title.includes(weapon.chineseName));
      assert.equal(searchWeaponAcquisitionChoices(query, weapon.category, "coda").length, 1);
    }
    assert.equal(android.weapons.filter((w: any) => w.name === `${weapon.englishName} / ${weapon.chineseName}`).length, 1);
  }

  // A Sheets outage must not remove any Coda weapon from the database.
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("<html>unavailable</html>", { status: 503 });
    for (const category of ["primary", "secondary", "melee"]) {
      const result = await fetchSheetRows(category);
      const actual = result.rows.filter(w => /^(?:Dual )?Coda /.test(w.englishName));
      assert.equal(actual.length, CODA_WEAPONS.filter(w => w.category === category).length);
      assert.ok(actual.every(w => !w.marketUrl && w.price === "不可交易"));
    }
  } finally { globalThis.fetch = originalFetch; }

  const registration = await readFile("scripts/register-warframe-card-command.mjs", "utf8");
  assert.match(registration, /name: "勾瘩", value: "coda"/);
  console.log("通過：14 把勾瘩武器、42 組中英文搜尋、BOT 分類、Android 離線資料、不可交易與表格故障備援。");
}
main().catch(error => { console.error(error); process.exitCode = 1; });

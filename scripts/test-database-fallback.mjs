import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { Children, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CODA_WEAPONS } from "../data/codaWeapons.ts";
import { EQUIPMENT_CATALOG } from "../data/equipmentCatalog.generated.ts";
import { INCARNON_WEAPONS } from "../data/incarnonAcquisition.ts";
import { KUVA_WEAPONS } from "../data/kuvaWeapons.generated.ts";
import { classifyDatabaseRow } from "../data/categoryTaxonomy.ts";
import { fetchSheetRows, SHEET_GIDS } from "../lib/sheets.ts";

// Node has no CSS module loader. Keep the real page, DataTable and data layer;
// only replace styles so these tests exercise the actual rendered page boundary.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".module.css")) return {
      format: "module",
      source: "export default new Proxy({}, { get: (_, key) => String(key) });",
      shortCircuit: true,
    };
    return nextLoad(url, context);
  },
});
const { default: DatabaseCategoryPage } = await import("../app/database/[category]/page.tsx");
const { default: DataTable } = await import("../components/DataTable.tsx");

const csv = (...rows) => rows.map(row => row.map(cell =>
  `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
const header = ["中文名", "英文名", "用途", "優先度", "價格", "交易", "持有", "來源", "備註"];
const sheetRow = (zh, en, price = "35", owned = "未購買") =>
  [zh, en, "回歸測試資料", "一般", price, "開啟交易", owned, "測試來源", "測試備註"];

function mockSheets(t, respond) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.hostname, "docs.google.com", "tests must not call external services");
    const category = Object.keys(SHEET_GIDS).find(key =>
      SHEET_GIDS[key].gid === url.searchParams.get("gid"));
    return respond(category);
  };
  t.after(() => { globalThis.fetch = originalFetch; });
}

function elements(node) {
  const result = [];
  Children.forEach(node, child => {
    if (!isValidElement(child)) return;
    result.push(child, ...elements(child.props.children));
  });
  return result;
}

async function pageResult(category, expectedRows, expectedState) {
  const page = await DatabaseCategoryPage({ params: Promise.resolve({ category }) });
  const nodes = elements(page);
  const table = nodes.find(node => node.type === DataTable);
  const warning = nodes.find(node => node.props.role === "status");
  const fatal = nodes.find(node => node.props.role === "alert");
  assert.equal(Boolean(warning), expectedState === "warning");
  assert.equal(Boolean(fatal), expectedState === "fatal");
  assert.equal(Boolean(table), expectedState !== "fatal", "available rows must reach DataTable");
  if (table) {
    assert.deepEqual(table.props.rows, expectedRows);
    assert.equal(table.props.category, category);
  }
  const record = nodes.find(node => node.props.className === "record");
  assert.equal(record.props.children[0].props.children,
    expectedState === "fatal" ? "—" : expectedRows.length.toLocaleString("zh-TW"));
  // Render DataTable itself too, rather than merely asserting that rows exist.
  const html = renderToStaticMarkup(page);
  assert.equal(html.includes("目前顯示"), expectedState !== "fatal");
  if (expectedState === "warning") {
    assert.match(html, /部分內容可能不完整或尚未更新/);
    assert.match(html, /href="\/db-status"/);
  }
  return html;
}

function assertEquipment(category, rows) {
  const expectedCoda = CODA_WEAPONS.filter(row => row.category === category);
  const actualCoda = rows.filter(row => classifyDatabaseRow(category, row).key === "coda");
  assert.equal(actualCoda.length, expectedCoda.length);
  assert.deepEqual(actualCoda.map(row => row.englishName).sort(),
    expectedCoda.map(row => row.englishName).sort());
  for (const row of expectedCoda) {
    assert.equal(classifyDatabaseRow(category, row).key, "coda");
    assert.equal(classifyDatabaseRow(category, {
      section: "", chineseName: "", englishName: row.englishName,
    }).key, "coda", "English-only names retain the existing taxonomy");
    const matches = rows.filter(item => item.englishName === row.englishName);
    assert.equal(matches.length, 1, "Coda must not be duplicated by Sheets/catalog merge");
    assert.deepEqual(matches[0].aliases, row.aliases);
    assert.equal(matches[0].price, "不可交易");
    assert.equal(matches[0].marketUrl, "");
  }
  // Check all existing equipment remains, including Prime, Kuva and Incarnon.
  for (const row of [...EQUIPMENT_CATALOG, ...KUVA_WEAPONS, ...INCARNON_WEAPONS]
    .filter(row => row.category === category)) {
    assert.ok(rows.some(item => item.englishName === row.englishName), row.englishName);
  }
}

test("healthy Sheets renders merged equipment, live fields, existing rows and accurate counts", async t => {
  mockSheets(t, category => {
    const coda = CODA_WEAPONS.find(row => row.category === category);
    const existing = EQUIPMENT_CATALOG.find(row => row.category === category && row.marketUrl);
    return new Response(csv(header,
      sheetRow(coda.chineseName, coda.englishName, "不可交易"),
      sheetRow(existing.chineseName, existing.englishName, "123", "已購買"),
      sheetRow("測試額外武器", "Fallback Regression Extra")), { status: 200 });
  });
  for (const category of ["primary", "secondary", "melee"]) {
    const result = await fetchSheetRows(category);
    assert.equal(result.error, undefined);
    assertEquipment(category, result.rows);
    assert.equal(result.rows.filter(row => row.englishName === "Fallback Regression Extra").length, 1);
    const existing = EQUIPMENT_CATALOG.find(row => row.category === category && row.marketUrl);
    const merged = result.rows.find(row => row.englishName === existing.englishName);
    assert.equal(merged.price, "123");
    assert.equal(merged.owned, "已購買");
    assert.equal(merged.marketUrl, existing.marketUrl);
    await pageResult(category, result.rows, "healthy");
  }
});

test("healthy MOD sources retain deduplication, filtering and market links", async t => {
  mockSheets(t, () => new Response(csv(header,
    sheetRow("膛線", "Serration"), sheetRow("測試武器", "Regression Rifle"),
    sheetRow("活動 Prime MOD", "Primed Regression")), { status: 200 }));
  // Section titles are how the source identifies ordinary MODs such as Serration.
  const result = await fetchSheetRows("mods");
  assert.equal(result.error, undefined);
  assert.deepEqual(result.rows.map(row => row.englishName), ["Primed Regression"]);
  assert.equal(result.rows[0].marketUrl, "https://warframe.market/items/primed_regression");
  await pageResult("mods", result.rows, "healthy");
});

test("partial MOD source failure keeps successful sources visible with a warning and counts", async t => {
  mockSheets(t, category => category === "primary"
    ? new Response("unavailable", { status: 503 })
    : new Response(csv(header, ["▣ MOD"], sheetRow("膛線", "Serration"),
      sheetRow("活動 Prime MOD", "Primed Regression")), { status: 200 }));
  const result = await fetchSheetRows("mods");
  assert.equal(result.error, "部分 MOD 來源讀取失敗：primary");
  assert.deepEqual(result.rows.map(row => row.englishName), ["Serration", "Primed Regression"]);
  const html = await pageResult("mods", result.rows, "warning");
  assert.ok(html.includes(result.error));
  assert.match(html, /Serration/);
});

test("all Sheets return HTTP 503: real equipment tables still render all 14 Coda weapons", async t => {
  mockSheets(t, () => new Response("<html>unavailable</html>", { status: 503 }));
  for (const category of ["primary", "secondary", "melee"]) {
    const result = await fetchSheetRows(category);
    assert.ok(result.error);
    assertEquipment(category, result.rows);
    const html = await pageResult(category, result.rows, "warning");
    for (const row of CODA_WEAPONS.filter(row => row.category === category)) {
      assert.ok(html.includes(row.chineseName), `${row.chineseName} must be visible`);
      assert.ok(html.includes(row.englishName));
    }
  }
});

test("complete network outage renders fallback where available and blocks only empty results", async t => {
  mockSheets(t, () => { throw new TypeError("simulated network outage"); });
  for (const category of ["primary", "secondary", "melee", "companions", "archwing", "mods", "overview"]) {
    const result = await fetchSheetRows(category);
    assert.ok(result.error);
    if (["mods", "overview"].includes(category)) assert.equal(result.rows.length, 0);
    else assert.ok(result.rows.length > 0);
    await pageResult(category, result.rows, result.rows.length ? "warning" : "fatal");
  }
});

test("HTML login response with HTTP 200 still warns while preserving the fallback", async t => {
  mockSheets(t, () => new Response("<!DOCTYPE html><html>sign in</html>", { status: 200 }));
  const result = await fetchSheetRows("primary");
  assert.ok(result.error);
  assertEquipment("primary", result.rows);
  await pageResult("primary", result.rows, "warning");
});

test("healthy empty source keeps the normal empty DataTable instead of an outage panel", async t => {
  mockSheets(t, () => new Response(csv(header), { status: 200 }));
  const result = await fetchSheetRows("overview");
  assert.equal(result.error, undefined);
  assert.equal(result.rows.length, 0);
  const html = await pageResult("overview", result.rows, "healthy");
  assert.match(html, /沒有找到資料/);
});

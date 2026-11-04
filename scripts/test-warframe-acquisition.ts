import assert from "node:assert/strict";
import { regularWarframes } from "../data/regularWarframes";
import { warframeDetails } from "../data/warframeDetails";
import { WARFRAME_ACQUISITION_DATA } from "../app/api/discord/data/warframes";
import { buildWarframeAcquisitionResponse, searchWarframeAcquisitionChoices } from "../app/api/discord/warframeAcquisition";
import { GET } from "../app/api/bot-search/warframe/route";
import { NextRequest } from "next/server";

const expected = new Set([...regularWarframes.map((frame) => frame.name), "Excalibur Umbra"]);
const actual = WARFRAME_ACQUISITION_DATA.map((frame) => frame.name.split(" / ")[0]);
assert.deepEqual(new Set(actual), expected, "BOT and shared catalog coverage must agree");
assert.equal(actual.length, expected.size, "No duplicate records");
assert.deepEqual(new Set(warframeDetails.map((frame) => frame.name)), expected, "Details and catalog coverage must agree");

for (const frame of WARFRAME_ACQUISITION_DATA) {
  const english = frame.name.split(" / ")[0];
  for (const query of [english, ...frame.aliases]) {
    const response = buildWarframeAcquisitionResponse(query) as any;
    assert.equal(response.embeds?.[0]?.title, `⚔️ ${frame.name}`, `Wrong lookup for ${query}`);
    const choices = searchWarframeAcquisitionChoices(query);
    assert.ok(choices.some((choice) => choice.value === english), `Missing autocomplete for ${query}`);
    assert.ok(choices.length <= 25);
    assert.ok(choices.every((choice) => choice.name.length <= 100 && choice.value.length <= 100));
  }
  const response = buildWarframeAcquisitionResponse(english) as any;
  const embed = response.embeds[0];
  assert.ok(embed.fields.length <= 25);
  assert.ok(embed.fields.every((field: any) => field.value && field.value.length <= 1024));
  const total = embed.title.length + embed.description.length + embed.footer.text.length +
    embed.fields.reduce((sum: number, field: any) => sum + field.name.length + field.value.length, 0);
  assert.ok(total <= 6000, `${english} exceeds the Discord embed limit`);
  assert.equal(embed.fields.filter((field: any) => field.name.startsWith("部件來源"))
    .map((field: any) => field.value).join(""), frame.parts, "Part splitting must preserve all text");
}

const narin = buildWarframeAcquisitionResponse("冰女") as any;
assert.match(JSON.stringify(narin), /Entropic Kuva/);
assert.match(JSON.stringify(narin), /Cephalon Melica/);
assert.match(JSON.stringify(narin), /Everview Arc/);
assert.equal(narin.components.length, 0, "Narin must not link to a nonexistent Prime set");
const citrine = buildWarframeAcquisitionResponse("Citrine") as any;
assert.equal(citrine.components[0].components[0].url, "https://warframe.market/items/citrine_prime_set");
const rhino = buildWarframeAcquisitionResponse("犀牛") as any;
assert.equal(rhino.components[0].components[0].url, "https://warframe.market/items/rhino_prime_set");
assert.match((buildWarframeAcquisitionResponse("not-a-warframe-123") as any).content, /找不到/);
assert.equal(searchWarframeAcquisitionChoices("not-a-warframe-123").length, 0);
assert.ok((buildWarframeAcquisitionResponse("") as any).embeds[0].description.length <= 4096);
async function verifySearchApi() {
  for (const frame of WARFRAME_ACQUISITION_DATA) {
    const query = frame.name.split(" / ")[0];
    const response = await GET(new NextRequest(`http://localhost/api/bot-search/warframe?q=${encodeURIComponent(query)}`));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.results[0]?.name, frame.name, `API lookup failed for ${query}`);
    assert.ok(payload.results[0].details.some((field: any) => field.label === "取得方式" && field.value === frame.source));
  }
  console.log(`Warframe acquisition checks passed: ${expected.size} frames, all aliases, autocomplete, drop fields, market links and search API.`);
}
verifySearchApi().catch((error) => { console.error(error); process.exitCode = 1; });

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import sharp from "sharp";

import { detectClanEmblem } from "../app/api/discord/clanVerification";
import { pickGiveawayWinners } from "../app/api/discord/giveaway";
import { buildWarframeAcquisitionResponse } from "../app/api/discord/warframeAcquisition";
import { buildKetherWarframeProfileEmbed } from "../app/api/discord/route";

async function testEmblemRecognition() {
  const logo = await readFile("public/kether-clan-logo.png");
  const resizedLogo = await sharp(logo).resize(112, 112).png().toBuffer();
  const screenshot = await sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 4,
      background: { r: 17, g: 25, b: 39, alpha: 1 },
    },
  })
    .composite([{ input: resizedLogo, left: 96, top: 110 }])
    .png()
    .toBuffer();
  const positive = await detectClanEmblem(screenshot, logo);

  assert.equal(positive.matched, true, `expected emblem match, score=${positive.score}`);

  const blank = await sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 3,
      background: { r: 17, g: 25, b: 39 },
    },
  })
    .png()
    .toBuffer();
  const negative = await detectClanEmblem(blank, logo);

  assert.equal(negative.matched, false, `blank image matched, score=${negative.score}`);
}

function testGiveawaySelection() {
  const entries = ["one", "two", "three", "four"].map((userId, index) => ({
    user_id: userId,
    display_name: userId,
    joined_at: new Date(2026, 8, 15, 0, index).toISOString(),
  }));
  const winners = pickGiveawayWinners(entries, 2);

  assert.equal(winners.length, 2);
  assert.equal(new Set(winners).size, 2);
  assert.ok(winners.every((winner) => entries.some((entry) => entry.user_id === winner)));

  const rerolled = pickGiveawayWinners(entries, 2, ["one", "two"]);
  assert.deepEqual(new Set(rerolled), new Set(["three", "four"]));
  assert.equal(pickGiveawayWinners(entries.slice(0, 1), 5).length, 1);
}

function testWarframeMarketLink() {
  const response = buildWarframeAcquisitionResponse("犀牛") as any;
  const button = response.components?.[0]?.components?.[0];

  assert.equal(button?.style, 5);
  assert.equal(button?.url, "https://warframe.market/items/rhino_prime_set");
}

function testSlashWarframeCard() {
  const interaction = {
    member: { user: { id: "viewer", username: "Viewer" } },
    data: {
      name: "warframe-card",
      options: [{ name: "user", type: 6, value: "target" }],
      resolved: {
        users: {
          target: {
            id: "target",
            username: "TargetTenno",
            global_name: "Target Tenno",
            avatar: null,
          },
        },
      },
    },
  };
  const embed = buildKetherWarframeProfileEmbed(interaction);

  assert.match(embed.description, /Target Tenno/);
  assert.match(embed.description, /尚未建立 Warframe 名片/);
}

async function main() {
  await testEmblemRecognition();
  testGiveawaySelection();
  testWarframeMarketLink();
  testSlashWarframeCard();

  console.log("KETHER Discord BOT tests passed: verification emblem, giveaway draw, market button, profile card.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

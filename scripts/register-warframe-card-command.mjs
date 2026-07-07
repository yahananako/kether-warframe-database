import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const text = readFileSync(path, "utf8");

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

const appId =
  process.env.DISCORD_APP_ID ||
  process.env.DISCORD_APPLICATION_ID ||
  process.env.DISCORD_CLIENT_ID;

const guildId = process.env.DISCORD_GUILD_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

if (!appId) throw new Error("缺少 DISCORD_APP_ID / DISCORD_APPLICATION_ID / DISCORD_CLIENT_ID");
if (!guildId) throw new Error("缺少 DISCORD_GUILD_ID");
if (!botToken) throw new Error("缺少 DISCORD_BOT_TOKEN");

const commands = [
  {
    name: "warframe-obtain",
    name_localizations: {
      "zh-TW": "戰甲取得",
      "zh-CN": "战甲取得",
    },
    description: "查詢 Warframe 戰甲取得方式",
    description_localizations: {
      "zh-TW": "查詢 Warframe 戰甲取得方式",
      "zh-CN": "查询 Warframe 战甲取得方式",
    },
    type: 1,
    options: [
      {
        name: "name",
        name_localizations: {
          "zh-TW": "名稱",
          "zh-CN": "名称",
        },
        description: "要查詢的戰甲名稱，例如 Yareli 或 雅蕾莉",
        description_localizations: {
          "zh-TW": "要查詢的戰甲名稱，例如 Yareli 或 雅蕾莉",
          "zh-CN": "要查询的战甲名称，例如 Yareli 或 雅蕾莉",
        },
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "查看 Warframe 名片",
    type: 2,
  },
  {
    name: "warframe-card",
    description: "查看指定成員的 Warframe 名片",
    type: 1,
    options: [
      {
        name: "user",
        description: "要查看名片的成員",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "warframe-profile",
    description: "A-1 測試：用 playerId 讀取 Warframe 官方 Profile",
    type: 1,
    options: [
      {
        name: "player_id",
        description: "Warframe Account ID / playerId",
        type: 3,
        required: true,
      },
      {
        name: "platform",
        description: "玩家平台",
        type: 3,
        required: true,
        choices: [
          { name: "PC", value: "pc" },
          { name: "PlayStation", value: "ps" },
          { name: "Xbox", value: "xbox" },
          { name: "Switch", value: "switch" },
          { name: "iOS", value: "ios" },
          { name: "Android", value: "android" },
        ],
      },
    ],
  },
];

const baseUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;

async function discordFetch(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    console.error(data);
    throw new Error(`Discord API 錯誤：${response.status}`);
  }

  return data;
}

const existingCommands = await discordFetch("GET", baseUrl);

for (const command of commands) {
  const existed = existingCommands.find(
    (item) => item.name === command.name && item.type === command.type
  );

  if (existed) {
    const updated = await discordFetch("PATCH", `${baseUrl}/${existed.id}`, command);
    console.log(`已更新 ${command.type === 1 ? "Slash Command" : "User Command"}：`, updated.name);
  } else {
    const created = await discordFetch("POST", baseUrl, command);
    console.log(`已建立 ${command.type === 1 ? "Slash Command" : "User Command"}：`, created.name);
  }
}

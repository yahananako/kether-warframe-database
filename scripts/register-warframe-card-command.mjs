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

const command = {
  name: "查看 Warframe 名片",
  type: 2
};

const baseUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;

async function discordFetch(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
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

const commands = await discordFetch("GET", baseUrl);

const existed = commands.find(
  (item) => item.name === command.name && item.type === command.type
);

if (existed) {
  const updated = await discordFetch("PATCH", `${baseUrl}/${existed.id}`, command);
  console.log("已更新 User Command：", updated.name);
} else {
  const created = await discordFetch("POST", baseUrl, command);
  console.log("已建立 User Command：", created.name);
}

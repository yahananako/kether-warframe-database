import fs from "node:fs";

const text = fs.readFileSync(".env.local", "utf8");

function get(key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const token = get("DISCORD_BOT_TOKEN");
const guildId = get("DISCORD_GUILD_ID");

console.log("目前 DISCORD_GUILD_ID:", guildId);

const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
  headers: {
    Authorization: `Bot ${token}`,
  },
});

const data = await response.json();

if (!response.ok) {
  console.error(data);
  throw new Error(`讀取 Bot 群組失敗：${response.status}`);
}

console.log("Bot 目前加入的群組：");

for (const guild of data) {
  console.log(`- ${guild.name} / ${guild.id}`);
}

const found = data.some((guild) => guild.id === guildId);

console.log(found ? "✅ Bot 有在這個群組" : "❌ Bot 不在這個 DISCORD_GUILD_ID 對應的群組");

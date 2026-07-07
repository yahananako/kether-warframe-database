import fs from "node:fs";

const text = fs.readFileSync(".env.local", "utf8");

function get(key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const clientId = get("DISCORD_CLIENT_ID");
const guildId = get("DISCORD_GUILD_ID");
const token = get("DISCORD_BOT_TOKEN");

console.log("DISCORD_CLIENT_ID:", clientId, /^\d{17,20}$/.test(clientId) ? "✅ 純數字ID" : "❌ 格式不對");
console.log("DISCORD_GUILD_ID:", guildId, /^\d{17,20}$/.test(guildId) ? "✅ 純數字ID" : "❌ 格式不對");
console.log("DISCORD_BOT_TOKEN:", token ? `✅ 有，長度 ${token.length}` : "❌ 缺");

const res = await fetch("https://discord.com/api/v10/users/@me", {
  headers: {
    Authorization: `Bot ${token}`,
  },
});

const data = await res.json();

console.log("Bot API 狀態:", res.status);
console.log("Bot 名稱:", data.username ?? "讀不到");
console.log("Bot User ID:", data.id ?? "讀不到");
console.log("Client ID 是否等於 Bot User ID:", data.id === clientId ? "✅ 一致" : "❌ 不一致");

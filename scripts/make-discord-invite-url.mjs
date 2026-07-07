import fs from "node:fs";

const text = fs.readFileSync(".env.local", "utf8");

function get(key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const clientId =
  get("DISCORD_CLIENT_ID") ||
  get("DISCORD_APP_ID") ||
  get("DISCORD_APPLICATION_ID");

if (!clientId) {
  throw new Error("找不到 DISCORD_CLIENT_ID");
}

const params = new URLSearchParams({
  client_id: clientId,
  scope: "bot applications.commands",
  permissions: "8",
});

console.log("請打開這個網址重新邀請 Bot：");
console.log(`https://discord.com/oauth2/authorize?${params.toString()}`);

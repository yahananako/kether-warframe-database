import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { NextRequest } from "next/server";
import { getDiscordAccessPolicy } from "../lib/auth/discordAccess";
import { buildDiscordSessionPayload, createDiscordSessionCookieValue, DISCORD_SESSION_COOKIE_NAME } from "../lib/auth/discordSession";
import { GET as callback } from "../app/api/auth/discord/callback/route";
import { GET as permission } from "../app/api/auth/permission/route";
import { GET as sessionApi } from "../app/api/auth/session/route";
import { POST as bot } from "../app/api/discord/route";
import { proxy } from "../proxy";

async function main() {
  Object.assign(process.env, {
    DISCORD_GUILD_ID: "test-guild", DISCORD_ALLOWED_ROLE_IDS: "angel, existing",
    DISCORD_ALLIANCE_ROLE_IDS: "", DISCORD_BOT_TOKEN: "test-bot-token",
    SESSION_SECRET: "test-session-secret", DISCORD_CLIENT_ID: "test-client",
    DISCORD_CLIENT_SECRET: "test-client-secret", DISCORD_REDIRECT_URI: "https://kether.test/api/auth/discord/callback",
  });
  const originalFetch = globalThis.fetch;
  let memberRoles = ["alliance"];
  let roleFetches = 0;
  let roleApiFails = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/roles")) {
      roleFetches++;
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bot test-bot-token");
      if (roleApiFails) return Response.json({}, { status: 503 });
      return Response.json([{ id: "alliance", name: "聯盟成員" }, { id: "outsider", name: "聯盟成員見習" }]);
    }
    if (url.endsWith("/oauth2/token")) return Response.json({ access_token: "test-oauth-token" });
    if (url.endsWith("/users/@me")) return Response.json({ id: "test-member", username: "Member" });
    if (url.endsWith("/member")) return Response.json({ roles: memberRoles });
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const policy = await getDiscordAccessPolicy("test-guild");
    assert.deepEqual(policy.allowedRoleIds, ["angel", "existing", "alliance"]);
    assert.equal(policy.allianceRoleResolved, true);
    assert.equal(policy.allianceRoleSource, "discord");
    assert.equal(policy.roleCheckEnabled, true);
    await Promise.all([getDiscordAccessPolicy("test-guild"), getDiscordAccessPolicy("test-guild")]);
    assert.equal(roleFetches, 1, "role lookup should be cached");

    function request(path: string, roles: string[], guildId = "test-guild") {
      const payload = buildDiscordSessionPayload({ discordUser: { id: "test-member", username: "Member", globalName: null, avatar: null }, guildId, roleIds: roles });
      const cookie = createDiscordSessionCookieValue(payload, process.env.SESSION_SECRET!);
      return new NextRequest(`https://kether.test${path}`, { headers: { cookie: `${DISCORD_SESSION_COOKIE_NAME}=${cookie}` } });
    }
    for (const roles of [["alliance"], ["angel"], ["existing"]]) {
      assert.equal((await (await permission(request("/api/auth/permission", roles))).json()).authorized, true);
      for (const path of ["/database/warframes", "/profile"]) {
        assert.equal((await proxy(request(path, roles))).headers.get("x-middleware-next"), "1");
      }
    }
    for (const roles of [[], ["outsider"]]) {
      assert.equal((await (await permission(request("/api/auth/permission", roles))).json()).authorized, false);
      assert.equal((await (await sessionApi(request("/api/auth/session", roles))).json()).guildAccess.authorized, false);
      assert.equal(new URL((await proxy(request("/profile", roles))).headers.get("location")!).pathname, "/unauthorized");
    }
    assert.equal((await (await permission(request("/api/auth/permission", ["alliance"], "other-guild"))).json()).authorized, false);
    assert.equal(new URL((await proxy(request("/profile", ["alliance"], "other-guild"))).headers.get("location")!).pathname, "/unauthorized");
    assert.equal(new URL((await proxy(new NextRequest("https://kether.test/profile"))).headers.get("location")!).pathname, "/login");
    assert.equal((await (await permission(new NextRequest("https://kether.test/api/auth/permission", { headers: { cookie: `${DISCORD_SESSION_COOKIE_NAME}=tampered.invalid` } }))).json()).authorized, false);

    function oauthRequest() {
      return new NextRequest("https://kether.test/api/auth/discord/callback?code=test-code&state=test-state", {
        headers: { cookie: "kether_discord_oauth_state=test-state; kether_discord_oauth_next=/profile" },
      });
    }
    const login = await callback(oauthRequest());
    assert.equal(new URL(login.headers.get("location")!).pathname, "/profile");
    const cookie = login.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;
    assert.ok(cookie, "alliance login must issue a signed session for the APP");
    const appRequest = new NextRequest("https://kether.test/api/auth/session", { headers: { cookie: `${DISCORD_SESSION_COOKIE_NAME}=${cookie}` } });
    assert.equal((await (await sessionApi(appRequest)).json()).guildAccess.authorized, true);
    assert.equal((await (await permission(appRequest)).json()).authorized, true);
    memberRoles = ["outsider"];
    assert.equal((await callback(oauthRequest())).cookies.get(DISCORD_SESSION_COOKIE_NAME), undefined);

    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    process.env.DISCORD_PUBLIC_KEY = publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("hex");
    const interaction = JSON.stringify({ type: 2, guild_id: "test-guild", member: { roles: ["alliance"], user: { id: "test-member", username: "Member" } }, data: { name: "warframe-card" } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = sign(null, Buffer.from(timestamp + interaction), privateKey).toString("hex");
    const result = await bot(new Request("https://kether.test/api/discord", { method: "POST", body: interaction, headers: { "x-signature-timestamp": timestamp, "x-signature-ed25519": signature } }));
    assert.equal(result.status, 200);
    assert.equal((await result.json()).type, 4, "alliance member BOT command must respond");

    roleApiFails = true;
    const failedPolicy = await getDiscordAccessPolicy("failed-guild");
    assert.deepEqual(failedPolicy.allowedRoleIds, ["angel", "existing"]);
    assert.equal(failedPolicy.roleCheckEnabled, true);
    assert.equal(failedPolicy.allianceRoleResolved, false);
    process.env.DISCORD_ALLIANCE_ROLE_IDS = "alliance-id";
    const configuredAlliancePolicy = await getDiscordAccessPolicy("test-guild");
    assert.deepEqual(configuredAlliancePolicy.allowedRoleIds, ["angel", "existing", "alliance-id"]);
    assert.equal(configuredAlliancePolicy.allianceRoleSource, "configured");
    process.env.DISCORD_ALLOWED_ROLE_IDS = "";
    assert.equal(
      (await getDiscordAccessPolicy("test-guild")).roleCheckEnabled,
      true,
      "resolved alliance access must keep role checking enabled",
    );
    console.log("Discord access passed: alliance OAuth, website/APP/API gates, session revalidation, signed BOT command, existing members, rejected outsiders/wrong guild/invalid sessions, cached lookup and Discord outage.");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

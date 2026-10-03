import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { safeNextPath } from "../lib/auth/navigation";
import { GET as callback } from "../app/api/auth/discord/callback/route";
import { GET as login } from "../app/api/auth/discord/login/route";
import { DISCORD_SESSION_COOKIE_NAME } from "../lib/auth/discordSession";

async function main() {
  for (const path of ["//evil.test", "/\\evil.test", "/%5cevil.test", "/%2fevil.test", "/login", "/api/auth/logout", "/x/../login", "/%6cogin", "/unauthorized", "/\nevil.test", "/%00", "https://evil.test", "/" + "x".repeat(501)]) {
    assert.equal(safeNextPath(path), "/profile", path);
  }
  assert.equal(safeNextPath("/database/incarnon?type=primary#evolution"), "/database/incarnon?type=primary#evolution");
  Object.assign(process.env, {
    DISCORD_CLIENT_ID: "test-client", DISCORD_CLIENT_SECRET: "test-secret",
    DISCORD_REDIRECT_URI: "https://kether.test/api/auth/discord/callback",
    DISCORD_GUILD_ID: "guild", SESSION_SECRET: "test-session",
    DISCORD_ALLOWED_ROLE_IDS: "member", DISCORD_ALLIANCE_ROLE_IDS: "alliance",
  });
  let scenario = "success";
  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls++;
    assert.ok(init?.signal, "Discord requests must have a deadline");
    if (scenario === "network") throw new TypeError("Failed to fetch");
    if (scenario === "timeout") throw new DOMException("Timed out", "TimeoutError");
    if (scenario === "malformed") return new Response("not json");
    const url = String(input);
    if (url.endsWith("/token")) return scenario === "token" ? Response.json({}, { status: 400 }) : Response.json({ access_token: "test-token" });
    if (url.endsWith("/users/@me")) return scenario === "profile" ? Response.json({}, { status: 503 }) : Response.json({ id: "user", username: "test" });
    if (url.endsWith("/member")) return scenario === "membership" ? Response.json({}, { status: 404 }) : Response.json({ roles: [scenario === "role" ? "outsider" : "member"] });
    throw new Error(`Unexpected URL: ${url}`);
  };
  function request(query = "code=code&state=state", next = "/database/incarnon") {
    return new NextRequest(`https://kether.test/api/auth/discord/callback?${query}`, { headers: { cookie: `kether_discord_oauth_state=state; kether_discord_oauth_next=${next}` } });
  }
  function failure(response: Awaited<ReturnType<typeof callback>>, reason: string) {
    assert.equal(response.status, 307);
    const target = new URL(response.headers.get("location")!);
    assert.equal(target.origin, "https://kether.test");
    assert.equal(target.pathname, "/login");
    assert.equal(target.searchParams.get("error"), reason);
    assert.equal(target.searchParams.get("next"), "/database/incarnon");
    assert.equal(response.cookies.get("kether_discord_oauth_state")?.value, "");
    assert.equal(response.cookies.get("kether_discord_oauth_next")?.value, "");
    assert.equal(response.cookies.get(DISCORD_SESSION_COOKIE_NAME), undefined);
  }
  try {
    failure(await callback(request("error=access_denied&state=state")), "cancelled");
    failure(await callback(request("code=code&state=wrong")), "expired");
    failure(await callback(request("state=state")), "expired");
    assert.equal(calls, 0, "invalid callbacks must not call Discord");
    for (const reason of ["token", "profile", "membership", "role", "network", "timeout", "malformed"]) {
      scenario = reason;
      failure(await callback(request()), ["network", "timeout", "malformed"].includes(reason) ? "unavailable" : reason);
    }
    scenario = "success";
    const success = await callback(request());
    assert.equal(new URL(success.headers.get("location")!).pathname, "/database/incarnon");
    assert.ok(success.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value);
    const unsafe = await callback(request("code=code&state=state", "/\\evil.test"));
    assert.equal(unsafe.headers.get("location"), "https://kether.test/profile");
    delete process.env.DISCORD_CLIENT_SECRET;
    failure(await callback(request()), "configuration");
    delete process.env.DISCORD_CLIENT_ID;
    const missing = await login(new NextRequest("https://kether.test/api/auth/discord/login?next=/story"));
    assert.equal(new URL(missing.headers.get("location")!).searchParams.get("error"), "configuration");
    process.env.DISCORD_CLIENT_ID = "test-client";
    process.env.DISCORD_REDIRECT_URI = "invalid";
    assert.equal(new URL((await login(new NextRequest("https://kether.test/api/auth/discord/login"))).headers.get("location")!).pathname, "/login");
    console.log("Auth recovery passed: cancellation, state rejection, token/profile/member/role failures, timeout/network/malformed responses, cookies, success, configuration and safe return paths.");
  } finally { globalThis.fetch = originalFetch; }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

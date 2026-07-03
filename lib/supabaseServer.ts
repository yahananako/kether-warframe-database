const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const KETHER_GUILD_ID = "1033399126936789023";
export const TEST_DISCORD_USER_ID = "kether-test-user";
export const TEST_DISCORD_USERNAME = "KETHER Test User";

export function hasServiceRoleKey() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
}

async function readExistingUser() {
  const response = await supabaseAdminFetch(
    `users?select=*&discord_user_id=eq.${TEST_DISCORD_USER_ID}&limit=1`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Read test user failed: HTTP ${response.status} ${text}`);
  }

  const users = await response.json();
  return users?.[0] ?? null;
}

export async function ensureTestUser() {
  const existing = await readExistingUser();

  if (existing) {
    return existing;
  }

  const response = await supabaseAdminFetch("users", {
    method: "POST",
    body: JSON.stringify({
      discord_user_id: TEST_DISCORD_USER_ID,
      discord_username: TEST_DISCORD_USERNAME,
      avatar_url: null
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Create test user failed: HTTP ${response.status} ${text}`);
  }

  const users = await response.json();
  return users[0];
}

export async function getKetherGuild() {
  const response = await supabaseAdminFetch(
    `guilds?select=id,discord_guild_id,guild_name,subscription_status&discord_guild_id=eq.${KETHER_GUILD_ID}&limit=1`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Read guild failed: HTTP ${response.status} ${text}`);
  }

  const guilds = await response.json();

  if (!guilds?.[0]) {
    throw new Error("KETHER guild not found in Supabase");
  }

  return guilds[0];
}

async function readExistingOwnedItem(userId: string, guildId: string, itemKey: string) {
  const response = await supabaseAdminFetch(
    `user_owned_items?select=*&user_id=eq.${userId}&guild_id=eq.${guildId}&item_key=eq.${encodeURIComponent(itemKey)}&limit=1`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Read owned item failed: HTTP ${response.status} ${text}`);
  }

  const items = await response.json();
  return items?.[0] ?? null;
}

export async function upsertOwnedItem(input: {
  itemKey: string;
  category: string;
  section: string;
  owned: boolean;
}) {
  const user = await ensureTestUser();
  const guild = await getKetherGuild();
  const existing = await readExistingOwnedItem(user.id, guild.id, input.itemKey);

  const payload = {
    user_id: user.id,
    guild_id: guild.id,
    item_key: input.itemKey,
    category: input.category,
    section: input.section,
    owned: input.owned,
    updated_at: new Date().toISOString()
  };

  const response = existing
    ? await supabaseAdminFetch(`user_owned_items?id=eq.${existing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
    : await supabaseAdminFetch("user_owned_items", {
        method: "POST",
        body: JSON.stringify(payload)
      });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Save owned item failed: HTTP ${response.status} ${text}`);
  }

  const rows = await response.json();

  return {
    user,
    guild,
    item: rows[0]
  };
}

export async function listOwnedItems() {
  const user = await ensureTestUser();
  const guild = await getKetherGuild();

  const response = await supabaseAdminFetch(
    `user_owned_items?select=*&user_id=eq.${user.id}&guild_id=eq.${guild.id}&order=updated_at.desc`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`List owned items failed: HTTP ${response.status} ${text}`);
  }

  const items = await response.json();

  return {
    user,
    guild,
    items
  };
}

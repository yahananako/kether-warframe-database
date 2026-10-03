export const ALLIANCE_MEMBER_ROLE_NAME = "聯盟成員";

type AllianceRoles = { ids: string[]; resolved: boolean };
let roleCache: { guildId: string; token: string; expiresAt: number; result: Promise<AllianceRoles> } | null = null;

function parseIds(value: string | undefined) {
  return (value ?? "").split(",").map((id) => id.trim()).filter(Boolean);
}

async function resolveAllianceRoles(guildId: string): Promise<AllianceRoles> {
  const configuredIds = parseIds(process.env.DISCORD_ALLIANCE_ROLE_IDS);
  if (configuredIds.length) return { ids: configuredIds, resolved: true };
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!guildId || !token) return { ids: [], resolved: false };
  if (roleCache?.guildId === guildId && roleCache.token === token && roleCache.expiresAt > Date.now()) {
    return roleCache.result;
  }

  const entry = {
    guildId,
    token,
    expiresAt: Date.now() + 5 * 60 * 1000,
    result: Promise.resolve({ ids: [], resolved: false } as AllianceRoles),
  };
  entry.result = (async () => {
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/roles`, {
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error("Unable to resolve alliance role");
      const roles: unknown = await response.json();
      if (!Array.isArray(roles)) throw new Error("Invalid Discord role list");
      const ids = roles.filter((role) => role?.name === ALLIANCE_MEMBER_ROLE_NAME && typeof role.id === "string")
        .map((role) => role.id);
      return { ids, resolved: ids.length > 0 };
    } catch {
      // A Discord failure must never grant access or remove existing allowed roles.
      entry.expiresAt = Date.now() + 30 * 1000;
      return { ids: [], resolved: false };
    }
  })();
  roleCache = entry;
  return entry.result;
}

export async function getDiscordAccessPolicy(guildId: string) {
  const existingIds = parseIds(process.env.DISCORD_ALLOWED_ROLE_IDS);
  const alliance = await resolveAllianceRoles(guildId);
  return {
    allowedRoleIds: Array.from(new Set([...existingIds, ...alliance.ids])),
    // Preserve the existing optional role-check setting.
    roleCheckEnabled: existingIds.length > 0,
    allianceRoleName: ALLIANCE_MEMBER_ROLE_NAME,
    allianceRoleResolved: alliance.resolved,
  };
}

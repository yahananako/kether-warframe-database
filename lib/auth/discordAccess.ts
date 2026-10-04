export const ALLIANCE_MEMBER_ROLE_NAME = "聯盟成員";

export type AllianceRoleSource =
  | "configured"
  | "discord"
  | "stale"
  | "unavailable";

type AllianceRoles = {
  ids: string[];
  resolved: boolean;
  source: AllianceRoleSource;
};

let roleCache: {
  guildId: string;
  token: string;
  expiresAt: number;
  result: Promise<AllianceRoles>;
} | null = null;

let lastResolvedRole: { guildId: string; ids: string[] } | null = null;

function parseIds(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isAllianceRoleCheckRequested(guildId: string) {
  const configuredIds = parseIds(process.env.DISCORD_ALLIANCE_ROLE_IDS);
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  return configuredIds.length > 0 || Boolean(guildId && token);
}

async function resolveAllianceRoles(guildId: string): Promise<AllianceRoles> {
  const configuredIds = parseIds(process.env.DISCORD_ALLIANCE_ROLE_IDS);

  if (configuredIds.length) {
    return { ids: configuredIds, resolved: true, source: "configured" };
  }

  const token = process.env.DISCORD_BOT_TOKEN?.trim();

  if (!guildId || !token) {
    return { ids: [], resolved: false, source: "unavailable" };
  }

  if (
    roleCache?.guildId === guildId &&
    roleCache.token === token &&
    roleCache.expiresAt > Date.now()
  ) {
    return roleCache.result;
  }

  const entry = {
    guildId,
    token,
    expiresAt: Date.now() + 5 * 60 * 1000,
    result: Promise.resolve({
      ids: [],
      resolved: false,
      source: "unavailable",
    } as AllianceRoles),
  };

  entry.result = (async () => {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/roles`,
        {
          headers: { Authorization: `Bot ${token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to resolve alliance role");
      }

      const roles: unknown = await response.json();

      if (!Array.isArray(roles)) {
        throw new Error("Invalid Discord role list");
      }

      const ids = roles
        .filter(
          (role) =>
            role?.name === ALLIANCE_MEMBER_ROLE_NAME &&
            typeof role.id === "string",
        )
        .map((role) => role.id);

      if (ids.length > 0) {
        lastResolvedRole = { guildId, ids };
      } else if (lastResolvedRole?.guildId === guildId) {
        lastResolvedRole = null;
      }

      return {
        ids,
        resolved: ids.length > 0,
        source: "discord" as const,
      };
    } catch {
      entry.expiresAt = Date.now() + 30 * 1000;

      if (lastResolvedRole?.guildId === guildId) {
        return {
          ids: lastResolvedRole.ids,
          resolved: true,
          source: "stale" as const,
        };
      }

      return {
        ids: [],
        resolved: false,
        source: "unavailable" as const,
      };
    }
  })();

  roleCache = entry;
  return entry.result;
}

export async function getDiscordAccessPolicy(guildId: string) {
  const existingIds = parseIds(process.env.DISCORD_ALLOWED_ROLE_IDS);
  const alliance = await resolveAllianceRoles(guildId);
  const allianceRoleCheckRequested = isAllianceRoleCheckRequested(guildId);

  return {
    allowedRoleIds: Array.from(new Set([...existingIds, ...alliance.ids])),
    roleCheckEnabled: existingIds.length > 0 || allianceRoleCheckRequested,
    allianceRoleName: ALLIANCE_MEMBER_ROLE_NAME,
    allianceRoleResolved: alliance.resolved,
    allianceRoleSource: alliance.source,
    allianceRoleCheckRequested,
  };
}

export async function evaluateDiscordAccess(
  expectedGuildId: string,
  sessionGuildId: string,
  roleIds: string[],
) {
  const policy = await getDiscordAccessPolicy(expectedGuildId);
  const guildIdMatches =
    Boolean(expectedGuildId) && sessionGuildId === expectedGuildId;
  const matchedRoleIds = policy.roleCheckEnabled
    ? roleIds.filter((roleId) => policy.allowedRoleIds.includes(roleId))
    : [];
  const hasAllowedRole =
    !policy.roleCheckEnabled || matchedRoleIds.length > 0;

  return {
    ...policy,
    guildIdMatches,
    matchedRoleIds,
    hasAllowedRole,
    authorized: guildIdMatches && hasAllowedRole,
  };
}

import type { NextRequest } from "next/server";

import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "./auth/discordSession";
import { getNeonSql } from "./neonServer";

export const KETHER_CLAN_SLUG = "kether-of-paradiso";

type ClanGroupRow = {
  id: string;
  slug: string;
  name: string;
  discord_guild_id: string;
  announcement_visibility: "public" | "members";
  is_active: boolean;
};

type ClanAdminRoleRow = {
  discord_role_id: string;
  role_name: string | null;
};

export class ClanAccessError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ClanAccessError";
    this.status = status;
  }
}

export async function getClanAccess(
  request: NextRequest,
  options: {
    slug?: string;
    requireAdmin?: boolean;
  } = {}
) {
  const slug = options.slug || KETHER_CLAN_SLUG;
  const requireAdmin = options.requireAdmin === true;
  const sql = getNeonSql();

  const groupRows = await sql`
    SELECT
      id,
      slug,
      name,
      discord_guild_id,
      announcement_visibility,
      is_active
    FROM clan_groups
    WHERE slug = ${slug}
      AND is_active = TRUE
    LIMIT 1
  `;

  const group = groupRows[0] as ClanGroupRow | undefined;

  if (!group) {
    throw new ClanAccessError("找不到啟用中的氏族資料。", 404);
  }

  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new ClanAccessError("缺少 SESSION_SECRET。", 500);
  }

  const sessionCookie =
    request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value || null;

  const session = sessionCookie
    ? verifyDiscordSessionCookieValue(sessionCookie, sessionSecret)
    : null;

  const guestCanRead =
    !requireAdmin && group.announcement_visibility === "public";

  if (!session && !guestCanRead) {
    throw new ClanAccessError("請先使用 Discord 登入。", 401);
  }

  if (session && session.guildId !== group.discord_guild_id) {
    throw new ClanAccessError("Discord 群組身分不符合此氏族。", 403);
  }

  const roleRows = (await sql`
    SELECT
      discord_role_id,
      role_name
    FROM clan_admin_roles
    WHERE group_id = ${group.id}
  `) as ClanAdminRoleRow[];

  const adminRoleIds = roleRows.map((role) => role.discord_role_id);

  const matchedAdminRoles = session
    ? roleRows.filter((role) =>
        session.roleIds.includes(role.discord_role_id)
      )
    : [];

  const canManage = matchedAdminRoles.length > 0;

  if (requireAdmin && !canManage) {
    throw new ClanAccessError("你沒有氏族公告管理權限。", 403);
  }

  return {
    sql,
    group,
    session,
    canManage,
    adminRoleIds,
    matchedAdminRoles
  };
}

import type { NextRequest } from "next/server";

import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue,
} from "./auth/discordSession";
import { getNeonSql } from "./neonServer";

export type KetherAdminLevel = "super_admin" | "admin";

export class VisualAdminAccessError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "VisualAdminAccessError";
    this.status = status;
  }
}

function parseIdList(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function requireVisualAdmin(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new VisualAdminAccessError("缺少 SESSION_SECRET。", 500);
  }

  const cookieValue =
    request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value || null;

  if (!cookieValue) {
    throw new VisualAdminAccessError("請先使用 Discord 登入。", 401);
  }

  const session = verifyDiscordSessionCookieValue(cookieValue, sessionSecret);

  if (!session) {
    throw new VisualAdminAccessError("Discord 登入已失效，請重新登入。", 401);
  }

  const expectedGuildId = process.env.DISCORD_GUILD_ID?.trim();

  if (expectedGuildId && session.guildId !== expectedGuildId) {
    throw new VisualAdminAccessError("Discord 群組身分不符合 KETHER。", 403);
  }

  const superAdminUserIds = parseIdList(
    process.env.KETHER_SUPER_ADMIN_USER_IDS ||
      process.env.KETHER_ADMIN_USER_IDS,
  );

  if (superAdminUserIds.includes(session.sub)) {
    return {
      sql: getNeonSql(),
      session,
      level: "super_admin" as const,
      isSuperAdmin: true,
    };
  }

  const explicitRoleIds = parseIdList(process.env.KETHER_ADMIN_ROLE_IDS);
  let allowed = session.roleIds.some((roleId) =>
    explicitRoleIds.includes(roleId),
  );

  const sql = getNeonSql();

  if (!allowed) {
    const rows = (await sql`
      SELECT car.discord_role_id
      FROM clan_admin_roles AS car
      INNER JOIN clan_groups AS cg ON cg.id = car.group_id
      WHERE cg.slug = 'kether-of-paradiso'
        AND cg.is_active = TRUE
    `) as Array<{ discord_role_id: string }>;

    allowed = rows.some((row) =>
      session.roleIds.includes(row.discord_role_id),
    );
  }

  if (!allowed) {
    throw new VisualAdminAccessError("你沒有 KETHER 管理後台權限。", 403);
  }

  return {
    sql,
    session,
    level: "admin" as const,
    isSuperAdmin: false,
  };
}

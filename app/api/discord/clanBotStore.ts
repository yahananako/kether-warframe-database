import { getNeonSql } from "../../../lib/neonServer";

export type GiveawayRow = {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string | null;
  prize: string;
  winner_count: number;
  status: "active" | "ended" | "cancelled";
  created_by: string;
  created_at: string;
  ended_at: string | null;
  winners: string[];
};

export type GiveawayEntryRow = {
  user_id: string;
  display_name: string;
  joined_at: string;
};

export type VerificationConflict = {
  kind: "player_id" | "screenshot";
};

let schemaPromise: Promise<void> | null = null;

async function createClanBotSchema() {
  const sql = getNeonSql();

  await sql`
    CREATE TABLE IF NOT EXISTS discord_clan_verifications (
      id BIGSERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      discord_user_id TEXT NOT NULL,
      discord_username TEXT NOT NULL,
      player_id TEXT NOT NULL,
      clan_name TEXT,
      mastery_rank TEXT,
      screenshot_attachment_id TEXT,
      status TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS discord_clan_verifications_member_idx
      ON discord_clan_verifications (guild_id, discord_user_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS discord_giveaways (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT,
      prize TEXT NOT NULL,
      winner_count INTEGER NOT NULL CHECK (winner_count BETWEEN 1 AND 10),
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      winners JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS discord_giveaways_one_active_per_channel_idx
      ON discord_giveaways (guild_id, channel_id)
      WHERE status = 'active'
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS discord_giveaway_entries (
      giveaway_id TEXT NOT NULL REFERENCES discord_giveaways(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (giveaway_id, user_id)
    )
  `;
}

export function ensureClanBotSchema() {
  if (!schemaPromise) {
    schemaPromise = createClanBotSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  return schemaPromise;
}

export async function saveVerificationAttempt(input: {
  guildId: string;
  discordUserId: string;
  discordUsername: string;
  playerId: string;
  clanName?: string | null;
  masteryRank?: string | null;
  screenshotAttachmentId?: string | null;
  status: "verified" | "rejected" | "error";
  reason: string;
  evidence: Record<string, unknown>;
}) {
  await ensureClanBotSchema();
  const sql = getNeonSql();
  const evidence = JSON.stringify(input.evidence);
  const verifiedAt = input.status === "verified" ? new Date().toISOString() : null;

  await sql`
    INSERT INTO discord_clan_verifications (
      guild_id,
      discord_user_id,
      discord_username,
      player_id,
      clan_name,
      mastery_rank,
      screenshot_attachment_id,
      status,
      reason,
      evidence,
      verified_at
    )
    VALUES (
      ${input.guildId},
      ${input.discordUserId},
      ${input.discordUsername},
      ${input.playerId},
      ${input.clanName ?? null},
      ${input.masteryRank ?? null},
      ${input.screenshotAttachmentId ?? null},
      ${input.status},
      ${input.reason},
      ${evidence}::jsonb,
      ${verifiedAt}
    )
  `;
}

export async function findVerifiedIdentityConflict(input: {
  guildId: string;
  discordUserId: string;
  playerId: string;
  normalizedPlayerId: string;
  screenshotSha256: string;
}) {
  await ensureClanBotSchema();
  const sql = getNeonSql();
  const rows = await sql`
    SELECT
      CASE
        WHEN LOWER(player_id) = LOWER(${input.playerId})
          OR evidence ->> 'playerIdNormalized' = ${input.normalizedPlayerId}
        THEN 'player_id'
        ELSE 'screenshot'
      END AS kind
    FROM discord_clan_verifications
    WHERE guild_id = ${input.guildId}
      AND discord_user_id <> ${input.discordUserId}
      AND status = 'verified'
      AND (
        LOWER(player_id) = LOWER(${input.playerId})
        OR evidence ->> 'playerIdNormalized' = ${input.normalizedPlayerId}
        OR evidence ->> 'screenshotSha256' = ${input.screenshotSha256}
      )
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return (rows[0] as VerificationConflict | undefined) ?? null;
}

export async function createGiveaway(input: {
  id: string;
  guildId: string;
  channelId: string;
  prize: string;
  winnerCount: number;
  createdBy: string;
}) {
  await ensureClanBotSchema();
  const sql = getNeonSql();

  const rows = await sql`
    INSERT INTO discord_giveaways (
      id,
      guild_id,
      channel_id,
      prize,
      winner_count,
      created_by
    )
    VALUES (
      ${input.id},
      ${input.guildId},
      ${input.channelId},
      ${input.prize},
      ${input.winnerCount},
      ${input.createdBy}
    )
    RETURNING *
  `;

  return rows[0] as GiveawayRow;
}

export async function attachGiveawayMessage(id: string, messageId: string) {
  const sql = getNeonSql();

  await sql`
    UPDATE discord_giveaways
    SET message_id = ${messageId}
    WHERE id = ${id}
  `;
}

export async function cancelGiveaway(id: string) {
  const sql = getNeonSql();

  await sql`
    UPDATE discord_giveaways
    SET status = 'cancelled', ended_at = NOW()
    WHERE id = ${id} AND status = 'active'
  `;
}

export async function findGiveaway(input: {
  guildId: string;
  channelId: string;
  giveawayId?: string | null;
  status?: "active" | "ended";
}) {
  await ensureClanBotSchema();
  const sql = getNeonSql();
  const status = input.status ?? "active";
  const giveawayId = input.giveawayId?.trim() || null;

  const rows = giveawayId
    ? await sql`
        SELECT *
        FROM discord_giveaways
        WHERE id = ${giveawayId}
          AND guild_id = ${input.guildId}
          AND status = ${status}
        LIMIT 1
      `
    : await sql`
        SELECT *
        FROM discord_giveaways
        WHERE guild_id = ${input.guildId}
          AND channel_id = ${input.channelId}
          AND status = ${status}
        ORDER BY created_at DESC
        LIMIT 1
      `;

  return (rows[0] as GiveawayRow | undefined) ?? null;
}

export async function findGiveawayById(id: string, guildId: string) {
  await ensureClanBotSchema();
  const sql = getNeonSql();
  const rows = await sql`
    SELECT *
    FROM discord_giveaways
    WHERE id = ${id} AND guild_id = ${guildId}
    LIMIT 1
  `;

  return (rows[0] as GiveawayRow | undefined) ?? null;
}

export async function addGiveawayEntry(input: {
  giveawayId: string;
  userId: string;
  displayName: string;
}) {
  const sql = getNeonSql();
  const inserted = await sql`
    INSERT INTO discord_giveaway_entries (
      giveaway_id,
      user_id,
      display_name
    )
    SELECT
      ${input.giveawayId},
      ${input.userId},
      ${input.displayName}
    FROM discord_giveaways
    WHERE id = ${input.giveawayId}
      AND status = 'active'
    ON CONFLICT (giveaway_id, user_id) DO NOTHING
    RETURNING user_id
  `;

  const stateRows = await sql`
    SELECT
      status,
      (
        SELECT COUNT(*)::int
        FROM discord_giveaway_entries
        WHERE giveaway_id = ${input.giveawayId}
      ) AS count
    FROM discord_giveaways
    WHERE id = ${input.giveawayId}
  `;

  return {
    joined: inserted.length > 0,
    count: Number(stateRows[0]?.count ?? 0),
    active: stateRows[0]?.status === "active",
  };
}

export async function listGiveawayEntries(giveawayId: string) {
  const sql = getNeonSql();
  const rows = await sql`
    SELECT user_id, display_name, joined_at
    FROM discord_giveaway_entries
    WHERE giveaway_id = ${giveawayId}
    ORDER BY joined_at ASC
  `;

  return rows as GiveawayEntryRow[];
}

export async function finishGiveaway(id: string, winners: string[]) {
  const sql = getNeonSql();
  const winnerJson = JSON.stringify(winners);
  const rows = await sql`
    UPDATE discord_giveaways
    SET
      status = 'ended',
      winners = ${winnerJson}::jsonb,
      ended_at = NOW()
    WHERE id = ${id} AND status = 'active'
    RETURNING *
  `;

  return (rows[0] as GiveawayRow | undefined) ?? null;
}

export async function replaceGiveawayWinners(id: string, winners: string[]) {
  const sql = getNeonSql();
  const winnerJson = JSON.stringify(winners);
  const rows = await sql`
    UPDATE discord_giveaways
    SET winners = ${winnerJson}::jsonb, ended_at = NOW()
    WHERE id = ${id} AND status = 'ended'
    RETURNING *
  `;

  return (rows[0] as GiveawayRow | undefined) ?? null;
}

import { getNeonSql } from "./neonServer";
import type { NewsStore } from "./clanNews";

let schemaPromise: Promise<void> | null = null;
async function ensureSchema() {
  if (!schemaPromise) schemaPromise = (async () => {
    const sql = getNeonSql();
    await sql`CREATE TABLE IF NOT EXISTS discord_clan_news_deliveries (
      bulletin_date TEXT NOT NULL, channel_id TEXT NOT NULL, payload_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('sending', 'sent', 'failed', 'unknown')),
      message_id TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (bulletin_date, channel_id)
    )`;
  })().catch((error) => { schemaPromise = null; throw error; });
  await schemaPromise;
}
export const clanNewsStore: NewsStore = {
  async claim(date, channelId, hash) {
    await ensureSchema();
    const sql = getNeonSql();
    const rows = await sql`INSERT INTO discord_clan_news_deliveries (bulletin_date, channel_id, payload_hash, status)
      VALUES (${date}, ${channelId}, ${hash}, 'sending')
      ON CONFLICT (bulletin_date, channel_id) DO UPDATE SET
        status = 'sending', payload_hash = EXCLUDED.payload_hash, updated_at = NOW()
      WHERE discord_clan_news_deliveries.status = 'failed'
      RETURNING bulletin_date`;
    return rows.length === 1;
  },
  async get(date, channelId) {
    await ensureSchema();
    const sql = getNeonSql();
    const rows = await sql`SELECT status, message_id FROM discord_clan_news_deliveries
      WHERE bulletin_date = ${date} AND channel_id = ${channelId}`;
    return rows[0] ? { status: rows[0].status, messageId: rows[0].message_id ?? undefined } : null;
  },
  async finish(date, channelId, status, messageId) {
    const sql = getNeonSql();
    await sql`UPDATE discord_clan_news_deliveries SET status = ${status}, message_id = ${messageId ?? null}, updated_at = NOW()
      WHERE bulletin_date = ${date} AND channel_id = ${channelId} AND status = 'sending'`;
  },
};

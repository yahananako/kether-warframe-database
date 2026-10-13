import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { taipeiDate, CLAN_NEWS_CHANNEL_ID } from '../lib/clanNews.ts';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('/clanNewsStore')) return { url: 'data:text/javascript,' + encodeURIComponent('export const clanNewsStore = {claim:(...args)=>globalThis.newsMock.store.claim(...args),get:(...args)=>globalThis.newsMock.store.get(...args),finish:(...args)=>globalThis.newsMock.store.finish(...args)};'), shortCircuit: true };
    if (specifier.endsWith('/discordApi')) return { url: 'data:text/javascript,' + encodeURIComponent('export async function discordBotFetch(...args){return globalThis.newsMock.bot(...args)}'), shortCircuit: true };
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return nextResolve(specifier + '.ts', context);
    return nextResolve(specifier, context);
  },
});
const { GET } = await import('../app/api/discord/clan-news/route.ts');
const secret = 'test-only-secret-abcdefghijklmnop';
const guildId = '123456789012345678';
function setup({ enabled = false, deployment = 'production', stale = false } = {}) {
  process.env.CRON_SECRET = secret;
  process.env.DISCORD_GUILD_ID = guildId;
  process.env.KETHER_CLAN_NEWS_ENABLED = String(enabled);
  process.env.VERCEL_ENV = deployment;
  let fetches = 0, posts = 0, row = null;
  globalThis.newsMock = {
    store: {
      async claim() { if (row) return false; row = { status: 'sending' }; return true; },
      async get() { return row; },
      async finish(_date, _channel, status, messageId) { row = { status, messageId }; },
    },
    async bot(path, init) {
      if (path === '/users/@me') return { id: '223456789012345678', bot: true };
      if (path.endsWith('/messages')) { assert.equal(init.method, 'POST'); posts++; return { id: '323456789012345678', channel_id: CLAN_NEWS_CHANNEL_ID }; }
      return { id: CLAN_NEWS_CHANNEL_ID, type: 0, guild_id: guildId, name: '氏族新聞' };
    },
  };
  globalThis.fetch = async (url, init) => {
    fetches++; assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
    return Response.json({ date: stale ? '2020-01-01' : taipeiDate(), articles: [] });
  };
  return { fetches: () => fetches, posts: () => posts };
}
const request = (action, token = secret) => new Request(`https://example.vercel.app/api/discord/clan-news${action ? `?action=${action}` : ''}`, { headers: { authorization: `Bearer ${token}` } });

test('unauthorized request performs no fetch or send', async () => { const f = setup(); const r = await GET(request('', 'wrong')); assert.equal(r.status, 401); assert.equal(f.fetches(), 0); assert.equal(f.posts(), 0); });
test('missing CRON_SECRET fails closed', async () => { const f = setup(); delete process.env.CRON_SECRET; assert.equal((await GET(request('status'))).status, 401); assert.equal(f.posts(), 0); });
test('disabled production cron never fetches or sends', async () => { const f = setup(); const r = await GET(request()); assert.equal((await r.json()).reason, 'publication-disabled'); assert.equal(f.fetches(), 0); assert.equal(f.posts(), 0); });
test('preview deployment cannot publish even with enabled flag', async () => { const f = setup({ enabled: true, deployment: 'preview' }); const r = await GET(request()); assert.equal((await r.json()).published, false); assert.equal(f.posts(), 0); });
test('authenticated preview renders bulletin without send', async () => { const f = setup(); const r = await GET(request('preview')); assert.equal(r.status, 200); const b = await r.json(); assert.equal(b.bulletin.date, taipeiDate()); assert.deepEqual(b.message.allowed_mentions.parse, []); assert.equal(f.posts(), 0); });
test('authenticated status resolves the selected guild channel', async () => { const f = setup(); const r = await GET(request('status')); const s = await r.json(); assert.equal(s.channelId, CLAN_NEWS_CHANNEL_ID); assert.equal(s.guildId, guildId); assert.equal(f.fetches(), 0); assert.equal(f.posts(), 0); });
test('invalid action cannot publish', async () => { const f = setup({ enabled: true }); assert.equal((await GET(request('invalid'))).status, 400); assert.equal(f.posts(), 0); });
test('fresh authenticated production bulletin posts once across cron repeats', async () => { const f = setup({ enabled: true }); const first = await (await GET(request())).json(); const second = await (await GET(request())).json(); assert.equal(first.published, true); assert.equal(second.reason, 'already-published'); assert.equal(f.posts(), 1); });
test('stale editorial file cannot be sent as todays news', async () => { const f = setup({ enabled: true, stale: true }); const r = await GET(request()); assert.equal(r.status, 502); assert.equal((await r.json()).published, false); assert.equal(f.posts(), 0); });

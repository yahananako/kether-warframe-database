import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { return next(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? specifier + '.ts' : specifier, context); } });
const { readNewsDelivery, refreshNewsMarket, MARKET_TITLE } = await import('../lib/clanNewsDelivery.ts');
const { CLAN_NEWS_CHANNEL_ID } = await import('../lib/clanNews.ts');
const now = new Date('2026-10-16T02:00:00Z');
const botId = '223456789012345678', guildId = '123456789012345678', messageId = '323456789012345678';
const bulletin = { date: '2026-10-16', articles: [], market: { status: 'verified', date: '2026-10-16', updatedCount: 341, totalPlatinum: 6482, previousTotalPlatinum: 6480, unpriced: ['Primed Vigor'] } };
function fixture(options = {}) {
  let message = { id: messageId, channel_id: CLAN_NEWS_CHANNEL_ID, author: { id: botId }, content: '📰 **Keter每日新聞**\n2026/10/16\n原新聞', embeds: [{ title: '正常新聞', description: '保留原新聞', image: { url: 'https://www-static.warframe.com/news.png', proxy_url: 'generated' } }], ...options.message };
  let patches = 0, reads = 0;
  const deps = {
    now, guildId,
    store: { async get() { return options.delivery ?? { status: 'sent', messageId }; } },
    async bot(path, init) {
      if (path === '/users/@me') return { id: botId, bot: true };
      if (path === `/channels/${CLAN_NEWS_CHANNEL_ID}`) return { id: CLAN_NEWS_CHANNEL_ID, guild_id: guildId, type: 0 };
      assert.equal(path, `/channels/${CLAN_NEWS_CHANNEL_ID}/messages/${messageId}`);
      if (init?.method === 'PATCH') {
        patches++;
        const payload = JSON.parse(init.body);
        assert.deepEqual(payload.allowed_mentions, { parse: [] });
        assert.equal('content' in payload, false);
        assert.equal('proxy_url' in payload.embeds[0].image, false);
        if (!options.dropUpdate) message = { ...message, embeds: payload.embeds };
        return structuredClone(message);
      }
      reads++; return structuredClone(message);
    },
  };
  return { deps, patches: () => patches, reads: () => reads, message: () => message };
}
test('delivery reads the actual stored Discord message without writing', async () => {
  const f = fixture(); const r = await readNewsDelivery(f.deps);
  assert.equal(r.message.id, messageId); assert.equal(f.patches(), 0); assert.equal(f.reads(), 1);
});
test('legacy escaped newlines are recognized without rewriting original content', async () => {
  const content = '📰 **Keter每日新聞**\\n2026/10/16\\n原新聞';
  const f = fixture({ message: { content } });
  await refreshNewsMarket(bulletin, f.deps); assert.equal(f.message().content, content);
});
test('market is appended to the original news and independently read back', async () => {
  const f = fixture(); const r = await refreshNewsMarket(bulletin, f.deps);
  assert.equal(r.updated, true); assert.equal(r.verified, true); assert.equal(r.messageId, messageId);
  assert.match(r.marketEmbeds[0].description, /341.*6,482/);
  assert.match(r.marketEmbeds[0].description, /較前次：2/);
  assert.equal(f.message().embeds[0].title, '正常新聞'); assert.equal(f.patches(), 1); assert.equal(f.reads(), 2);
});
test('repeating market refresh replaces its section without duplicating news or prices', async () => {
  const f = fixture(); await refreshNewsMarket(bulletin, f.deps); await refreshNewsMarket(bulletin, f.deps);
  assert.equal(f.message().embeds.length, 2); assert.equal(f.message().embeds.filter(e => e.title === MARKET_TITLE).length, 1);
});
for (const [label, message] of Object.entries({ author: { author: { id: '999456789012345678' } }, channel: { channel_id: '999456789012345678' }, date: { content: '📰 **Keter每日新聞**\n2026/10/15' }, title: { content: 'Other message\n2026/10/16' } })) {
  test(`refuses to modify a message with wrong ${label}`, async () => {
    const f = fixture({ message }); await assert.rejects(refreshNewsMarket(bulletin, f.deps), /identity mismatch/); assert.equal(f.patches(), 0);
  });
}
test('unknown delivery never triggers a new send or edit', async () => {
  const f = fixture({ delivery: { status: 'unknown' } }); await assert.rejects(refreshNewsMarket(bulletin, f.deps), /No confirmed delivery/); assert.equal(f.patches(), 0);
});
test('unverified or stale prices cannot be patched', async () => {
  const f = fixture();
  await assert.rejects(refreshNewsMarket({ ...bulletin, market: { status: 'unavailable', date: bulletin.date } }, f.deps), /not verified/);
  await assert.rejects(refreshNewsMarket({ ...bulletin, date: '2026-10-15' }, f.deps), /today/); assert.equal(f.patches(), 0);
});
test('PATCH success without actual market readback is a failure', async () => {
  const f = fixture({ dropUpdate: true }); await assert.rejects(refreshNewsMarket(bulletin, f.deps), /readback mismatch/);
});

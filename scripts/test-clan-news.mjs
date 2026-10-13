import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBulletin, buildDiscordMessage, deliverBulletin, taipeiDate, CLAN_NEWS_CHANNEL_ID } from '../lib/clanNews.ts';

const now = new Date('2026-10-13T01:54:00Z');
const guildId = '123456789012345678';
const article = { title: 'Taubound 活動預告', publishedDate: '2026-10-08', summary: '官方公告期間為10月15日至11月17日，精確時刻未公布喵。', memberBenefit: '限時對話與獎勵可提前安排揪團喵。', nextStep: '開放後完成Eris任務喵。', sourceUrl: 'https://www.warframe.com/en/news/epoch-operation-taubound', imageUrl: 'https://www-static.warframe.com/uploads/thumbnails/d4940c6cab0ad90994427983cc628371_1600x900.jpg' };
const bulletin = () => ({ date: '2026-10-13', articles: [{ ...article }] });
function fixture(options = {}) {
  let row = null;
  let posts = 0;
  const store = {
    async claim() { if (row && row.status !== 'failed') return false; row = { status: 'sending' }; return true; },
    async get() { return row; },
    async finish(_date, _channel, status, messageId) { if (options.dbFailure && status === 'sent') throw new Error('DB unavailable'); row = { status, messageId }; },
  };
  async function bot(path, init) {
    if (path === '/users/@me') return { id: '223456789012345678', bot: options.notBot ? false : true };
    if (path === `/channels/${CLAN_NEWS_CHANNEL_ID}`) return { id: CLAN_NEWS_CHANNEL_ID, guild_id: options.wrongGuild ? '999456789012345678' : guildId, name: '新聞', type: options.channelType ?? 0 };
    assert.equal(path, `/channels/${CLAN_NEWS_CHANNEL_ID}/messages`);
    assert.equal(init.method, 'POST');
    const payload = JSON.parse(init.body);
    assert.deepEqual(payload.allowed_mentions.parse, []);
    assert.equal(payload.enforce_nonce, true);
    posts++;
    if (options.error) throw options.error;
    return { id: '323456789012345678', channel_id: options.wrongResponse ? '423456789012345678' : CLAN_NEWS_CHANNEL_ID };
  }
  return { deps: { now, guildId, bot, store }, posts: () => posts, row: () => row };
}

test('Taipei day boundary uses local date', () => assert.equal(taipeiDate(new Date('2026-10-12T16:01:00Z')), '2026-10-13'));
test('rejects stale bulletin', () => assert.throws(() => validateBulletin({ ...bulletin(), date: '2026-10-12' }, now)));
test('rejects impossible publication date', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [{ ...article, publishedDate: '2026-02-30' }] }, now)));
test('rejects future publication', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [{ ...article, publishedDate: '2026-10-14' }] }, now)));
test('rejects disguised external source', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [{ ...article, sourceUrl: 'https://www.warframe.com.evil.test/en/news/x' }] }, now)));
test('rejects official homepage as news source', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [{ ...article, sourceUrl: 'https://www.warframe.com/en/' }] }, now)));
test('rejects non-official image', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [{ ...article, imageUrl: 'https://evil.test/1.png' }] }, now)));
test('rejects duplicate English/Chinese article links', () => assert.throws(() => validateBulletin({ ...bulletin(), articles: [article, { ...article, sourceUrl: article.sourceUrl.replace('/en/', '/zh-hant/') }] }, now)));
test('only clan benefit field appears and mentions are disabled', () => {
  const msg = buildDiscordMessage(validateBulletin(bulletin(), now));
  assert.ok(msg.embeds[0].fields.some(x => x.name === '對氏族成員的幫助'));
  assert.equal(JSON.stringify(msg).includes('對小希的幫助'), false);
  assert.deepEqual(msg.allowed_mentions.parse, []);
  assert.ok(msg.nonce.length <= 25);
});
test('empty news day produces an honest daily message', () => {
  const msg = buildDiscordMessage(validateBulletin({ date: '2026-10-13', articles: [] }, now));
  assert.equal(msg.embeds.length, 0);
  assert.ok(msg.content.includes('今日無新增官方消息'));
});
test('enforces total embed limit', () => {
  const articles = Array.from({ length: 5 }, (_, n) => ({ ...article, title: '標'.repeat(150), summary: '摘'.repeat(700), memberBenefit: '益'.repeat(300), nextStep: '步'.repeat(200), sourceUrl: `https://www.warframe.com/en/news/news-${n}` }));
  assert.throws(() => buildDiscordMessage(validateBulletin({ date: '2026-10-13', articles }, now)));
});
test('no delivery occurs to a different guild', async () => { const f = fixture({ wrongGuild: true }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); assert.equal(f.posts(), 0); });
test('no delivery occurs to a DM/forum channel', async () => { const f = fixture({ channelType: 15 }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); assert.equal(f.posts(), 0); });
test('rejects non-bot identity', async () => { const f = fixture({ notBot: true }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); assert.equal(f.posts(), 0); });
test('repeated daily execution sends exactly once', async () => {
  const f = fixture(); const first = await deliverBulletin(bulletin(), f.deps); const second = await deliverBulletin(bulletin(), f.deps);
  assert.equal(first.published, true); assert.equal(second.reason, 'already-published'); assert.equal(f.posts(), 1); assert.equal(f.row().status, 'sent');
});
test('concurrent execution sends exactly once', async () => { const f = fixture(); await Promise.all([deliverBulletin(bulletin(), f.deps), deliverBulletin(bulletin(), f.deps)]); assert.equal(f.posts(), 1); });
test('timeout after possible acceptance blocks automatic retry', async () => {
  const f = fixture({ error: new Error('Network timeout') }); await assert.rejects(deliverBulletin(bulletin(), f.deps));
  assert.equal(f.row().status, 'unknown'); assert.equal((await deliverBulletin(bulletin(), f.deps)).reason, 'delivery-needs-reconciliation'); assert.equal(f.posts(), 1);
});
test('Discord 5xx also blocks ambiguous retry', async () => {
  const f = fixture({ error: Object.assign(new Error('server error'), { status: 503 }) }); await assert.rejects(deliverBulletin(bulletin(), f.deps));
  await deliverBulletin(bulletin(), f.deps); assert.equal(f.posts(), 1); assert.equal(f.row().status, 'unknown');
});
test('known permission rejection leaves safe retry state', async () => { const f = fixture({ error: Object.assign(new Error('permission'), { status: 403 }) }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); assert.equal(f.row().status, 'failed'); });
test('post succeeded but DB update failed never resends', async () => {
  const f = fixture({ dbFailure: true }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); await deliverBulletin(bulletin(), f.deps); assert.equal(f.posts(), 1); assert.equal(f.row().status, 'sending');
});
test('unverified Discord response cannot mark sent', async () => { const f = fixture({ wrongResponse: true }); await assert.rejects(deliverBulletin(bulletin(), f.deps)); assert.equal(f.row().status, 'unknown'); });

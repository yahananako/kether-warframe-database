import fs from 'node:fs';
import path from 'node:path';

const site = path.resolve(process.cwd(), '../kether-site-source/data');
const assets = path.resolve(process.cwd(), 'assets');

function between(text, start, end) {
  const from = text.indexOf(start);
  if (from < 0) throw new Error(`Missing ${start}`);
  const arrayStart = text.indexOf('[', from);
  const arrayEnd = text.indexOf(end, arrayStart);
  if (arrayEnd < 0) throw new Error(`Missing ${end}`);
  return text.slice(arrayStart, arrayEnd + 1);
}

const storyText = fs.readFileSync(path.join(site, 'storyFlow.ts'), 'utf8');
const chapters = JSON.parse(between(storyText, 'export const storyChapters', '] as const'));

const sideText = fs.readFileSync(path.join(site, 'sideStoryFlow.ts'), 'utf8');
const sideSource = between(sideText, 'export const sideStoryEras', '];\n\nexport const sideStoryReadingOrder');
const guide = slug => `https://www.warframe.com/en/guides/quests/${slug}`;
const sideEras = Function('guide', `return (${sideSource})`)(guide);

const regularText = fs.readFileSync(path.join(site, 'regularWarframes.ts'), 'utf8');
const regularSource = between(regularText, 'export const regularWarframes', '];');
const regularWarframes = Function(`return (${regularSource})`)();

const rolesText = fs.readFileSync(path.join(site, 'warframeRoles.ts'), 'utf8');
const roleMapSource = rolesText.match(/const roleMap:[^=]+\=\s*({[\s\S]*?});\n\nexport function/);
if (!roleMapSource) throw new Error('Missing role map');
const roleMap = Function(`return (${roleMapSource[1]})`)();

const output = { chapters, sideEras, regularWarframes, roleMap };
fs.writeFileSync(path.join(assets, 'v3-data.js'), `window.KETHER_V3_DATA=${JSON.stringify(output)};\n`);
console.log(`v3 data: ${chapters.length} chapters, ${sideEras.length} side eras, ${regularWarframes.length} warframes`);

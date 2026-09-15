import fs from "node:fs";

const detailData = JSON.parse(
  fs.readFileSync("data/warframeDetails.generated.json", "utf8"),
);
const seriesData = JSON.parse(fs.readFileSync("data/questSeries.json", "utf8"));
const regularSource = fs.readFileSync("data/regularWarframes.ts", "utf8");
const storySource = fs.readFileSync("data/storyFlow.ts", "utf8");

function extractArray(source, marker, endMarker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing ${marker}`);
  const start = source.indexOf("[", markerIndex);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Invalid ${marker} array`);
  return Function(`"use strict"; return (${source.slice(start, end + 1)});`)();
}

const regularWarframes = extractArray(
  regularSource,
  "export const regularWarframes",
  "];",
);
const storyChapters = JSON.parse(
  storySource.slice(
    storySource.indexOf("[", storySource.indexOf("export const storyChapters")),
    storySource.indexOf("] as const") + 1,
  ),
);
const detailsByName = new Map(
  detailData.warframes.map((warframe) => [warframe.name, warframe]),
);
const storyPaths = new Set(
  storyChapters.flatMap((chapter) =>
    chapter.passages.map((passage) => `/story/${chapter.slug}/${passage.id}`),
  ),
);

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

assert(
  regularWarframes.length === 65,
  `Expected 65 regular Warframes, got ${regularWarframes.length}`,
);
assert(
  detailData.warframes.length === 66,
  `Expected 66 detail records, got ${detailData.warframes.length}`,
);

for (const regular of regularWarframes) {
  assert(
    detailsByName.has(regular.name),
    `Missing detail record: ${regular.name}`,
  );
}

for (const warframe of detailData.warframes) {
  assert(warframe.slug && warframe.name, "Detail record has no slug or name");
  assert(
    warframe.abilities.length === 4,
    `${warframe.name} does not have four abilities`,
  );
  assert(
    warframe.abilities.every((ability) => ability.description),
    `${warframe.name} has an empty ability description`,
  );
  assert(
    !JSON.stringify(warframe).includes("對應數值"),
    `${warframe.name} contains an unresolved placeholder`,
  );
  assert(
    !warframe.marketSlug || warframe.hasPrime,
    `${warframe.name} has a market slug without a Prime`,
  );
  assert(
    warframe.name !== "Excalibur" || !warframe.marketSlug,
    "Excalibur Prime must not expose a market set",
  );
}

assert(
  seriesData.series.length === 6,
  `Expected 6 quest series, got ${seriesData.series.length}`,
);
for (const series of seriesData.series) {
  assert(series.episodes.length >= 3, `${series.title} has too few episodes`);
  for (const episode of series.episodes) {
    assert(
      storyPaths.has(episode.href),
      `${series.title} points to missing story ${episode.href}`,
    );
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Warframe detail test passed: ${regularWarframes.length} archive entries, ${detailData.warframes.length} detail records, ${seriesData.series.length} quest series.`,
);

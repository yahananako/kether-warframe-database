import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_FILE = path.join(ROOT, "data", "kuvaWeapons.generated.ts");

const SHEETS = {
  primary: {
    title: "主要武器",
    sheetId: 1365606609,
    insertAt: 56,
    sectionFormatRow: 18,
    headerFormatRow: 19,
    dataFormatRow: 20,
  },
  secondary: {
    title: "次要武器",
    sheetId: 1587192708,
    insertAt: 53,
    sectionFormatRow: 18,
    headerFormatRow: 19,
    dataFormatRow: 20,
  },
  melee: {
    title: "近戰武器",
    sheetId: 1282903836,
    insertAt: 63,
    sectionFormatRow: 18,
    headerFormatRow: 19,
    dataFormatRow: 20,
  },
  archwing: {
    title: "曲翼",
    sheetId: 1952688920,
    blockStart: 28,
    formatSheetId: 1365606609,
    sectionFormatRow: 18,
    headerFormatRow: 19,
    dataFormatRow: 20,
  },
};

const HEADERS = [
  "中文名",
  "英文名",
  "中文用途／說明",
  "優先度",
  "交易價格（白金）",
  "交易網站",
  "已購買",
  "來源／取得方式",
  "備註",
];

const EXPECTED_COUNTS = { primary: 12, secondary: 5, melee: 2, archwing: 2 };

function stringCell(value) {
  return value === "" || value === null || value === undefined
    ? {}
    : { userEnteredValue: { stringValue: String(value) } };
}

function linkCell(label, url) {
  const safeUrl = String(url).replaceAll('"', '""');
  const safeLabel = String(label).replaceAll('"', '""');
  return {
    userEnteredValue: {
      formulaValue: `=HYPERLINK("${safeUrl}","${safeLabel}")`,
    },
  };
}

function emptyRow() {
  return { values: Array.from({ length: 9 }, () => ({})) };
}

function sectionRow(section) {
  return {
    values: [stringCell(`▣ ${section}`), ...Array.from({ length: 8 }, () => ({}))],
  };
}

function headerRow() {
  return { values: HEADERS.map(stringCell) };
}

function dataRow(item) {
  return {
    values: [
      stringCell(item.chineseName),
      stringCell(item.englishName),
      stringCell(item.description),
      stringCell(item.priority),
      stringCell(item.price),
      linkCell(item.tradeText || "查看玄骸拍賣", item.marketUrl),
      stringCell(item.owned),
      stringCell(item.source),
      stringCell(item.note),
    ],
  };
}

function readCatalog(source) {
  const match = source.match(/KUVA_WEAPONS: KuvaWeaponCatalogRow\[\] = (\[[\s\S]*\]);\s*$/m);
  if (!match) throw new Error("Could not locate KUVA_WEAPONS in generated file.");
  return JSON.parse(match[1]);
}

function copyRowFormat(sheetId, sourceRow, startRow, endRow, destinationSheetId = sheetId) {
  return {
    copyPaste: {
      source: {
        sheetId,
        startRowIndex: sourceRow,
        endRowIndex: sourceRow + 1,
        startColumnIndex: 0,
        endColumnIndex: 9,
      },
      destination: {
        sheetId: destinationSheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: 0,
        endColumnIndex: 9,
      },
      pasteType: "PASTE_FORMAT",
      pasteOrientation: "NORMAL",
    },
  };
}

function rowHeight(sheetId, startIndex, endIndex, pixelSize) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "ROWS",
        startIndex,
        endIndex,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function validationRequests(sheetId, startRowIndex, endRowIndex) {
  return [
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ["高", "中", "低", "待評估"].map((userEnteredValue) => ({ userEnteredValue })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ["已購買", "未購買"].map((userEnteredValue) => ({ userEnteredValue })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
  ];
}

function buildBlockRequests(category, items) {
  const config = SHEETS[category];
  const rows = [sectionRow(items[0].section), headerRow(), ...items.map(dataRow), emptyRow()];
  const start = config.insertAt;
  const dataStart = start + 2;
  const dataEnd = dataStart + items.length;
  const end = start + rows.length;

  return {
    sheet: config.title,
    range: `${config.title}!A${start + 1}:I${end}`,
    itemCount: items.length,
    requests: [
      copyRowFormat(config.sheetId, config.sectionFormatRow, start, start + 1),
      copyRowFormat(config.sheetId, config.headerFormatRow, start + 1, start + 2),
      copyRowFormat(config.sheetId, config.dataFormatRow, dataStart, dataEnd),
      {
        updateCells: {
          range: {
            sheetId: config.sheetId,
            startRowIndex: start,
            endRowIndex: end,
            startColumnIndex: 0,
            endColumnIndex: 9,
          },
          rows,
          fields: "userEnteredValue",
        },
      },
      rowHeight(config.sheetId, start, start + 1, 30),
      rowHeight(config.sheetId, start + 1, start + 2, 36),
      rowHeight(config.sheetId, dataStart, dataEnd, 76),
      rowHeight(config.sheetId, dataEnd, end, 20),
      ...validationRequests(config.sheetId, dataStart, dataEnd),
    ],
  };
}

function buildArchwingRequests(items) {
  const config = SHEETS.archwing;
  const rows = [sectionRow(items[0].section), headerRow(), ...items.map(dataRow), emptyRow()];
  const start = config.blockStart;
  const dataStart = start + 2;
  const dataEnd = dataStart + items.length;
  const end = start + rows.length;

  return {
    sheet: config.title,
    range: `${config.title}!A${start + 1}:I${end}`,
    itemCount: items.length,
    requests: [
      copyRowFormat(config.formatSheetId, config.sectionFormatRow, start, start + 1, config.sheetId),
      copyRowFormat(config.formatSheetId, config.headerFormatRow, start + 1, start + 2, config.sheetId),
      copyRowFormat(config.formatSheetId, config.dataFormatRow, dataStart, dataEnd, config.sheetId),
      {
        updateCells: {
          range: {
            sheetId: config.sheetId,
            startRowIndex: start,
            endRowIndex: end,
            startColumnIndex: 0,
            endColumnIndex: 9,
          },
          rows,
          fields: "userEnteredValue",
        },
      },
      rowHeight(config.sheetId, start, start + 1, 30),
      rowHeight(config.sheetId, start + 1, start + 2, 36),
      rowHeight(config.sheetId, dataStart, dataEnd, 76),
      rowHeight(config.sheetId, dataEnd, end, 20),
      ...validationRequests(config.sheetId, dataStart, dataEnd),
    ],
  };
}

const source = await readFile(CATALOG_FILE, "utf8");
const catalog = readCatalog(source);
const groups = Object.fromEntries(
  Object.keys(SHEETS).map((category) => [
    category,
    catalog.filter((item) => item.category === category),
  ]),
);

for (const [category, items] of Object.entries(groups)) {
  if (items.length !== EXPECTED_COUNTS[category]) {
    throw new Error(
      `Kuva ${category} count changed from ${EXPECTED_COUNTS[category]} to ${items.length}; migrate the Sheet block before refreshing it.`,
    );
  }
}

const blocks = [
  buildBlockRequests("primary", groups.primary),
  buildBlockRequests("secondary", groups.secondary),
  buildBlockRequests("melee", groups.melee),
  buildArchwingRequests(groups.archwing),
];

// Keep the old standalone Kuva Nukor slot empty now that the complete series has its own block.
blocks[1].requests.unshift({
  updateCells: {
    range: {
      sheetId: SHEETS.secondary.sheetId,
      startRowIndex: 7,
      endRowIndex: 8,
      startColumnIndex: 0,
      endColumnIndex: 9,
    },
    rows: [emptyRow()],
    fields: "userEnteredValue",
  },
});

console.log(JSON.stringify({
  spreadsheetId: "1ll27z4P_9a9ly2HsxNJdOHW2mzTL8_BHUqLZUtxy9Lc",
  summary: blocks.map(({ sheet, range, itemCount }) => ({ sheet, range, itemCount })),
  requests: blocks.flatMap((block) => block.requests),
}));

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_FILE = path.join(ROOT, "data", "equipmentCatalog.generated.ts");

const SHEETS = {
  primary: { title: "主要武器", sheetId: 1365606609, insertAt: 18 },
  secondary: { title: "次要武器", sheetId: 1587192708, insertAt: 18 },
  melee: { title: "近戰武器", sheetId: 1282903836, insertAt: 18 },
  archwing: { title: "曲翼", sheetId: 1952688920, replaceAt: 4, existingEnd: 39 },
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

const SECTION_ORDER = {
  primary: ["Prime 主要武器"],
  secondary: ["Prime 次要武器"],
  melee: ["Prime 近戰武器"],
  archwing: [
    "曲翼",
    "曲翼槍",
    "曲翼槍／亡靈武器",
    "曲翼近戰武器",
    "亡靈機甲",
    "亡靈專屬武器",
  ],
};

function stringCell(value) {
  return value === "" || value === null || value === undefined
    ? {}
    : { userEnteredValue: { stringValue: String(value) } };
}

function linkCell(label, url) {
  if (!url) return stringCell("不可交易");
  const safeUrl = String(url).replaceAll('"', '""');
  const safeLabel = String(label).replaceAll('"', '""');
  return { userEnteredValue: { formulaValue: `=HYPERLINK("${safeUrl}","${safeLabel}")` } };
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
      linkCell(item.tradeText || "開啟交易", item.marketUrl),
      stringCell(item.owned),
      stringCell(item.source),
      stringCell(item.note),
    ],
  };
}

function readCatalog(source) {
  const match = source.match(/EQUIPMENT_CATALOG: EquipmentCatalogRow\[\] = (\[[\s\S]*\]);\n$/m);
  if (!match) throw new Error("Could not locate EQUIPMENT_CATALOG in generated file.");
  return JSON.parse(match[1]);
}

function buildRows(catalog, category) {
  const rows = [];
  const sectionPositions = [];
  const headerPositions = [];
  const dataRanges = [];

  for (const section of SECTION_ORDER[category]) {
    const items = catalog
      .filter((item) => item.category === category && item.section === section)
      .sort((a, b) => a.englishName.localeCompare(b.englishName));

    if (items.length === 0) continue;

    sectionPositions.push(rows.length);
    rows.push(sectionRow(section));
    headerPositions.push(rows.length);
    rows.push(headerRow());
    const dataStart = rows.length;
    rows.push(...items.map(dataRow));
    dataRanges.push([dataStart, rows.length]);
  }

  rows.push(emptyRow(), emptyRow());
  return { rows, sectionPositions, headerPositions, dataRanges };
}

function copyRowRequest(sheetId, sourceRow, startRow, endRow, pasteType = "PASTE_NORMAL") {
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
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: 0,
        endColumnIndex: 9,
      },
      pasteType,
      pasteOrientation: "NORMAL",
    },
  };
}

function rowHeightRequest(sheetId, startRowIndex, endRowIndex, pixelSize) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "ROWS",
        startIndex: startRowIndex,
        endIndex: endRowIndex,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function validationRequests(sheetId, absoluteDataRanges) {
  const requests = [];

  for (const [startRowIndex, endRowIndex] of absoluteDataRanges) {
    requests.push(
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
    );
  }

  return requests;
}

function buildRegularSheetRequests(catalog, category) {
  const config = SHEETS[category];
  const block = buildRows(catalog, category);
  const start = config.insertAt;
  const end = start + block.rows.length;
  const requests = [
    {
      insertDimension: {
        range: {
          sheetId: config.sheetId,
          dimension: "ROWS",
          startIndex: start,
          endIndex: end,
        },
        inheritFromBefore: true,
      },
    },
    copyRowRequest(config.sheetId, 6, start, end),
    ...block.sectionPositions.map((position) =>
      copyRowRequest(config.sheetId, 4, start + position, start + position + 1),
    ),
    ...block.headerPositions.map((position) =>
      copyRowRequest(config.sheetId, 5, start + position, start + position + 1),
    ),
    {
      updateCells: {
        range: {
          sheetId: config.sheetId,
          startRowIndex: start,
          endRowIndex: end,
          startColumnIndex: 0,
          endColumnIndex: 9,
        },
        rows: block.rows,
        fields: "userEnteredValue",
      },
    },
  ];

  for (const position of block.sectionPositions) {
    requests.push(rowHeightRequest(config.sheetId, start + position, start + position + 1, 30));
  }
  for (const position of block.headerPositions) {
    requests.push(rowHeightRequest(config.sheetId, start + position, start + position + 1, 36));
  }
  const absoluteDataRanges = block.dataRanges.map(([a, b]) => [start + a, start + b]);
  for (const [a, b] of absoluteDataRanges) requests.push(rowHeightRequest(config.sheetId, a, b, 76));
  requests.push(...validationRequests(config.sheetId, absoluteDataRanges));

  return {
    sheet: config.title,
    sheetId: config.sheetId,
    startRow: start + 1,
    endRow: end,
    rowCount: block.rows.length,
    itemCount: block.dataRanges.reduce((count, [a, b]) => count + b - a, 0),
    requests,
  };
}

function buildArchwingRequests(catalog) {
  const category = "archwing";
  const config = SHEETS.archwing;
  const block = buildRows(catalog, category);
  const start = config.replaceAt;
  const existingHeight = config.existingEnd - config.replaceAt;
  const insertCount = Math.max(0, block.rows.length - existingHeight);
  const end = start + block.rows.length;
  const requests = [];

  if (insertCount > 0) {
    requests.push({
      insertDimension: {
        range: {
          sheetId: config.sheetId,
          dimension: "ROWS",
          startIndex: config.existingEnd,
          endIndex: config.existingEnd + insertCount,
        },
        inheritFromBefore: true,
      },
    });
  }

  requests.push(
    copyRowRequest(config.sheetId, 6, start, end),
    ...block.sectionPositions.map((position) =>
      copyRowRequest(config.sheetId, 4, start + position, start + position + 1),
    ),
    ...block.headerPositions.map((position) =>
      copyRowRequest(config.sheetId, 5, start + position, start + position + 1),
    ),
    {
      updateCells: {
        range: {
          sheetId: config.sheetId,
          startRowIndex: start,
          endRowIndex: end,
          startColumnIndex: 0,
          endColumnIndex: 9,
        },
        rows: block.rows,
        fields: "userEnteredValue",
      },
    },
  );

  for (const position of block.sectionPositions) {
    requests.push(rowHeightRequest(config.sheetId, start + position, start + position + 1, 30));
  }
  for (const position of block.headerPositions) {
    requests.push(rowHeightRequest(config.sheetId, start + position, start + position + 1, 36));
  }
  const absoluteDataRanges = block.dataRanges.map(([a, b]) => [start + a, start + b]);
  for (const [a, b] of absoluteDataRanges) requests.push(rowHeightRequest(config.sheetId, a, b, 76));
  requests.push(...validationRequests(config.sheetId, absoluteDataRanges));

  return {
    sheet: config.title,
    sheetId: config.sheetId,
    startRow: start + 1,
    endRow: end,
    rowCount: block.rows.length,
    itemCount: block.dataRanges.reduce((count, [a, b]) => count + b - a, 0),
    insertedRows: insertCount,
    requests,
  };
}

const source = await readFile(CATALOG_FILE, "utf8");
const catalog = readCatalog(source);
const category = process.argv[2];

if (!SHEETS[category]) {
  throw new Error(`Choose one category: ${Object.keys(SHEETS).join(", ")}`);
}

const payload = category === "archwing"
  ? buildArchwingRequests(catalog)
  : buildRegularSheetRequests(catalog, category);

console.log(JSON.stringify(payload));

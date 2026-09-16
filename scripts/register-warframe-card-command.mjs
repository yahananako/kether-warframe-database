import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  const text = readFileSync(path, "utf8");

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

const dryRun = process.argv.includes("--dry-run");
const ifConfigured = process.argv.includes("--if-configured");

const appId =
  process.env.DISCORD_APP_ID ||
  process.env.DISCORD_APPLICATION_ID ||
  process.env.DISCORD_CLIENT_ID;

const guildId = process.env.DISCORD_GUILD_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;
const missingConfiguration = [
  !appId ? "DISCORD_APP_ID / DISCORD_APPLICATION_ID / DISCORD_CLIENT_ID" : null,
  !guildId ? "DISCORD_GUILD_ID" : null,
  !botToken ? "DISCORD_BOT_TOKEN" : null,
].filter(Boolean);

if (!dryRun && missingConfiguration.length > 0) {
  if (ifConfigured) {
    console.log(
      `略過 Discord 指令同步：缺少 ${missingConfiguration.join("、")}。`,
    );
    process.exit(0);
  }

  throw new Error(`Discord 指令同步設定不完整：${missingConfiguration.join("、")}`);
}

const commands = [
  {
    name: "kether",
    description: "搜尋 KETHER 資料庫、網站入口或 Warframe Market 價格",
    description_localizations: {
      "zh-TW": "搜尋 KETHER 資料庫、網站入口或 Warframe Market 價格",
      "zh-CN": "搜索 KETHER 数据库、网站入口或 Warframe Market 价格",
    },
    type: 1,
    options: [
      {
        name: "keyword",
        name_localizations: {
          "zh-TW": "關鍵字",
          "zh-CN": "关键字",
        },
        description: "例如：首頁、激昂射擊、Glaive Prime",
        description_localizations: {
          "zh-TW": "例如：首頁、激昂射擊、Glaive Prime",
          "zh-CN": "例如：首页、激昂射击、Glaive Prime",
        },
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: "price",
    name_localizations: {
      "zh-TW": "查價",
      "zh-CN": "查价",
    },
    description: "查詢 Warframe Market 即時白金價格與交易網站",
    description_localizations: {
      "zh-TW": "查詢 Warframe Market 即時白金價格與交易網站",
      "zh-CN": "查询 Warframe Market 即时白金价格与交易网站",
    },
    type: 1,
    options: [
      {
        name: "item",
        name_localizations: {
          "zh-TW": "物品",
          "zh-CN": "物品",
        },
        description: "輸入中文或英文物品名稱",
        description_localizations: {
          "zh-TW": "輸入中文或英文物品名稱",
          "zh-CN": "输入中文或英文物品名称",
        },
        type: 3,
        required: true,
        autocomplete: true,
      },
      {
        name: "rank",
        name_localizations: {
          "zh-TW": "mod等級",
          "zh-CN": "mod等级",
        },
        description: "MOD 等級；不指定時預設 Rank 0",
        description_localizations: {
          "zh-TW": "MOD 等級；不指定時預設 Rank 0",
          "zh-CN": "MOD 等级；不指定时默认 Rank 0",
        },
        type: 3,
        required: false,
        choices: Array.from({ length: 11 }, (_, rank) => ({
          name: rank === 10 ? "Rank 10 / 滿等" : `Rank ${rank}`,
          value: String(rank),
        })),
      },
    ],
  },
  {
    name: "help",
    name_localizations: {
      "zh-TW": "說明",
      "zh-CN": "说明",
    },
    description: "顯示 KETHER 小希 BOT 指令說明",
    description_localizations: {
      "zh-TW": "顯示 KETHER 小希 BOT 指令說明",
      "zh-CN": "显示 KETHER 小希 BOT 指令说明",
    },
    type: 1,
  },
  {
    name: "relic-obtain",
    name_localizations: {
      "zh-TW": "核桃取得",
      "zh-CN": "遗物取得",
    },
    description: "查詢 Warframe 核桃與遺物取得方式",
    description_localizations: {
      "zh-TW": "查詢 Warframe 核桃與遺物取得方式",
      "zh-CN": "查询 Warframe 遗物取得方式",
    },
    type: 1,
    options: [
      {
        name: "name",
        name_localizations: {
          "zh-TW": "名稱",
          "zh-CN": "名称",
        },
        description: "要查詢的核桃名稱，例如 Lith、Axi 或 Lith S18",
        description_localizations: {
          "zh-TW": "要查詢的核桃名稱，例如 Lith、Axi 或 Lith S18",
          "zh-CN": "要查询的遗物名称，例如 Lith、Axi 或 Lith S18",
        },
        type: 3,
        required: true,
        autocomplete: true,
      },
    ],
  },
  {
  name: "weapon-obtain",

  name_localizations: {
    "zh-TW": "武器取得",
    "zh-CN": "武器取得",
  },

  description: "查詢 Warframe 武器取得方式",

  description_localizations: {
    "zh-TW": "查詢 Warframe 武器取得方式",
    "zh-CN": "查询 Warframe 武器取得方式",
  },

  type: 1,

  options: [
    {
      name: "weapon_type",

      name_localizations: {
        "zh-TW": "類型",
        "zh-CN": "类型",
      },

      description: "先選武器類型",

      description_localizations: {
        "zh-TW": "先選武器類型",
        "zh-CN": "先选武器类型",
      },

      type: 3,
      required: true,
      choices: [
        { name: "全部", value: "all" },
        { name: "主要武器", value: "primary" },
        { name: "次要武器", value: "secondary" },
        { name: "近戰武器", value: "melee" },
        { name: "曲翼武器", value: "archwing" },
        { name: "亡靈骸甲武器", value: "necramech" },
      ],
    },
    {
      name: "series",

      name_localizations: {
        "zh-TW": "系列",
        "zh-CN": "系列",
      },

      description: "再選武器系列或來源分類",

      description_localizations: {
        "zh-TW": "再選武器系列或來源分類",
        "zh-CN": "再选武器系列或来源分类",
      },

      type: 3,
      required: true,
      choices: [
        { name: "全部", value: "all" },
        { name: "P版 / Prime", value: "prime" },
        { name: "商店", value: "market" },
        { name: "氏族", value: "clan" },
        { name: "集團", value: "syndicate" },
        { name: "赤毒", value: "kuva" },
        { name: "信條", value: "tenet" },
        { name: "靈化", value: "incarnon" },
        { name: "活動 / 特殊", value: "event" },
        { name: "任務 / 掉落", value: "drop" },
      ],
    },
    {
      name: "name",

      name_localizations: {
        "zh-TW": "名稱",
        "zh-CN": "名称",
      },

      description: "最後輸入武器名稱，例如 托里德、兇惡終結者、Glaive Prime",

      description_localizations: {
        "zh-TW": "最後輸入武器名稱，例如 托里德、兇惡終結者、Glaive Prime",
        "zh-CN": "最后输入武器名称，例如 托里德、凶恶终结者、Glaive Prime",
      },

      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
},

{
  name: "companion-obtain",

  name_localizations: {
    "zh-TW": "同伴取得",
    "zh-CN": "同伴取得",
  },

  description: "查詢 Warframe 同伴與寵物取得方式",

  description_localizations: {
    "zh-TW": "查詢 Warframe 同伴與寵物取得方式",
    "zh-CN": "查询 Warframe 同伴与宠物取得方式",
  },

  type: 1,

  options: [
    {
      name: "name",

      name_localizations: {
        "zh-TW": "名稱",
        "zh-CN": "名称",
      },

      description: "要查詢的同伴名稱，例如 庫娃、笑貓、Helios",

      description_localizations: {
        "zh-TW": "要查詢的同伴名稱，例如 庫娃、笑貓、Helios",
        "zh-CN": "要查询的同伴名称，例如 库娃、笑猫、Helios",
      },

      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
},

{
    name: "material-obtain",
    name_localizations: {
      "zh-TW": "材料取得",
      "zh-CN": "材料取得",
    },
    description: "查詢 Warframe 材料取得方式",
    description_localizations: {
      "zh-TW": "查詢 Warframe 材料取得方式",
      "zh-CN": "查询 Warframe 材料取得方式",
    },
    type: 1,
    options: [
      {
        name: "name",
        name_localizations: {
          "zh-TW": "名稱",
          "zh-CN": "名称",
        },
        description: "要查詢的材料名稱，例如 碲 或 Orokin 電池",
        description_localizations: {
          "zh-TW": "要查詢的材料名稱，例如 碲 或 Orokin 電池",
          "zh-CN": "要查询的材料名称，例如 碲 或 Orokin 电池",
        },
        type: 3,
        required: true,
        autocomplete: true,
      },
    ],
  },
  {
    name: "warframe-obtain",
    name_localizations: {
      "zh-TW": "戰甲取得",
      "zh-CN": "战甲取得",
    },
    description: "查詢 Warframe 戰甲取得方式",
    description_localizations: {
      "zh-TW": "查詢 Warframe 戰甲取得方式",
      "zh-CN": "查询 Warframe 战甲取得方式",
    },
    type: 1,
    options: [
      {
        name: "name",
        name_localizations: {
          "zh-TW": "名稱",
          "zh-CN": "名称",
        },
        description: "要查詢的戰甲名稱，例如 Yareli 或 雅蕾莉",
        description_localizations: {
          "zh-TW": "要查詢的戰甲名稱，例如 Yareli 或 雅蕾莉",
          "zh-CN": "要查询的战甲名称，例如 Yareli 或 雅蕾莉",
        },
        type: 3,
        required: true,
        autocomplete: true,
      },
    ],
  },
  {
    name: "查看 Warframe 名片",
    type: 2,
  },
  {
    name: "warframe-card",
    name_localizations: {
      "zh-TW": "戰甲名片",
      "zh-CN": "战甲名片",
    },
    description: "查看指定成員的 Warframe 名片",
    description_localizations: {
      "zh-TW": "查看指定成員的 Warframe 名片",
      "zh-CN": "查看指定成员的 Warframe 名片",
    },
    type: 1,
    options: [
      {
        name: "user",
        name_localizations: {
          "zh-TW": "成員",
          "zh-CN": "成员",
        },
        description: "要查看名片的成員",
        description_localizations: {
          "zh-TW": "要查看名片的成員",
          "zh-CN": "要查看名片的成员",
        },
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "warframe-profile",
    name_localizations: {
      "zh-TW": "官方資料",
      "zh-CN": "官方资料",
    },
    description: "A-1 測試：用 playerId 讀取 Warframe 官方 Profile",
    description_localizations: {
      "zh-TW": "用玩家代號讀取 Warframe 官方 Profile",
      "zh-CN": "用玩家代号读取 Warframe 官方 Profile",
    },
    type: 1,
    options: [
      {
        name: "player_id",
        description: "Warframe Account ID / playerId",
        type: 3,
        required: true,
      },
      {
        name: "platform",
        description: "玩家平台",
        type: 3,
        required: true,
        choices: [
          { name: "PC", value: "pc" },
          { name: "PlayStation", value: "ps" },
          { name: "Xbox", value: "xbox" },
          { name: "Switch", value: "switch" },
          { name: "iOS", value: "ios" },
          { name: "Android", value: "android" },
        ],
      },
    ],
  },
  {
    name: "clan-verify",
    name_localizations: {
      "zh-TW": "氏族驗證",
      "zh-CN": "氏族验证",
    },
    description: "用遊戲個人簡介截圖自動完成 KETHER 氏族驗證",
    description_localizations: {
      "zh-TW": "用遊戲個人簡介截圖自動完成 KETHER 氏族驗證",
      "zh-CN": "用游戏个人简介截图自动完成 KETHER 氏族验证",
    },
    type: 1,
    options: [
      {
        name: "player_id",
        name_localizations: {
          "zh-TW": "玩家代號",
          "zh-CN": "玩家代号",
        },
        description: "截圖中顯示的 Warframe 玩家 ID",
        description_localizations: {
          "zh-TW": "截圖中顯示的 Warframe 玩家 ID",
          "zh-CN": "截图中显示的 Warframe 玩家 ID",
        },
        type: 3,
        required: true,
        min_length: 2,
        max_length: 40,
      },
      {
        name: "screenshot",
        name_localizations: {
          "zh-TW": "個人簡介截圖",
          "zh-CN": "个人简介截图",
        },
        description: "需同時清楚顯示玩家 ID、氏族名稱與氏族徽章",
        description_localizations: {
          "zh-TW": "需同時清楚顯示玩家 ID、氏族名稱與氏族徽章",
          "zh-CN": "需同时清楚显示玩家 ID、氏族名称与氏族徽章",
        },
        type: 11,
        required: true,
      },
    ],
  },
  {
    name: "giveaway",
    name_localizations: {
      "zh-TW": "抽獎",
      "zh-CN": "抽奖",
    },
    description: "建立與管理 KETHER 氏族抽獎",
    description_localizations: {
      "zh-TW": "建立與管理 KETHER 氏族抽獎",
      "zh-CN": "建立与管理 KETHER 氏族抽奖",
    },
    type: 1,
    options: [
      {
        name: "start",
        name_localizations: {
          "zh-TW": "開始",
          "zh-CN": "开始",
        },
        description: "在目前頻道開始一場抽獎",
        description_localizations: {
          "zh-TW": "在目前頻道開始一場抽獎",
          "zh-CN": "在目前频道开始一场抽奖",
        },
        type: 1,
        options: [
          {
            name: "prize",
            name_localizations: {
              "zh-TW": "獎品",
              "zh-CN": "奖品",
            },
            description: "本次抽獎的獎品",
            description_localizations: {
              "zh-TW": "本次抽獎的獎品",
              "zh-CN": "本次抽奖的奖品",
            },
            type: 3,
            required: true,
            min_length: 1,
            max_length: 200,
          },
          {
            name: "winner_count",
            name_localizations: {
              "zh-TW": "中獎名額",
              "zh-CN": "中奖名额",
            },
            description: "要抽出的中獎人數，預設 1 名",
            description_localizations: {
              "zh-TW": "要抽出的中獎人數，預設 1 名",
              "zh-CN": "要抽出的中奖人数，默认 1 名",
            },
            type: 4,
            required: false,
            min_value: 1,
            max_value: 10,
          },
        ],
      },
      {
        name: "end",
        name_localizations: {
          "zh-TW": "結束",
          "zh-CN": "结束",
        },
        description: "結束目前頻道的抽獎並抽出中獎者",
        description_localizations: {
          "zh-TW": "結束目前頻道的抽獎並抽出中獎者",
          "zh-CN": "结束目前频道的抽奖并抽出中奖者",
        },
        type: 1,
        options: [
          {
            name: "giveaway_id",
            name_localizations: {
              "zh-TW": "抽獎編號",
              "zh-CN": "抽奖编号",
            },
            description: "留空時會結束目前頻道正在進行的抽獎",
            description_localizations: {
              "zh-TW": "留空時會結束目前頻道正在進行的抽獎",
              "zh-CN": "留空时会结束目前频道正在进行的抽奖",
            },
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: "reroll",
        name_localizations: {
          "zh-TW": "重抽",
          "zh-CN": "重抽",
        },
        description: "從原參加者中重新抽選中獎者",
        description_localizations: {
          "zh-TW": "從原參加者中重新抽選中獎者",
          "zh-CN": "从原参加者中重新抽选中奖者",
        },
        type: 1,
        options: [
          {
            name: "giveaway_id",
            name_localizations: {
              "zh-TW": "抽獎編號",
              "zh-CN": "抽奖编号",
            },
            description: "留空時會重抽目前頻道最近結束的抽獎",
            description_localizations: {
              "zh-TW": "留空時會重抽目前頻道最近結束的抽獎",
              "zh-CN": "留空时会重抽目前频道最近结束的抽奖",
            },
            type: 3,
            required: false,
          },
        ],
      },
    ],
  },
];

function validateCommandOptions(options = [], path = "command") {
  if (options.length > 25) {
    throw new Error(`${path} 超過 Discord 的 25 個選項上限`);
  }

  for (const option of options) {
    if (![1, 2].includes(option.type) && !/^[a-z0-9_-]{1,32}$/.test(option.name)) {
      throw new Error(`${path} 選項名稱不合法：${option.name}`);
    }

    if (Array.isArray(option.options)) {
      validateCommandOptions(option.options, `${path}/${option.name}`);
    }

    if (Array.isArray(option.choices) && option.choices.length > 25) {
      throw new Error(`${path}/${option.name} 超過 Discord 的 25 個選項值上限`);
    }
  }
}

function validateCommands(items) {
  const keys = new Set();

  for (const command of items) {
    const key = `${command.type}:${command.name}`;

    if (keys.has(key)) throw new Error(`Discord 指令重複：${key}`);
    keys.add(key);

    if (command.type === 1 && !/^[a-z0-9_-]{1,32}$/.test(command.name)) {
      throw new Error(`Slash Command 名稱不合法：${command.name}`);
    }

    validateCommandOptions(command.options, command.name);
  }
}

validateCommands(commands);

if (dryRun) {
  console.log(`Discord 指令格式驗證通過：${commands.length} 個指令。`);
  process.exit(0);
}

const baseUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;

async function discordFetch(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    console.error(data);
    throw new Error(`Discord API 錯誤：${response.status}`);
  }

  return data;
}

const existingCommands = await discordFetch("GET", baseUrl);

for (const command of commands) {
  const existed = existingCommands.find(
    (item) => item.name === command.name && item.type === command.type
  );

  if (existed) {
    const updated = await discordFetch("PATCH", `${baseUrl}/${existed.id}`, command);
    console.log(`已更新 ${command.type === 1 ? "Slash Command" : "User Command"}：`, updated.name);
  } else {
    const created = await discordFetch("POST", baseUrl, command);
    console.log(`已建立 ${command.type === 1 ? "Slash Command" : "User Command"}：`, created.name);
  }
}

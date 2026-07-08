type WarframeAcquisitionRecord = {
  key: string;
  name: string;
  aliases: string[];
  source: string;
  parts: string;
  tips: string;
  notes: string;
};

const WARFRAME_ACQUISITION_DATA: WarframeAcquisitionRecord[] = [
  {
    key: "yareli",
    name: "Yareli / 雅蕾莉",
    aliases: ["yareli", "雅蕾莉", "水妹", "水女"],
    source: "主線任務「The Waverider / 乘浪者」取得本體藍圖；部件藍圖從氏族道場 Ventkids Bash Lab 研究取得。",
    parts: "本體藍圖：任務取得。部件藍圖：氏族研究。",
    tips: "適合先確認氏族道場研究是否已完成。",
    notes: "KETHER 測試資料，後續可擴充詳細材料與任務需求。",
  },
  {
    key: "rhino",
    name: "Rhino / 犀牛",
    aliases: ["rhino", "犀牛", "牛"],
    source: "金星 Fossa 節點擊敗 Jackal 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Boss 掉落。",
    tips: "新人早期很推薦的坦型戰甲。",
    notes: "適合新手推圖與生存。",
  },
  {
    key: "nekros",
    name: "Nekros / 摸屍甲",
    aliases: ["nekros", "摸屍", "摸屍甲", "死靈"],
    source: "Deimos / 火衛二 Magnacidium 節點擊敗 Lephantis 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Lephantis 掉落。",
    tips: "常用於刷資源，核心技能是 Desecrate / 褻瀆。",
    notes: "KETHER 常用刷資源戰甲。",
  },
  {
    key: "nova",
    name: "Nova / 諾娃",
    aliases: ["nova", "諾娃", "nova p", "nova prime"],
    source: "Europa / 歐羅巴 Naamah 節點擊敗 Raptors 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Raptors 掉落。",
    tips: "加速娃與減速娃都很常用。",
    notes: "後續可補充加速 / 減速配置連結。",
  },
  {
    key: "wisp",
    name: "Wisp / 花甲",
    aliases: ["wisp", "花甲", "幽靈甲"],
    source: "Jupiter / 木星 The Ropalolyst 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Ropalolyst 掉落。",
    tips: "需要推進到能打 Ropalolyst 的進度。",
    notes: "高泛用輔助戰甲。",
  },
  {
    key: "saryn",
    name: "Saryn / 毒媽",
    aliases: ["saryn", "毒媽", "毒女"],
    source: "Sedna / 賽德娜 Merrow 節點擊敗 Kela De Thaym 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Kela De Thaym 掉落。",
    tips: "常用於範圍清怪。",
    notes: "需要對應 Boss 門票資源。",
  },
  {
    key: "mesa",
    name: "Mesa / 槍女",
    aliases: ["mesa", "槍女", "女槍"],
    source: "Eris / 鬩神星 Mutalist Alad V Assassination 取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由 Mutalist Alad V 掉落。",
    tips: "需要 Mutalist Alad V Assassinate Key。",
    notes: "高火力輸出戰甲。",
  },
  {
    key: "ivara",
    name: "Ivara / 弓妹",
    aliases: ["ivara", "弓妹", "隱身弓"],
    source: "間諜任務獎勵取得本體與部件藍圖。",
    parts: "各部件依不同等級間諜任務獎勵池取得。",
    tips: "適合用隱身或熟悉路線後刷。",
    notes: "後續可細分低階 / 中階 / 高階間諜掉落。",
  },
  {
    key: "gauss",
    name: "Gauss / 高斯",
    aliases: ["gauss", "高斯", "跑男"],
    source: "Sedna / 賽德娜 Kappa 中斷任務獎勵取得部件藍圖；本體藍圖可由商店購買。",
    parts: "Neuroptics、Chassis、Systems 由中斷任務獎勵取得。",
    tips: "適合組隊刷中斷，效率比較穩。",
    notes: "高速機動戰甲。",
  },
  {
    key: "revenant",
    name: "Revenant / 幽魂",
    aliases: ["revenant", "幽魂", "夜靈甲"],
    source: "完成相關任務取得本體藍圖；部件藍圖主要從夜靈平野賞金取得。",
    parts: "部件藍圖由賞金輪替獎勵取得。",
    tips: "需要留意賞金獎勵輪替。",
    notes: "高生存戰甲，後續可補賞金階級。",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll("_", "")
    .replaceAll("/", "")
    .trim();
}

function findWarframe(query: string) {
  const normalized = normalize(query);
  return WARFRAME_ACQUISITION_DATA.find((record) => {
    return record.aliases.some((alias) => normalize(alias) === normalized);
  });
}


export function searchWarframeAcquisitionChoices(rawQuery: string | null | undefined) {
  const query = normalize(String(rawQuery ?? ""));
  const scored = WARFRAME_ACQUISITION_DATA.map((record) => {
    const searchable = [record.name, record.key, ...record.aliases].map(normalize);
    const exact = searchable.some((value) => value === query);
    const startsWith = searchable.some((value) => query && value.startsWith(query));
    const includes = searchable.some((value) => query && value.includes(query));

    let score = 0;
    if (!query) score = 1;
    else if (exact) score = 100;
    else if (startsWith) score = 80;
    else if (includes) score = 50;

    return { record, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
    .slice(0, 25);

  return scored.map(({ record }) => ({
    name: record.name.slice(0, 100),
    value: (record.aliases[0] ?? record.key).slice(0, 100),
  }));
}

export function buildWarframeAcquisitionResponse(rawName: string | null | undefined) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    const list = WARFRAME_ACQUISITION_DATA.map((record) => `・${record.name}`).join("\n");

    return {
      content:
        "請輸入要查詢的戰甲名稱喵。\n\n" +
        "目前測試資料：\n" +
        list +
        "\n\n範例：`/戰甲取得 名稱:Yareli`",
    };
  }

  const record = findWarframe(name);

  if (!record) {
    const list = WARFRAME_ACQUISITION_DATA.map((item) => item.name).join("、");

    return {
      content:
        `找不到「${name}」的戰甲取得資料喵。\n\n` +
        `目前可查：${list}`,
    };
  }

  return {
    embeds: [
      {
        title: `🧬 ${record.name}`,
        description: "KETHER Warframe Database｜戰甲取得方式",
        color: 0xf6a6d8,
        fields: [
          {
            name: "取得方式",
            value: record.source,
          },
          {
            name: "部件來源",
            value: record.parts,
          },
          {
            name: "小希建議",
            value: record.tips,
          },
          {
            name: "備註",
            value: record.notes,
          },
        ],
        footer: {
          text: "E-1 測試版｜後續可擴充全戰甲資料",
        },
      },
    ],
  };
}

type MaterialAcquisitionRecord = {
  key: string;
  name: string;
  aliases: string[];
  category: string;
  source: string;
  recommended: string;
  tips: string;
  notes: string;
};

const MATERIAL_ACQUISITION_DATA: MaterialAcquisitionRecord[] = [
  {
    key: "tellurium",
    name: "Tellurium / 碲",
    aliases: ["tellurium", "碲", "di"],
    category: "稀有材料",
    source: "主要來自天王星水下／曲翼相關任務、九重天任務，以及部分 Archwing 相關內容。",
    recommended: "天王星 Ophelia 生存、九重天任務。",
    tips: "刷資源時可搭配 Nekros / 摸屍甲、資源加成與隊伍刷怪效率。",
    notes: "掉落感偏低，建議順手刷，不要單場賭命喵。",
  },
  {
    key: "orokin-cell",
    name: "Orokin Cell / Orokin 電池",
    aliases: ["orokin cell", "orokincell", "orokin電池", "電池", "奥羅金電池"],
    category: "稀有材料",
    source: "土星、穀神星，以及部分 Boss 掉落。",
    recommended: "土星 Helene、防禦或生存類任務。",
    tips: "新手做 Prime、武器、戰甲時很常缺。",
    notes: "可以長期順刷，不建議用白金買。",
  },
  {
    key: "argon-crystal",
    name: "Argon Crystal / 氬結晶",
    aliases: ["argon crystal", "argon", "氬結晶", "氩结晶", "氬"],
    category: "會衰變材料",
    source: "虛空 Void 任務掉落。",
    recommended: "Void 捕獲、殲滅、生存任務。",
    tips: "氬結晶會隨時間衰減，要用的時候再刷。",
    notes: "今天刷、今天用，別讓它在倉庫蒸發喵。",
  },
  {
    key: "neural-sensors",
    name: "Neural Sensors / 神經傳感器",
    aliases: ["neural sensors", "neuralsensors", "神經傳感器", "神经传感器", "神經"],
    category: "稀有材料",
    source: "木星相關任務與 Boss 掉落。",
    recommended: "木星 Cameria 生存、Alad V 相關刷法。",
    tips: "早期做戰甲常會缺。",
    notes: "木星解開後可以順路刷。",
  },
  {
    key: "neurodes",
    name: "Neurodes / 神經元",
    aliases: ["neurodes", "神經元", "神经元"],
    category: "稀有材料",
    source: "地球、月球 Lua、鬩神星、Deimos 等地掉落。",
    recommended: "地球早期任務、月球或 Deimos 相關任務。",
    tips: "新手常缺，後期會慢慢囤起來。",
    notes: "如果只開到前期星圖，先從地球刷。",
  },
  {
    key: "morphics",
    name: "Morphics / 變形體",
    aliases: ["morphics", "變形體", "变形体"],
    category: "稀有材料",
    source: "水星、火星、冥王星、歐羅巴等地掉落。",
    recommended: "火星、歐羅巴常規任務。",
    tips: "早期製作武器與戰甲會用到。",
    notes: "通常推星圖時會自然累積。",
  },
  {
    key: "gallium",
    name: "Gallium / 鎵",
    aliases: ["gallium", "鎵", "镓"],
    category: "稀有材料",
    source: "火星、天王星相關任務掉落。",
    recommended: "火星或天王星生存／殲滅類任務。",
    tips: "可跟其他材料一起順刷。",
    notes: "如果天王星還沒開，先從火星處理。",
  },
  {
    key: "control-module",
    name: "Control Module / 控制模組",
    aliases: ["control module", "controlmodule", "控制模組", "控制模块"],
    category: "常見稀有材料",
    source: "虛空 Void、海王星、歐羅巴等地掉落。",
    recommended: "Void 任務順刷。",
    tips: "後期很容易爆倉，新手前期可能短缺。",
    notes: "不建議特地花白金買。",
  },
  {
    key: "plastids",
    name: "Plastids / 生物質",
    aliases: ["plastids", "生物質", "生物质"],
    category: "常用材料",
    source: "土星、天王星、鬩神星、冥王星等地掉落。",
    recommended: "土星或天王星生存類任務。",
    tips: "製作量需求常常很大。",
    notes: "適合搭配刷怪型任務慢慢囤。",
  },
  {
    key: "polymer-bundle",
    name: "Polymer Bundle / 聚合物束",
    aliases: ["polymer bundle", "polymer", "聚合物束", "聚合物"],
    category: "常用材料",
    source: "水星、金星、天王星等地掉落。",
    recommended: "天王星 Ophelia 或其他高刷怪任務。",
    tips: "大量製作消耗很快。",
    notes: "可以跟 Tellurium / 碲一起順刷。",
  },
  {
    key: "cryotic",
    name: "Cryotic / 永凍晶礦",
    aliases: ["cryotic", "永凍晶礦", "永冻晶矿", "冰凍礦", "冰冻矿"],
    category: "任務材料",
    source: "挖掘 Excavation 任務取得。",
    recommended: "地球、冥王星、歐羅巴等挖掘任務。",
    tips: "看挖掘機數量累積，隊伍效率差很多。",
    notes: "需要大量時建議組隊刷。",
  },
  {
    key: "oxium",
    name: "Oxium / 奧席金屬",
    aliases: ["oxium", "奧席金屬", "奥席金属", "奧席", "奥席"],
    category: "敵人掉落材料",
    source: "Corpus Oxium Osprey 類敵人掉落。",
    recommended: "Corpus 高刷怪任務。",
    tips: "要在 Oxium Osprey 自爆前擊殺才穩。",
    notes: "需求量大時會很有感，像被 Corpus 開了材料稅。",
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

function findMaterial(query: string) {
  const normalized = normalize(query);

  return MATERIAL_ACQUISITION_DATA.find((record) => {
    if (normalize(record.name).includes(normalized)) return true;
    return record.aliases.some((alias) => normalize(alias) === normalized);
  });
}

export function buildMaterialAcquisitionResponse(rawName: string | null | undefined) {
  const name = String(rawName ?? "").trim();

  if (!name) {
    const list = MATERIAL_ACQUISITION_DATA.map((record) => `・${record.name}`).join("\n");

    return {
      content:
        "請輸入要查詢的材料名稱喵。\n\n" +
        "目前測試資料：\n" +
        list +
        "\n\n範例：`/材料取得 名稱:碲`",
    };
  }

  const record = findMaterial(name);

  if (!record) {
    const list = MATERIAL_ACQUISITION_DATA.map((item) => item.name).join("、");

    return {
      content:
        `找不到「${name}」的材料取得資料喵。\n\n` +
        `目前可查：${list}`,
    };
  }

  return {
    embeds: [
      {
        title: `🧪 ${record.name}`,
        description: "KETHER Warframe Database｜材料取得方式",
        color: 0x9bd67b,
        fields: [
          {
            name: "分類",
            value: record.category,
          },
          {
            name: "主要來源",
            value: record.source,
          },
          {
            name: "推薦刷法",
            value: record.recommended,
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
          text: "E-2 測試版｜後續可擴充全材料資料",
        },
      },
    ],
  };
}

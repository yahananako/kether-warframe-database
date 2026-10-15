// Shared by the server and the dependency-free Android data builder.
// Names, categories, rotations and effects come from the complete Incarnon archive.
const labels = { primary: "主要武器", secondary: "次要武器", melee: "近戰武器" };
const zarimanWeapons = new Set(["Phenmor", "Felarx", "Laetum", "Innodem", "Praedos"]);

function acquisition(weapon) {
  if (weapon.kind === "genesis") {
    return {
      source: `主要由鋼韌之道無盡巡迴（Circuit）第 ${weapon.rotation} 組輪替取得靈化創件，選為第 5 或第 10 階獎勵；之後到扎日曼向 Cavalero 安裝於相容武器。`,
      parts: "需要相容基底武器、對應的靈化創件、悲愴鉗爪與指定渡域資源；不會直接獲得一把新武器。",
      note: `靈化創件／應感創件｜輪替 ${weapon.rotation}｜與基底武器共用武器槽位，依所選版本套用進化數值。`,
    };
  }
  if (zarimanWeapons.has(weapon.name)) {
    return {
      source: "完成 Angels of the Zariman／扎日曼相關主線後，向扎日曼蛹巖的 Cavalero 以堅守者聲望購買藍圖並製作；各武器需要對應的集團階級。",
      parts: "原生靈化武器，使用自身藍圖與製作資源；不需要另外安裝靈化創件。",
      note: "原生靈化／應感武器｜取得後完成武器自身的進化挑戰；不是無盡巡迴靈化創件獎勵。",
    };
  }
  if (weapon.name === "Onos" || weapon.name === "Ruvox") {
    return {
      source: "完成 Whispers in the Walls 與 The Deadlock Protocol 後，從火衛二 Armatus 中斷任務取得藍圖；也可在聖所研究所向 Loid 使用 Vessel Capillaries 兌換。",
      parts: weapon.name === "Ruvox" ? "收集武器藍圖與所需部件再製作；原生靈化武器，不需靈化創件。" : "取得武器藍圖與製作資源後製作；原生靈化武器，不需靈化創件。",
      note: "原生靈化／應感武器｜Armatus 中斷任務／Loid 的 Research Dante 商店；也可從遊戲商店以白金購買成品。",
    };
  }
  if (weapon.name === "Thalys") {
    return {
      source: "完成織島者（Isleweaver）心旋取得蛛繭，再到寢區向 Acrithis 兌換泰力藍圖並製作。",
      parts: "需要泰力藍圖與指定製作資源；原生靈化巨鐮，不需靈化創件。",
      note: "原生靈化／應感武器｜Acrithis 為常駐蛛繭兌換商人。",
    };
  }
  throw new Error(`Missing native Incarnon acquisition: ${weapon.name}`);
}

export function buildIncarnonAcquisition(catalog) {
  return catalog.weapons.map((weapon) => {
    const genesis = weapon.kind === "genesis";
    const englishName = genesis ? `${weapon.name} Incarnon` : weapon.name;
    const chineseName = genesis ? `${weapon.nameZh} 靈化` : weapon.nameZh;
    const details = acquisition(weapon);
    const variantKeys = new Set(weapon.evolutions.flatMap(e => e.abilities.flatMap(a => Object.keys(a.variantValues || {}))));
    const aliases = [...new Set([
      englishName, chineseName, weapon.name, weapon.nameZh,
      `${weapon.name} Incarnon`, `${weapon.nameZh}靈化`, `${weapon.nameZh}應感`,
      ...(genesis ? [`${weapon.name} Incarnon Genesis`, `${weapon.nameZh}靈化創件`, `${weapon.nameZh}應感創件`] : []),
      ...(genesis && variantKeys.has("Prime") ? [`${weapon.name} Prime Incarnon`, `${weapon.nameZh} Prime 靈化`] : []),
    ])];
    return {
      key: genesis ? `${weapon.id}-incarnon` : weapon.id,
      name: `${englishName} / ${chineseName}`,
      category: weapon.category,
      section: `靈化${labels[weapon.category]}`,
      chineseName, englishName, aliases,
      description: weapon.effect.zh,
      priority: "待評估", price: "不可交易", tradeText: "不可交易", owned: "未購買",
      source: details.source, parts: details.parts,
      tips: weapon.effect.zh,
      note: details.note,
      notes: `${details.note} 完整進化與挑戰： https://kether-warframe-database.vercel.app/database/incarnon?q=${encodeURIComponent(weapon.name)}`,
      marketUrl: "", imageUrl: weapon.image,
      weaponType: labels[weapon.category], weaponTypeKey: weapon.category,
      series: "靈化", seriesKey: "incarnon",
      tradeNote: "靈化創件及武器成品不可交易；可交易的 Prime 基底部件請另查該武器的 Prime 資料。",
      incarnonKind: weapon.kind,
      rotation: weapon.rotation,
    };
  });
}

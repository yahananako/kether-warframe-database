export type WarframeCanonProfile = {
  name: string;
  sourceType: "任務故事" | "Leverian" | "Codex 記錄" | "Prime 敘事" | "官方設定";
  epithet: string;
  summary: string;
  paragraphs: string[];
  source: { label: string; url: string };
};

const frame = (slug: string) => `https://www.warframe.com/game/warframes/${slug}`;
const guide = (slug: string) => `https://www.warframe.com/game/questguide#${slug}`;

// 沒有獨立任務或 Leverian 展廳的戰甲，使用遊戲 Codex、Prime 預告與官方角色頁。
// 文案刻意標示來源層級，避免把角色設定擴寫成未在遊戲中發生的事件。
export const warframeCanonProfiles: WarframeCanonProfile[] = [
  { name: "Ash", sourceType: "Leverian", epithet: "從 Scoria 手中留下的無聲刀鋒", summary: "Ash 的 Leverian 記錄追溯他與 Scoria 刺客集團的血腥交鋒。", paragraphs: ["Scoria 把暗殺變成權力與儀式，Ash 則以同樣的黑暗逼近他們。這段記錄不是單純的忍者能力介紹，而是 Orokin 時代一場以獵人為獵物的清算。"], source: { label: "Ash 官方戰甲頁／Leverian", url: frame("ash") } },
  { name: "Banshee", sourceType: "官方設定", epithet: "把聲音化為武器的獵手", summary: "Banshee 以聲波定位弱點、壓制槍聲並震碎敵陣。", paragraphs: ["遊戲目前沒有為 Banshee 收錄一段具名的個人任務；她的正式設定集中於 Codex 與角色頁。這裡保留官方可確認的聲波戰鬥身分，不把技能敘述虛構成歷史事件。"], source: { label: "Banshee 官方戰甲頁", url: frame("banshee") } },
  { name: "Baruuk", sourceType: "官方設定", epithet: "克制怒火的和平主義者", summary: "Baruuk 以克制維持平靜；當忍耐被耗盡，壓抑的力量才完全釋放。", paragraphs: ["他的設計把和平與暴力放在同一具戰甲裡：閃避、繳械與保護盟友都在避免衝突，Serene Storm 則是最後界線被越過後的回應。"], source: { label: "Baruuk 官方戰甲頁", url: frame("baruuk") } },
  { name: "Caliban", sourceType: "任務故事", epithet: "Erra 留下的 Sentient 混種", summary: "Caliban 是 Warframe 與 Sentient 技術交纏的產物，也是 Erra 留在始源星系的遺緒。", paragraphs: ["《新世戰》之後，Caliban 成為 Narmer 與 Sentient 入侵留下的活證據。他能召喚 Sentient 同族並剝除防禦，身體本身就記錄了兩種兵器體系被強行結合的結果。"], source: { label: "The New War 任務指南", url: guide("the-new-war") } },
  { name: "Chroma", sourceType: "任務故事", epithet: "披著異質甲皮的失控獵者", summary: "《新疑謎》中，一具不受 Tenno 控制的 Chroma 追隨神祕訊號而現身。", paragraphs: ["Cephalon Simaris 追查 Arcane Machine 時，Tenno 遭遇這具遊蕩戰甲。任務沒有交代他完整的前世，只留下重要線索：Chroma 的外皮與 Sentient 特性存在關聯，而他曾在沒有操作者的狀態下行動。"], source: { label: "The New Strange 任務指南", url: guide("the-new-strange") } },
  { name: "Cyte-09", sourceType: "任務故事", epithet: "Quincy 所映照的神射手", summary: "Cyte-09 的敘事核心位於 1999：Quincy 是這套原型力量的人類鏡像。", paragraphs: ["在 Höllvania，Protoframe 讓戰甲不再只是遙遠的兵器外殼。Quincy 的警戒、射術與僱傭兵經歷，替 Cyte-09 的穿牆偵察與精準狙擊補上人格與時代背景。"], source: { label: "Warframe: 1999 官方頁", url: "https://www.warframe.com/1999" } },
  { name: "Ember", sourceType: "官方設定", epithet: "讓火焰成為審判", summary: "Ember 以熱能與燃燒控制戰場，是最早確立元素戰甲形象的角色之一。", paragraphs: ["遊戲尚未給 Ember 一段完整的具名個人任務。她的 Codex 與官方角色設定聚焦於火焰、熱量與越戰越烈的 Immolation；因此本頁將其標為角色設定，而非杜撰一場未被記錄的戰役。"], source: { label: "Ember 官方戰甲頁", url: frame("ember") } },
  { name: "Equinox", sourceType: "官方設定", epithet: "白晝與黑夜共居一身", summary: "Equinox 以 Day 與 Night 兩種面向，在攻擊、控制與恢復之間轉換。", paragraphs: ["她的官方敘事建立在二元共存，而非善惡對立：白晝能帶來毀滅，黑夜能提供安眠與保護，兩者共同構成完整戰甲。"], source: { label: "Equinox 官方戰甲頁", url: frame("equinox") } },
  { name: "Excalibur", sourceType: "Codex 記錄", epithet: "第一柄被拔出的 Orokin 之劍", summary: "Excalibur 是 Warframe 計畫最具代表性的劍士；一般型與 Umbra 並不是同一段人生。", paragraphs: ["普通 Excalibur 的官方資料主要描述其劍術與戰甲系譜，沒有《犧牲》那段 Dax 父親的記憶。本頁把兩者分開：只有 Excalibur Umbra 顯示 Umbra、Isaah 與 Ballas 的完整故事。"], source: { label: "Excalibur 官方戰甲頁", url: frame("excalibur") } },
  { name: "Frost", sourceType: "官方設定", epithet: "在冰封之中建立防線", summary: "Frost 操縱低溫與冰雪，以 Snow Globe 為隊伍劃出能夠固守的疆界。", paragraphs: ["目前遊戲沒有 Frost 的獨立人物任務；可確認內容來自 Codex 與官方角色設定。冰霜既是攻擊，也是把混亂暫時凍結、為同伴爭取時間的防禦方式。"], source: { label: "Frost 官方戰甲頁", url: frame("frost") } },
  { name: "Garuda", sourceType: "官方設定", epithet: "以鮮血維持力量的利爪", summary: "Garuda 的能力把生命、傷口與力量交換綁在一起。", paragraphs: ["玩家在 Orb Vallis 的索拉里斯委託中取得她的零件，但遊戲沒有明言那就是 Garuda 本人的生平。官方設定能確認的是她以鮮血為資源、以利爪完成處決的戰鬥身分。"], source: { label: "Garuda 官方戰甲頁", url: frame("garuda") } },
  { name: "Gyre", sourceType: "Codex 記錄", epithet: "Zariman 舞步留下的電弧", summary: "Gyre 的設計與 Zariman 上的舞者 Gyra 及其悲劇性傳聞相互映照。", paragraphs: ["她的部件由 Zariman 的 Holdfasts 委託取得。遊戲以零散記錄將旋轉舞步、電流與失落船艦連接，卻沒有把所有細節整理成一條單一任務；因此這裡保留 Codex 層級的說法。"], source: { label: "Gyre 官方戰甲頁", url: frame("gyre") } },
  { name: "Hildryn", sourceType: "官方設定", epithet: "以護盾代替能量的堡壘", summary: "Hildryn 把自己的護盾同時當作生命線、武器與隊伍防壁。", paragraphs: ["她與 Orb Vallis、Exploiter Orb 的取得流程相連，但遊戲沒有收錄一段獨立的 Hildryn 生平。官方角色頁將她定位為以護盾保護弱者並壓制敵人的重裝戰甲。"], source: { label: "Hildryn 官方戰甲頁", url: frame("hildryn") } },
  { name: "Hydroid", sourceType: "官方設定", epithet: "從深淵升起的海盜", summary: "Hydroid 以潮汐、暴雨與深海觸手塑造令人畏懼的掠奪者形象。", paragraphs: ["他的遊戲設定主要存在於 Codex 和官方角色頁，沒有獨立的具名歷史事件。這段資料因此聚焦於官方的海洋、深淵與船長意象。"], source: { label: "Hydroid 官方戰甲頁", url: frame("hydroid") } },
  { name: "Khora", sourceType: "Codex 記錄", epithet: "與 Venari 共同狩獵", summary: "Khora 與 Kavat Venari 是不可拆分的獵人搭檔。", paragraphs: ["Simaris 的 Sanctuary Onslaught 保存她的藍圖，但這是取得途徑，不等於完整生平。Codex 能確認的是她以鞭索束縛敵人，Venari 則在攻擊、保護與治療之間回應她。"], source: { label: "Khora 官方戰甲頁", url: frame("khora") } },
  { name: "Loki", sourceType: "官方設定", epithet: "從敵人視線中改寫戰局", summary: "Loki 不以正面火力取勝，而以隱形、誘餌、換位與繳械操縱認知。", paragraphs: ["遊戲尚未收錄 Loki 的個人任務故事；他的正式角色設定是一名欺敵者。這裡不替他虛構前世，只保留 Codex 所建立的詭計與匿蹤身分。"], source: { label: "Loki 官方戰甲頁", url: frame("loki") } },
  { name: "Mag", sourceType: "Prime 敘事", epithet: "以磁力扭轉戰場的軌道", summary: "Mag 操縱磁場、護盾與金屬，是 Orokin 戰甲工程最直接的力量展示之一。", paragraphs: ["Mag Prime 的官方敘事把她放回 Orokin 菁英戰士的脈絡；一般 Codex 則聚焦於磁力控制。現有資料沒有一段像 Umbra 那樣具名完整的個人傳記。"], source: { label: "Mag 官方戰甲頁", url: frame("mag") } },
  { name: "Mesa", sourceType: "任務故事", epithet: "被 Mutalist Alad V 操縱的槍手", summary: "《Patient Zero》中，Mesa 曾被 Infested 控制，成為 Alad V 用來對付 Tenno 的武器。", paragraphs: ["Tenno 追蹤 Mutalist Alad V 時遭遇受控的 Mesa。擊敗她並切斷控制，是任務裡最直接的戰甲遭感染利用案例之一；任務揭露的是她被俘後的一章，而非完整前世。"], source: { label: "Patient Zero 任務指南", url: guide("patient-zero") } },
  { name: "Nekros", sourceType: "官方設定", epithet: "讓死者再次回到戰場", summary: "Nekros 操縱恐懼、靈魂與屍骸，把敵人的死亡轉化為隊伍資源。", paragraphs: ["他的官方資料採死靈法師意象，未提供一段獨立人物任務。這裡呈現 Codex 可確認的死亡操控身分，不將 Nekros 的技能效果寫成虛構歷史。"], source: { label: "Nekros 官方戰甲頁", url: frame("nekros") } },
  { name: "Nidus", sourceType: "任務故事", epithet: "Helminth 感染被駕馭的形狀", summary: "Nidus 是 Warframe 與 Infestation 關係最赤裸的體現；《Glast Gambit》引導玩家取得他的藍圖。", paragraphs: ["Mycona 殖民地利用對 Infestation 的特殊關係生存，Nef Anyo 則把孩子 Neewa 當成賭局籌碼。任務並未說 Nidus 本人就是殖民地英雄，但它把他的取得與感染、免疫及道德選擇放在同一脈絡。"], source: { label: "The Glast Gambit 任務指南", url: guide("the-glast-gambit") } },
  { name: "Nyx", sourceType: "官方設定", epithet: "把敵人的意志變成戰場", summary: "Nyx 侵入感知、製造混亂並吸收火力，是以精神控制為核心的戰甲。", paragraphs: ["目前沒有 Nyx 的獨立個人任務。她與 Excalibur 的早期設計血緣可由外形看出，但遊戲內正式設定仍以心靈干涉能力為主。"], source: { label: "Nyx 官方戰甲頁", url: frame("nyx") } },
  { name: "Oberon", sourceType: "官方設定", epithet: "在自然與輻射間守護盟友", summary: "Oberon 將聖騎士與森林守護者意象合而為一。", paragraphs: ["治療、淨化與輻射控制共同構成他的官方身分。遊戲尚未提供一段具名生平，因此本頁以 Codex 設定呈現，不額外編造事件。"], source: { label: "Oberon 官方戰甲頁", url: frame("oberon") } },
  { name: "Octavia", sourceType: "任務故事", epithet: "用一首歌喚回 Suda", summary: "《Octavia's Anthem》中，Mandachord 的旋律帶 Tenno 進入 Cephalon Suda 的記憶。", paragraphs: ["Hunhow 的力量侵入 Suda，Tenno 與 Ordis 以 Octavia 的樂句追入數位空間。音樂不只是密碼或武器，也是 Suda 找回自我、抵抗抹除的記憶錨點。"], source: { label: "Octavia's Anthem 任務指南", url: guide("octavias-anthem") } },
  { name: "Qorvex", sourceType: "官方設定", epithet: "Albrecht 留給實驗室的混凝土守衛", summary: "Qorvex 由 Albrecht Entrati 設計，以厚重防護抵抗實驗室的輻射與未知威脅。", paragraphs: ["他不是從古戰爭傳說回歸的英雄，而是 Entrati 研究環境所需要的防護裝置。混凝土般的外殼、反應爐核心與輻射能力，都指向同一任務：保護被選中的操作者。"], source: { label: "Qorvex 官方戰甲頁", url: frame("qorvex") } },
  { name: "Rhino", sourceType: "Codex 記錄", epithet: "在 Zariman 孩子面前停下的暴獸", summary: "Rhino Prime Codex 記下一具失控戰甲標本闖出設施，卻在 Zariman 孩子附近突然安靜。", paragraphs: ["研究者逃離暴走標本時，把它引向保存 Zariman 倖存者的區域。那具野獸般的戰甲在孩子面前停住，讓 Orokin 看見 Transference 能夠控制 Warframe 的可能性；這則記錄是戰甲計畫轉折的重要碎片。"], source: { label: "Rhino Prime Codex／官方角色頁", url: frame("rhino") } },
  { name: "Saryn", sourceType: "Prime 敘事", epithet: "以致命毒素清除腐敗", summary: "Saryn Prime 的官方敘事由 Ballas 述說，把她描繪成以死亡換取淨化的新生命。", paragraphs: ["她的毒素不是溫柔的療法，而是 Orokin 對被污染世界提出的殘酷答案。Prime 敘事以花朵與劇毒並置，呈現 Saryn 同時代表凋零與再生。"], source: { label: "Saryn 官方戰甲頁", url: frame("saryn") } },
  { name: "Temple", sourceType: "任務故事", epithet: "Flare 與 Techrot 樂聲凝成的戰甲", summary: "Temple 的故事屬於 Warframe: 1999，與 Protoframe Flare、樂團和 Höllvania 的 Techrot 災變相連。", paragraphs: ["這套戰甲以音樂、火焰與感染時代的反抗形象存在。其人物線應與 1999 的 Flare 區分閱讀：一邊是可操控戰甲，一邊是承受同源力量與記憶的人。"], source: { label: "Warframe: 1999 官方頁", url: "https://www.warframe.com/1999" } },
  { name: "Trinity", sourceType: "官方設定", epithet: "把傷害轉化為隊伍的生命線", summary: "Trinity 以治療、能量回復與傷害連結維持整支隊伍。", paragraphs: ["遊戲沒有 Trinity 的獨立人物任務；她的 Codex 身分是支援與醫療專家。這裡保留官方設定，不把玩家在任務中的表現誤寫成她的古代生平。"], source: { label: "Trinity 官方戰甲頁", url: frame("trinity") } },
  { name: "Valkyr", sourceType: "Codex 記錄", epithet: "從 Zanuka 實驗中留下的怒火", summary: "Valkyr 被 Alad V 囚禁、剝離與實驗，她現今的狂怒來自 Zanuka Project 的折磨。", paragraphs: ["Gersemi 外觀保留她遭實驗前的形態；現代 Valkyr 身上的束具與傷痕則記錄 Corpus 改造。這不是抽象的狂戰士設定，而是遊戲明確留下的受害與倖存痕跡。"], source: { label: "Valkyr 官方戰甲頁", url: frame("valkyr") } },
  { name: "Vauban", sourceType: "官方設定", epithet: "為封鎖戰場而生的工程師", summary: "Vauban 使用陷阱、牽引與壓縮裝置，把敵軍困進自己設計的秩序。", paragraphs: ["官方設定常把他定位為對付 Corpus 的戰術工程師，但沒有具名個人任務。這裡以角色頁可確認的技術與控制身分呈現。"], source: { label: "Vauban 官方戰甲頁", url: frame("vauban") } },
  { name: "Volt", sourceType: "官方設定", epithet: "讓電流與速度穿過整支隊伍", summary: "Volt 操縱電能，既能高速突進，也能建立帶電護盾保護盟友。", paragraphs: ["作為早期可選戰甲之一，Volt 的遊戲內資料主要是戰鬥設定，沒有獨立傳記任務。本頁因此清楚標為官方角色設定。"], source: { label: "Volt 官方戰甲頁", url: frame("volt") } },
  { name: "Wisp", sourceType: "官方設定", epithet: "在次元縫隙間引來太陽之門", summary: "Wisp 跨越維度、召喚儲能池，並開啟通往太陽的傳送門灼燒敵人。", paragraphs: ["她的部件與 Jupiter 的 Ropalolyst 戰鬥相連，但遊戲沒有說那場戰鬥就是 Wisp 的個人歷史。可確認敘事集中於她幽靈般的次元存在與 Sol Gate。"], source: { label: "Wisp 官方戰甲頁", url: frame("wisp") } },
  { name: "Wukong", sourceType: "官方設定", epithet: "以分身與不死意志嘲弄死亡", summary: "Wukong 取材自古老地球神話中的猴王，以分身、長棍與多次逃死塑造頑強戰士。", paragraphs: ["遊戲沒有替 Wukong 收錄獨立個人任務。他的正式形象是神話原型在 Warframe 世界中的重構，因此本頁不另編 Orokin 時代事件。"], source: { label: "Wukong 官方戰甲頁", url: frame("wukong") } },
  { name: "Xaku", sourceType: "官方設定", epithet: "三名失落戰甲被 Void 拼回的殘響", summary: "Xaku 不是單一戰士，而是三具失落 Warframe 的殘骸被 Void 維繫成的新存在。", paragraphs: ["裂開的外殼、暴露的骨架與偷取武器的能力，都呼應這個複數身分。官方沒有完整說出三名前身的姓名與結局，未知本身就是 Xaku 故事的一部分。"], source: { label: "Xaku 官方戰甲頁", url: frame("xaku") } },
  { name: "Zephyr", sourceType: "官方設定", epithet: "把天空變成自己的戰場", summary: "Zephyr 以輕量結構、氣流與龍捲風長時間停留空中。", paragraphs: ["她的遊戲內設定聚焦於飛行與風暴，尚無獨立人物任務。這裡依官方角色頁呈現其空戰身分，不把取得方式或玩家行動誤作角色傳記。"], source: { label: "Zephyr 官方戰甲頁", url: frame("zephyr") } },
];

export const warframeCanonProfileMap = new Map(
  warframeCanonProfiles.map((profile) => [profile.name.toLowerCase().replace(/[^a-z0-9]/g, ""), profile]),
);

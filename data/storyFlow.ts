export type StoryKind = "歷史背景" | "主線" | "關鍵支線" | "最新章節";

export type StoryStep = {
  id: string;
  title: string;
  englishTitle: string;
  kind: StoryKind;
  prerequisite: string;
  unlock: string;
  summary: string;
  spoilers: string[];
  note?: string;
};

export type StoryArc = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  era: string;
  summary: string;
  steps: StoryStep[];
};

export const STORY_UPDATED_AT = "2026.08.24";

export const storyArcs: StoryArc[] = [
  {
    id: "before-awakening",
    number: "00",
    kicker: "世界歷史",
    title: "夢醒之前",
    era: "遠古・Orokin 時代 → Tenno 長眠",
    summary:
      "這一段不是可接取的任務，而是散落在主線、資料庫條目與限時事件中的遠古背景。先知道名詞，之後的真相會更容易拼起來。",
    steps: [
      {
        id: "orokin-and-void",
        title: "Orokin 帝國與虛空",
        englishTitle: "The Orokin Empire & the Void",
        kind: "歷史背景",
        prerequisite: "背景設定｜非任務",
        unlock: "理解帝國、Entrati 與科技根源",
        summary:
          "Orokin 以生物科技、轉移與虛空研究建立帝國；他們的繁榮，同時埋下了往後所有災難的種子。",
        spoilers: [
          "Albrecht Entrati 的虛空實驗讓帝國接觸到一個會回望觀察者的存在；往後的「牆中人」與 Void War 都從這裡延伸。",
          "帝國把身體、記憶與生命視為可替換資源，這種權力結構也塑造了 Warframe、Dax 與 Tenno 的命運。",
        ],
      },
      {
        id: "zariman",
        title: "Zariman Ten Zero 事故",
        englishTitle: "The Zariman Ten Zero Incident",
        kind: "歷史背景",
        prerequisite: "背景設定｜主線逐步揭露",
        unlock: "理解 Tenno、Operator 與 Drifter",
        summary:
          "一艘殖民船在虛空中失事，倖存的孩子成為帝國既畏懼又需要的力量。",
        spoilers: [
          "孩子們因虛空獲得能力；不同選擇與可能性，最終形成 Operator 與 Drifter 兩條彼此交會的生命路徑。",
          "Margulis 試圖保護孩子，Orokin 卻把他們改造成可操控 Warframe 的武器。",
        ],
      },
      {
        id: "old-war",
        title: "Sentient 與遠古之戰",
        englishTitle: "The Sentients & the Old War",
        kind: "歷史背景",
        prerequisite: "背景設定｜The Second Dream 後逐步揭露",
        unlock: "理解 Tau、Lotus 與 Tenno 的誕生",
        summary:
          "Orokin 創造 Sentient 前往 Tau 改造世界；造物回頭反抗造主，遠古之戰席捲整個始源星系。",
        spoilers: [
          "Sentient 回到始源星系後幾乎擊敗 Orokin，直到 Tenno 以 Warframe 參戰，才改變戰局。",
          "Natah 原本肩負滲透與摧毀 Tenno 的任務，卻成為 Lotus，選擇把 Tenno 隱藏起來。",
        ],
      },
      {
        id: "betrayal",
        title: "背叛與長夢",
        englishTitle: "The Betrayal & the Long Dream",
        kind: "歷史背景",
        prerequisite: "背景設定｜The Second Dream／The Sacrifice",
        unlock: "接到現代故事的起點",
        summary:
          "Orokin 勝利儀式後帝國迅速崩解，Tenno 被 Lotus 送入長眠；Grineer 與 Corpus 則在廢墟上成為新霸權。",
        spoilers: [
          "Tenno 在 Natah、Lotus 與其他勢力的推動下反抗 Orokin；真相並不是單一人物的一次背叛。",
          "Warframe 並非單純機器。The Sacrifice 會補上 Umbra、Helminth 病毒與「轉移」之間最關鍵的一塊。",
        ],
      },
    ],
  },
  {
    id: "awakening",
    number: "01",
    kicker: "官方 Arc 1",
    title: "覺醒與始源星系",
    era: "地球 → 火星／火衛二",
    summary:
      "先學會生存、打開星圖，並認識 Grineer、Corpus、Infested 與幾個會陪你走到終局的家族。",
    steps: [
      {
        id: "awakening-quest",
        title: "覺醒",
        englishTitle: "Awakening",
        kind: "主線",
        prerequisite: "建立角色後自動開始",
        unlock: "基礎移動、戰鬥與第一套裝備",
        summary:
          "沉睡已久的 Tenno 被喚醒；Lotus 引導你逃離 Grineer 將軍 Vor 的控制。",
        spoilers: [
          "你目前看見的「Tenno」身分只是故事刻意保留的表面答案，真正的操作者要到 The Second Dream 才會揭露。",
        ],
      },
      {
        id: "vors-prize",
        title: "Vor 的戰利品",
        englishTitle: "Vor's Prize",
        kind: "主線",
        prerequisite: "完成教學",
        unlock: "軌道飛行器、鑄造廠、Mod 與自由星圖",
        summary:
          "解除 Vor 植入的控制裝置，修復自己的 Orbiter，正式踏上始源星系。",
        spoilers: [
          "Vor 對 Orokin 與虛空力量的執著不會在這裡結束；他之後會以另一種形式出現在虛空。",
        ],
      },
      {
        id: "sayas-vigil",
        title: "Saya 的守夜",
        englishTitle: "Saya's Vigil",
        kind: "主線",
        prerequisite: "完成 Vor's Prize，造訪地球 Cetus",
        unlock: "夜靈平野、Ostron／Quills 故事入口",
        summary:
          "協助 Saya 尋找失蹤已久的丈夫 Onkko，第一次接觸夜靈平野與 Unum 的祕密。",
        spoilers: [
          "Onkko 並非單純失蹤；他因看見多種未來而選擇離開 Saya，加入 Quills 並保護更大的因果走向。",
        ],
      },
      {
        id: "vox-solaris",
        title: "索拉里斯之聲",
        englishTitle: "Vox Solaris",
        kind: "主線",
        prerequisite: "抵達金星 Fortuna",
        unlock: "Orb Vallis、Solaris United 與債役制度背景",
        summary:
          "在 Nef Anyo 的債務殖民地裡協助 Eudico，認識 Corpus 統治下的日常代價。",
        spoilers: [
          "Solaris 工人可被回收身體部位、扣押頭顱與人格；Vox Solaris 是他們反抗 Corpus 的地下網路。",
        ],
      },
      {
        id: "once-awake",
        title: "一朝醒來",
        englishTitle: "Once Awake",
        kind: "主線",
        prerequisite: "依金星／水星交會點指引開啟",
        unlock: "Infested 威脅與後續星圖",
        summary:
          "Grineer 的生物武器實驗喚醒 Infested；你第一次正面理解感染者不是普通敵軍。",
        spoilers: [
          "Infestation 會吞噬生物與機械並重組意識；它與製造 Warframe 的 Helminth 菌株有密切但不完全相同的關係。",
        ],
      },
      {
        id: "heart-of-deimos",
        title: "火衛二之心",
        englishTitle: "Heart of Deimos",
        kind: "主線",
        prerequisite: "開啟火衛二並完成星圖提示",
        unlock: "Necralisk、Entrati、Helminth 與 Necramech",
        summary:
          "進入被感染吞噬的 Entrati 家族領地，維持驅動虛空科技的 Heart 運作。",
        spoilers: [
          "Entrati 家族彼此傷害卻仍共同守住 Heart；這個家族與 Albrecht 的研究，會在 Whispers in the Walls 成為主線核心。",
          "完成後可逐步取得 Necramech；它也是進入 The New War 前必須準備的裝備之一。",
        ],
      },
      {
        id: "the-archwing",
        title: "曲翼",
        englishTitle: "The Archwing",
        kind: "主線",
        prerequisite: "完成 Once Awake 並推進火星路線",
        unlock: "太空任務、Archwing 系統",
        summary:
          "打造 Archwing，從行星地表走向太空戰場，也為日後 Railjack 戰鬥建立基礎。",
        spoilers: [
          "任務本身以系統解鎖為主，但它讓 Tenno 能介入 Fomorian、深空與之後的 Railjack 衝突。",
        ],
      },
    ],
  },
  {
    id: "war-within",
    number: "02",
    kicker: "官方 Arc 2",
    title: "內戰傳奇",
    era: "天王星 → Lua → Kuva 要塞",
    summary:
      "這是 Warframe 身分揭密的核心段落。若只想先追主線，請一路完成到 The Sacrifice。",
    steps: [
      {
        id: "natah",
        title: "Natah",
        englishTitle: "Natah",
        kind: "主線",
        prerequisite: "抵達天王星並調查異常無人機",
        unlock: "Sentient、Hunhow 與 Lotus 身世",
        summary:
          "天王星深海出現不該甦醒的訊號，Lotus 的過去開始追上現在。",
        spoilers: [
          "Lotus 原名 Natah，是 Sentient 領袖 Hunhow 的女兒；她被派來滲透 Orokin 並消滅 Tenno。",
          "她最終沒有完成任務，而是以 Lotus 的身分讓 Tenno 進入長夢。",
        ],
      },
      {
        id: "second-dream",
        title: "第二場夢",
        englishTitle: "The Second Dream",
        kind: "主線",
        prerequisite: "完成 Natah 並推進至海王星路線",
        unlock: "Operator、Lua 與 Focus",
        summary:
          "Stalker 與 Hunhow 追查 Tenno 真相；你將第一次真正回答「我究竟是誰」。",
        spoilers: [
          "Warframe 是被遠端「轉移」操控的載體，真正的 Tenno 是藏在 Lua 儲藏室中的 Zariman 孩子。",
          "Lotus 把 Lua 藏進虛空以保護孩子；任務結尾 Operator 被帶回 Orbiter。",
        ],
      },
      {
        id: "rising-tide",
        title: "澎湃狂潮",
        englishTitle: "Rising Tide",
        kind: "主線",
        prerequisite: "完成 The Second Dream，依任務指引重建 Railjack",
        unlock: "Railjack、Cephalon Cy",
        summary:
          "找回 Old War 時代的 Railjack 殘骸，與 Cephalon Cy 重建能進行深空作戰的戰艦。",
        spoilers: [
          "Cy 曾在 Old War 失去船員，對再次指揮艦艇充滿創傷；修復 Railjack 也是 The New War 的實際前置。",
        ],
        note: "系統上可較早完成；敘事上可把它視為 The New War 的備戰章。",
      },
      {
        id: "the-war-within",
        title: "內戰",
        englishTitle: "The War Within",
        kind: "主線",
        prerequisite: "完成 The Second Dream 與 Sedna 交會點",
        unlock: "完整 Operator 能力、Kuva 要塞與 Queens",
        summary:
          "Grineer 雙子女皇盯上你的身體；Tenno 必須不靠 Warframe 面對恐懼與控制。",
        spoilers: [
          "女皇企圖用 Continuity 奪取 Operator 身體；你在 Teshin 引導下重新掌握轉移與虛空能力。",
          "任務揭露 Teshin 受 Kuva 與 Dax 誓約束縛，也讓玩家的選擇傾向首次被明確記錄。",
        ],
      },
      {
        id: "chains-of-harrow",
        title: "Harrow 的枷鎖",
        englishTitle: "Chains of Harrow",
        kind: "主線",
        prerequisite: "完成 The War Within 並通過 Mot（Void）",
        unlock: "Rell、Red Veil 與牆中人",
        summary:
          "一段來自廢棄飛船的求救訊號，把你帶進 Rell 長年獨自承受的噩夢。",
        spoilers: [
          "Rell 是被其他 Zariman 孩子排斥的 Tenno；他把自己束縛於 Harrow，長久壓制牆中人對現實的侵入。",
          "釋放 Rell 後，牆中人的注意力轉向玩家；那聲「Hey, kiddo」成為後續 Void War 的陰影。",
        ],
      },
      {
        id: "apostasy-prologue",
        title: "背叛序幕",
        englishTitle: "Apostasy Prologue",
        kind: "主線",
        prerequisite: "完成 Chains of Harrow，調查 Orbiter 私人房間",
        unlock: "Lotus 失蹤與下一段主線",
        summary:
          "一段短而關鍵的敘事序幕：某位熟悉的人回來，Lotus 做出無法忽視的選擇。",
        spoilers: [
          "Ballas 現身並帶走 Lotus；她重新以 Sentient 的 Natah 形象出現，Tenno 失去一直以來的引導者。",
        ],
      },
      {
        id: "the-sacrifice",
        title: "犧牲",
        englishTitle: "The Sacrifice",
        kind: "主線",
        prerequisite: "完成 Apostasy Prologue",
        unlock: "Excalibur Umbra、Warframe 起源真相",
        summary:
          "追查一具保有記憶的 Warframe，從他的痛苦中看見 Ballas 與 Warframe 計畫的本質。",
        spoilers: [
          "Umbra 原是被 Ballas 強迫感染的 Dax；Ballas讓他永遠記得自己親手殺死兒子的瞬間。",
          "Operator 並不是抹除 Warframe 的痛苦，而是與它共同承受；這也解釋了轉移能安撫某些 Warframe 意識。",
        ],
      },
    ],
  },
  {
    id: "new-war",
    number: "03",
    kicker: "官方 Arc 3",
    title: "新世戰爭",
    era: "序幕 → Narmer → Zariman／Duviri",
    summary:
      "Sentient 戰爭真正降臨。這一章會重整始源星系，也讓 Operator、Drifter 與 Lotus 的關係走到新階段。",
    steps: [
      {
        id: "prelude-to-war",
        title: "戰爭序幕",
        englishTitle: "Prelude to War",
        kind: "主線",
        prerequisite: "完成 The Sacrifice",
        unlock: "Chimera Prologue、Erra、The Maker",
        summary:
          "三段短篇把 Ballas、Natah、Erra 與 Sentient 艦隊推到全面戰爭前夜。",
        spoilers: [
          "Ballas 表面受 Sentient 控制，實際一直操弄 Natah 與 Erra；Paracesis 則被打造為對 Sentient 的武器。",
          "Natah 的記憶與忠誠遭反覆改寫，The New War 的衝突不只是陣營對戰，也是身分與操控。",
        ],
      },
      {
        id: "the-new-war",
        title: "新世戰爭",
        englishTitle: "The New War",
        kind: "主線",
        prerequisite: "完成 Prelude to War，持有 Railjack 與 Necramech",
        unlock: "Drifter、Narmer 後續與新星圖狀態",
        summary:
          "Sentient 入侵始源星系。這是一段會暫時鎖定其他活動的長篇電影式任務，開始前請先準備時間。",
        spoilers: [
          "Ballas 以 Narmer 面紗統治星系，並背叛幾乎所有盟友；Operator 被投入虛空，Drifter 則在另一條可能性中行動。",
          "Operator 與 Drifter 在 Zariman 相遇並共享可能性。結尾由玩家決定 Lotus／Natah／Margulis 的顯示身分。",
          "牆中人以巨大的 Vitruvian 形象出現，將戰爭主軸從 Sentient 推向更深的虛空危機。",
        ],
      },
      {
        id: "angels-of-zariman",
        title: "Zariman 的天使",
        englishTitle: "Angels of the Zariman",
        kind: "關鍵支線",
        prerequisite: "完成 The New War",
        unlock: "Chrysalith、Holdfasts、Voidplume 與更多 Zariman 真相",
        summary:
          "回到一切開始的殖民船；仍留在船上的人與虛空天使，讓 Zariman 事故不再只是回憶。",
        spoilers: [
          "Holdfasts 是由虛空與記憶維繫的存在；玩家協助他們抵抗被 Void Angel 吞噬與遺忘。",
          "Zariman 卡在現實與虛空之間，成為阻擋牆中人進一步侵入的關鍵楔子。",
        ],
      },
      {
        id: "veilbreaker",
        title: "破冪者",
        englishTitle: "Veilbreaker",
        kind: "關鍵支線",
        prerequisite: "完成 The New War",
        unlock: "Kahl 駐軍與 Narmer 戰後支線",
        summary:
          "從 Kahl-175 的視角清理 Narmer 殘黨，補上普通士兵在大戰後如何活下來。",
        spoilers: [
          "Kahl 脫離面紗後選擇營救不同陣營的「兄弟」，並與 Daughter 建立出意外務實的合作。",
        ],
      },
      {
        id: "jade-shadows",
        title: "翠玉魅影",
        englishTitle: "Jade Shadows",
        kind: "主線",
        prerequisite: "完成 The New War",
        unlock: "Stalker／Jade 故事與 Ascension",
        summary:
          "短篇電影任務轉向 Stalker；長年追殺 Tenno 的敵人，也有一段被 Orokin 摧毀的人生。",
        spoilers: [
          "Jade 與 Sorren（Stalker）曾是相愛的 Orokin 時代人物，兩人因禁忌關係受罰並成為 Warframe。",
          "Jade 犧牲自己誕下孩子 Sirius／Orion；Hunhow 與 Tenno 都在這段故事中暫時放下敵意。",
        ],
      },
      {
        id: "duviri-paradox",
        title: "雙衍悖論",
        englishTitle: "The Duviri Paradox",
        kind: "主線",
        prerequisite: "天王星交會點後可開啟；進入 The Hex 前必須完成",
        unlock: "Duviri、Drifter、Circuit 與悖論背景",
        summary:
          "玩法上能較早進入；若想保留身分揭密，建議在 The New War 後遊玩，會更容易理解 Drifter 的位置。",
        spoilers: [
          "Duviri 是 Drifter 在虛空中以情緒與《Tales of Duviri》塑造的世界；Dominus Thrax 映照其被困住的自我。",
          "任務結尾的援手與 The New War 中 Drifter 幫助 Operator 的事件互相閉合，形成悖論。",
        ],
        note: "官方指南把它列在 Arc 3；目前可於土星的天王星交會點解鎖後接取。",
      },
    ],
  },
  {
    id: "void-war",
    number: "04",
    kicker: "官方 Arc 4",
    title: "虛空戰爭與 1999",
    era: "Sanctum Anatomica → 1999 Höllvania",
    summary:
      "Albrecht Entrati 的失蹤、牆中人的追逐與 1999 年交會。這是目前主線通往未來 Tau 篇章的最前線。",
    steps: [
      {
        id: "whispers-in-the-walls",
        title: "牆中低語",
        englishTitle: "Whispers in the Walls",
        kind: "主線",
        prerequisite: "完成 Heart of Deimos 與 The New War",
        unlock: "Sanctum Anatomica、Cavia、Murmur",
        summary:
          "Entrati 家族收到 Albrecht 的訊號；你深入地下實驗室，尋找他留下的時間與虛空計畫。",
        spoilers: [
          "Albrecht 為躲避牆中人前往 1999，留下 Kalymos Sequence 與大型時間裝置。",
          "Loid 對 Albrecht 的感情與被遺留的傷痕，成為啟動後續計畫的核心；牆中人則試圖用「冷漠」切斷連結。",
        ],
      },
      {
        id: "lotus-eaters",
        title: "食蓮者",
        englishTitle: "The Lotus Eaters",
        kind: "主線",
        prerequisite: "完成 Whispers in the Walls",
        unlock: "The Hex 前導",
        summary:
          "一段沒有戰鬥的短篇序幕；Lotus 聽見來自 1999 的呼喚，Drifter 準備跨越時間。",
        spoilers: [
          "Lotus 感受到牆中人的威脅並指引 Drifter 前往 1999；這段任務直接銜接 The Hex。",
        ],
      },
      {
        id: "the-hex",
        title: "六煞",
        englishTitle: "The Hex",
        kind: "主線",
        prerequisite: "完成 The Lotus Eaters 與 The Duviri Paradox",
        unlock: "Höllvania、Hex Syndicate、KIM 與 Atomicycle",
        summary:
          "Drifter 回到 1999，與六名 Protoframe 合作，試圖阻止一場早已注定失敗的災難。",
        spoilers: [
          "Albrecht 把 Protoframe 與 Techrot 危機留在 1999，Drifter 必須透過關係與時間循環找到不同結局。",
          "第一次任務結局無法救下所有人；完成後推進 Hex 聲望與 Chemistry，才能走向 Finale。",
        ],
      },
      {
        id: "hex-finale",
        title: "六煞終章",
        englishTitle: "The Hex Finale",
        kind: "最新章節",
        prerequisite: "完成 The Hex，依 KIM、Chemistry 與 Syndicate 提示推進",
        unlock: "1999 完整結局與後續 KIM 故事",
        summary:
          "把與 Hex 建立的連結帶回關鍵時刻；這不是單純提高數值，而是 The Hex 真正的收束。",
        spoilers: [
          "Drifter 以理解每位成員的恐懼與選擇改寫失敗循環，讓團隊在跨年事件中存活。",
          "這段結局為後續 1999 對話、關係故事與 Fables & Frontiers 奠定狀態。",
        ],
        note: "遊戲會顯示尚缺的條件；先把 Hex Syndicate 與 KIM 關係穩定推進即可。",
      },
    ],
  },
];

export const sideStories = [
  {
    era: "Arc 1 前後",
    title: "庫狛取得任務",
    englishTitle: "Howl of the Kubrow",
    insertAfter: "Vor's Prize 後",
    focus: "取得第一隻 Kubrow，也補充 Orokin 生物設計與同伴系統。",
  },
  {
    era: "早期星圖",
    title: "失竊之夢",
    englishTitle: "Stolen Dreams",
    insertAfter: "火星／火衛一階段",
    focus: "Maroo、奧秘與 Orokin 遺物；可接到 The New Strange。",
  },
  {
    era: "早期星圖",
    title: "新疑謎團",
    englishTitle: "The New Strange",
    insertAfter: "Stolen Dreams 後",
    focus: "Cephalon Simaris、Sanctuary 與 Chroma 的早期線索。",
  },
  {
    era: "早期星圖",
    title: "寡言的男人",
    englishTitle: "A Man of Few Words",
    insertAfter: "抵達中繼站後",
    focus: "Darvo 與 Clem 的 Grineer 逃亡小故事。",
  },
  {
    era: "Infested",
    title: "零號病患",
    englishTitle: "Patient Zero",
    insertAfter: "Once Awake 後",
    focus: "Mutalist Alad V 與 Infestation 事件鏈的可重玩核心。",
  },
  {
    era: "Warframe 傳說",
    title: "Limbo 定理",
    englishTitle: "The Limbo Theorem",
    insertAfter: "取得 Archwing 後",
    focus: "Limbo 的裂隙實驗與一次致命計算錯誤。",
  },
  {
    era: "Warframe 傳說",
    title: "隱藏的信息",
    englishTitle: "Hidden Messages",
    insertAfter: "中期星圖",
    focus: "從謎語追索 Mirage 在 Old War 的最後一戰。",
  },
  {
    era: "Warframe 傳說",
    title: "Inaros 之沙",
    englishTitle: "Sands of Inaros",
    insertAfter: "拜訪 Baro Ki'Teer 後",
    focus: "火星居民、Baro 身世與守護者 Inaros 的傳說。",
  },
  {
    era: "Warframe 傳說",
    title: "銀光林地",
    englishTitle: "The Silver Grove",
    insertAfter: "The Second Dream 前後",
    focus: "New Loka、Titania 與地球生態重生的真相。",
  },
  {
    era: "Cephalon／Sentient",
    title: "Octavia 的讚歌",
    englishTitle: "Octavia's Anthem",
    insertAfter: "The Second Dream 後",
    focus: "Cephalon Suda、Hunhow 與以音樂對抗 Sentient 的故事。",
  },
  {
    era: "Corpus／殖民地",
    title: "Glast 的千鈞一策",
    englishTitle: "The Glast Gambit",
    insertAfter: "The War Within 前後",
    focus: "Mycona 殖民地、Nef Anyo 與感染免疫兒童的倫理選擇。",
  },
  {
    era: "Infested",
    title: "Jordas 樞律",
    englishTitle: "The Jordas Precept",
    insertAfter: "中後期星圖",
    focus: "遭 Infestation 吞噬的 Cephalon 與巨型感染體。",
  },
  {
    era: "夜靈平野",
    title: "Revenant 的面具",
    englishTitle: "Mask of the Revenant",
    insertAfter: "Saya's Vigil 並提高 Quills 聲望後",
    focus: "Unum、Eidolon 與 Revenant 如何被其力量改變。",
  },
  {
    era: "Corpus",
    title: "僵局協議",
    englishTitle: "The Deadlock Protocol",
    insertAfter: "The War Within 前後",
    focus: "Corpus 創辦者 Parvos Granum、Protea 與 Granum Void；建議在 The New War 前完成。",
  },
  {
    era: "Railjack",
    title: "暴風雨的呼喚",
    englishTitle: "Call of the Tempestarii",
    insertAfter: "Rising Tide 後",
    focus: "Sevagoth、Tempestarii 與 Corpus 深空戰線。",
  },
  {
    era: "Orb Vallis",
    title: "浪潮騎士",
    englishTitle: "The Waverider",
    insertAfter: "Vox Solaris 後",
    focus: "Ventkids、Yareli 與 K-Drive 文化。",
  },
  {
    era: "地球",
    title: "Koumei 與五命運",
    englishTitle: "Koumei & the Five Fates",
    insertAfter: "Saya's Vigil 後",
    focus: "Cetus、命運絲線與 Infested Oni 的獨立篇章。",
  },
] as const;

export const retiredLore = [
  {
    title: "Gradivus Dilemma",
    status: "歷史事件・無法完整重玩",
    summary:
      "Grineer 與 Corpus 爭奪火星，Tenno 被迫選邊；這也是 Alad V、Sargas Ruk 與陣營力量轉變的重要節點。",
  },
  {
    title: "Alad V 事件鏈",
    status: "部分只剩首領與任務殘片",
    summary:
      "從 Hunt for Alad V、Patient Zero、Tubemen of Regor 到 Shadow Debt，解釋 Alad V 為何感染、治癒，又與 Sentient 產生聯繫。",
  },
  {
    title: "Cicero Crisis → Eyes of Blight",
    status: "歷史事件・部分週期玩法保留",
    summary:
      "Vay Hek 的地球破壞與 Fomorian 襲擊建立了中繼站戰爭背景；Vesper Relay 的命運也與 2026 的 The Shadowgrapher 呼應。",
  },
  {
    title: "Scarlet Spear",
    status: "歷史事件・無法完整重玩",
    summary:
      "Tenno 與 Little Duck 協同地面、太空小隊抵抗 Sentient 入侵，是 The New War 前最直接的戰爭升溫。",
  },
  {
    title: "Operation: Orphix Venom",
    status: "劇情事件已結束・玩法概念保留",
    summary:
      "Sentient 以 Orphix 壓制 Warframe，迫使 Tenno 倚賴 Necramech；替 The New War 的裝備與戰術前置提供背景。",
  },
] as const;

export const currentBranches = [
  {
    title: "遠古和平",
    englishTitle: "The Old Peace",
    date: "2025.12.10",
    kind: "最新電影主線",
    prerequisite: "至少完成 The Lotus Eaters（其前置為 Whispers in the Walls）",
    placement: "在 Dark Refractory 中回看 Old War；通往未來 Tau 篇章",
    summary:
      "親歷 Orokin 與 Sentient 脆弱和平崩解的記憶，揭露玩家在遠古戰爭中被遺忘的角色。",
    sourceUrl: "https://www.warframe.com/en/news/the-old-peace-available-now",
  },
  {
    title: "暗影繪師",
    englishTitle: "The Shadowgrapher",
    date: "2026.03.25",
    kind: "最新獨立故事",
    prerequisite: "完成 The War Within",
    placement: "可在主線中期後遊玩；內容回望 Vesper Relay 與歷史事件",
    summary:
      "以新的角度追索一段被戰爭與影像留下的記憶，補上中繼站和 Tenno 過往的斷層。",
    sourceUrl: "https://www.warframe.com/en/news/the-shadowgrapher-available-now",
  },
  {
    title: "翠玉魅影：星座",
    englishTitle: "Jade Shadows: Constellations",
    date: "2026.06.17",
    kind: "Jade 後日談",
    prerequisite: "完成 Jade Shadows",
    placement: "建議緊接 Jade Shadows",
    summary:
      "延續 Stalker、孩子與 Jade 的故事，並開啟 Uranus Proxima 的 Pontis Tower 內容。",
    sourceUrl: "https://www.warframe.com/en/patch-notes/pc/43-0-0",
  },
  {
    title: "寓言與前線：遲到了",
    englishTitle: "Fables & Frontiers: Running Late",
    date: "2026.08.12",
    kind: "Hex KIM 後日談",
    prerequisite:
      "完成 The Hex 與 Hex Finale、Hex Syndicate Rank 5，並與 Amir 達 Chemistry Rank 5",
    placement: "Hex Finale 後；六天 KIM 文字冒險，每日一段",
    summary:
      "由 Amir 擔任 Fablemaster，與 Hex 成員進行一場永久保留、可重玩的桌上角色扮演式 KIM 小故事。",
    sourceUrl: "https://www.warframe.com/en/patch-notes/pc/43-5-0",
  },
] as const;

export const officialSources = [
  {
    label: "Warframe 官方任務指南",
    url: "https://www.warframe.com/en/guides/quests",
    description: "四大主線 Arc 與目前官方建議順序",
  },
  {
    label: "The Duviri Paradox 官方指南",
    url: "https://www.warframe.com/en/guides/quests/the-duviri-paradox",
    description: "目前解鎖位置與 The Hex 前置說明",
  },
  {
    label: "The Old Peace 官方公告",
    url: "https://www.warframe.com/en/news/the-old-peace-available-now",
    description: "最新電影任務與 The Lotus Eaters 前置",
  },
  {
    label: "The Shadowgrapher 官方公告",
    url: "https://www.warframe.com/en/news/the-shadowgrapher-available-now",
    description: "2026 獨立故事與 The War Within 前置",
  },
  {
    label: "Update 43.5 官方更新說明",
    url: "https://www.warframe.com/en/patch-notes/pc/43-5-0",
    description: "Fables & Frontiers 完整解鎖條件",
  },
] as const;

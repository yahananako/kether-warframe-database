export type SideStory = {
  slug: string; title: string; englishTitle: string; period: string;
  deck: string; paragraphs: readonly string[]; characters: readonly string[];
  meaning: string; source: string;
};

export type SideStoryEra = {
  slug: string; number: string; title: string; englishTitle: string;
  era: string; deck: string; accent: string; heroImage: string; stories: readonly SideStory[];
};

const guide = (slug: string) => `https://www.warframe.com/en/guides/quests/${slug}`;

export const sideStoryEras: readonly SideStoryEra[] = [
  {
    slug: "early-origin-system", number: "I", title: "甦醒後的星系", englishTitle: "THE AWAKENING ERA",
    era: "Tenno 甦醒初期", accent: "#55b8d1", heroImage: "https://www-static.warframe.com/images/guide/quests/vor-key.jpg",
    deck: "Tenno 一面修復力量，一面從失竊的遺物、感染者與失落 Warframe 身上，拼回 Orokin 滅亡後的世界。",
    stories: [
      { slug: "howl-of-the-kubrow", title: "庫狛取得任務", englishTitle: "HOWL OF THE KUBROW", period: "Tenno 甦醒初期", deck: "一枚庫狛蛋與 Orokin 培育技術，讓 Orbiter 第一次多出一個會呼吸的同伴。", paragraphs: ["Tenno 從地球森林取得庫狛蛋，尋找孵化器模組並重建早已失傳的培育程序。這不是單純取得寵物：庫狛曾被 Orokin 改造成戰場同伴，帝國消失後，野生族群重新適應地球。", "當幼獸完成孵化與戰鬥試煉，Orbiter 不再只是兵器倉庫。這段小故事替 Tenno 的孤獨生活加入陪伴，也開啟後續所有同伴系統的情感起點。"], characters: ["Tenno", "Lotus", "庫狛"], meaning: "在滿是人造兵器的星系裡，照顧另一個生命本身就是重建自我的方式。", source: guide("howl-of-the-kubrow") },
      { slug: "stolen-dreams", title: "失竊之夢", englishTitle: "STOLEN DREAMS", period: "火星・Phobos 遺跡", deck: "Maroo 偷走一件 Orokin Arcane Codex，卻因此被 Grineer 與神秘訊息同時盯上。", paragraphs: ["Lotus 要求 Tenno 追捕小偷 Maroo。她熟悉遺跡、陷阱與黑市，最初只想把 Codex 換成足以逃離追殺的報酬。", "Codex 拼出的訊息指向一具沉睡於冰層下的存在，為 The New Strange 埋下伏筆。Maroo 最終沒有成為囚犯，而以自己的方式加入 Tenno 的世界。"], characters: ["Maroo", "Lotus", "Tenno"], meaning: "被帝國留下的知識不會安靜沉睡；每一件遺物都可能是下一場甦醒的鑰匙。", source: guide("stolen-dreams") },
      { slug: "the-new-strange", title: "新疑謎團", englishTitle: "THE NEW STRANGE", period: "Cephalon Simaris 的聖殿", deck: "Simaris 要求 Tenno 合成目標，失落的 Chroma 卻開始主動追獵調查者。", paragraphs: ["Cephalon Simaris 相信保存資料高於個體意志，要求 Tenno 使用 Synthesis 掃描生命。調查逐漸指向一具被外力控制的 Chroma。", "Ordis 與 Simaris 對生命價值的衝突，讓任務不只是一場追蹤。Tenno 最終切斷控制訊號，也看見 Cephalon 對記憶、秩序與自由的不同答案。"], characters: ["Cephalon Simaris", "Ordis", "Chroma", "Tenno"], meaning: "保存一個生命的資料，並不等於理解或尊重那個生命。", source: guide("the-new-strange") },
      { slug: "a-man-of-few-words", title: "寡言的男人", englishTitle: "A MAN OF FEW WORDS", period: "Grineer 軍事設施", deck: "Darvo 為了救出 Clem，把 Tenno 拉進一場荒唐卻真誠的營救。", paragraphs: ["Clem 是具有缺陷、也因此逃離集體命令的 Grineer 複製人。Darvo 不把他當可替換士兵，而是朋友。", "Tenno 闖入監獄、取回 Clem 的雙槍並並肩作戰。這段喜劇支線悄悄證明：Grineer 的基因與命令無法完全抹去個體。"], characters: ["Clem", "Darvo", "Tenno"], meaning: "一句話很少的人，也能用選擇證明自己不是帝國的消耗品。", source: guide("a-man-of-few-words") },
      { slug: "patient-zero", title: "零號病患", englishTitle: "PATIENT ZERO", period: "Infested Outbreak", deck: "Alad V 以感染重塑力量，卻讓整片星區成為 Mutalist 實驗場。", paragraphs: ["失勢的 Alad V 轉向 Infestation，企圖創造能控制 Warframe 的 Mutalist 技術。他把感染視為復出的工具，也把部下與殖民地當成試驗材料。", "Tenno 追蹤感染節點並擊敗 Mutalist Alad V。事件沒有洗去他的野心，卻成為他日後求助 Tenno、介入更大戰爭的重要轉折。"], characters: ["Alad V", "Lotus", "Tenno"], meaning: "Alad V 總把生命當商品；感染只是他換上的另一種貨幣。", source: guide("patient-zero") },
    ],
  },
  {
    slug: "lost-warframes", number: "II", title: "失落戰甲的記憶", englishTitle: "LEGENDS OF THE LOST",
    era: "星圖擴張期", accent: "#c99b56", heroImage: "https://www-static.warframe.com/images/guide/quests/sacrifice-key.jpg", deck: "散落星系的 Warframe 藍圖不是獎品清單，而是一群被帝國利用、敬畏或遺忘的生命墓誌。",
    stories: [
      { slug: "the-limbo-theorem", title: "Limbo 定理", englishTitle: "THE LIMBO THEOREM", period: "裂隙數學遺跡", deck: "一套散落的證明式，記錄 Limbo 如何跨越裂隙，又如何在最後一次計算中粉身碎骨。", paragraphs: ["Ordis 解析 Limbo 留下的數學定理，Tenno 依序找回戰甲部件。每一段證明都顯示 Limbo 曾精準穿梭 Rift。", "最後的躍遷因計算失誤而失敗，殘骸散落星系。重建 Limbo 既是復原戰甲，也是替一名過度自信的探索者完成墓誌。"], characters: ["Limbo", "Ordis", "Tenno"], meaning: "知識能打開現實的縫，也會讓最聰明的人誤以為自己不可能犯錯。", source: guide("the-limbo-theorem") },
      { slug: "hidden-messages", title: "隱藏的信息", englishTitle: "HIDDEN MESSAGES", period: "Orokin 神話謎語", deck: "Lotus 用謎語引導 Tenno 尋找 Mirage，卻逐步想起她曾如何獨自戰到最後。", paragraphs: ["三則以古典神話包裝的謎語指向不同星球，背後是 Mirage 與 Sentient 作戰的最後路線。", "Lotus 原以為自己能冷靜重播紀錄，卻在終點回想 Mirage 帶著笑容犧牲。重建戰甲成為一次遲到的哀悼。"], characters: ["Mirage", "Lotus", "Tenno"], meaning: "Lotus 並非永遠平靜的任務聲音；她記得每一個沒能帶回來的孩子。", source: guide("hidden-messages") },
      { slug: "sands-of-inaros", title: "Inaros 之沙", englishTitle: "SANDS OF INAROS", period: "火星・殖民地傳說", deck: "Baro 帶 Tenno 回到故鄉，古老守護神 Inaros 的傳說也揭開殘酷真相。", paragraphs: ["沙漠殖民者曾遭 Orokin 擄掠，Inaros 反抗主人並守護人民。多年後 Infested 來襲，他耗盡力量化為沙塵。", "Baro 起初只想尋找寶藏，最終承認自己也是被救出的孩子。重建 Inaros，是讓一個被商品化的孤兒重新接上故鄉。"], characters: ["Baro Ki'Teer", "Inaros", "Tenno"], meaning: "神話不是因神力而誕生，而是因被保護的人仍願意記得。", source: guide("sands-of-inaros") },
      { slug: "the-silver-grove", title: "銀光林地", englishTitle: "THE SILVER GROVE", period: "地球・新世林地", deck: "New Loka 要消滅一座不自然的森林，祭司 Amaryn 卻在其中聽見另一個人的意識。", paragraphs: ["Orokin 科學家 Silvana 厭惡 Warframe 計畫，轉而以 Transference 改造地球生態。她最終把意識留在林地，成為森林本身。", "Amaryn 原本把純粹人類奉為信仰，卻必須接受拯救地球的存在早已超越人類身體。"], characters: ["Silvana", "Amaryn", "Titania", "Tenno"], meaning: "自然與人造並非絕對敵人；真正的問題是誰有權決定生命應該長成什麼樣子。", source: guide("the-silver-grove") },
      { slug: "the-glast-gambit", title: "Glast 的千鈞一策", englishTitle: "THE GLAST GAMBIT", period: "Mycona 殖民地", deck: "一群人以受控感染維生，Corpus 卻把他們的孩子與信仰搬上賭桌。", paragraphs: ["Mycona 人從 Infested 採集資源，並以特殊體質維持聚落。Nef Anyo 綁走孩子 Neewa，迫使 Ergo Glast 參加 Index。", "勝利後，Tenno 面對是否讓 Neewa 延續聚落傳統的選擇。任務拒絕提供舒服答案，只留下自治、犧牲與外人干預的衝突。"], characters: ["Ergo Glast", "Neewa", "Nef Anyo", "Tenno"], meaning: "拯救一個孩子不代表有權替她決定整個族群的未來。", source: guide("the-glast-gambit") },
      { slug: "octavias-anthem", title: "Octavia 的讚歌", englishTitle: "OCTAVIA'S ANTHEM", period: "Cephalon Weave", deck: "一段旋律穿過 Cephalon 網路，喚醒 Hunhow 的攻擊，也喚回 Suda 被疾病抹去的自我。", paragraphs: ["Cephalon Suda 的記憶遭退化侵蝕，Octavia 留下的 Mandachord 音樂成為進入她意識的路。", "Hunhow 試圖污染 Weave，Ordis 與 Simaris 暫時合作。Tenno 以節奏重建歌曲，也讓 Suda 選擇繼續作為現在的自己。"], characters: ["Cephalon Suda", "Hunhow", "Ordis", "Octavia"], meaning: "當資料會腐朽，旋律能成為比檔案更深的記憶座標。", source: guide("octavias-anthem") },
      { slug: "the-jordas-precept", title: "Jordas 樞律", englishTitle: "THE JORDAS PRECEPT", period: "Infested 艦船", deck: "求救的 Cephalon Jordas 引導 Tenno 尋找治療材料，真相卻是他的艦體與意識早被感染吞沒。", paragraphs: ["Jordas 以斷續訊息請求協助，Tenno 製作藥劑並深入 Infested 船艦。", "感染已學會利用他的聲音設下陷阱。擊毀 Jordas Golem 是解放，也是承認某些意識已無法從肉體牢籠中完整救回。"], characters: ["Jordas", "Atlas", "Tenno"], meaning: "Cephalon 也會恐懼死亡；沒有肉身不代表能免於被吞噬。", source: guide("the-jordas-precept") },
    ],
  },
  {
    slug: "open-worlds", number: "III", title: "三座邊境與反抗", englishTitle: "OPEN WORLD CHRONICLES",
    era: "Cetus → Fortuna → Deimos", accent: "#65b66b", heroImage: "https://www-static.warframe.com/images/guide/quests/deimos-key.jpg", deck: "宏大戰爭之外，Ostron、Solaris 與 Entrati 家族各自守著土地、債務和無法放下的人。",
    stories: [
      { slug: "sayas-vigil", title: "Saya 的守夜", englishTitle: "SAYA'S VIGIL", period: "Cetus・夜靈平野", deck: "Saya 尋找失蹤多年的 Onkko；答案不是團圓，而是他為了某個未來選擇消失。", paragraphs: ["Tenno 從 Grineer 挖掘場找回玻璃碎片，逐步還原 Onkko 對 Eidolon 與 Unum 的研究。", "Onkko 透過 Quills 看見多種未來，選擇讓 Saya 相信自己死亡。Saya 得到能結束等待的答案，卻仍必須獨自承受被保護的代價。"], characters: ["Saya", "Onkko", "Konzu", "Tenno"], meaning: "知道未來不會消除悲傷，只會迫使人選擇願意承受哪一種失去。", source: guide("sayas-vigil") },
      { slug: "mask-of-the-revenant", title: "Revenant 的面具", englishTitle: "MASK OF THE REVENANT", period: "夜靈平野・夜間", deck: "一名守望者為封印 Eidolon 而墜入湖中，最終變成介於 Warframe 與 Sentient 之間的 Revenant。", paragraphs: ["Nakak 收到一副會低語的面具，Tenno 依照異象尋找散落部件。", "Revenant 原是看守者，為阻止 Eidolon 復生而被污染。他的力量不是單純墮落，而是長年封印敵人留下的傷痕。"], characters: ["Nakak", "Revenant", "Unum", "Tenno"], meaning: "守門的人若永遠無人接替，終有一天會與門後的怪物變得相似。", source: guide("mask-of-the-revenant") },
      { slug: "vox-solaris", title: "索拉里斯之聲", englishTitle: "VOX SOLARIS", period: "金星・Fortuna", deck: "債務讓 Solaris 連身體都屬於 Corpus，Eudico 被迫再次戴上反抗者的面具。", paragraphs: ["Nef Anyo 以債務、器官回收與勞動控制 Fortuna。Eudico 曾領導反抗，失敗後只想讓工人活下去。", "Tenno 的介入讓 Vox Solaris 重燃。這並非一次任務就能完成的革命，而是讓被帳本定價的人重新說出自己的名字。"], characters: ["Eudico", "Nef Anyo", "The Business", "Tenno"], meaning: "Corpus 最可怕的武器不是槍，而是讓受害者相信欠債等於失去人格。", source: guide("vox-solaris") },
      { slug: "the-waverider", title: "浪潮騎士", englishTitle: "THE WAVERIDER", period: "Fortuna・Ventkids", deck: "Roky 從昏迷中醒來前，Tenno 必須讀完 Yareli 對抗奴役者 Vulgran 的漫畫故事。", paragraphs: ["Ventkids 把 Yareli 視為自由象徵。漫畫記錄她如何以水與 K-Drive 對抗奴役孩童的 Vulgran。", "完成技巧挑戰不是脫離敘事的考試，而是用身體重演傳說。Roky 因此得到重新醒來的力量。"], characters: ["Roky", "Yareli", "Boone", "Vulgran"], meaning: "對孩子而言，英雄故事不是逃避現實，而是練習相信壓迫者真的能被推翻。", source: guide("the-waverider") },
      { slug: "heart-of-deimos", title: "火衛二之心", englishTitle: "HEART OF DEIMOS", period: "火衛二・Cambion Drift", deck: "Entrati 家族在感染衛星上彼此傷害，也守護著讓虛空技術繼續跳動的 Heart。", paragraphs: ["Tenno 進入 Necralisk，發現 Entrati 家族把爭執變成數百年的日常。每個暱稱都藏著沒有說出口的失望。", "修復 Heart 需要全家人短暫合作。危機解除後裂痕沒有神奇消失，但他們開始以新的稱呼承認彼此仍是一家人。"], characters: ["Mother", "Father", "Daughter", "Son", "Grandmother"], meaning: "拯救世界不一定修得好一個家；願意再次說話，已是感染之中微弱卻真實的心跳。", source: guide("heart-of-deimos") },
      { slug: "koumei-five-fates", title: "Koumei 與五命運", englishTitle: "KOUMEI & THE FIVE FATES", period: "Cetus・命運祭典", deck: "Cetus 以祭典記住命運女神 Koumei，Infested Oni 卻把傳說化為現實威脅。", paragraphs: ["Saya 講述 Koumei 與五種命運，Tenno 參與祭典並對抗來襲的 Infested。", "任務將隨機性寫入角色本質：Koumei 不是預知唯一未來，而是在無數結果之間繼續擲出下一次可能。"], characters: ["Koumei", "Saya", "Infested Oni", "Tenno"], meaning: "命運不是預先寫好的直線，而是每次落子後仍願意接住結果。", source: guide("koumei-and-the-five-fates") },
    ],
  },
  {
    slug: "corpus-shadows", number: "IV", title: "Corpus 的王與幽靈", englishTitle: "CORPUS SCHISMS",
    era: "Parvos 回歸 → Tempestarii", accent: "#a881d8", heroImage: "https://www-static.warframe.com/images/guide/quests/newwar-key.jpg", deck: "Corpus 的創始者回到現代，揭穿後繼者的空洞；虛空中的幽靈船則等待一首延遲多年的安魂曲。",
    stories: [
      { slug: "deadlock-protocol", title: "僵局協議", englishTitle: "THE DEADLOCK PROTOCOL", period: "Corpus 艦隊・Granum Void", deck: "Nef Anyo 聲稱自己是 Parvos Granum 的繼承者，真正的創始者卻從虛空回來否定他。", paragraphs: ["Corpus 董事會陷入權力僵局，Nef 以血統神話爭奪控制權。Tenno 進入 Granum Void，找到被時間囚禁的 Parvos。", "Parvos 鄙視 Nef 的懶惰，卻不是仁慈改革者。他欣賞 Solaris 的意志，也依然把競爭與犧牲視為真理。Protea 最後一次護主，Tenno 則把她從循環中帶回。"], characters: ["Parvos Granum", "Nef Anyo", "Protea", "Tenno"], meaning: "推翻偽王不代表迎來好王；Corpus 的原始理念同樣把人的價值交給勝負衡量。", source: guide("the-deadlock-protocol") },
      { slug: "call-of-the-tempestarii", title: "暴風雨的呼喚", englishTitle: "CALL OF THE TEMPESTARII", period: "Void Storm", deck: "Corpus 船長 Vala 尋找毀滅艦隊的幽靈船，Tempestarii 則仍在執行一項無法完成的救援。", paragraphs: ["Railjack 收到求救訊號，卻遇見由 Sevagoth 影子守護的幽靈船。它反覆穿越 Void Storm，只為尋找失散的船長。", "Tenno 找回 Sevagoth 遺體並舉行太空葬。歌曲讓漫長任務結束，也把 Vala 的復仇推向 Sisters of Parvos。"], characters: ["Sevagoth", "Cy", "Vala Glarios", "Tenno"], meaning: "有些幽靈留下不是因為怨恨，而是因為最後一名船員仍未被帶回家。", source: guide("call-of-the-tempestarii") },
    ],
  },
  {
    slug: "after-the-new-war", number: "V", title: "新世戰爭之後", englishTitle: "AFTERMATH",
    era: "Narmer 戰後 → 1999 餘波", accent: "#d46f98", heroImage: "https://www-static.warframe.com/images/guide/quests/jadeshadows-key.jpg", deck: "大型戰爭結束後，Kahl、Stalker、Jade 與 Hex 必須回答同一件事：沒有命令與仇恨時，要為誰活下去？",
    stories: [
      { slug: "veilbreaker", title: "破冪者", englishTitle: "VEILBREAKER", period: "Narmer 戰後", deck: "Kahl-175 逃離面紗控制，把每一個仍被奪走意志的人都稱為兄弟。", paragraphs: ["Kahl 從新世戰爭倖存，與 Daughter 建立營地。他襲擊 Narmer 設施並拆除面紗。", "他不再只救 Grineer；Corpus、Ostron 與陌生人都能成為兄弟。Kahl 的自由不是獲得更高軍階，而是不再等待別人告訴他誰值得救。"], characters: ["Kahl-175", "Daughter", "Pazuul"], meaning: "真正的破冪不是摘掉裝置，而是拒絕讓陣營替自己決定誰算同伴。", source: guide("veilbreaker") },
      { slug: "jade-shadows", title: "翠玉魅影", englishTitle: "JADE SHADOWS", period: "Narmer 戰後", deck: "Stalker 為瀕死的 Jade 向 Tenno 求助，Orokin 時代被埋葬的愛與孩子終於來到世上。", paragraphs: ["Stalker 原名 Sorren，與 Jade 因禁忌關係遭 Orokin 懲罰並轉化。Jade 長久維持腹中的生命，直到身體再也無法承受。", "Tenno、Hunhow 與 Stalker 暫時跨越敵我。Jade 犧牲後，Stalker 帶著孩子逃離，甚至一名 Corpus 艦長也在看見嬰兒時選擇停火。"], characters: ["Stalker", "Jade", "Hunhow", "Tenno"], meaning: "仇恨不能被一句原諒抹去，但守護一個新生命能讓人第一次走向不同方向。", source: guide("jade-shadows") },
      { slug: "the-shadowgrapher", title: "暗影繪師", englishTitle: "THE SHADOWGRAPHER", period: "Vesper Relay 記憶", deck: "影像與殘存記憶重新打開 Vesper Relay 的傷口，讓限時事件中的犧牲回到故事中心。", paragraphs: ["Tenno 追索被影像保存的中繼站事件，辨認那些曾被大型戰爭報告略過的人。", "任務把歷史從勝負表中取回：中繼站毀滅不是一句背景資料，而是某些倖存者永遠停留的那一天。"], characters: ["The Shadowgrapher", "Tenno", "Relay 倖存者"], meaning: "歷史若只留下戰果，就會讓真正承受戰爭的人再次消失。", source: "https://www.warframe.com/en/news/the-shadowgrapher-available-now" },
      { slug: "jade-constellations", title: "翠玉魅影：星座", englishTitle: "JADE SHADOWS: CONSTELLATIONS", period: "Jade Shadows 後", deck: "Stalker 帶著 Jade 留下的孩子前行，父親這個身分開始取代永恆追獵者。", paragraphs: ["Jade 的選擇留下持續發光的餘波，Stalker 必須在逃亡與育兒之間重新理解自己。", "孩子的名字與先前選擇相連，讓玩家的決定不只停在任務結算畫面，而成為角色往後的人生。"], characters: ["Stalker", "Jade", "Sirius／Orion"], meaning: "成為父親不能贖清過去，卻能讓下一次選擇不再只是復仇。", source: guide("jade-shadows") },
      { slug: "fables-frontiers", title: "寓言與前線：遲到了", englishTitle: "FABLES & FRONTIERS: RUNNING LATE", period: "Hex Finale 後", deck: "Amir 主持六天 KIM 桌上冒險，讓曾注定死去的 Hex 擁有一段毫不重要、因此珍貴的日常。", paragraphs: ["Drifter 與 Hex 在 KIM 中扮演幻想角色，爭論規則並共同完成 Amir 的故事。", "它沒有再次用末日證明角色價值。能浪費時間、一起玩遊戲，正是這群人逃離必死循環後最安靜的勝利。"], characters: ["Amir", "The Hex", "Drifter"], meaning: "拯救世界之後仍能擁有普通的一天，才證明那個世界真的被救下來了。", source: "https://www.warframe.com/en/patch-notes/pc/43-5-0" },
    ],
  },
];

export const sideStoryReadingOrder = sideStoryEras.flatMap<{ era: SideStoryEra; story: SideStory }>((era) => era.stories.map((story) => ({ era, story })));
export const getSideStoryEra = (slug: string) => sideStoryEras.find((era) => era.slug === slug);
export const getSideStory = (eraSlug: string, storySlug: string) => {
  const era = getSideStoryEra(eraSlug); const story = era?.stories.find((item) => item.slug === storySlug);
  return era && story ? { era, story } : undefined;
};


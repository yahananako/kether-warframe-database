(() => {
  "use strict";

  const root = document.getElementById("kether-mobile-v5");
  const body = document.getElementById("k5-body");
  const data = window.KETHER_V3_DATA;
  if (!root || !body || !data) return;

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>\"]/g,
      (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
    );
  const roleInfo = {
    damage: ["傷害", "DAMAGE"],
    control: ["群控", "CROWD CONTROL"],
    support: ["支援", "SUPPORT"],
    survival: ["生存", "SURVIVAL"],
    stealth: ["匿蹤", "STEALTH"],
  };
  const normalize = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/prime|umbra/g, "")
      .replace(/[^a-z0-9]/g, "");

  function top(kicker, title, description) {
    return `<header class="v3-head"><small>${escapeHtml(kicker)}</small><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></header>`;
  }

  function finish() {
    root.querySelector("#k5-menu").hidden = true;
    window.scrollTo(0, 0);
  }

  function storyLibrary(tab = "main") {
    const entries =
      tab === "main"
        ? data.chapters
            .map(
              (chapter, index) =>
                `<button class="v3-book" data-v3-chapter="${index}"><img src="${escapeHtml(chapter.heroImage)}" alt=""><span><small>${escapeHtml(chapter.number)}・${escapeHtml(chapter.label)}</small><h3>${escapeHtml(chapter.title)}</h3><em>${escapeHtml(chapter.era)}</em><p>${escapeHtml(chapter.deck)}</p><b>${escapeHtml(chapter.readTime)}　›</b></span></button>`,
            )
            .join("")
        : data.sideEras
            .map(
              (era, index) =>
                `<button class="v3-book" data-v3-era="${index}"><img src="${escapeHtml(era.heroImage)}" alt=""><span><small>支線卷 ${escapeHtml(era.number)}</small><h3>${escapeHtml(era.title)}</h3><em>${escapeHtml(era.era)}</em><p>${escapeHtml(era.deck)}</p><b>${era.stories.length} 篇故事　›</b></span></button>`,
            )
            .join("");
    body.innerHTML =
      top(
        "KETHER ILLUSTRATED CHRONICLE",
        "Warframe 故事全書",
        "主線、支線與系列任務・小說閱讀模式",
      ) +
      `<nav class="v3-tabs"><button data-v34-story-main class="${tab === "main" ? "on" : ""}">主線五卷</button><button data-v34-story-side class="${tab === "side" ? "on" : ""}">支線書庫</button><button data-v34-storytab="series">系列任務</button></nav><section class="v3-books">${entries}</section>`;
    finish();
  }

  function questSeriesHome() {
    body.innerHTML =
      top(
        "QUEST SERIES CHRONICLE",
        "系列任務故事書",
        "六條連續航路・網站與 App 共用閱讀順序",
      ) +
      '<nav class="v3-tabs"><button data-v3-storytab="main">主線五卷</button><button data-v3-storytab="side">支線書庫</button><button class="on" data-v34-storytab="series">系列任務</button></nav>' +
      '<section class="v3-books">' +
      data.questSeries
        .map(
          (series, index) =>
            `<button class="v3-book" data-v34-series="${index}"><img src="${escapeHtml(series.heroImage)}" alt=""><span><small>${escapeHtml(series.number)}</small><h3>${escapeHtml(series.title)}</h3><em>${escapeHtml(series.era)}</em><p>${escapeHtml(series.deck)}</p><b>${series.episodes.length} 個任務節點　›</b></span></button>`,
        )
        .join("") +
      "</section>";
    finish();
  }

  function questSeriesRoute(seriesIndex) {
    const series = data.questSeries[seriesIndex];
    if (!series) return questSeriesHome();
    body.innerHTML =
      `<button class="v3-back" data-v34-storytab="series">‹ 回到系列任務書庫</button>` +
      `<article class="v34-series-hero"><img src="${escapeHtml(series.heroImage)}" alt=""><div><small>${escapeHtml(series.number)}・${escapeHtml(series.englishTitle)}</small><h1>${escapeHtml(series.title)}</h1><strong>${escapeHtml(series.era)}</strong><p>${escapeHtml(series.deck)}</p></div></article>` +
      '<section class="v34-route">' +
      series.episodes
        .map(
          (episode, episodeIndex) =>
            `<button data-v34-episode="${seriesIndex}|${episodeIndex}"><span>${escapeHtml(episode.number)}</span><div><h3>${escapeHtml(episode.title)}</h3><p>${escapeHtml(episode.description)}</p></div><b>›</b></button>`,
        )
        .join("") +
      "</section>";
    finish();
  }

  function questSeriesEpisode(seriesIndex, episodeIndex) {
    const series = data.questSeries[seriesIndex];
    const episode = series?.episodes?.[episodeIndex];
    const [, chapterSlug, passageId] = String(episode?.href || "")
      .split("/")
      .filter(Boolean);
    const chapter = data.chapters.find((item) => item.slug === chapterSlug);
    const passage = chapter?.passages?.find((item) => item.id === passageId);
    if (!series || !passage) return questSeriesRoute(seriesIndex);

    body.innerHTML =
      `<article class="v3-reader"><button class="v3-back" data-v34-series="${seriesIndex}">‹ 回到${escapeHtml(series.title)}</button>` +
      `<header><small>${escapeHtml(episode.number)}・${escapeHtml(passage.period)}</small><h1>${escapeHtml(passage.title)}</h1><h3>${escapeHtml(passage.englishTitle)}</h3><p>${escapeHtml(passage.summary)}</p></header>` +
      `<section>${passage.image ? `<figure><img src="${escapeHtml(passage.image.src)}" alt=""><figcaption>${escapeHtml(passage.image.caption)}</figcaption></figure>` : ""}${passage.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}<aside><strong>${escapeHtml(passage.meaning.title)}</strong><p>${escapeHtml(passage.meaning.text)}</p></aside><footer>關鍵人物：${escapeHtml(passage.characters.join("・"))}</footer></section></article>`;
    finish();
  }

  function detailForSlug(slug) {
    return data.warframeDetails.find((item) => item.slug === slug);
  }

  function acquisitionFor(name) {
    if (name === "Excalibur Umbra")
      return "完成主線任務「犧牲」後取得完整 Excalibur Umbra。";
    return (
      data.regularWarframes.find((item) => item.name === name)?.acquisition ||
      "取得條件整理中，請以遊戲內 Codex 為準。"
    );
  }

  function roleFor(warframe) {
    return data.roleMap[normalize(warframe.name)] || "damage";
  }

  function warframeDetail(slug) {
    const warframe = detailForSlug(slug);
    if (!warframe) return;
    const role = roleFor(warframe);
    const roleLabel = roleInfo[role] || roleInfo.damage;
    const acquisition = acquisitionFor(warframe.name);
    const marketPath = warframe.marketSlug
      ? `/api/market-price?kind=item&slug=${encodeURIComponent(warframe.marketSlug)}`
      : "";
    const marketUrl = warframe.marketSlug
      ? `https://warframe.market/items/${warframe.marketSlug}`
      : "";
    const components = warframe.components.length
      ? warframe.components
          .map(
            (component) =>
              `<article><h3>${escapeHtml(component.name)}</h3>${component.drops.length ? `<ul>${component.drops.map((drop) => `<li><span>${escapeHtml(drop.location)}</span><b>${drop.chance == null ? escapeHtml(drop.rarity || "任務獎勵") : `${Number(drop.chance).toFixed(2)}%`}</b></li>`).join("")}</ul>` : "<p>依上方任務流程取得。</p>"}</article>`,
          )
          .join("")
      : '<p class="v34-muted">沒有可拆分顯示的部件掉落資料。</p>';

    body.innerHTML =
      `<button class="v3-back" data-v34-frame-list="${role}">‹ 回到一般戰甲</button>` +
      `<article class="v34-frame-hero"><small>${escapeHtml(roleLabel[1])} WARFRAME</small><h1>${escapeHtml(warframe.name)}</h1><span>${escapeHtml(roleLabel[0])}型戰甲</span><img src="${escapeHtml(warframe.imageUrl)}" alt=""><p>${escapeHtml(warframe.description)}</p><button data-v34-build="${escapeHtml(warframe.slug)}">執政官寶石・MOD 配裝 ›</button>${warframe.name === "Excalibur" ? '<button class="v34-umbra-link" data-v34-frame="excalibur-umbra">Excalibur Umbra 檔案 ›</button>' : ""}</article>` +
      '<section class="v34-stats">' +
      [
        ["生命", warframe.stats.health],
        ["護盾", warframe.stats.shield],
        ["護甲", warframe.stats.armor],
        ["能量", warframe.stats.energy],
        ["衝刺", warframe.stats.sprint],
      ]
        .map(
          ([label, value]) =>
            `<article><small>${label}</small><strong>${value}</strong></article>`,
        )
        .join("") +
      "</section>" +
      top("ABILITIES・TAP TO EXPAND", "技能資料", "點擊技能名稱展開完整說明") +
      '<section class="v34-abilities">' +
      warframe.abilities
        .map(
          (ability) =>
            `<details><summary><span>${String(ability.number).padStart(2, "0")}</span>${ability.imageUrl ? `<img src="${escapeHtml(ability.imageUrl)}" alt="">` : ""}<strong>${escapeHtml(ability.name)}</strong><b>＋</b></summary><p>${escapeHtml(ability.description)}</p></details>`,
        )
        .join("") +
      `</section><aside class="v34-passive"><strong>被動技能</strong><p>${escapeHtml(warframe.passiveDescription || "資料整理中")}</p></aside>` +
      top("ACQUISITION", "取得方式", acquisition) +
      `<section class="v34-source"><p>${escapeHtml(acquisition)}</p><div>${components}</div></section>` +
      `<section class="v34-market" data-market-request="${escapeHtml(marketPath)}"><small>WARFRAME MARKET・PC</small><h2>${escapeHtml(warframe.name)}${warframe.marketSlug ? " Prime 套裝" : ""}</h2><div class="v21-market"><b class="v21-market-value">${warframe.marketSlug ? "正在同步最低線上賣單…" : warframe.hasPrime ? "限定 Prime 版本沒有公開市場價格" : "目前沒有可查價的 Prime 套裝"}</b>${marketUrl ? `<a class="v21-trade-link" href="${escapeHtml(marketUrl)}">開啟 Warframe Market 交易頁</a>` : ""}<small class="v21-trade-note">一般版戰甲本體不可交易。</small></div></section>`;
    finish();
    if (marketPath && window.KetherSync) window.KetherSync.fetch(marketPath);
  }

  const buildOptions = {
    aura: ["成長之力", "短暫喘息", "腐蝕投射", "能量虹吸", "鋼鐵充能"],
    exilus: ["力量竄升", "狡詐竄升", "速度竄升", "準備就緒", "頂天立地 PRIME"],
    mods: [
      "暗影聚精會神",
      "暗影生命力",
      "暗影纖維",
      "瞬時堅毅",
      "盲怒",
      "過度延展",
      "延伸",
      "持久力 PRIME",
      "心志偏狹",
      "川流不息 PRIME",
      "簡化",
      "適應",
      "翻滾防護",
      "預言神密",
    ],
    arcanes: [
      "蛻化昇騰",
      "蛻現效率",
      "充沛賦能",
      "保衛者賦能",
      "優雅賦能",
      "復仇者賦能",
    ],
    shards: [
      "紅色：技能強度",
      "紅色：技能持續",
      "黃色：施放速度",
      "黃色：能量球效率",
      "藍色：最大能量",
      "藍色：最大生命",
      "藍色：護甲",
      "翠綠：腐蝕層數",
      "紫色：近戰暴擊玩法",
      "自由調整",
    ],
  };

  function defaultBuild(role) {
    const roleDefaults = {
      damage: [
        "成長之力",
        "力量竄升",
        [
          "暗影聚精會神",
          "瞬時堅毅",
          "延伸",
          "持久力 PRIME",
          "川流不息 PRIME",
          "簡化",
          "翻滾防護",
          "預言神密",
        ],
      ],
      control: [
        "短暫喘息",
        "狡詐竄升",
        [
          "過度延展",
          "延伸",
          "預言神密",
          "持久力 PRIME",
          "心志偏狹",
          "簡化",
          "翻滾防護",
          "暗影聚精會神",
        ],
      ],
      support: [
        "成長之力",
        "力量竄升",
        [
          "持久力 PRIME",
          "心志偏狹",
          "暗影聚精會神",
          "預言神密",
          "川流不息 PRIME",
          "簡化",
          "延伸",
          "適應",
        ],
      ],
      survival: [
        "短暫喘息",
        "頂天立地 PRIME",
        [
          "適應",
          "翻滾防護",
          "暗影生命力",
          "暗影纖維",
          "暗影聚精會神",
          "持久力 PRIME",
          "川流不息 PRIME",
          "簡化",
        ],
      ],
      stealth: [
        "能量虹吸",
        "準備就緒",
        [
          "持久力 PRIME",
          "心志偏狹",
          "預言神密",
          "川流不息 PRIME",
          "簡化",
          "延伸",
          "翻滾防護",
          "暗影聚精會神",
        ],
      ],
    }[role] || ["成長之力", "力量竄升", buildOptions.mods.slice(0, 8)];
    return {
      aura: roleDefaults[0],
      exilus: roleDefaults[1],
      mods: roleDefaults[2],
      arcanes: ["蛻化昇騰", "蛻現效率"],
      shards: [
        "紅色：技能強度",
        "紅色：技能強度",
        "黃色：施放速度",
        "藍色：最大能量",
        "自由調整",
      ],
    };
  }

  function optionSelect(label, group, index, value) {
    const choices = [value, ...buildOptions[group]].filter(
      (item, position, values) => item && values.indexOf(item) === position,
    );
    return `<label><span>${escapeHtml(label)}</span><select data-v34-slot="${group}|${index}"><option value="">尚未配置</option>${choices.map((option) => `<option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }

  function warframeBuild(slug, reset = false) {
    const warframe = detailForSlug(slug);
    if (!warframe) return;
    const role = roleFor(warframe);
    const storageKey = `kether-warframe-build:${warframe.name.toLowerCase()}`;
    if (reset) localStorage.removeItem(storageKey);
    let build = defaultBuild(role);
    try {
      build = {
        ...build,
        ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
      };
    } catch (_) {}
    window.KETHER_V34_BUILD = { slug, storageKey, build };

    body.innerHTML =
      `<button class="v3-back" data-v34-frame="${escapeHtml(slug)}">‹ 返回 ${escapeHtml(warframe.name)} 詳情</button>` +
      `<article class="v34-build-hero"><div><small>KETHER BUILD MATRIX・${escapeHtml(roleInfo[role][1])}</small><h1>${escapeHtml(warframe.name)}</h1><p>通用起始配置會保存在這台裝置，可隨時重新調整。</p></div><img src="${escapeHtml(warframe.imageUrl)}" alt=""></article>` +
      '<section class="v34-builder"><header><h2>靈氣與特殊功能</h2><button data-v34-reset="' +
      escapeHtml(slug) +
      '">重設範本</button></header><div class="v34-two">' +
      optionSelect("靈氣槽", "aura", 0, build.aura) +
      optionSelect("特殊功能槽", "exilus", 0, build.exilus) +
      '</div><h2>8 格 MOD 插槽</h2><div class="v34-grid">' +
      build.mods
        .map((value, index) =>
          optionSelect(`MOD ${index + 1}`, "mods", index, value),
        )
        .join("") +
      '</div><h2>2 格賦能</h2><div class="v34-two">' +
      build.arcanes
        .map((value, index) =>
          optionSelect(`賦能 ${index + 1}`, "arcanes", index, value),
        )
        .join("") +
      '</div><h2>5 顆執政官寶石</h2><div class="v34-grid">' +
      build.shards
        .map((value, index) =>
          optionSelect(`寶石 ${index + 1}`, "shards", index, value),
        )
        .join("") +
      '</div><p class="v34-saved">◆ 每次選擇後自動保存；這是起點，不是唯一答案。</p></section>';
    finish();
  }

  const oldFooter = root.querySelector(".k5-app-footer");
  if (oldFooter) {
    const footer = document.createElement("details");
    footer.className = "k5-app-footer v34-footer";
    footer.innerHTML =
      '<summary><span><strong>KETHER OF PARADISO</strong><small>快速航標・點擊展開</small></span><b>⌃</b></summary><div><nav><button data-v34-go="warframes">一般戰甲</button><button data-v34-storytab="series">系列任務</button><a href="https://kether-warframe-database.vercel.app/live">電波局</a><a href="https://discord.gg/TNGYQb5mBN">Discord</a></nav><p>網站・小希 BOT・Android／iOS App 共用資料航線</p><span>設計者 ヤハ奈々子</span><small>APP 3.0.11・WEB 2.6.4</small></div>';
    oldFooter.replaceWith(footer);
  }

  root.querySelectorAll('[data-page="story"]').forEach((button) => {
    button.removeAttribute("data-page");
    button.setAttribute("data-v34-story-home", "");
  });

  function refreshVisibleCopy() {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const next = String(node.nodeValue || "")
        .replaceAll("60 位一般戰甲", "65 位一般戰甲")
        .replaceAll("一般戰甲收錄 60 位", "一般戰甲收錄 65 位")
        .replaceAll("KETHER V2.6.2", "KETHER V2.6.4")
        .replaceAll("KETHER V2.6.3", "KETHER V2.6.4")
        .replaceAll(
          "故事書主線與支線皆採任務專屬封面，不再共用戰甲圖片。",
          "故事書新增六條系列任務航路，與主線、支線共用閱讀資料。",
        )
        .replaceAll(
          "電波局獨立頁面與五大裝備分類已同步完成。",
          "戰甲詳情、配裝與系列任務故事書已同步完成。",
        );
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }
  new MutationObserver(refreshVisibleCopy).observe(body, {
    childList: true,
    subtree: true,
  });
  refreshVisibleCopy();

  window.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest?.(
        "[data-v34-story-home],[data-v34-story-main],[data-v34-story-side],[data-v34-storytab],[data-v34-series],[data-v34-episode],[data-v34-frame],[data-v34-frame-list],[data-v34-build],[data-v34-reset],[data-v34-go]",
      );
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      if (target.dataset.v34StoryHome !== undefined) storyLibrary("main");
      else if (target.dataset.v34StoryMain !== undefined) storyLibrary("main");
      else if (target.dataset.v34StorySide !== undefined) storyLibrary("side");
      else if (target.dataset.v34Storytab === "series") questSeriesHome();
      else if (target.dataset.v34Series !== undefined)
        questSeriesRoute(Number(target.dataset.v34Series));
      else if (target.dataset.v34Episode) {
        const [seriesIndex, episodeIndex] = target.dataset.v34Episode
          .split("|")
          .map(Number);
        questSeriesEpisode(seriesIndex, episodeIndex);
      } else if (target.dataset.v34Frame)
        warframeDetail(target.dataset.v34Frame);
      else if (target.dataset.v34FrameList) {
        root.querySelector('[data-kind="一般戰甲"]')?.click();
        root
          .querySelector(`[data-v3-role="${target.dataset.v34FrameList}"]`)
          ?.click();
      } else if (target.dataset.v34Build)
        warframeBuild(target.dataset.v34Build);
      else if (target.dataset.v34Reset)
        warframeBuild(target.dataset.v34Reset, true);
      else if (target.dataset.v34Go === "warframes") {
        root.querySelector('[data-kind="一般戰甲"]')?.click();
      }
    },
    true,
  );

  window.addEventListener("change", (event) => {
    const select = event.target.closest?.("[data-v34-slot]");
    const current = window.KETHER_V34_BUILD;
    if (!select || !current) return;
    const [group, indexText] = select.dataset.v34Slot.split("|");
    const index = Number(indexText);
    if (Array.isArray(current.build[group]))
      current.build[group][index] = select.value;
    else current.build[group] = select.value;
    localStorage.setItem(current.storageKey, JSON.stringify(current.build));
  });

  const styles = document.createElement("style");
  styles.textContent = `#kether-mobile-v5 .v3-tabs{grid-template-columns:repeat(3,1fr)}#kether-mobile-v5 .v34-open-frame{width:100%;margin-top:12px;padding:12px;border:1px solid #4a93aa;border-radius:12px;background:#17364a;color:#7beaff;font-weight:900}#kether-mobile-v5 .v34-series-hero{position:relative;overflow:hidden;margin:13px 0 18px;border:1px solid #33425c;border-radius:24px;background:#101722}#kether-mobile-v5 .v34-series-hero>img{width:100%;aspect-ratio:16/8;object-fit:cover;opacity:.58}#kether-mobile-v5 .v34-series-hero>div{padding:19px}#kether-mobile-v5 .v34-series-hero small,#kether-mobile-v5 .v34-frame-hero>small,#kether-mobile-v5 .v34-build-hero small{color:#72e6ff;letter-spacing:.11em}#kether-mobile-v5 .v34-series-hero h1,#kether-mobile-v5 .v34-frame-hero h1,#kether-mobile-v5 .v34-build-hero h1{margin:7px 0;color:#f1c86e;font-size:34px}#kether-mobile-v5 .v34-series-hero p{color:#aeb8c8;line-height:1.7}#kether-mobile-v5 .v34-route{display:grid;gap:10px}#kether-mobile-v5 .v34-route button{display:grid;grid-template-columns:38px 1fr 14px;gap:12px;align-items:center;padding:15px;border:1px solid #33425c;border-radius:17px;background:#121a28;color:#fff;text-align:left}#kether-mobile-v5 .v34-route button>span{display:grid;place-items:center;width:34px;height:34px;border:1px solid #72e6ff;border-radius:50%;color:#72e6ff}#kether-mobile-v5 .v34-route h3{margin:0;color:#f1c86e}#kether-mobile-v5 .v34-route p{margin:5px 0 0;color:#aeb8c8;line-height:1.5}#kether-mobile-v5 .v34-frame-hero{display:grid;margin:13px 0 15px;padding:19px;border:1px solid #33425c;border-radius:23px;background:radial-gradient(circle at 50% 45%,#304665,transparent 55%),#111824}#kether-mobile-v5 .v34-frame-hero>span{color:#72e6ff}#kether-mobile-v5 .v34-frame-hero>img{width:100%;height:330px;object-fit:contain;filter:drop-shadow(0 18px 22px #000a)}#kether-mobile-v5 .v34-frame-hero>p{color:#b3bdcc;line-height:1.75}#kether-mobile-v5 .v34-frame-hero>button{padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#72e6ff,#f1c86e);color:#071017;font-weight:900}#kether-mobile-v5 .v34-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:15px}#kether-mobile-v5 .v34-stats article{display:grid;gap:3px;padding:12px;border:1px solid #33425c;border-radius:14px;background:#121a28}#kether-mobile-v5 .v34-stats small{color:#8794a8}#kether-mobile-v5 .v34-stats strong{color:#fff;font-size:19px}#kether-mobile-v5 .v34-abilities{display:grid;gap:9px;margin-bottom:10px}#kether-mobile-v5 .v34-abilities details{border:1px solid #33425c;border-radius:15px;background:#121a28;overflow:hidden}#kether-mobile-v5 .v34-abilities summary{display:grid;grid-template-columns:25px 40px 1fr 18px;gap:9px;align-items:center;padding:11px;list-style:none}#kether-mobile-v5 .v34-abilities summary img{width:38px;height:38px;object-fit:contain}#kether-mobile-v5 .v34-abilities summary span,#kether-mobile-v5 .v34-abilities summary b{color:#72e6ff}#kether-mobile-v5 .v34-abilities details>p{margin:0;padding:0 14px 15px;color:#aeb8c8;line-height:1.7}#kether-mobile-v5 .v34-passive,#kether-mobile-v5 .v34-source,#kether-mobile-v5 .v34-market{margin-bottom:15px;padding:16px;border:1px solid #3a465c;border-radius:18px;background:#121a28}#kether-mobile-v5 .v34-passive strong,#kether-mobile-v5 .v34-market h2{color:#f1c86e}#kether-mobile-v5 .v34-passive p,#kether-mobile-v5 .v34-source>p{color:#aeb8c8;line-height:1.7}#kether-mobile-v5 .v34-source>div{display:grid;gap:8px}#kether-mobile-v5 .v34-source article{padding:12px;border-radius:13px;background:#1a2434}#kether-mobile-v5 .v34-source h3{margin:0 0 8px;color:#f1c86e}#kether-mobile-v5 .v34-source ul{display:grid;gap:5px;margin:0;padding:0;list-style:none}#kether-mobile-v5 .v34-source li{display:flex;justify-content:space-between;gap:9px;color:#aeb8c8;font-size:12px}#kether-mobile-v5 .v34-source li b{color:#72e6ff}#kether-mobile-v5 .v34-market>small{color:#72e6ff;letter-spacing:.09em}#kether-mobile-v5 .v34-market h2{margin:7px 0}#kether-mobile-v5 .v34-build-hero{display:grid;grid-template-columns:1fr 130px;align-items:center;margin:13px 0;padding:18px;border:1px solid #33425c;border-radius:22px;background:#111824}#kether-mobile-v5 .v34-build-hero>img{width:130px;height:180px;object-fit:contain}#kether-mobile-v5 .v34-build-hero p{color:#aeb8c8;line-height:1.6}#kether-mobile-v5 .v34-builder{padding:16px;border:1px solid #33425c;border-radius:20px;background:#101722}#kether-mobile-v5 .v34-builder>header{display:flex;justify-content:space-between;align-items:center;gap:8px}#kether-mobile-v5 .v34-builder h2{margin:18px 0 10px;color:#f1c86e;font-size:19px}#kether-mobile-v5 .v34-builder>header h2{margin:0}#kether-mobile-v5 .v34-builder>header button{padding:8px 10px;border:1px solid #4a93aa;border-radius:10px;background:#17364a;color:#72e6ff}#kether-mobile-v5 .v34-two,#kether-mobile-v5 .v34-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#kether-mobile-v5 .v34-builder label{display:grid;gap:6px;padding:10px;border:1px solid #2f3d54;border-radius:13px;background:#172131}#kether-mobile-v5 .v34-builder label>span{color:#8391a7;font-size:11px}#kether-mobile-v5 .v34-builder select{min-width:0;width:100%;padding:10px 7px;border:1px solid #3d4e69;border-radius:9px;background:#0c131e;color:#fff}#kether-mobile-v5 .v34-saved{color:#8391a7;font-size:12px;line-height:1.6}#kether-mobile-v5 .v34-footer{display:block!important;padding:0!important;text-align:left!important}#kether-mobile-v5.k5-home-mode .k5-app-footer{display:block!important;flex:0 0 auto}#kether-mobile-v5 .v34-footer>summary{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;cursor:pointer;list-style:none}#kether-mobile-v5 .v34-footer>summary span{display:grid}#kether-mobile-v5 .v34-footer>summary small{margin-top:3px}#kether-mobile-v5 .v34-footer>summary b{color:#72e6ff}#kether-mobile-v5 .v34-footer[open]>summary b{transform:rotate(180deg)}#kether-mobile-v5 .v34-footer>div{display:grid;gap:9px;padding:4px 16px 19px;border-top:1px solid #2b3549}#kether-mobile-v5 .v34-footer nav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}#kether-mobile-v5 .v34-footer nav button,#kether-mobile-v5 .v34-footer nav a{display:flex;justify-content:center;align-items:center;min-height:40px;border:1px solid #33425c;border-radius:11px;background:#151d2b;color:#dbe5f3;text-decoration:none}#kether-mobile-v5 .v34-footer p{margin:0;color:#8d99ac;font-size:12px;line-height:1.5}#kether-mobile-v5 .v34-footer>div>span{color:#f1c86e}#kether-mobile-v5 .v34-footer>div>small{color:#778397}`;
  document.head.appendChild(styles);
})();

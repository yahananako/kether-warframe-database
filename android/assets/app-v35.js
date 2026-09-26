(() => {
  "use strict";

  const root = document.getElementById("kether-mobile-v5");
  const body = document.getElementById("k5-body");
  const catalog = window.KETHER_V3_DATA?.incarnonCatalog;
  if (!root || !body || !catalog?.weapons) return;

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>\"]/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
    );
  const categoryLabels = {
    primary: "主要武器",
    secondary: "次要武器",
    melee: "近戰武器",
  };
  let activeCategory = "all";
  let activeQuery = "";

  function searchableText(weapon) {
    return [
      weapon.name,
      weapon.nameZh,
      weapon.effect?.zh,
      weapon.effect?.en,
      ...(weapon.evolutions || []).flatMap((evolution) => [
        evolution.unlockCondition?.zh,
        evolution.unlockCondition?.en,
        ...(evolution.abilities || []).flatMap((ability) => [
          ability.name,
          ability.description,
          ability.notes,
        ]),
      ]),
    ]
      .join(" ")
      .toLowerCase();
  }

  function evolutionCard(evolution) {
    const abilities = evolution.abilities
      .map((ability) => {
        const variants = ability.variantValues
          ? `<details class="v35-sub"><summary>各版本數值</summary><dl>${Object.entries(
              ability.variantValues,
            )
              .map(
                ([name, value]) =>
                  `<div><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`,
              )
              .join("")}</dl></details>`
          : "";
        const notes = ability.notes
          ? `<details class="v35-sub"><summary>能力備註</summary><p>${escapeHtml(
              ability.notes,
            )}</p></details>`
          : "";
        return `<article class="v35-ability"><h4>${escapeHtml(
          ability.name,
        )}</h4><p>${escapeHtml(ability.description)}</p>${variants}${notes}</article>`;
      })
      .join("");
    const unlockZh = evolution.unlockCondition?.zh || evolution.unlockCondition?.en;
    const unlockEn = evolution.unlockCondition?.zh ? evolution.unlockCondition?.en : "";

    return `<section class="v35-evo"><header><b>EVO ${evolution.tier}</b><strong>${
      evolution.tier === 1 ? "靈化形態" : "進化能力"
    }</strong></header><div class="v35-unlock"><small>進化解鎖條件</small><strong>${escapeHtml(
      unlockZh,
    )}</strong>${unlockEn ? `<span>${escapeHtml(unlockEn)}</span>` : ""}</div><div class="v35-abilities">${abilities}</div></section>`;
  }

  function weaponCard(weapon) {
    const kind = weapon.kind === "genesis" ? "應感創件" : "原生應感";
    return `<details class="v35-weapon"><summary><span class="v35-art"><img src="${escapeHtml(
      weapon.image,
    )}" alt="${escapeHtml(weapon.nameZh)}"></span><span class="v35-copy"><span class="v35-badges"><b>${kind}</b>${
      weapon.rotation ? `<i>輪替 ${weapon.rotation}</i>` : ""
    }</span><strong>${escapeHtml(weapon.nameZh)}</strong><small>${escapeHtml(
      weapon.name,
    )}</small><em>靈化特效</em><p>${escapeHtml(
      weapon.effect?.zh,
    )}</p><i class="v35-open">查看 ${weapon.evolutions.length} 階進化能力　＋</i></span></summary><div class="v35-detail">${weapon.evolutions
      .map(evolutionCard)
      .join("")}<a href="${escapeHtml(
      weapon.sourceUrl,
    )}">Warframe Wiki 原始資料 ↗</a></div></details>`;
  }

  function renderResults() {
    const normalizedQuery = activeQuery.trim().toLowerCase();
    const weapons = catalog.weapons.filter(
      (weapon) =>
        (activeCategory === "all" || weapon.category === activeCategory) &&
        (!normalizedQuery || searchableText(weapon).includes(normalizedQuery)),
    );
    const target = body.querySelector("#v35-results");
    const count = body.querySelector("#v35-count");
    if (count) count.textContent = `${weapons.length} / ${catalog.weapons.length} 把`;
    if (!target) return;

    target.innerHTML = ["primary", "secondary", "melee"]
      .map((category) => {
        const items = weapons.filter((weapon) => weapon.category === category);
        if (!items.length) return "";
        return `<section class="v35-section"><header><span><small>${category.toUpperCase()} INCARNON</small><h2>${categoryLabels[category]}</h2></span><b>${items.length}</b></header><div>${items
          .map(weaponCard)
          .join("")}</div></section>`;
      })
      .join("");
    if (!weapons.length) {
      target.innerHTML =
        '<div class="v35-empty"><strong>找不到符合的靈化武器</strong><p>試著清除搜尋文字或切換分類。</p></div>';
    }
  }

  function showIncarnon() {
    activeCategory = "all";
    activeQuery = "";
    body.innerHTML = `<header class="v35-head"><small>KETHER INCARNON ARMORY</small><h1>靈化武器列表</h1><p>主要・次要・近戰｜圖片、靈化特效、進化解鎖條件與能力</p><div><strong>${catalog.totals.all}</strong><span>全部</span><strong>${catalog.totals.genesis}</strong><span>創件</span><strong>${catalog.totals.natural}</strong><span>原生</span></div></header><section class="v35-tools"><label><span>⌕</span><input id="v35-query" type="search" placeholder="搜尋中英文名稱、特效或能力…"></label><nav>${[
      ["all", "全部"],
      ["primary", "主要"],
      ["secondary", "次要"],
      ["melee", "近戰"],
    ]
      .map(
        ([value, label], index) =>
          `<button data-v35-category="${value}" class="${index === 0 ? "on" : ""}">${label}</button>`,
      )
      .join("")}</nav><p id="v35-count"></p></section><main id="v35-results"></main>`;
    root.querySelector("#k5-menu").hidden = true;
    renderResults();
    window.scrollTo(0, 0);
  }

  window.addEventListener(
    "click",
    (event) => {
      const trigger = event.target.closest?.(
        '[data-kind="靈化武器"],[data-search-kind="靈化武器"],[data-v35-incarnon],[data-v35-category]',
      );
      if (!trigger) return;
      if (
        trigger.dataset.v35Category === undefined &&
        !document.body.classList.contains("k5-authenticated")
      ) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();

      if (trigger.dataset.v35Category !== undefined) {
        activeCategory = trigger.dataset.v35Category;
        body.querySelectorAll("[data-v35-category]").forEach((button) => {
          button.classList.toggle("on", button === trigger);
        });
        renderResults();
      } else {
        showIncarnon();
      }
    },
    true,
  );

  window.addEventListener("input", (event) => {
    if (event.target.id !== "v35-query") return;
    activeQuery = event.target.value;
    renderResults();
  });

  const footerNav = root.querySelector(".v34-footer nav");
  if (footerNav && !footerNav.querySelector("[data-v35-incarnon]")) {
    footerNav.insertAdjacentHTML(
      "beforeend",
      '<button type="button" data-v35-incarnon>靈化武器</button>',
    );
  }

  const styles = document.createElement("style");
  styles.textContent = `#kether-mobile-v5 .v35-head{display:grid;gap:7px;padding:20px;border:1px solid #33425c;border-radius:23px;background:radial-gradient(circle at 80% 0,rgba(112,231,255,.17),transparent 44%),linear-gradient(145deg,#182233,#0e1520)}#kether-mobile-v5 .v35-head>small{color:#72e6ff;letter-spacing:.12em}#kether-mobile-v5 .v35-head h1{margin:0;color:#f1c86e;font-size:31px}#kether-mobile-v5 .v35-head p{margin:0;color:#aeb8c8;line-height:1.55}#kether-mobile-v5 .v35-head>div{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr;align-items:baseline;gap:5px;margin-top:7px;padding:10px 12px;border-radius:14px;background:#0b111b}#kether-mobile-v5 .v35-head>div strong{color:#72e6ff;font-size:20px}#kether-mobile-v5 .v35-head>div span{color:#8794a8;font-size:11px}#kether-mobile-v5 .v35-tools{position:sticky;top:6px;z-index:5;display:grid;gap:9px;margin:12px 0 18px;padding:10px;border:1px solid #33425c;border-radius:18px;background:rgba(13,19,30,.96);box-shadow:0 12px 26px #0008;backdrop-filter:blur(18px)}#kether-mobile-v5 .v35-tools>label{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px;padding:0 12px;border:1px solid #32435d;border-radius:13px;background:#151e2c;color:#72e6ff}#kether-mobile-v5 .v35-tools input{min-height:43px;border:0;outline:0;background:transparent;color:#fff}#kether-mobile-v5 .v35-tools nav{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#kether-mobile-v5 .v35-tools button{min-height:37px;border:1px solid #33425c;border-radius:11px;background:#151e2c;color:#aeb8c8}#kether-mobile-v5 .v35-tools button.on{border-color:#72e6ff;background:#153849;color:#72e6ff}#kether-mobile-v5 .v35-tools>p{margin:0;color:#8794a8;text-align:center;font-size:11px}#kether-mobile-v5 #v35-results{display:grid;gap:24px}#kether-mobile-v5 .v35-section>header{display:flex;align-items:end;justify-content:space-between;margin-bottom:10px;padding:0 3px}#kether-mobile-v5 .v35-section>header small{color:#72e6ff;letter-spacing:.1em}#kether-mobile-v5 .v35-section>header h2{margin:3px 0 0;color:#f1c86e}#kether-mobile-v5 .v35-section>header>b{display:grid;place-items:center;width:42px;height:42px;border:1px solid #3d4c66;border-radius:13px;background:#151e2c;color:#72e6ff}#kether-mobile-v5 .v35-section>div{display:grid;gap:11px}#kether-mobile-v5 .v35-weapon{overflow:hidden;border:1px solid #33425c;border-radius:21px;background:linear-gradient(145deg,#151e2c,#0e151f)}#kether-mobile-v5 .v35-weapon>summary{display:grid;grid-template-columns:38% 1fr;min-height:218px;list-style:none}#kether-mobile-v5 .v35-art{display:grid;place-items:center;padding:8px;background:radial-gradient(circle,rgba(112,231,255,.17),transparent 65%)}#kether-mobile-v5 .v35-art img{width:115%;max-width:175px;height:190px;object-fit:contain;filter:drop-shadow(0 15px 15px #0009)}#kether-mobile-v5 .v35-copy{min-width:0;display:flex;flex-direction:column;padding:15px 13px 13px 3px}#kether-mobile-v5 .v35-badges{display:flex;gap:5px}#kether-mobile-v5 .v35-badges b,#kether-mobile-v5 .v35-badges i{padding:4px 7px;border-radius:999px;background:#213047;color:#72e6ff;font-size:9px;font-style:normal}#kether-mobile-v5 .v35-copy>strong{margin-top:9px;color:#fff;font-size:23px}#kether-mobile-v5 .v35-copy>small{color:#b69cff;letter-spacing:.08em}#kether-mobile-v5 .v35-copy>em{margin-top:10px;color:#72e6ff;font-size:9px;font-style:normal;letter-spacing:.1em}#kether-mobile-v5 .v35-copy>p{display:-webkit-box;overflow:hidden;margin:5px 0;color:#b4becc;font-size:11px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:4}#kether-mobile-v5 .v35-open{margin-top:auto;color:#f1c86e;font-size:10px;font-style:normal;font-weight:700}#kether-mobile-v5 .v35-detail{display:grid;gap:10px;padding:12px;border-top:1px solid #33425c}#kether-mobile-v5 .v35-evo{padding:13px;border:1px solid #33425c;border-radius:16px;background:#111a27}#kether-mobile-v5 .v35-evo>header{display:flex;align-items:center;gap:8px}#kether-mobile-v5 .v35-evo>header b{padding:5px 8px;border-radius:8px;background:linear-gradient(135deg,#7660c8,#377e96);color:#fff;font-size:10px}#kether-mobile-v5 .v35-evo>header strong{color:#f1c86e}#kether-mobile-v5 .v35-unlock{display:grid;gap:3px;margin-top:10px;padding:10px;border-left:3px solid #72e6ff;border-radius:4px 10px 10px 4px;background:#142533}#kether-mobile-v5 .v35-unlock small{color:#72e6ff}#kether-mobile-v5 .v35-unlock strong{color:#e7edf6;font-size:12px;line-height:1.55}#kether-mobile-v5 .v35-unlock span{color:#8290a4;font-size:9px;line-height:1.5}#kether-mobile-v5 .v35-abilities{display:grid;gap:7px;margin-top:9px}#kether-mobile-v5 .v35-ability{padding:10px;border:1px solid #29394f;border-radius:12px;background:#172131}#kether-mobile-v5 .v35-ability h4{margin:0;color:#b69cff}#kether-mobile-v5 .v35-ability p{margin:5px 0 0;color:#aeb8c8;font-size:11px;line-height:1.6;white-space:pre-line}#kether-mobile-v5 .v35-sub{margin-top:7px;border-top:1px dashed #38465b}#kether-mobile-v5 .v35-sub summary{padding-top:7px;color:#72e6ff;font-size:10px}#kether-mobile-v5 .v35-sub dl{display:grid;gap:4px;margin:7px 0 0}#kether-mobile-v5 .v35-sub dl div{display:grid;grid-template-columns:70px 1fr;gap:6px;padding:6px;border-radius:8px;background:#0f1723}#kether-mobile-v5 .v35-sub dt,#kether-mobile-v5 .v35-sub dd{margin:0;color:#aeb8c8;font-size:9px;white-space:pre-line}#kether-mobile-v5 .v35-sub dt{color:#f1c86e}#kether-mobile-v5 .v35-detail>a{color:#72e6ff;font-size:10px;text-decoration:none}#kether-mobile-v5 .v35-empty{padding:40px 20px;border:1px dashed #40506b;border-radius:20px;color:#aeb8c8;text-align:center}#kether-mobile-v5 .v35-empty strong{color:#f1c86e}`;
  document.head.appendChild(styles);
})();

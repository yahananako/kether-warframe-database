(()=>{
  const stations=[
    ["cetus","希圖斯","地球晝夜"],
    ["vallis","奧布山谷","金星冷暖"],
    ["cambion","魔裔禁地","Fass／Vome"],
    ["zariman","扎日曼","虛空狀態"],
    ["duviri","渡域","螺旋輪替"],
    ["baro","虛空商人","Baro Ki'Teer"],
    ["fissures","虛空裂縫","裂縫完整清單"],
    ["invasions","入侵戰線","進度與獎勵"],
    ["sortie","每日突擊","三階段任務"],
    ["archon-hunt","執政官獵殺","本週目標"],
    ["alerts","特殊警報","倒數與獎勵"],
    ["news","官方新聞","最新公告"],
  ];
  const escape=value=>String(value||"").replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  const enhance=()=>{
    const world=document.querySelector("#kether-mobile-v5 .v32-world");
    if(!world||world.querySelector(".v33-stations"))return;
    const panel=document.createElement("section");
    panel.className="v33-stations";
    panel.innerHTML='<div class="v33-heading"><span>◆ 12 座情報站</span><b>點選進入完整頁面</b></div><div class="v33-grid">'+stations.map(item=>'<a href="https://kether-warframe-database.vercel.app/live/'+escape(item[0])+'"><strong>'+escape(item[1])+'</strong><small>'+escape(item[2])+'</small><i>開啟 ›</i></a>').join("")+'</div>';
    const live=world.querySelector(".v32-live");
    live?.insertAdjacentElement("afterend",panel);
  };
  const previous=window.ketherWorldResult;
  if(typeof previous==="function"){
    window.ketherWorldResult=encoded=>{
      previous(encoded);
      queueMicrotask(enhance);
    };
  }
  const style=document.createElement("style");
  style.textContent='#kether-mobile-v5 .v33-stations{display:grid;gap:12px;padding:14px;border:1px solid #33425c;border-radius:18px;background:#0f1724}#kether-mobile-v5 .v33-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#72e6ff;font-size:12px}#kether-mobile-v5 .v33-heading b{color:#aeb8c8;font-size:11px;font-weight:600}#kether-mobile-v5 .v33-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#kether-mobile-v5 .v33-grid a{display:grid;gap:3px;padding:11px 12px;border:1px solid #30445e;border-radius:13px;background:#111d2c;color:#edf6ff;text-decoration:none}#kether-mobile-v5 .v33-grid strong{font-size:13px}#kether-mobile-v5 .v33-grid small{overflow:hidden;color:#8493a8;font-size:10px;white-space:nowrap;text-overflow:ellipsis}#kether-mobile-v5 .v33-grid i{margin-top:3px;color:#f1c86e;font-size:10px;font-style:normal;font-weight:700}';
  document.head.appendChild(style);
})();

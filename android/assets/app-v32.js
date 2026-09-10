(()=>{
  'use strict';

  const body=document.getElementById('k5-body');
  if(!body)return;

  const officialNightwave=window.KETHER_NIGHTWAVE_TC?.challenges||{};
  const missionMap={
    Capture:'捕獲',Exterminate:'殲滅',Extermination:'殲滅',Survival:'生存',Defense:'防禦',
    'Mobile Defense':'移動防禦',Spy:'間諜',Rescue:'救援',Sabotage:'破壞',Excavation:'挖掘',
    Interception:'攔截',Disruption:'中斷',Defection:'叛逃',Hijack:'劫持',Assassination:'刺殺',
    Crossfire:'交戰','Crossfire Exterminate':'交戰殲滅','Void Flood':'虛空洪流',
    'Void Cascade':'虛空級聯','Void Armageddon':'虛空決戰',Alchemy:'鍊金術',
    'Mirror Defense':'鏡像防禦','Infested Salvage':'感染打撈',Assault:'強襲',
    Pursuit:'追擊',Rush:'突擊',Skirmish:'前哨戰',Volatile:'揮發物',Orphix:'奧影',Unknown:'未知任務'
  };
  const factionMap={
    Grineer:'克隆尼',Corpus:'科普斯',Infested:'感染者',Infestation:'感染者',Corrupted:'墮落者',
    Orokin:'Orokin',Sentient:'Sentient',Narmer:'納爾梅',Tenno:'天諾',Neutral:'中立'
  };
  const cycleMap={
    day:'白晝',night:'夜晚',warm:'溫暖',cold:'寒冷',fass:'法斯',vome:'維姆',
    corpus:'科普斯掌控',grineer:'克隆尼掌控',calm:'平靜',anger:'憤怒',envy:'嫉妒',
    sorrow:'悲傷',joy:'喜悅',fear:'恐懼'
  };
  const tierMap={Lith:'古紀',Meso:'前紀',Neo:'中紀',Axi:'後紀',Requiem:'安魂',Omnia:'全紀'};
  const planetMap={
    Earth:'地球',Venus:'金星',Mercury:'水星',Mars:'火星',Phobos:'火衛一',Deimos:'火衛二',
    Ceres:'穀神星',Jupiter:'木星',Europa:'歐羅巴',Saturn:'土星',Uranus:'天王星',
    Neptune:'海王星',Pluto:'冥王星',Sedna:'賽德娜',Eris:'鬩神星',Lua:'月球',Void:'虛空',
    Zariman:'札日曼','Kuva Fortress':'赤毒要塞'
  };
  const modifierMap={
    'Augmented Enemy Armor':'強化敵人護甲','Eximus Stronghold':'卓越者堡壘',
    'Energy Reduction':'能量減少','Radiation Hazard':'輻射危害','Dense Fog':'濃霧',
    'Low Gravity':'低重力','Magnetic Anomalies':'磁力異常','Enemy Physical Enhancement':'敵人物理強化',
    'Extreme Cold':'極寒環境','Fire Hazard':'火焰危害','Cryogenic Leakage':'低溫洩漏',
    'Enemy Elemental Enhancement':'敵人元素強化','Weapon Restriction':'武器限制'
  };
  const elementMap={Radiation:'輻射',Corrosive:'腐蝕',Heat:'火焰',Cold:'冰凍',Electricity:'電擊',
    Magnetic:'磁力',Viral:'病毒',Gas:'毒氣',Blast:'爆炸',Toxin:'毒素',Impact:'衝擊',Puncture:'穿刺',Slash:'切割'};
  const itemTerms=[
    ['Orokin Catalyst Blueprint','Orokin 催化劑藍圖'],['Orokin Reactor Blueprint','Orokin 反應爐藍圖'],
    ['Forma Blueprint','Forma 藍圖'],['Nitain Extract','硝化萃取物'],['Detonite Injector','爆燃噴射器'],
    ['Fieldron','電磁力場裝置'],['Mutagen Mass','突變原聚合物'],['Twin Vipers Wraith','雙子蝰蛇 亡魂'],
    ['Dera Vandal','德拉 破壞者'],['Karak Wraith','卡拉克 亡魂'],['Latron Wraith','拉特昂 亡魂'],
    ['Snipetron Vandal','狙擊特昂 破壞者'],['Strun Wraith','斯特朗 亡魂'],['Sheev','希芙'],
    ['Weapon Exilus Adapter','武器特殊功能槽連接器'],['Exilus Warframe Adapter','Warframe 特殊功能槽連接器'],
    ['Riven Mod','裂罅 MOD'],['Endo','內融核心'],['Kuva','赤毒'],['Credits','現金'],
    ['Blueprint','藍圖'],['Receiver','機匣'],['Barrel','槍管'],['Stock','槍托'],['Blade','刀刃'],['Handle','握柄']
  ];

  const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mapped=(map,value,fallback='資料同步中')=>value?(map[value]||value):fallback;
  const mission=value=>mapped(missionMap,value,'任務同步中');
  const faction=value=>mapped(factionMap,value,'派系同步中');
  const cycle=value=>mapped(cycleMap,String(value||'').toLowerCase(),'循環同步中');
  const tier=value=>mapped(tierMap,value,'遺物紀元');

  function duration(value){
    if(!value)return '時間同步中';
    return String(value)
      .replace(/(\d+)\s*d\b/gi,'$1天')
      .replace(/(\d+)\s*h\b/gi,'$1小時')
      .replace(/(\d+)\s*m\b/gi,'$1分')
      .replace(/(\d+)\s*s\b/gi,'$1秒')
      .replace(/\s+/g,' ')
      .trim();
  }

  function eta(item){
    if(!item)return '時間同步中';
    if(item.eta||item.timeLeft||item.shortString)return duration(item.eta||item.timeLeft||item.shortString);
    const end=new Date(item.expiry||0).getTime(),left=end-Date.now();
    if(!Number.isFinite(left)||left<=0)return '即將更新';
    const minutes=Math.ceil(left/60000),days=Math.floor(minutes/1440),hours=Math.floor(minutes%1440/60),mins=minutes%60;
    return [days&&days+'天',hours&&hours+'小時',mins+'分'].filter(Boolean).join(' ');
  }

  function node(value){
    return String(value||'未知節點')
      .replace(/\(([^)]+)\)/g,(_,name)=>'（'+(planetMap[name]||name)+'）')
      .replace(/\bRelay\b/g,'中繼站');
  }

  function item(value){
    let result=String(value||'');
    for(const [from,to] of itemTerms)result=result.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),to);
    return result||'獎勵同步中';
  }

  function reward(value){
    if(!value)return '獎勵同步中';
    if(value.asString)return item(value.asString);
    const rows=[];
    for(const entry of value.countedItems||[])rows.push((entry.count||1)+' × '+item(entry.type||entry.key));
    for(const entry of value.items||[])rows.push(item(entry));
    if(value.credits)rows.push(value.credits+' 現金');
    return rows.join('、')||'獎勵同步中';
  }

  function modifier(value){
    let result=String(value||'特殊條件同步中');
    for(const [from,to] of Object.entries(modifierMap))result=result.replace(from,to);
    for(const [from,to] of Object.entries(elementMap))result=result.replace(new RegExp(from,'gi'),to);
    return result.replace(/:\s*/g,'：');
  }

  function nightwave(item){
    const key=String(item.id||'').replace(/^\d+/,'').toLowerCase();
    const translated=officialNightwave[key];
    if(!translated)return {title:item.title||'午夜電波挑戰',desc:item.desc||'挑戰資料同步中'};
    const liveCount=String(item.desc||'').match(/\b\d[\d,]*/)?.[0]||String(translated[2]||'');
    const desc=String(translated[1]||'')
      .replace(/<DT_[^>]+>\s*/g,'')
      .replace(/\|COUNT\|/g,liveCount)
      .replace(/\s+/g,' ')
      .replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g,'$1')
      .trim();
    return {title:translated[0]||item.title||'午夜電波挑戰',desc:desc||item.desc||'挑戰資料同步中'};
  }

  const section=(title,count,rows,empty)=>'<details class="v32-fold" open><summary><b>'+E(title)+'</b><span>'+E(count)+' 筆</span></summary><div class="v3-radio-list">'+(rows.length?rows.join(''):'<p class="v3-empty">'+E(empty)+'</p>')+'</div></details>';
  const row=(title,detail,meta)=>'<article><b>'+E(title)+'</b><p>'+E(detail)+'</p><span>'+E(meta)+'</span></article>';

  window.ketherWorldResult=encoded=>{
    const loading=body.querySelector('.v3-signal');
    if(!loading)return;
    if(!encoded){loading.innerHTML='<p>世界狀態暫時無法連線，請稍後重新開啟。</p>';return}
    try{
      const json=JSON.parse(new TextDecoder('utf-8').decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))));
      const cycles=[
        ['地球',json.earthCycle?.state,json.earthCycle],['希圖斯',json.cetusCycle?.state,json.cetusCycle],
        ['奧布山谷',json.vallisCycle?.state,json.vallisCycle],['火衛二',json.cambionCycle?.state||json.cambionCycle?.active,json.cambionCycle],
        ['札日曼',json.zarimanCycle?.state,json.zarimanCycle],['渡域',json.duviriCycle?.state,json.duviriCycle]
      ];
      const alerts=(json.alerts||[]).map(x=>row(node(x.mission?.node||'警報任務'),mission(x.mission?.type)+'・'+faction(x.mission?.faction),reward(x.mission?.reward)+'・剩餘 '+eta(x)));
      const fissures=(json.fissures||[]).filter(x=>!x.expired).map(x=>row(tier(x.tier)+'・'+mission(x.missionType),node(x.node)+'・'+faction(x.enemy),((x.isStorm?'虛空風暴':'虛空裂縫')+(x.isHard?'・鋼韌之道':'')+'・剩餘 '+eta(x))));
      const invasions=(json.invasions||[]).filter(x=>!x.completed).map(x=>row(node(x.node),faction(x.attacker?.faction)+' 對 '+faction(x.defender?.faction),'進攻獎勵：'+reward(x.attacker?.reward)+'｜防守獎勵：'+reward(x.defender?.reward)+'｜進度 '+Math.round(x.completion||0)+'%'));
      const night=(json.nightwave?.activeChallenges||[]).map(x=>{const z=nightwave(x),kind=x.isElite?'菁英週任':x.isDaily?'每日任務':'每週任務';return row(z.title,z.desc,kind+'・'+(x.reputation||0)+' 聲望・剩餘 '+eta(x))});
      const sortie=(json.sortie?.variants||[]).map((x,index)=>row('突擊 '+(index+1)+'・'+mission(x.missionType),node(x.node),modifier(x.modifier)));
      const archon=(json.archonHunt?.missions||[]).map((x,index)=>row('執政官獵殺 '+(index+1)+'・'+mission(x.type),node(x.node),mapped({'Archon Amar':'執政官阿瑪','Archon Boreal':'執政官博瑞爾','Archon Nira':'執政官妮拉'},json.archonHunt?.boss,'執政官')));
      const synced=(()=>{try{return new Date(json.timestamp).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}catch(_){return '剛剛'}})();
      loading.outerHTML='<section class="v3-world v32-world"><div class="v32-live"><span>◆ 始源星系即時訊號</span><b>同步：'+E(synced)+'</b></div><h3>星球循環</h3><div class="v3-cycle-grid v32-cycles">'+cycles.map(x=>'<article><span></span><small>'+E(x[0])+'</small><b>'+E(cycle(x[1]))+'</b><em>剩餘 '+E(eta(x[2]))+'</em></article>').join('')+'</div>'+section('特殊警報',alerts.length,alerts,'目前沒有特殊警報')+section('虛空裂縫與風暴',fissures.length,fissures,'目前沒有裂縫訊號')+section('入侵戰線',invasions.length,invasions,'目前沒有入侵戰線')+section('每日突擊',sortie.length,sortie,'突擊資料同步中')+section('執政官獵殺',archon.length,archon,'執政官資料同步中')+section('午夜電波挑戰',night.length,night,'目前沒有午夜電波挑戰')+'<details class="v32-fold" open><summary><b>虛空商人</b><span>'+E(json.voidTrader?.active?'已抵達':'尚未抵達')+'</span></summary><div class="v3-radio-list">'+row('Baro Ki\'Teer',node(json.voidTrader?.location||'位置尚未公布'),eta(json.voidTrader))+'</div></details><p class="v32-source">即時資料：WarframeStat.us｜午夜電波翻譯：Warframe 繁體中文公開匯出</p></section>';
    }catch(error){loading.innerHTML='<p>世界狀態解析失敗，請稍後重試。</p>'}
  };

  const style=document.createElement('style');
  style.textContent='#kether-mobile-v5 .v32-world{display:grid;gap:14px}#kether-mobile-v5 .v32-live{display:flex;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid #32516a;border-radius:14px;background:#101b2b;color:#72e6ff;font-size:12px}#kether-mobile-v5 .v32-live b{color:#aeb8c8;font-weight:600;text-align:right}#kether-mobile-v5 .v32-cycles{grid-template-columns:repeat(2,minmax(0,1fr))}#kether-mobile-v5 .v32-fold{overflow:hidden;border:1px solid #33425c;border-radius:18px;background:#0f1724}#kether-mobile-v5 .v32-fold>summary{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;cursor:pointer;list-style:none;color:#f1c86e}#kether-mobile-v5 .v32-fold>summary::-webkit-details-marker{display:none}#kether-mobile-v5 .v32-fold>summary span{color:#72e6ff;font-size:12px}#kether-mobile-v5 .v32-fold>.v3-radio-list{padding:0 12px 12px}#kether-mobile-v5 .v32-source{color:#7f8ca1;font-size:11px;line-height:1.6;text-align:center}';
  document.head.appendChild(style);
})();

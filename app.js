"use strict";

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
const pick = list => list[Math.floor(Math.random() * list.length)];
const GAME_DEFS = [
  {id:"spy", name:"谁是卧底", min:4, rule:"轮流看词、描述、投票，找出拿到不同词的人。", art:"spy"},
  {id:"bomb", name:"数字炸弹", min:2, rule:"轮流猜 1–100；每次缩小范围，猜中炸弹的人结束本轮。", art:"bomb"},
  {id:"five", name:"5 秒说三个", min:2, rule:"轮流在 5 秒内说出指定的三个答案，由大家判断是否完成。", art:"five"},
  {id:"charades", name:"你比我猜", min:2, rule:"一人看词后用动作表演，其他人猜；不能说话或比划文字，每轮 60 秒。", art:"guess"},
  {id:"truth", name:"真心话大冒险", min:2, rule:"轮流抽题；不想答可以换题。", art:"truth"},
  {id:"match", name:"默契大考验", min:2, rule:"依次私下选答案，最后一起揭晓有多少人选一样。", art:"match"},
  {id:"dice", name:"掷骰比大小", min:2, rule:"每人轮流掷一次骰子，点数最大的人获胜；同点数并列，可以再玩一轮。", art:"dice"}
];
const FIVE = ["说出三个迟到的离谱理由","说出三个手机只剩 1% 电时的反应","说出三件嘴上说不买却买了的东西","说出三个让群聊突然安静的话题","说出三件出门后才想起忘带的东西","说出三个假装自己很忙的动作","说出三句朋友说完你就知道要借钱的开场白","说出三个周一不想起床的理由","说出三件小时候坚信、长大才发现不对的事","说出三种奶茶店里纠结半天的选择","说出三个外卖迟迟不来时的猜想","说出三种收到‘在吗’时的内心活动","说出三个不想结束假期的理由","说出三件以为只要五分钟、结果花了一小时的事","说出三种你给闹钟起过的名字","说出三个网购拆箱时可能出现的表情","说出三句电影里常见的台词","说出三个适合今天这场聚会的名字","说出三件做完会觉得自己很厉害的小事","说出三个让你立刻放下手机的理由","说出三种猫可能嫌弃人类的原因","说出三句夸朋友新发型的话","说出三件旅行回来才后悔没做的事","说出三个想给未来自己发的提醒"];
const CHARADES = ["刷牙","打喷嚏","跳绳","煮面","打羽毛球","坐过山车","撑伞","照镜子","拍照","骑自行车","钓鱼","弹钢琴","看恐怖电影","吃火锅","放风筝","找钥匙","挤地铁","遛狗","搬快递","做瑜伽","喝到很烫的水","打蚊子","抢红包","偷偷吃零食"];
const TRUTH = ["最近一件让你开心的小事是什么？","如果多出一天假期，你想做什么？","最近循环的一首歌是什么？","你小时候最想拥有什么超能力？","推荐一个你喜欢的地方。","今天你最想吃什么？","你最近学会了什么小事？","这桌人一起旅行，你想去哪里？","如果能马上学会一项技能，你选什么？","说一部你愿意再看一遍的电影。"];
const DARE = ["用动作表演一种动物，让大家猜。","给桌上一件物品起个名字。","用播音腔介绍今天的聚会。","为自己设计一个三秒钟的出场动作。","只用手势表达“我饿了”。","用不同语气说三次“我准备好了”。","模仿慢动作走路五秒。","给大家推荐一种你喜欢的零食。"];
const MATCH = [
  {q:"现在点一份夜宵，你选哪样？",a:["烧烤","火锅","面条","甜品"]},
  {q:"周末出门，你先去哪？",a:["公园","电影院","咖啡馆","商场"]},
  {q:"一起去旅行，先带哪件？",a:["相机","零食","扑克牌","充电宝"]},
  {q:"给今天选一个背景音，你选？",a:["流行","爵士","电子","轻音乐"]},
  {q:"约一场聚会，你更想？",a:["做饭","看电影","逛街","玩游戏"]},
  {q:"收到一份小礼物，你希望是？",a:["花","书","小摆件","零食"]}
];
const SPY = [["可乐","雪碧"],["橙子","橘子"],["雨伞","雨衣"],["电影","电视剧"],["包子","饺子"],["咖啡","奶茶"],["书店","图书馆"],["地铁","公交车"]];
const DEFAULT_NAMES = ["小水","小满","阿圆","小北","阿乐"];
const state = {screen:"home",count:4,names:DEFAULT_NAMES.slice(0,4),theme:"purple",sound:false,game:null,data:null,wheelRotation:0,wheelChoice:null,timer:null,wheelFrame:null,used:{five:[],charades:[],truth:[],dare:[],match:[],spy:[]}};
try {const saved=JSON.parse(localStorage.getItem("shui-party-box-v2"));if(saved&&Array.isArray(saved.names)&&saved.names.length>=2&&saved.names.length<=5){state.count=saved.names.length;state.names=saved.names.map(x=>String(x).slice(0,16));}} catch {}
// 公共游玩版固定紫色。其他配色仅作为 Skill 的开发模板。
const visualTheme=["purple","blue","orange"].includes(window.PARTY_THEME)?window.PARTY_THEME:"purple";
document.body.dataset.theme=visualTheme;
if(visualTheme!=="purple")$("heroArt").src={blue:"assets/blue-dice.png",orange:"assets/cream-tabletop.png"}[visualTheme];
if(window.PARTY_LAYOUT==="compact")document.body.dataset.layout="compact";
document.body.dataset.screen="home";

function save(){try{localStorage.setItem("shui-party-box-v2",JSON.stringify({names:state.names}));}catch{}}
function notify(message){const node=$("toast");node.textContent=message;clearTimeout(notify.t);notify.t=setTimeout(()=>node.textContent="",2800);}
function sound(freq=500,duration=.06){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.value=freq;gain.gain.value=.04;gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);osc.onended=()=>ctx.close();}catch{}}
function clearTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
function show(screen){clearTimer();cancelAnimationFrame(state.wheelFrame);state.wheelFrame=null;state.screen=screen;document.body.dataset.screen=screen;updateMusicVolume();["home","choose","wheel","game"].forEach(name=>$(name+"Screen").hidden=name!==screen);window.scrollTo({top:0,behavior:"instant"});}
function renderNames(){const row=$("countRow");row.innerHTML=[2,3,4,5].map(n=>`<button type="button" data-count="${n}" aria-pressed="${n===state.count}">${n} 人</button>`).join("");$("nameCount").textContent=`${state.count} 人`;$("nameInputs").innerHTML=Array.from({length:state.count},(_,i)=>`<input id="playerName${i}" data-name="${i}" maxlength="16" autocomplete="off" aria-label="第 ${i+1} 位参与者姓名" placeholder="第 ${i+1} 位" value="${esc(state.names[i]||"")}">`).join("");}
function readNames(){const names=[...document.querySelectorAll("[data-name]")].map(el=>el.value.trim());if(names.some(name=>!name)){ $("setupError").textContent="请填上每位参与者的名字。";return false;}if(new Set(names).size!==names.length){$("setupError").textContent="名字不要重复。";return false;}state.names=names;$("setupError").textContent="";save();return true;}
function setCount(count){[...document.querySelectorAll("[data-name]")].forEach((el,i)=>state.names[i]=el.value);state.count=count;while(state.names.length<count)state.names.push(DEFAULT_NAMES[state.names.length]||"");state.names.length=count;renderNames();}
function allowedGames(){return GAME_DEFS.filter(game=>state.count>=game.min);}
function renderChooser(){
  const descriptions={spy:"描述 · 投票 · 揭晓",bomb:"猜数字 · 缩范围",five:"限时作答",charades:"比划动作 · 猜出答案",truth:"抽题 · 换题",match:"私下选择 · 一起揭晓",dice:"轮流掷骰 · 比大小"};
  $("chooseTitle").textContent=`${state.count} 人选游戏`;$("chooseContext").textContent=`${state.count} 人 · ${state.names.join("、")}`;
  $("gameGrid").innerHTML=GAME_DEFS.map((game,i)=>`<button type="button" class="game-tile ${i===0?"featured":""}" data-open-game="${game.id}" ${state.count<game.min?"disabled":""} aria-label="${game.name}${state.count<game.min?"，需 4 人以上":""}">${i===0?'<img class="tile-scene" src="assets/spy-scene-v2.png" alt="">':`<span class="tile-illustration illustration-${game.art}" aria-hidden="true"></span>`}<span class="tile-copy"><strong>${game.name}</strong><small>${state.count<game.min?"需 4 人以上":descriptions[game.id]}</small></span><span class="tile-arrow" aria-hidden="true">›</span></button>`).join("");
}
function enterChooser(){if(!readNames())return;renderChooser();show("choose");}
function setWheelRotation(angle){
  state.wheelRotation=angle;
  $("wheel").style.transform=`rotate(${angle}deg)`;
  document.querySelectorAll(".wheel-label").forEach(label=>label.style.transform=`translate(-50%,-50%) rotate(${-angle}deg)`);
}
function createWheel(){
  const games=allowedGames(),colors=["#c7a0ef","#ffc8a1","#adbcff","#ffb3d1","#d6eb9f","#b5ddd5","#f3d997"],step=360/games.length;
  $("wheel").style.background=`conic-gradient(${games.map((_,i)=>`${colors[i]} ${i*step}deg ${(i+1)*step}deg`).join(",")})`;
  $("wheelLabels").innerHTML=games.map((game,i)=>{const rad=((i+.5)*step-90)*Math.PI/180;return `<span class="wheel-label" style="left:${50+33*Math.cos(rad)}%;top:${50+33*Math.sin(rad)}%">${game.name}</span>`;}).join("");
  setWheelRotation(state.wheelRotation);$("wheelResult").textContent="转一下，看看玩什么";$("playSpinButton").hidden=true;$("spinButton").textContent="开始转";$("spinButton").disabled=false;state.wheelChoice=null;
}
function enterWheel(){if(state.screen==="home"&&!readNames())return;show("wheel");createWheel();}
function spin(){
  if($("spinButton").disabled)return;
  const games=allowedGames(),index=Math.floor(Math.random()*games.length),step=360/games.length;
  const from=state.wheelRotation,target=Math.ceil(from/360)*360+1440+(360-(index+.5)*step)%360;
  state.wheelChoice=games[index].id;$("spinButton").disabled=true;$("playSpinButton").hidden=true;$("wheelResult").textContent="正在抽取…";
  const duration=matchMedia("(prefers-reduced-motion: reduce)").matches?0:4000,start=performance.now();
  function frame(now){
    if(state.screen!=="wheel")return;
    const progress=duration?Math.min(1,(now-start)/duration):1;
    setWheelRotation(from+(target-from)*(1-Math.pow(1-progress,4)));
    if(progress<1){state.wheelFrame=requestAnimationFrame(frame);return;}
    state.wheelFrame=null;$("wheelResult").textContent=`抽到：${games[index].name}`;$("spinButton").disabled=false;$("spinButton").textContent="再抽一次";$("playSpinButton").hidden=false;sound(720,.11);
  }
  state.wheelFrame=requestAnimationFrame(frame);
}
function freshQuestion(key,pool){let available=pool.map((_,i)=>i).filter(i=>!state.used[key].includes(i));if(!available.length){state.used[key]=[];available=pool.map((_,i)=>i);}const index=pick(available);state.used[key].push(index);return pool[index];}
function startGame(id){const game=GAME_DEFS.find(g=>g.id===id);if(!game||state.count<game.min){notify("这个游戏需要至少 4 人。");return;}clearTimer();state.game=id;$("gameScreen").dataset.game=id;state.data={turn:0,score:Object.fromEntries(state.names.map(n=>[n,0]))};if(id==="bomb")newBomb();if(id==="five")newFive();if(id==="charades")newCharades();if(id==="truth")newTruth();if(id==="match")newMatch();if(id==="spy")newSpy();if(id==="dice")newDice();$("gameTitle").textContent=game.name;$("gameRule").textContent=game.rule;$("gameCounter").textContent=`${state.count} 人`;show("game");renderGame();}
function renderGame(){switch(state.game){case"bomb":renderBomb();break;case"five":renderFive();break;case"charades":renderCharades();break;case"truth":renderTruth();break;case"match":renderMatch();break;case"spy":renderSpy();break;case"dice":renderDice();break;}}
const panel=html=>{
  $("gameBody").innerHTML=html;
  const first=$("gameBody").querySelector(".play-card");
  if(first&&!first.classList.contains("private-card")&&state.game!=="spy"&&state.game!=="dice"){
    const art=GAME_DEFS.find(g=>g.id===state.game).art;
    first.insertAdjacentHTML("afterbegin",`<span class="round-illustration illustration-${art}" aria-hidden="true"></span>`);
    first.classList.add("with-illustration");
  }
  updateMusicVolume();
};
function progressDots(index){return `<div class="player-progress" aria-label="${index} / ${state.count} 位已查看">${state.names.map((_,i)=>`<span class="${i<index?"complete":""}"></span>`).join("")}</div><p class="progress-caption">${index} / ${state.count} 位已查看</p>`;}
function mysteryCard(id=""){return `<div class="mystery-card" ${id?`id="${id}"`:""}><span class="card-star" aria-hidden="true"></span><span class="keyhole" aria-hidden="true"></span><strong>其他人先别看</strong></div>`;}

const button=(label,action,kind="primary",attrs="")=>`<button class="btn btn-${kind}" type="button" data-action="${action}" ${attrs}>${label}</button>`;
const scores=()=>`<div class="score-list">${state.names.map(name=>`<div class="score-row"><span>${esc(name)}</span><strong>${state.data.score[name]} 分</strong></div>`).join("")}</div>`;

function newBomb(){state.data={...state.data,target:1+Math.floor(Math.random()*100),low:1,high:100,turn:0,done:false,last:""};}
function renderBomb(){const d=state.data;panel(`<div class="play-card"><span class="label">${d.done?"本轮结束":`轮到 ${esc(state.names[d.turn%state.count])}`}</span><h2>${d.done?"猜中炸弹":"猜一个数字"}</h2><div class="big-value">${d.done?d.target:`${d.low}–${d.high}`}</div><p>${esc(d.last||"数字会越猜越少；猜中的人结束本轮。")}</p>${d.done?`<div class="play-actions">${button("再玩一轮","bomb-new")}</div>`:`<label class="label" for="bombGuess">输入 ${d.low}–${d.high} 的整数</label><input class="play-input" id="bombGuess" type="number" inputmode="numeric" min="${d.low}" max="${d.high}" autocomplete="off"><div class="play-actions">${button("确认猜测","bomb-guess")}</div>`}</div>`);}
function guessBomb(){const d=state.data;const value=Number($("bombGuess")?.value);if(!Number.isInteger(value)||value<d.low||value>d.high){notify(`请输入 ${d.low}–${d.high} 的整数。`);return;}sound(420,.05);if(value===d.target){d.done=true;d.last=`${state.names[d.turn%state.count]} 猜中了。`;}else{d.last=`${state.names[d.turn%state.count]} 猜 ${value}，${value<d.target?"太小了":"太大了"}。`;if(value<d.target)d.low=value+1;else d.high=value-1;d.turn++;}renderBomb();}

function newFive(){state.data={...state.data,turn:0,question:freshQuestion("five",FIVE),left:5,active:false,expired:false};}
function renderFive(){const d=state.data;panel(`<div class="play-card"><span class="label">轮到 ${esc(state.names[d.turn%state.count])}</span><h2>${esc(d.question)}</h2><div class="big-value" id="countdown">${d.left.toFixed(1)}</div><p>5 秒内说出三个答案，由在场的人判断。</p><div class="play-actions">${d.active||d.expired?`${button("完成 +1","five-done")}${button("没完成","five-fail","secondary")}`:button("开始计时","five-start")}</div></div><div class="play-card"><span class="label">本场得分</span>${scores()}</div>`);}
function startFive(){const d=state.data;if(d.active||d.expired)return;d.active=true;const end=Date.now()+5000;renderFive();state.timer=setInterval(()=>{d.left=Math.max(0,(end-Date.now())/1000);const node=$("countdown");if(node)node.textContent=d.left.toFixed(1);if(d.left<=0){clearTimer();d.active=false;d.expired=true;sound(340,.2);renderFive();}},90);}
function endFive(won){clearTimer();const d=state.data;if(won)d.score[state.names[d.turn%state.count]]++;d.turn++;d.question=freshQuestion("five",FIVE);d.left=5;d.active=false;d.expired=false;renderFive();}

function newCharades(){state.data={...state.data,turn:0,word:freshQuestion("charades",CHARADES),phase:"private",left:60,seen:false};}
function renderCharades(){
 const d=state.data,name=esc(state.names[d.turn%state.count]);
 if(d.phase==="private"){
  panel(`<div class="play-card private-card">${progressDots(d.turn%state.count)}<h2 class="pass-title">把手机交给<strong>${name}</strong></h2><p>只让表演的人看词</p>${mysteryCard("charadeSecret")}<button class="btn btn-primary" type="button" id="charadeReveal">按住看词</button><p class="release-hint">松手立即隐藏</p><div class="play-actions">${button("记住了，开始表演","charade-start","secondary","disabled")}</div></div><div class="play-card"><span class="label">本场得分</span>${scores()}</div>`);
  wireReveal("charadeReveal","charadeSecret",()=>d.word,()=>{d.seen=true;const btn=document.querySelector('[data-action="charade-start"]');if(btn)btn.disabled=false;});return;
 }
 panel(`<div class="play-card"><span class="label">${name} 正在表演</span><h2>${d.left>0?"大家猜这个词":"本轮时间到"}</h2><div class="big-value" id="countdown">${Math.ceil(d.left)}s</div><p>只用动作提示，不说话、不比划文字。</p><div class="play-actions">${button("猜对了 +1","charade-done","primary",d.left<=0?"disabled":"")}${button("跳过 / 下一位","charade-next","secondary")}</div></div><div class="play-card"><span class="label">本场得分</span>${scores()}</div>`);
}
function startCharades(){const d=state.data;if(!d.seen)return;d.phase="live";const end=Date.now()+60000;renderCharades();state.timer=setInterval(()=>{d.left=Math.max(0,(end-Date.now())/1000);const node=$("countdown");if(node)node.textContent=Math.ceil(d.left)+"s";if(d.left<=0){clearTimer();sound(340,.2);renderCharades();}},150);}
function nextCharades(won){clearTimer();const d=state.data;if(won&&d.left>0)d.score[state.names[d.turn%state.count]]++;d.turn++;d.word=freshQuestion("charades",CHARADES);d.phase="private";d.left=60;d.seen=false;renderCharades();}

function newTruth(){state.data={...state.data,turn:0,mode:"truth",question:freshQuestion("truth",TRUTH)};}
function renderTruth(){const d=state.data;panel(`<div class="play-card"><span class="label">轮到 ${esc(state.names[d.turn%state.count])}</span><h2>${d.mode==="truth"?"真心话":"大冒险"}</h2><div class="option-list"><button type="button" data-action="truth-mode" data-value="truth" aria-pressed="${d.mode==="truth"}">真心话</button><button type="button" data-action="truth-mode" data-value="dare" aria-pressed="${d.mode==="dare"}">大冒险</button></div><h2>${esc(d.question)}</h2><div class="play-actions">${button("下一位","truth-next")}${button("换一题","truth-skip","secondary")}</div></div>`);}
function nextTruth(nextPerson){const d=state.data;if(nextPerson)d.turn++;d.question=freshQuestion(d.mode,d.mode==="truth"?TRUTH:DARE);renderTruth();}

function newMatch(){state.data={...state.data,turn:0,question:freshQuestion("match",MATCH),answers:[],phase:"pass"};}
function renderMatch(){const d=state.data;if(d.phase==="result"){const counts=d.question.a.map((_,i)=>d.answers.filter(a=>a===i).length),top=Math.max(...counts);panel(`<div class="play-card"><span class="label">全部完成</span><h2>大家选了什么？</h2><p>${esc(d.question.q)}</p><div class="score-list">${state.names.map((name,i)=>`<div class="score-row"><span>${esc(name)}</span><strong>${esc(d.question.a[d.answers[i]])}</strong></div>`).join("")}</div><p>最多人选的是：${d.question.a.filter((_,i)=>counts[i]===top).map(esc).join("、")}（${top} 人）</p><div class="play-actions">${button("再来一题","match-next")}</div></div>`);return;}const name=esc(state.names[d.turn]);if(d.phase==="pass"){panel(`<div class="play-card private-card"><span class="label">${d.turn+1} / ${state.count}</span><h2>把手机交给 ${name}</h2><p>选完后交给下一位，答案会一直隐藏。</p>${button("开始作答","match-open")}</div>`);return;}panel(`<div class="play-card"><span class="label">${name} 作答中</span><h2>${esc(d.question.q)}</h2><div class="option-list">${d.question.a.map((option,i)=>`<button type="button" data-action="match-answer" data-value="${i}">${esc(option)}</button>`).join("")}</div></div>`);}
function nextMatch(){const d=state.data;d.turn=0;d.question=freshQuestion("match",MATCH);d.answers=[];d.phase="pass";renderMatch();}

function newSpy(){const pair=freshQuestion("spy",SPY),spyIndex=Math.floor(Math.random()*state.count);state.data={...state.data,pair,spyIndex,turn:0,phase:"pass",looked:false,voteIndex:0,votes:[]};}
function renderSpy(){const d=state.data;
 if(d.phase==="pass"){
  panel(`<div class="play-card private-card">${progressDots(d.turn)}<h2 class="pass-title">把手机交给<strong>${esc(state.names[d.turn])}</strong></h2>${mysteryCard()}${button("查看我的词","spy-open")}<p class="release-hint">确认别人看不到屏幕后继续</p></div>`);return;
 }
 if(d.phase==="reveal"){
  panel(`<div class="play-card private-card">${progressDots(d.turn)}<h2 class="pass-title">把手机交给<strong>${esc(state.names[d.turn])}</strong></h2>${mysteryCard("spySecret")}<button class="btn btn-primary" type="button" id="spyReveal">按住查看词语</button><p class="release-hint">松手立即隐藏</p><div class="play-actions">${button(d.turn===state.count-1?"都看完了":"交给下一位","spy-next","secondary","disabled")}</div></div>`);
  wireReveal("spyReveal","spySecret",()=>d.turn===d.spyIndex?d.pair[1]:d.pair[0],()=>{d.looked=true;const btn=document.querySelector('[data-action="spy-next"]');if(btn)btn.disabled=false;});return;
 }
 if(d.phase==="discuss"){panel(`<div class="play-card"><span class="label">所有人已看词</span><h2>轮流描述</h2><p>每人说一句自己的词有什么特点。描述完毕再投票。</p><div class="play-actions">${button("开始投票","spy-vote-start")}</div></div>`);return;}if(d.phase==="vote"){const voter=esc(state.names[d.voteIndex]);panel(`<div class="play-card private-card"><span class="label">投票 ${d.voteIndex+1} / ${state.count}</span><h2>把手机交给 ${voter}</h2><p>选一个你认为是卧底的人。</p><div class="player-list">${state.names.map((name,i)=>`<button type="button" data-action="spy-vote" data-value="${i}" ${i===d.voteIndex?"disabled":""}>${esc(name)}</button>`).join("")}</div></div>`);return;}const counts=state.names.map((_,i)=>d.votes.filter(v=>v===i).length),max=Math.max(...counts),leaders=counts.map((n,i)=>n===max?i:-1).filter(i=>i>=0),caught=leaders.length===1&&leaders[0]===d.spyIndex;panel(`<div class="play-card"><span class="label">投票结束</span><h2>${leaders.length>1?"票数相同":caught?"找到了卧底":"卧底没有被选中"}</h2><p>卧底：<strong>${esc(state.names[d.spyIndex])}</strong></p><p>大家的词：${esc(d.pair[0])}　卧底的词：${esc(d.pair[1])}</p><div class="score-list">${state.names.map((name,i)=>`<div class="score-row"><span>${esc(name)}</span><strong>${counts[i]} 票</strong></div>`).join("")}</div><div class="play-actions">${button("再玩一轮","spy-new")}</div></div>`);}
function newDice(){state.data={...state.data,turn:0,rolls:[],face:1,rolling:false};}
function dieFace(value){
  const positions={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
  return positions[value].map(pos=>`<span class="die-pip" style="grid-area:${Math.floor((pos-1)/3)+1}/${(pos-1)%3+1}"></span>`).join("");
}
function renderDice(){
  const d=state.data,done=d.rolls.length===state.count,rolled=d.rolls.length>d.turn;
  const high=done?Math.max(...d.rolls):0,winners=done?state.names.filter((_,i)=>d.rolls[i]===high):[];
  panel(`<div class="play-card dice-card"><span class="label">${done?"本轮结果":`${d.turn+1} / ${state.count} · 轮到 ${esc(state.names[d.turn])}`}</span><h2>${done?(winners.length>1?"并列最高":"本轮最高"):"掷出你的点数"}</h2><div class="die-face ${d.rolling?"rolling":""}" role="img" aria-label="骰子 ${d.face} 点">${dieFace(d.face)}</div><p>${done?`${winners.map(esc).join("、")} · ${high} 点`:d.rolling?"骰子滚动中…":rolled?`${esc(state.names[d.turn])} 掷出了 ${d.face} 点`:"点击掷骰，每人一次。"}</p><div class="play-actions">${done?button("再玩一轮","dice-new"):rolled?button(`交给 ${esc(state.names[d.turn+1])}`,"dice-next"):button(d.rolling?"掷骰中…":"掷骰子","dice-roll","primary",d.rolling?"disabled":"")}</div></div><div class="play-card"><span class="label">本轮点数</span><div class="score-list">${state.names.map((name,i)=>`<div class="score-row ${done&&d.rolls[i]===high?"winner":""}"><span>${esc(name)}</span><strong>${d.rolls[i]===undefined?"—":`${d.rolls[i]} 点`}</strong></div>`).join("")}</div></div>`);
}
function rollDice(){
  const d=state.data;if(d.rolling||d.rolls.length>d.turn)return;
  d.rolling=true;renderDice();const result=1+Math.floor(Math.random()*6),start=performance.now();
  const duration=matchMedia("(prefers-reduced-motion: reduce)").matches?0:700;
  state.timer=setInterval(()=>{
    if(performance.now()-start<duration){d.face=1+(d.face%6);renderDice();sound(180+d.face*45,.025);return;}
    clearTimer();d.face=result;d.rolling=false;d.rolls.push(result);renderDice();sound(640,.09);
  },75);
}

function wireReveal(buttonId,secretId,getWord,onLook){
 const btn=$(buttonId),secret=$(secretId);
 const reveal=()=>{secret.textContent=getWord();secret.classList.add("revealed");onLook();sound(580,.04);};
 const hide=()=>{secret.textContent="已隐藏";secret.classList.remove("revealed");};
 btn.addEventListener("pointerdown",event=>{try{btn.setPointerCapture?.(event.pointerId);}catch{}reveal();});
 ["pointerup","pointercancel","pointerleave","lostpointercapture","blur"].forEach(event=>btn.addEventListener(event,hide));
 btn.addEventListener("keydown",event=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();reveal();}});
 btn.addEventListener("keyup",hide);
}
const bgMusic=$("backgroundMusic");
const playlist=Array.isArray(window.PARTY_MUSIC)?window.PARTY_MUSIC.filter(x=>typeof x==="string"&&/^(?:assets\/music\/|references\/audio-review\/)track-[123]\.mp3$/.test(x)):[];
let trackIndex=0,musicFailed=false;
if(playlist.length)bgMusic.src=playlist[0];
function updateMusicVolume(){bgMusic.volume=state.screen==="game"?.10:.24;}
function renderSoundButton(){const btn=$("soundButton");btn.textContent=`声音：${state.sound?"开":"关"}`;btn.setAttribute("aria-pressed",String(state.sound));}
async function playMusic(){
 if(!playlist.length||musicFailed||!state.sound||document.hidden)return;
 try{await bgMusic.play();if(!state.sound||document.hidden)bgMusic.pause();}catch{musicFailed=true;notify("背景音乐暂时无法播放，游戏提示音仍可用。");}
}
async function toggleSound(){
 state.sound=!state.sound;renderSoundButton();
 if(!state.sound){bgMusic.pause();return;}
 musicFailed=false;updateMusicVolume();sound(560,.08);await playMusic();
}
bgMusic.addEventListener("ended",()=>{
 if(!playlist.length)return;
 trackIndex=(trackIndex+1)%playlist.length;bgMusic.src=playlist[trackIndex];bgMusic.currentTime=0;playMusic();
});
document.addEventListener("visibilitychange",()=>{if(document.hidden){bgMusic.pause();const secret=document.querySelector(".mystery-card.revealed");if(secret){secret.textContent="已隐藏";secret.classList.remove("revealed");}}else playMusic();});
window.addEventListener("pagehide",()=>bgMusic.pause());

$("countRow").addEventListener("click",event=>{const button=event.target.closest("[data-count]");if(button)setCount(Number(button.dataset.count));});
$("nameInputs").addEventListener("input",event=>{if(event.target.matches("[data-name]"))$("setupError").textContent="";});
$("chooseButton").onclick=enterChooser;$("randomButton").onclick=enterWheel;$("chooseRandomButton").onclick=enterWheel;$("chooseInsteadButton").onclick=()=>{renderChooser();show("choose");};
$("gameGrid").addEventListener("click",event=>{const tile=event.target.closest("[data-open-game]");if(tile)startGame(tile.dataset.openGame);});
$("spinButton").onclick=spin;$("playSpinButton").onclick=()=>{if(state.wheelChoice)startGame(state.wheelChoice);};
$("restartGameButton").onclick=()=>{if(state.game)startGame(state.game);};
$("homeButton").onclick=()=>show("home");document.querySelectorAll("[data-back]").forEach(button=>button.onclick=()=>{if(button.dataset.back==="choose"){renderChooser();show("choose");}else show("home");});
$("soundButton").onclick=toggleSound;
$("gameBody").addEventListener("click",event=>{const button=event.target.closest("[data-action]");if(!button||button.disabled)return;const action=button.dataset.action,d=state.data;switch(action){case"dice-roll":rollDice();break;case"dice-next":if(d.rolls.length===d.turn+1&&d.rolls.length<state.count){d.turn++;renderDice();}break;case"dice-new":newDice();renderDice();break;case"bomb-new":newBomb();renderBomb();break;case"bomb-guess":guessBomb();break;case"five-start":startFive();break;case"five-done":endFive(true);break;case"five-fail":endFive(false);break;case"charade-start":startCharades();break;case"charade-done":nextCharades(true);break;case"charade-next":nextCharades(false);break;case"truth-mode":d.mode=button.dataset.value;nextTruth(false);break;case"truth-next":nextTruth(true);break;case"truth-skip":nextTruth(false);break;case"match-open":d.phase="choose";renderMatch();break;case"match-answer":d.answers.push(Number(button.dataset.value));d.turn++;d.phase=d.turn>=state.count?"result":"pass";renderMatch();break;case"match-next":nextMatch();break;case"spy-open":d.phase="reveal";d.looked=false;renderSpy();break;case"spy-next":if(!d.looked)return;d.turn++;d.phase=d.turn>=state.count?"discuss":"pass";renderSpy();break;case"spy-vote-start":d.phase="vote";d.voteIndex=0;d.votes=[];renderSpy();break;case"spy-vote":d.votes.push(Number(button.dataset.value));d.voteIndex++;d.phase=d.voteIndex>=state.count?"result":"vote";renderSpy();break;case"spy-new":newSpy();renderSpy();break;}});
$("gameBody").addEventListener("keydown",event=>{if(event.key==="Enter"&&event.target.id==="bombGuess")guessBomb();});
renderNames();

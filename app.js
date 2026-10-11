const K='stairTracker.v1';
let state={days:{},rope:{},weight:85,weightSet:true,stairIn:7,jumps:100,streakSets:30,goalDate:'2026-12-25',effort:1};
let shownDay=null,lastStreak=-1;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const todayKey=()=>keyOf(new Date());

// Realistic estimate: Normal pace, 70 kg, 7 in stairs ≈ 2.0 kcal per set (≈1.2 up + 0.8 down).
// Scales with body weight, stair height and pace.
function calc(){
  const s=(state.weight/70)*(state.stairIn/7)*state.effort;
  const up=1.2*s,down=0.8*s;
  return{rise:20*state.stairIn*0.0254,up,down,total:up+down};
}
const perSet=()=>calc().total;
// Jump rope: ~10 METs average (incl. misses), net of resting = 9 METs -> 0.15 kcal/kg per minute; 100 jumps ≈ 1 minute.
const ropePer=()=>0.15*state.weight*(state.jumps/100);
const dayK=k=>(state.days[k]||0)*perSet()+(state.rope[k]||0)*ropePer();
const hit=k=>(state.days[k]||0)>=state.streakSets;

function save(){
  try{localStorage.setItem(K,JSON.stringify(state))}catch(e){}
}

function tick(){
  const d=new Date();let h=d.getHours(),ap=h>=12?'PM':'AM';h=h%12||12;
  $('clock').innerHTML=pad(h)+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())+'<small>'+ap+'</small>';
  $('date').textContent=d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(shownDay!==keyOf(d))render();
}

function streaks(){
  const t=new Date();
  const doneToday=hit(keyOf(t));
  let cur=doneToday?1:0;
  const d=new Date(t);d.setDate(d.getDate()-1);
  while(hit(keyOf(d))){cur++;d.setDate(d.getDate()-1)}
  const keys=Object.keys(state.days).concat(Object.keys(state.rope)).sort();let best=0,run=0;
  if(keys.length){
    const a=new Date(keys[0]+'T00:00:00');
    for(let x=new Date(a);x<=t;x.setDate(x.getDate()+1)){
      if(hit(keyOf(x))){run++;best=Math.max(best,run)}else run=0;
    }
  }
  return{cur,best:Math.max(best,cur),doneToday};
}

function countUp(el,to){
  const from=parseInt(el.textContent)||0;if(from===to){el.textContent=to;return}
  const t0=performance.now();
  (function f(t){const p=Math.min(1,(t-t0)/500);el.textContent=Math.round(from+(to-from)*p);if(p<1)requestAnimationFrame(f)})(t0);
}

function render(){
  const tk=todayKey();shownDay=tk;
  const n=state.days[tk]||0,r=state.rope[tk]||0,per=perSet(),rp=ropePer(),total=dayK(tk),c=calc();
  $('count').textContent=n;
  $('ofgoal').textContent='of '+state.streakSets+' stair sets';
  $('ktot').textContent=total.toFixed(0);
  const gd=new Date(state.goalDate+'T00:00:00'),t0=new Date();t0.setHours(0,0,0,0);
  const dl=Math.round((gd-t0)/864e5);
  $('gdays').textContent=Math.max(0,dl);
  $('glab').textContent=dl>1?'days to go':dl===1?'day to go':dl===0?'goal day — finish it!':'goal date passed';
  $('gdate').textContent=gd.toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
  const allK=[...new Set(Object.keys(state.days).concat(Object.keys(state.rope)))].reduce((a,k)=>a+dayK(k),0);
  $('gtot').textContent='Burned so far: '+Math.round(allK)+' kcal';
  if(document.activeElement!==$('gdateIn'))$('gdateIn').value=state.goalDate;
  $('nrp').textContent=r;$('krp').textContent=(r*rp).toFixed(0);
  $('per1').textContent=per.toFixed(1);$('per2').textContent=rp.toFixed(1);$('jn').textContent=state.jumps;
  const ring=$('ring');ring.style.strokeDashoffset=326.7*(1-Math.min(1,n/state.streakSets));
  ring.classList.toggle('done',n>=state.streakSets);
  $('calc').innerHTML='Stairs: <b>'+per.toFixed(1)+' kcal/set</b> (20 × '+state.stairIn+' in = '+c.rise.toFixed(2)+' m up). Jump rope: <b>'+rp.toFixed(1)+' kcal per '+state.jumps+' jumps</b> (about '+(state.jumps/100).toFixed(1)+' min). Ballpark ±30% — real burn depends on pace, misses and your body.';
  if(document.activeElement!==$('wt'))$('wt').value=state.weight;
  if(document.activeElement!==$('ht'))$('ht').value=state.stairIn;
  if(document.activeElement!==$('jumps'))$('jumps').value=state.jumps;
  if(document.activeElement!==$('streakSets'))$('streakSets').value=state.streakSets;
  $('eff').value=String(state.effort);

  const s=streaks();
  $('flame').classList.toggle('lit',s.doneToday);
  if(s.cur!==lastStreak){countUp($('snum'),s.cur);if(lastStreak>=0){$('snum').classList.remove('pop');void $('snum').offsetWidth;$('snum').classList.add('pop')}lastStreak=s.cur}
  const sl=Math.max(0,state.streakSets-n);
  $('ssub').textContent=s.doneToday?'Flame lit — '+state.streakSets+' stair sets done today. Best streak: '+s.best+' days.':'Do '+sl+' more stair set'+(sl===1?'':'s')+' today ('+n+'/'+state.streakSets+')'+(s.cur>0?' to keep your '+s.cur+'-day streak.':' to light the flame.')+' Best: '+s.best+'.';
  $('chips').innerHTML=[3,7,14,30].map(m=>'<div class="chip'+(s.best>=m?' on':'')+'">'+m+'🔥</div>').join('');

  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d)}
  const max=Math.max(1,...days.map(d=>dayK(keyOf(d))));
  $('week').innerHTML=days.map(d=>{
    const k=keyOf(d),cc=dayK(k),h=Math.max(4,Math.round(cc/max*80));
    return'<div class="col'+(k===tk?' today':(hit(k)?' hit':''))+'"><div class="v">'+Math.round(cc)+'</div><div class="bar" style="height:'+h+'px"></div><div class="d">'+d.toLocaleDateString(undefined,{weekday:'short'})+'</div></div>';
  }).join('');
  const ts=days.reduce((a,d)=>a+(state.days[keyOf(d)]||0),0),tr=days.reduce((a,d)=>a+(state.rope[keyOf(d)]||0),0),tk2=days.reduce((a,d)=>a+dayK(keyOf(d)),0);
  $('tbl').innerHTML='<tr><th>Day</th><th>Stairs</th><th>Rope</th><th>kcal</th></tr>'+days.slice().reverse().map(d=>{const k=keyOf(d);return'<tr><td>'+d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+(hit(k)?' ✓':'')+'</td><td>'+(state.days[k]||0)+'</td><td>'+(state.rope[k]||0)+'</td><td>'+dayK(k).toFixed(0)+'</td></tr>'}).join('')+'<tr><td><strong>Week</strong></td><td><strong>'+ts+'</strong></td><td><strong>'+tr+'</strong></td><td><strong>'+tk2.toFixed(0)+'</strong></td></tr>';
}

function prune(){const c=new Date();c.setDate(c.getDate()-400);const ck=keyOf(c);['days','rope'].forEach(f=>Object.keys(state[f]).forEach(k=>{if(k<ck)delete state[f][k]}))}

/* effects */
const cv=$('fx'),cx=cv.getContext('2d');let parts=[],raf=null;
function size(){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio}
addEventListener('resize',size);size();
function confetti(){
  const cols=['#d8001a','#c9a45c','#ffffff','#111111','#ff4d5e'];
  for(let i=0;i<140;i++){
    const a=Math.random()*Math.PI*2,sp=6+Math.random()*10;
    parts.push({x:cv.width/2,y:cv.height*.55,vx:Math.cos(a)*sp*devicePixelRatio,vy:(Math.sin(a)*sp-8)*devicePixelRatio,w:(6+Math.random()*6)*devicePixelRatio,h:(10+Math.random()*8)*devicePixelRatio,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],life:1});
  }
  if(!raf)loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts.forEach(p=>{p.vy+=.35*devicePixelRatio;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.r+=p.vr;p.life-=.008;
    cx.save();cx.globalAlpha=Math.max(0,p.life);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()});
  parts=parts.filter(p=>p.life>0&&p.y<cv.height+50);
  raf=parts.length?requestAnimationFrame(loop):null;if(!raf)cx.clearRect(0,0,cv.width,cv.height);
}
let toastT;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),3200)}

function addSet(type,e){
  const b=$(type==='rope'?'rope':'tap'),r=b.getBoundingClientRect();
  const rp=document.createElement('span');rp.className='ripple';const sz=Math.max(r.width,r.height)/4;
  rp.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(e.clientX-r.left-sz/2)+'px;top:'+(e.clientY-r.top-sz/2)+'px';
  b.appendChild(rp);setTimeout(()=>rp.remove(),650);
  const pl=document.createElement('span');pl.className='plus';pl.textContent='+'+Math.round(type==='rope'?ropePer():perSet())+' kcal';
  pl.style.left=(e.clientX-r.left-30)+'px';pl.style.top=(e.clientY-r.top-30)+'px';
  b.parentNode.appendChild(pl);setTimeout(()=>pl.remove(),900);
  const k=todayKey(),before=dayK(k),store=type==='rope'?state.rope:state.days;
  store[k]=(store[k]||0)+1;
  if(navigator.vibrate)try{navigator.vibrate(20)}catch(_){}
  prune();save();render();
  const cb=$('count');cb.classList.remove('bump');void cb.offsetWidth;cb.classList.add('bump');
  if(type==='stairs'&&state.days[k]===state.streakSets){
    confetti();
    const s=streaks(),ms=[3,7,14,30,50,100].includes(s.cur);
    toast(ms?'🔥 '+s.cur+'-DAY STREAK! Unstoppable.':'🔥 '+state.streakSets+' sets done! Streak: '+s.cur+(s.cur===1?' day':' days'));
    if(ms)setTimeout(confetti,600);
  }
}
$('tap').addEventListener('click',e=>addSet('stairs',e));
$('rope').addEventListener('click',e=>addSet('rope',e));
$('undoS').onclick=()=>{const k=todayKey();if((state.days[k]||0)>0){state.days[k]--;save();render()}};
$('undoR').onclick=()=>{const k=todayKey();if((state.rope[k]||0)>0){state.rope[k]--;save();render()}};
$('wt').onchange=e=>{const v=parseFloat(e.target.value);if(v>=30&&v<=250){state.weight=v;state.weightSet=true;save()}render()};
$('ht').onchange=e=>{const v=parseFloat(e.target.value);if(v>=3&&v<=12){state.stairIn=v;save()}render()};
$('streakSets').onchange=e=>{const v=parseInt(e.target.value);if(v>=1&&v<=1000){state.streakSets=v;save()}render()};
$('gdateIn').onchange=e=>{if(e.target.value){state.goalDate=e.target.value;save()}render()};
$('jumps').onchange=e=>{const v=parseInt(e.target.value);if(v>=10&&v<=1000){state.jumps=v;save()}render()};
$('eff').onchange=e=>{state.effort=parseFloat(e.target.value);save();render()};

function merge(s){if(s&&typeof s==='object')state={days:Object.assign({},s.days||{}),rope:Object.assign({},s.rope||{}),weight:(s.weightSet&&s.weight)?s.weight:85,weightSet:true,stairIn:s.stairIn||7,jumps:s.jumps||100,streakSets:s.streakSets||30,goalDate:s.goalDate||'2026-12-25',effort:s.effort||1}}
try{merge(JSON.parse(localStorage.getItem(K)||'null'))}catch(e){}
render();tick();setInterval(tick,1000);

document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});

// Offline support / installable app
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}

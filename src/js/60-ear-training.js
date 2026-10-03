/* Parde · src/js/60-ear-training.js
   Ear training tab: question generators (step size, major/minor, tetrachord, mode, degree), scoring.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- ear training ---------- */
const QT={
  interval:{label:['Step size','اندازه‌ی فاصله'],levels:[['T vs B','T در برابر B'],['T · B · J','T · B · J'],['All five: T B J S H','هر پنج: T B J S H']],prompt:['Which step did you hear?','کدام فاصله را شنیدید؟']},
  majmin:{label:['Major or minor','ماژور یا مینور'],levels:[['Full scale','گام کامل'],['Short melody','ملودی کوتاه']],prompt:['Major or minor?','ماژور یا مینور؟']},
  tetra:{label:['Tetrachord (dang)','دانگ'],levels:[['Western: T T B · T B T · B T T','غربی: T T B · T B T · B T T'],['Add Shur J J T & Chahargah J S B','به‌علاوه‌ی شور J J T و چهارگاه J S B'],['All seven genera','هر هفت نوع']],prompt:['Which tetrachord filled the fourth?','کدام دانگ فاصله‌ی چهارم را پر کرد؟']},
  dastgah:{label:['Which mode?','کدام گام؟'],levels:[['Minor · Shur · Major','مینور · شور · ماژور'],['Shur · Chahargah · Homayoun · Mahur','شور · چهارگاه · همایون · ماهور'],['Add Segah · Rast','به‌علاوه‌ی سه‌گاه · راست']],prompt:['Which mode is this?','این کدام گام است؟']},
  degree:{label:['Degree over drone','درجه روی واخوان'],levels:[['Degrees 1–5','درجه‌های ۱ تا ۵'],['Degrees 1–8','درجه‌های ۱ تا ۸']],prompt:['Which degree of the current explorer mode? (drone = tonic)','کدام درجه از گام فعلی کاوشگر؟ (واخوان = نت پایه)']}
};
let Q={type:store.get('qtype','interval'),level:0,cur:null,answered:false};
if(!QT[Q.type])Q.type='interval';
const stats=store.get('stats',{});
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function baseF(){return 196*Math.pow(2,Math.random()*0.75)}
function genQ(){
  const L=Q.level,t=tun();
  if(Q.type==='interval'){const pool=[['T','B'],['T','B','J'],['T','B','J','S','H']][L];const k=rnd(pool),b=baseF(),c1=stepCents(k);
    return {answers:pool,correct:k,label:x=>`${x} · ${ivName(x)}`,play:()=>playInterval(k,b,$('#qhow').value==='harm',c1),ref:()=>play(pool.flatMap((x,i)=>[{f:b,at:i*3},{f:b*Math.pow(2,stepCents(x)/1200),at:i*3+1,d:1.4}]))}}
  if(Q.type==='majmin'){const k=rnd(['major','minor']),ti=Math.floor(Math.random()*TONICS.length);const d=degs(M[k]);
    let seq=[0,1,2,3,4,5,6,7];if(L===1){seq=[0];let p=0;for(let i=0;i<6;i++){p=Math.min(5,Math.max(0,p+rnd([-1,1,1,2,-2])));seq.push(p)}seq.push(2,1,0)}
    const ev=seq.map((i,n)=>({f:fq(d[i],ti),at:n*.8,d:.8}));
    return {answers:['major','minor'],correct:k,label:x=>mName(M[x]),play:()=>play(ev),ref:()=>play([...scaleEvents(M.major,'up','x',0),...scaleEvents(M.minor,'up','x',9)])}}
  if(Q.type==='tetra'){const pool=[['TTB','TBT','BTT'],['TTB','TBT','BTT','JJT','JSB'],['TTB','TBT','BTT','JJT','JSB','TJJ','JTJ']][L];const k=rnd(pool),b=baseF();
    const mk=(g,st,bb)=>{const o=[{f:bb,at:st}];genusCents(g).forEach((c,i)=>o.push({f:bb*Math.pow(2,c/1200),at:st+i+1,d:i===2?1.5:1}));return o};
    return {answers:pool,correct:k,label:x=>`<bdi dir="ltr">${x.split('').join(' ')}</bdi> · ${gName(x)}`,play:()=>play(mk(k,0,b)),ref:()=>play(pool.flatMap((g,i)=>mk(g,i*5.5,b)))}}
  if(Q.type==='dastgah'){const pool=[['minor','shur','major'],['shur','chahargah','homayoun','mahur'],['shur','chahargah','homayoun','mahur','segah','rast']][L];const k=rnd(pool);const d=degs(M[k]);
    const ev=[0,1,2,3,4,5,6,7,6,5,4,3,2,1,0].map((i,n)=>({f:fq(d[i]),at:n*.75,d:n===14?1.6:.75}));
    return {answers:pool,correct:k,label:x=>mName(M[x]),play:()=>{setDrone(true);play(ev)},ref:()=>{setDrone(true);play(pool.flatMap((x,j)=>scaleEvents(M[x],'up','x',j*9.5)))}}}
  if(Q.type==='degree'){const m=M[S.mode],d=degs(m),n=L?8:5,k=Math.floor(Math.random()*n);
    return {answers:[...Array(n).keys()].map(String),correct:String(k),label:x=>`${+x+1} · ${spell(+x+ROT(m),d[+x]).txt}`,play:()=>{setDrone(true);play([{f:fq(d[k]),at:0,d:2}])},ref:()=>{setDrone(true);play(scaleEvents(m,'up','x',0).slice(0,n))}}}
}
function renderQTypes(){
  $('#qtypes').innerHTML=Object.entries(QT).map(([k,v])=>`<button class="btn ${k===Q.type?'on':''}" data-qt="${k}">${L2(...v.label)}</button>`).join('');
  $('#qlevel').innerHTML=QT[Q.type].levels.map((l,i)=>`<option value="${i}">${i+1} · ${L2(...l)}</option>`).join('');
  Q.level=Math.min(store.get('lvl-'+Q.type,0),QT[Q.type].levels.length-1);$('#qlevel').value=Q.level;
  $('#qhow').closest('.field').hidden=Q.type!=='interval';
}
function qPrompt(){return L2(...QT[Q.type].prompt)+(Q.type==='degree'?` — ${mName(M[S.mode])}, ${tx('on')} ${tonicName(S.tonic)}`:'')}
function renderQAnswers(){ // re-label the current question (used on language switch too)
  if(!Q.cur)return;$('#qprompt').textContent=qPrompt();
  $('#qans').innerHTML=Q.cur.answers.map(a=>`<button class="btn" data-a="${a}">${Q.cur.label(a)}</button>`).join('');
  if(Q.answered&&Q.last){const b=$(`#qans [data-a="${Q.last}"]`);b&&b.classList.add(Q.last===Q.cur.correct?'right':'wrong');$(`#qans [data-a="${Q.cur.correct}"]`).classList.add('right');showFb()}
}
function newQ(autoplay=true){
  Q.cur=genQ();Q.answered=false;Q.last=null;$('#qfb').textContent='';$('#qfb').className='fb';
  renderQAnswers();renderScore();if(autoplay)Q.cur.play();
}
function key(){return Q.type+':'+Q.level}
function renderScore(){const s=stats[key()]||{r:0,n:0,streak:0,best:0,last:[]};const last=s.last.slice(-20);const pct=last.length?Math.round(100*last.filter(Boolean).length/last.length):0;
  $('#qscore').innerHTML=`<span>${tx('sc_all')} <b><bdi dir="ltr">${s.r}/${s.n}</bdi></b></span><span>${tx('sc_20')} <b>${last.length?pct+'%':'—'}</b>${last.length>=20&&pct>=85?tx('sc_ready'):''}</span><span>${tx('sc_streak')} <b>${s.streak}</b> (${tx('sc_best')} ${s.best})</span>`}
function showFb(){const ok=Q.last===Q.cur.correct;$('#qfb').innerHTML=ok?tx('fb_ok'):tx('fb_no',{x:Q.cur.label(Q.cur.correct)});$('#qfb').className='fb '+(ok?'good':'bad')}
function answer(a,btn){
  if(Q.answered)return;Q.answered=true;Q.last=a;const ok=a===Q.cur.correct;
  const s=stats[key()]||(stats[key()]={r:0,n:0,streak:0,best:0,last:[]});s.n++;if(ok){s.r++;s.streak++;s.best=Math.max(s.best,s.streak)}else s.streak=0;s.last.push(ok?1:0);s.last=s.last.slice(-40);store.set('stats',stats);
  btn.classList.add(ok?'right':'wrong');if(!ok)$(`#qans [data-a="${Q.cur.correct}"]`).classList.add('right');
  showFb();renderScore();
}


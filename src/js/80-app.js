/* Parde · src/js/80-app.js
   Language switching (incl. right-to-left), feedback button, and all event wiring. Runs last.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- language ---------- */
function applyLang(){
  const app=$('#app');app.dir=S.lang==='fa'?'rtl':'ltr';app.lang=S.lang;
  $$('[data-i18n]').forEach(el=>{el.innerHTML=tx(el.dataset.i18n)});
  $('#h1').innerHTML=tx('h1');$('#langBtn').textContent=tx('lang');$('#langBtn').lang=S.lang==='fa'?'en':'fa';
  document.title=S.lang==='fa'?'پرده':'Parde';
  setStatus();const b=$('#pDrone');b.textContent=tx(S.drone?'drone_on':'drone_off');
  fillSelects();renderExplore();renderIntervals();renderQTypes();renderPlan();renderQAnswers();renderScore();
  if(!echoRun)$('#echoStatus').textContent='';
}

/* ---------- feedback (claude.ai comments, composer-only: opens the shell's own comment box) ---------- */
let commentsNS;const commentsReady=(window.claude&&window.claude.use)?window.claude.use('comments').then(c=>commentsNS=c).catch(()=>commentsNS=null):Promise.resolve(commentsNS=null);
/* outside claude.ai: on GitHub Pages (user.github.io/repo/) feedback goes to the repo's Issues page */
function githubIssuesURL(){
  const h=location.hostname;if(!/\.github\.io$/i.test(h))return null;
  const user=h.split('.')[0],seg=location.pathname.split('/').filter(Boolean)[0],repo=seg&&!/\.html?$/i.test(seg)?seg:h;
  return `https://github.com/${user}/${repo}/issues/new?title=${encodeURIComponent('Feedback: ')}`;
}
async function sendFeedback(){
  const msg=$('#fbMsg');msg.textContent='';
  const gh=githubIssuesURL();if(gh&&!(window.claude&&window.claude.use)){window.open(gh,'_blank','noopener');msg.textContent=tx('fb_gh');return}
  const c=commentsNS===undefined?await commentsReady:commentsNS;
  if(!c){msg.textContent=tx('fb_signin');return}
  try{const r=await c.openComposer({element:$('#credit')});if(r&&r.opened)msg.textContent=tx('fb_open')}
  catch(e){msg.textContent=tx('fb_signin')}
}
/* ---------- wiring ---------- */
applyLang();
$('#langBtn').onclick=()=>{S.lang=S.lang==='fa'?'en':'fa';saveSettings();applyLang()};
$$('nav.tabs button').forEach(b=>b.onclick=()=>{$$('nav.tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));['explore','intervals','ear','plan'].forEach(t=>$('#tab-'+t).hidden=t!==b.dataset.tab);store.set('tab',b.dataset.tab);if(b.dataset.tab==='ear'&&!Q.cur)newQ(false)});
const savedTab=store.get('tab','explore');const tb=$(`nav.tabs [data-tab="${savedTab}"]`);if(tb&&savedTab!=='explore')tb.click();
$('#mode').onchange=e=>{S.mode=e.target.value;renderExplore()};
$('#cmp').onchange=e=>{S.cmp=e.target.value;renderExplore()};
$('#tonic').onchange=e=>{S.tonic=+e.target.value;renderExplore();renderIntervals()};
$('#tuning').onchange=e=>{S.tuning=e.target.value;renderExplore();renderIntervals()};
$('#timbre').onchange=e=>{S.timbre=e.target.value;renderExplore()};
$('#bpm').oninput=e=>{S.bpm=+e.target.value;$('#bpmv').textContent=S.bpm};$('#bpm').onchange=renderExplore;
$('#vol').oninput=e=>{S.vol=+e.target.value;if(master)master.gain.value=S.vol};$('#vol').onchange=saveSettings;
$('#pUp').onclick=()=>play(scaleEvents(M[S.mode],'up'));
$('#pDown').onclick=()=>play(scaleEvents(M[S.mode],'down'));
$('#pBoth').onclick=()=>play(scaleEvents(M[S.mode],'both'));
$('#pCmp').onclick=()=>{const c=S.cmp&&M[S.cmp];play(c?[...scaleEvents(M[S.mode],'up','r',0),...scaleEvents(c,'up','c',10)]:scaleEvents(M[S.mode],'up'))};
$('#pDrone').onclick=()=>setDrone(!S.drone);
$('#pEcho').onclick=echoDrill;
$('#pStop').onclick=()=>stopAll(false);
$('#aTest').onclick=testSound;
document.addEventListener('click',e=>{
  if(e.target.closest('#fbBtn')){sendFeedback();return}
  const rv=e.target.closest('#echoReveal');if(rv){const r=window.__echoRun;if(r&&r.ans)rv.outerHTML=tx('echo_ans',{a:r.ans});return}
  const seg=e.target.closest('.seg');if(seg){const m=M[seg.dataset.m],d=degs(m),i=+seg.dataset.seg;play([{f:fq(d[i]),at:0},{f:fq(d[i+1]),at:1,d:1.3}]);return}
  const tk=e.target.closest('.tick');if(tk){playDeg(+tk.dataset.deg,M[tk.dataset.m],tk.id.replace(/\d+$/,''));return}
  const alt=e.target.closest('[data-alt]');if(alt){play([{f:fq(+alt.dataset.alt),at:0,d:1.5}]);return}
  const dot=e.target.closest('.dot');if(dot){playDeg(+dot.dataset.deg);return}
  const iv=e.target.closest('[data-iv]');if(iv){playInterval(iv.dataset.iv,tonicFreq(),true);return}
  const vs=e.target.closest('[data-ivvs]');if(vs){const b=tonicFreq(),k=vs.dataset.ivvs;play([{f:b,at:0},{f:b*Math.pow(2,tun().T/1200),at:1,d:1.3},{f:b,at:3},{f:b*Math.pow(2,tun()[k]/1200),at:4,d:1.3}]);return}
  const pm=e.target.closest('[data-play]');if(pm){play(scaleEvents(M[pm.dataset.play],'up','m'));return}
  const qt=e.target.closest('[data-qt]');if(qt){Q.type=qt.dataset.qt;store.set('qtype',Q.type);renderQTypes();newQ();return}
  const an=e.target.closest('[data-a]');if(an){answer(an.dataset.a,an);return}
});
document.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;
  if($('#tab-explore').hidden===false&&/^[1-8]$/.test(e.key)){playDeg(+e.key-1)}
  if(e.target.classList&&e.target.classList.contains('dot')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();playDeg(+e.target.dataset.deg)}
});
$('#qlevel').onchange=e=>{Q.level=+e.target.value;store.set('lvl-'+Q.type,Q.level);newQ()};
$('#qReplay').onclick=()=>Q.cur&&Q.cur.play();
$('#qStop').onclick=()=>stopAll(false);
$('#qRef').onclick=()=>Q.cur&&Q.cur.ref();
$('#qNext').onclick=()=>newQ();
$('#f1').oninput=calc;$('#f2').oninput=calc;
$('#fPlay').onclick=()=>{const a=+$('#f1').value,b=+$('#f2').value;if(a>0&&b>0)play([{f:a,at:0},{f:b,at:1},{f:[a,b],at:2.5,d:3}])};
$('#stages').addEventListener('change',e=>{if(e.target.type==='checkbox'){const d=store.get('plan',{});d[e.target.id.slice(3)]=e.target.checked;store.set('plan',d)}});

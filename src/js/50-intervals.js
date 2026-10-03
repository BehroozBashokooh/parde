/* Parde · src/js/50-intervals.js
   Building blocks tab: the five step sizes (T B J S H), cents calculator, major/minor rulers.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- intervals tab ---------- */
function renderIntervals(){
  const t=tun();
  $('#ivgrid').innerHTML=Object.entries(IVINFO).map(([k,v])=>`<div class="iv" style="--c:var(--${k})"><span class="sym">${k}</span><span class="nm">${L2(v.name,v.fa)} <span class="fa">${L2(v.fa,v.name)}</span></span><span class="muted" style="font-size:.85rem">${L2(v.en,v.enFa)}</span><span class="num"><bdi dir="ltr">${k==='J'&&t.Jl?t.J.toFixed(1)+' / '+t.Jl.toFixed(1):t[k].toFixed(1)}¢ · ${S.tuning==='nosa'?v.ratio:''}</bdi>${S.tuning==='nosa'?'':tx('qt',{n:v.q/50})}</span><div class="btnrow" style="margin-top:6px"><button class="btn" data-iv="${k}">${tx('play')}</button><button class="btn" data-ivvs="${k}">${tx('vsT')}</button></div></div>`).join('');
  $('#mmRulers').innerHTML=rulerHTML(M.major,mName(M.major),'mA')+rulerHTML(M.minor,mName(M.minor),'mB')+rulerHTML(M.shur,mName(M.shur),'mC');
  calc();
}
function playInterval(k,base=tonicFreq(),harm=false,cents){const f2=base*Math.pow(2,(cents??tun()[k])/1200);const ev=[{f:base,at:0},{f:f2,at:1,d:1.2}];if(harm)ev.push({f:[base,f2],at:2.6,d:2});play(ev)}
function calc(){const a=+$('#f1').value,b=+$('#f2').value;if(a>0&&b>0){const c=lg(b/a);let best='T',bd=1e9;for(const k of 'TBJSH'){const dd=Math.abs(tun()[k]-Math.abs(c));if(dd<bd){bd=dd;best=k}}$('#fRes').textContent=tx('calc',{c:c.toFixed(1),b:Math.abs(a-b).toFixed(2),k:best})}}


/* Parde · src/js/40-explorer.js
   Scale explorer tab: mode/tonic selects, interval ruler, cents wheel (SVG), analysis facts,
   degree table with variable forms, scale playback, echo drill.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- explorer ---------- */
function fillSelects(){
  const opt=(sel,withNone)=>{const v=sel.value;sel.innerHTML=(withNone?`<option value="">${tx('none')}</option>`:'')+['Western','Dastgah','Avaz & gusheh'].map(g=>`<optgroup label="${tx('g_'+g)}">`+MODES.filter(m=>m.g===g).map(m=>`<option value="${m.id}">${m.parent?'\u00a0\u00a0\u00a0'+(S.lang==='fa'?'↲ ':'↳ '):''}${mName(m)}</option>`).join('')+'</optgroup>').join('')};
  opt($('#mode'));opt($('#cmp'),true);
  $('#tonic').innerHTML=TONICS.map((t,i)=>`<option value="${i}">${tonicName(i)}</option>`).join('');
  $('#mode').value=S.mode;$('#cmp').value=S.cmp;$('#tonic').value=S.tonic;$('#tuning').value=S.tuning;$('#timbre').value=S.timbre;$('#bpm').value=S.bpm;$('#bpmv').textContent=S.bpm;$('#vol').value=S.vol;
}
const chips=pat=>{let h='';[...pat].forEach((k,i)=>{h+=`<span class="chip" style="--c:var(--${k})">${k}</span>`;if(i===2||i===3)h+='<span class="chip sep">|</span>'});return h};
function rulerHTML(mode,label,idp){
  const d=degs(mode);
  const segs=[...mode.pat].map((k,i)=>{const w=d[i+1]-d[i];return `<div class="seg" style="--c:var(--${k});flex-grow:${w}" data-seg="${i}" data-m="${mode.id}" title="${ivName(k)}: ${w.toFixed(1)}¢"><b>${k}</b><small>${Math.round(w)}</small></div>`}).join('');
  const ticks=d.map((c,i)=>`<div class="tick" id="${idp}${i}" data-deg="${i}" data-m="${mode.id}" style="left:${(c-d[0])/12}%;top:46px"><span class="nm">${spell(i+ROT(mode),c).html}</span><span class="n">${i+1}</span></div>`).join('');
  return `<div class="ruler"><div class="lab"><span dir="auto">${label}</span><span class="muted">${mode.pat.split('').join(' ')}</span></div><div style="position:relative"><div class="bar">${segs}</div><div class="ticks">${ticks}</div></div></div>`;
}
function wheelSVG(m,c){
  const R=108,pt=(cents,r)=>{const a=cents/1200*2*Math.PI-Math.PI/2;return [r*Math.cos(a),r*Math.sin(a)]};
  const ff=S.lang==='fa'?'Vazirmatn, Tahoma, sans-serif':'IBM Plex Sans, system-ui, sans-serif';
  let s=`<svg class="wheel" viewBox="-150 -150 300 300" role="img" aria-label="1200 cents"><circle r="${R}" fill="none" stroke="var(--line)" stroke-width="1.5"/>`;
  for(let k=0;k<24;k++){const L=k%2?5:11;const [x1,y1]=pt(k*50,R),[x2,y2]=pt(k*50,R-L);s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-opacity="${k%2?.35:.7}" stroke-width="1"/>`}
  const d=degs(m);
  [...m.pat].forEach((k,i)=>{const a0=d[i],a1=d[i+1],r=R-26;const [x0,y0]=pt(a0+10,r),[x1,y1]=pt(a1-10,r);s+=`<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="var(--${k})" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;const [lx,ly]=pt((a0+a1)/2,r-18);s+=`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="var(--${k})" font-family="IBM Plex Mono, monospace">${k}</text>`});
  if(c){degs(c).slice(0,7).forEach(cc=>{const [x,y]=pt(cc,R);s+=`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="var(--S)" stroke-width="2" stroke-dasharray="3 2"/>`})}
  alts(m).forEach(([i,cc])=>{const [x,y]=pt(cc,R);const sp=spell(i+ROT(m),cc);s+=`<g class="altdot" data-alt="${cc}" tabindex="0" role="button" aria-label="(${i+1}) ${sp.txt}"><title>(${i+1}) ${sp.txt} · ${cc.toFixed(1)}¢</title><circle cx="${x}" cy="${y}" r="8" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="600" fill="var(--accent)">${i+1}</text></g>`});
  d.slice(0,7).forEach((cc,i)=>{const [x,y]=pt(cc,R),[tx_,ty]=pt(cc,R+26);const sp=spell(i+ROT(m),cc);
    const mark=sp.sh==='k'?`<tspan font-size="8" dy="-4">${L2('k','کرن')}</tspan>`:sp.sh==='s'?`<tspan font-size="8" dy="-4">${L2('s','سری')}</tspan>`:sp.sh;
    s+=`<g class="dot" data-deg="${i}" id="w${i}" tabindex="0" role="button" aria-label="${i+1}"><circle cx="${x}" cy="${y}" r="10" fill="var(--accent)"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="var(--surface)">${i+1}</text></g><text x="${tx_}" y="${ty}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="var(--ink)" font-family="${ff}">${sp.name}${mark}</text>`});
  return s+'</svg>';
}
function analyze(m){
  const t=tun(),d=degs(m),out=[];
  const g=m.pat.slice(0,3),four=d[3]-d[0],five=d[4]-d[0],pat=x=>`<bdi dir="ltr">${x.split('').join(' ')}</bdi>`;
  const sg=v=>(v>0?'+':'')+v.toFixed(0);
  const p4=Math.abs(four-t.nat[3])<3,p5=Math.abs(five-t.nat[4])<3;
  out.push([tx('f_lower'),`${pat(g)} → ${p4?gName(g)+(tx('type')?' '+tx('type'):''):tx('notpure4')}`]);
  out.push([tx('f_deg4'),`<bdi dir="ltr">${four.toFixed(1)}¢</bdi> · ${p4?tx('pure4'):'<bdi dir="ltr">'+sg(four-t.nat[3])+'</bdi>'+tx('from4')}`]);
  out.push([tx('f_deg5'),`<bdi dir="ltr">${five.toFixed(1)}¢</bdi> · ${p5?tx('pure5'):'<bdi dir="ltr">'+sg(five-t.nat[4])+'</bdi>'+tx('from5')}`]);
  const up=m.pat.slice(4);
  if(Math.abs(d[7]-d[4]-t.nat[3])<3)out.push([tx('f_upper'),`${pat(up)} → ${gName(up)}${tx('type')?' '+tx('type'):''}`]);
  else out.push([tx('f_upperpart'),`${pat(up)} ${tx('deg58')}`]);
  return out;
}
function renderExplore(){
  syncSegah();
  const m=M[S.mode],c=S.cmp&&S.cmp!==S.mode?M[S.cmp]:null;
  $('#mName').textContent=mName(m);$('#mFa').textContent=mAlt(m);$('#mFa').setAttribute('lang',S.lang==='fa'?'en':'fa');
  $('#mChips').innerHTML=chips(m.pat);$('#mDesc').textContent=m.parent?derivedDesc(m):L2(m.desc,m.descFa);
  $('#mNote').hidden=!(m.mm&&segahMM());$('#mNote').textContent=m.mm?L2(...m.mm):'';
  $('#mSrc').innerHTML=m.src==='mm'?'':m.src==='nosa'?`<a class="srcbadge" href="${NOSA}" target="_blank" rel="noopener">${tx('src_nosa')}</a>`:`<span class="srcbadge">${tx('src_lab')}</span>`;
  $('#wheelNote').innerHTML=tx('wheel_note',{m:mName(m)});
  $('#wheel').innerHTML=wheelSVG(m,c);
  $('#rulers').innerHTML=rulerHTML(m,mName(m),'r')+(c?rulerHTML(c,tx('compare')+mName(c),'c'):'');
  const facts=analyze(m);
  if(c){const a=degs(m),b=degs(c);const rel=!!(m.parent||c.parent); /* derived modes start elsewhere: compare shapes from each mode's own first degree */
    const diffs=a.map((x,i)=>[i,rel?(x-a[0])-(b[i]-b[0]):x-b[i]]).filter(([,v])=>Math.abs(v)>3);
    facts.push([`${tx('vs')} ${mName(c)}`,diffs.length?diffs.map(([i,v])=>`${tx('deg')} ${i+1}: <bdi dir="ltr">${v>0?'+':''}${v.toFixed(0)}¢</bdi>`).join(' · '):tx('identical')]);}
  $('#facts').innerHTML=facts.map(([k,v])=>`<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  const d=degs(m),tc=tonicCents();
  let rows='<tr>'+tx('th').map(h=>`<th>${h}</th>`).join('')+'</tr>';
  d.forEach((cc,i)=>{const sp=spell(i+ROT(m),cc),dev=tc+cc-sp.ref,big=Math.abs(dev)>30,near=Math.abs(dev)<=10.5;
    const off=near?`<span class="muted" title="${tx('near')}">≈</span>`:`<bdi dir="ltr" class="${big?'dev-big':''}">${sp.key} ${dev>=0?'+':'−'}${Math.abs(dev).toFixed(0)}¢</bdi>${big?' <span class="muted">· '+tx('between')+'</span>':''}`;
    rows+=`<tr><td class="num">${i+1}</td><td>${sp.html}</td><td class="num">${(cc-d[0]).toFixed(1)}</td><td>${i?`<span class="chip" style="--c:var(--${m.pat[i-1]})">${m.pat[i-1]}</span>`:''}</td><td class="num">${(tonicFreq()*Math.pow(2,cc/1200)).toFixed(2)}</td><td class="num">${off}</td><td>${alts(m).filter(a=>a[0]===i%7&&i<7).map(([j,ac])=>`<button class="altbtn" type="button" data-alt="${ac}">${spell(j+ROT(m),ac).html} <span class="muted"><bdi dir="ltr">${(ac-d[0]).toFixed(1)}¢</bdi></span> ▶</button>`).join(' ')}</td></tr>`});
  $('#dtable').innerHTML=rows;
  if(S.drone)setDrone(true);
  saveSettings();
}
function saveSettings(){store.set('settings',{mode:S.mode,cmp:S.cmp,tonic:S.tonic,tuning:S.tuning,timbre:S.timbre,bpm:S.bpm,vol:S.vol,lang:S.lang})}
const fq=(c,ti)=>tonicFreq(ti)*Math.pow(2,c/1200);
const hot=(...ids)=>()=>{$$('.hot').forEach(e=>e.classList.remove('hot'));ids.forEach(id=>{const e=document.getElementById(id);e&&e.classList.add('hot')})};
function scaleEvents(m,dir,pref='r',start=0){
  const d=degs(m);let idx=[0,1,2,3,4,5,6,7];if(dir==='down')idx.reverse();if(dir==='both')idx=[0,1,2,3,4,5,6,7,6,5,4,3,2,1,0];
  return idx.map((i,k)=>({f:fq(d[i]),at:start+k,d:k===idx.length-1?2:1,ui:hot(pref+i,pref==='r'?'w'+(i%7):'')}));
}
function playDeg(i,m=M[S.mode],pref='r'){const d=degs(m);play([{f:fq(d[i]),at:0,d:1.5,ui:hot(pref+i,m.id===S.mode?'w'+(i%7):'')}])}

/* echo drill */
let echoRun=null;
function echoDrill(){
  stopAll(true);if(!S.drone)setDrone(true);
  const m=M[S.mode],d=degs(m),run={round:0};echoRun=run;window.__echoRun=run;
  const next=()=>{
    if(echoRun!==run)return;if(run.round>=8){$('#echoStatus').innerHTML=tx('echo_done');echoRun=null;return}
    run.round++;let p=Math.random()<.5?0:Math.floor(Math.random()*5);const ph=[p];
    for(let k=0;k<3;k++){let s=[-1,1,1,-1,2,-2][Math.floor(Math.random()*6)];p=Math.min(7,Math.max(0,p+s));ph.push(p)}
    const ev=ph.map((i,k)=>({f:fq(d[i]),at:k,d:k===3?1.5:1}));
    const ans=ph.map(i=>i+1).join(' – ');
    ev.push({at:4.5,d:5,ui:()=>{if(echoRun!==run)return;run.ans=ans;$('#echoStatus').innerHTML=tx('echo_turn',{n:run.round})}});
    play(ev,{onEnd:()=>{echoRun=run;run.prev=ans;setTimeout(next,300)}});echoRun=run;
    $('#echoStatus').innerHTML=tx('echo_listen',{n:run.round,prev:run.prev?tx('echo_prev',{a:run.prev}):''});run.prev=null;
  };
  next();
}


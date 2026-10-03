/* Parde · src/js/30-audio.js
   Sound: Web Audio live playback with an offline-render fallback, Karplus-Strong plucked string,
   sine tone, drone, sequencing of notes with UI highlighting.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- audio ---------- */
/* Live Web Audio when the browser lets the AudioContext run; otherwise every sound is
   rendered offline (OfflineAudioContext → WAV) and played through an <audio> element. */
let ctx=null,master=null,droneNodes=null,droneEl=null,mode='unknown';
function ac(){
  if(!ctx){
    try{ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=S.vol;
      const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;master.connect(comp).connect(ctx.destination);}
    catch(e){ctx=null}
  }
  return ctx;
}
async function ensureAudio(){
  const c=ac();
  if(c&&c.state!=='running'){
    try{await Promise.race([c.resume(),new Promise(r=>setTimeout(r,500))])}catch(e){}
    if(c.state!=='running'){ // WebKit unlock trick: start a silent buffer inside the gesture
      try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0);await new Promise(r=>setTimeout(r,120))}catch(e){}
    }
  }
  mode=c&&c.state==='running'?'live':'file';setStatus();return mode==='live';
}
function setStatus(){
  const el=$('#aStat');if(!el)return;
  el.textContent=tx('st_'+mode);
  el.dataset.s=mode;
}
['pointerdown','keydown','touchend'].forEach(ev=>document.addEventListener(ev,()=>{const c=ac();if(c&&c.state!=='running')c.resume().then(()=>{mode=c.state==='running'?'live':mode;setStatus()}).catch(()=>{})},{capture:true}));
const ksCache=new Map();
function ksBuffer(c){ // one Karplus-Strong string at a fixed base; exact pitch set by playbackRate
  const sr=c.sampleRate,N=Math.round(sr/220);if(ksCache.has(sr))return ksCache.get(sr);
  const len=Math.floor(sr*2.2),buf=c.createBuffer(1,len,sr),y=buf.getChannelData(0);
  let prev=0;for(let i=0;i<N;i++){const r=Math.random()*2-1;prev=.6*r+.4*prev;y[i]=prev}
  y[N]=.997*y[0];for(let i=N+1;i<len;i++)y[i]=.4985*(y[i-N]+y[i-N-1]); // y[-1] would be undefined → NaN → silence
  let m=1e-9;for(let i=0;i<len;i++)m=Math.max(m,Math.abs(y[i]));for(let i=0;i<len;i++)y[i]/=m;
  const out={buf,f0:sr/(N+.5)};ksCache.set(sr,out);return out;
}
function note(c,f,t,dur,dest,gain=.5){
  if(S.timbre==='pluck'){
    const {buf,f0}=ksBuffer(c);
    [[.99963,gain],[1.00083,gain*.45]].forEach(([det,g])=>{ // doubled course, like setar; detunes centred so the perceived pitch stays exact
      const s=c.createBufferSource();s.buffer=buf;s.playbackRate.value=f/f0*det;
      const v=c.createGain();v.gain.setValueAtTime(g,t);v.gain.setTargetAtTime(0,t+Math.max(dur,.25)*1.3,.12);
      s.connect(v).connect(dest);s.start(t);s.stop(t+Math.max(dur,.25)*1.3+.8);
    });
  }else{
    const o=c.createOscillator();o.type='sine';o.frequency.value=f;const v=c.createGain();
    v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(gain*.7,t+.02);v.gain.setValueAtTime(gain*.7,t+dur*.85);v.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(v).connect(dest);o.start(t);o.stop(t+dur+.05);
  }
}
function wavURL(buf){
  const d=buf.getChannelData(0),n=d.length,sr=buf.sampleRate,ab=new ArrayBuffer(44+n*2),v=new DataView(ab);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){const s=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,s*32767,true)}
  return URL.createObjectURL(new Blob([ab],{type:'audio/wav'}));
}
async function render(seconds,build){
  const sr=44100,oc=new OfflineAudioContext(1,Math.ceil(sr*seconds),sr);
  const out=oc.createGain();out.gain.value=S.vol*.9;out.connect(oc.destination);build(oc,out);
  return wavURL(await oc.startRendering());
}
let seq=null,playTok=0;
function stopAll(keepDrone){
  playTok++;
  if(seq){seq.stop();seq.timers.forEach(clearTimeout);seq=null}
  echoRun=null;$('#echoStatus').textContent='';
  $$('.hot').forEach(e=>e.classList.remove('hot'));
  if(!keepDrone)setDrone(false);
}
/* events: [{f, at (beats), d (beats), ui}] */
function play(events,{onEnd}={}){
  stopAll(true);const tok=playTok;
  const beat=60/S.bpm;let end=0;events.forEach(e=>end=Math.max(end,e.at+(e.d||1)));
  const put=(c,dest,t0)=>events.forEach(e=>{if(e.f)(Array.isArray(e.f)?e.f:[e.f]).forEach(f=>note(c,f,t0+e.at*beat,(e.d||1)*beat*.95,dest,Array.isArray(e.f)?.35:.5))});
  const arm=(startIn,stopFn)=>{ // UI timers relative to audio start
    const timers=[];events.forEach(e=>{if(e.ui)timers.push(setTimeout(()=>e.ui(),(startIn+e.at*beat)*1000))});
    timers.push(setTimeout(()=>{$$('.hot').forEach(x=>x.classList.remove('hot'));seq=null;onEnd&&onEnd()},(startIn+end*beat)*1000+150));
    seq={stop:stopFn,timers};
  };
  ensureAudio().then(async live=>{
    if(tok!==playTok)return;
    if(live){const bus=ctx.createGain();bus.connect(master);put(ctx,bus,ctx.currentTime+.08);arm(.08,()=>bus.disconnect());return}
    const url=await render(end*beat+1.6,(oc,out)=>put(oc,out,.05));if(tok!==playTok)return;
    const a=new Audio(url);arm(.05,()=>{a.pause();URL.revokeObjectURL(url)});
    a.play().catch(()=>{mode='blocked';setStatus()});
  });
}
function setDrone(on){
  S.drone=on;const b=$('#pDrone');if(b){b.textContent=tx(on?'drone_on':'drone_off');b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)}
  if(droneNodes){const {g,oscs}=droneNodes;g.gain.setTargetAtTime(0,ctx.currentTime,.08);oscs.forEach(o=>o.stop(ctx.currentTime+.5));droneNodes=null}
  if(droneEl){droneEl.pause();droneEl=null}
  if(!on)return;
  const f=tonicFreq()/2*Math.pow(2,degs(M[S.mode])[0]/1200),fifth=1.5; // drone uses a pure 3:2 fifth in both tunings
  const build=(c,dest,loopSafe)=>{
    const g=c.createGain();g.gain.value=loopSafe?.09:0;if(!loopSafe)g.gain.setTargetAtTime(.09,c.currentTime,.3);
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(g).connect(dest);
    const parts=loopSafe?[[f,1],[f*fifth,.45],[f/2,.5]]:[[f,1],[f*1.003,.6],[f*fifth,.45],[f/2,.5]];
    const oscs=parts.map(([fr,a])=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=fr;const v=c.createGain();v.gain.value=a;o.connect(v).connect(lp);o.start();return o});
    return {g,oscs};
  };
  ensureAudio().then(async live=>{
    if(!S.drone)return;
    if(live){droneNodes=build(ctx,master,false);return}
    const secs=Math.round(4*f/2)/(f/2); // whole number of periods → seamless loop
    const url=await render(secs,(oc,out)=>build(oc,out,true));if(!S.drone)return;
    droneEl=new Audio(url);droneEl.loop=true;droneEl.play().catch(()=>{mode='blocked';setStatus()});
  });
}
function testSound(){play([{f:440,at:0,d:1},{f:660,at:1,d:1.5}])}


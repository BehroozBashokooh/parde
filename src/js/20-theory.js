/* Parde · src/js/20-theory.js
   Music model: tunings (Nosa / Vaziri 24-TET), Nosa degree positions and variable degrees,
   the mode list incl. avaz derived from their dastgah, note spelling with koron/sori, app state S.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- theory model ---------- */
const lg=x=>1200*Math.log2(x);
const TUN={
  /* Nosa ScalesTest constants: T 203.91, B 90.22, J 143.5 (small) / 150.63 (large, = T+B−J), S = 2T−J, H = 2T−B */
  nosa:{T:203.91,B:90.22,J:143.5,Jl:203.91+90.22-143.5,S:2*203.91-143.5,H:2*203.91-90.22,
        nat:[0,lg(9/8),lg(81/64),lg(4/3),lg(3/2),lg(27/16),lg(243/128)],flat:lg(2187/2048)},
  q:{T:200,B:100,J:150,S:250,H:300,nat:[0,200,400,500,700,900,1100],flat:100}
};
const IVINFO={
  T:{name:'Tanini',fa:'طنینی',en:'whole tone',enFa:'پرده',ratio:'9 : 8',q:200},
  B:{name:'Baqiyye',fa:'بقیه',en:'small half step (limma)',enFa:'نیم‌پرده‌ی کوچک (لیما)',ratio:'256 : 243',q:100},
  J:{name:'Mojannab',fa:'مجنب',en:'neutral step — the koron sound',enFa:'فاصله‌ی میانه — صدای کُرُن',ratio:'small + large = 294.1¢ (32 : 27)',q:150},
  S:{name:'Large step',fa:'فاصله‌ی بزرگ',en:'T + (T − J)',enFa:'T + (T − J)',ratio:'2T − J',q:250},
  H:{name:'Augmented 2nd',fa:'دوم افزوده',en:'T + apotome',enFa:'T + آپوتوم',ratio:'19683 : 16384',q:300}
};
const ivName=k=>L2(IVINFO[k].name,IVINFO[k].fa);
/* src: 'nosa' = pattern taken from the Nosa ScalesTest app; 'lab' = standard Western theory added here */
const MODES=[
 {id:'major',g:'Western',src:'nosa',name:'Major',fa:'ماژور',pat:'TTBTTTB',
  desc:'The Western major scale: a T T B tetrachord, a whole tone, then the same tetrachord again. In the Persian system the same pattern appears as Mahur. (Nosa lists it as “Major mode, Western classical”.)',
  descFa:'گام ماژور غربی: دانگ T T B، یک پرده، و دوباره همان دانگ. در موسیقی ایرانی همین الگو در ماهور دیده می‌شود. (در نوسا با نام «مد ماژور (کلاسیک غربی)» آمده است.)'},
 {id:'minor',g:'Western',src:'lab',name:'Natural minor',fa:'مینور طبیعی',pat:'TBTTBTT',
  desc:'Natural (Aeolian) minor. Compare it with Shur: the two share every note except degree 2.',
  descFa:'مینور طبیعی (ائولین). آن را با شور مقایسه کنید: همه‌ی نت‌ها جز درجه‌ی دوم یکسان‌اند.'},
 {id:'hminor',g:'Western',src:'lab',name:'Harmonic minor',fa:'مینور هارمونیک',pat:'TBTTBHB',
  desc:'Natural minor with a raised 7th, creating an augmented second (H) between degrees 6 and 7 — the Western ear\'s idea of an "eastern" sound. Compare its B H B with the J S B of Chahargah and Homayoun.',
  descFa:'مینور طبیعی با درجه‌ی هفتمِ بالابرده، که میان درجه‌های ۶ و ۷ یک دوم افزوده (H) می‌سازد — همان صدایی که گوش غربی «شرقی» می‌شنود. B H B آن را با J S B چهارگاه و همایون مقایسه کنید.'},
 {id:'shur',g:'Dastgah',src:'nosa',name:'Shur',fa:'شور',pat:'JJTTBTT',
  desc:'Often called the mother of the dastgahs: Abu Ata, Bayat-e Tork, Afshari and Dashti are traditionally grouped under it. Its lower tetrachord J J T puts a koron on degree 2.',
  descFa:'اغلب «مادر دستگاه‌ها» خوانده می‌شود: ابوعطا، بیات ترک، افشاری و دشتی به‌طور سنتی زیرمجموعه‌ی آن‌اند. دانگ پایینی J J T درجه‌ی دوم را کُرُن می‌کند.'},
 {id:'abuata',g:'Dastgah',src:'mm',parent:'shur',rot:3,name:'Abu Ata',fa:'ابوعطا'},
 {id:'afsh',g:'Dastgah',src:'mm',parent:'shur',rot:3,name:'Afshari',fa:'افشاری'},
 {id:'nava',g:'Dastgah',src:'mm',parent:'shur',rot:3,name:'Nava',fa:'نوا'},
 {id:'bayattork',g:'Dastgah',src:'mm',parent:'shur',rot:2,name:'Bayat-e Tork',fa:'بیات ترک'},
 {id:'dashti',g:'Dastgah',src:'mm',parent:'shur',rot:4,name:'Dashti',fa:'دشتی'},
 {id:'segah',g:'Dastgah',src:'nosa',name:'Segah',fa:'سه‌گاه',pat:'JTJJTTJ',
  mm:['Degree 5 follows a recommendation by Maestro Hamid Motebassem: for Segah on Mi♭ (starting on Mi koron), Si koron instead of Si♭, because it sounds better. It also makes a pure fifth above the tonic. Nosa\'s Si♭ is kept as the variable form.','درجه‌ی پنجم به توصیه‌ی استاد حمید متبسم است: در سه‌گاه روی می‌بمل (شروع از می کُرُن)، سی کُرُن به جای سی‌بمل، چون خوش‌صداتر است. این نت با نت پایه یک پنجم درست هم می‌سازد. سی‌بمل نوسا به‌عنوان شکل متغیر حفظ شده است.'],
  desc:'Built largely from neutral steps, and its tonic is itself a microtonal note (traditionally e.g. Mi koron). As in the Nosa app, Segah starts 53¢ above the selected key note: with Do selected it begins on Do sori.',
  descFa:'بیشتر از فواصل مجنب ساخته شده است و نت پایه‌ی آن خود یک نت ریزپرده‌ای است (به‌طور سنتی مثلاً می کُرُن). مانند نرم‌افزار نوسا، سه‌گاه ۵۳ سنت بالاتر از نت پایه‌ی انتخابی شروع می‌شود: با انتخاب «دو» از دو سُری آغاز می‌شود.'},
 {id:'chahargah',g:'Dastgah',src:'nosa',name:'Chahargah',fa:'چهارگاه',pat:'JSBTJSB',
  desc:'Two identical J S B tetrachords joined by a whole tone — a bright, assertive mode. The S step gives its middle a stretched, "open" sound.',
  descFa:'دو دانگ یکسان J S B که با یک پرده به هم وصل شده‌اند — مُدی درخشان و استوار. فاصله‌ی S به میانه‌ی آن حالتی کشیده و «باز» می‌دهد.'},
 {id:'homayoun',g:'Dastgah',src:'nosa',name:'Homayoun',fa:'همایون',pat:'JSBTBTT',
  desc:'Lower tetrachord J S B like Chahargah; upper part like minor. Bayat-e Esfahan is traditionally grouped with Homayoun.',
  descFa:'دانگ پایینی J S B مانند چهارگاه؛ بخش بالایی نزدیک به مینور. بیات اصفهان به‌طور سنتی با همایون گروه‌بندی می‌شود.'},
 {id:'esfahan',g:'Dastgah',src:'mm',parent:'homayoun',rot:3,name:'Esfahan',fa:'اصفهان'},
 {id:'mahur',g:'Dastgah',src:'nosa',name:'Mahur',fa:'ماهور',pat:'TTBTTTB',
  desc:'Same step pattern as the Western major scale. Its colour in performance comes from the gushehs, which bring in korons the plain scale does not show.',
  descFa:'همان الگوی فاصله‌ای گام ماژور غربی. رنگ آن در اجرا از گوشه‌ها می‌آید که کُرُن‌هایی می‌آورند که گام ساده نشان نمی‌دهد.'},
 {id:'rast',g:'Dastgah',src:'nosa',name:'Rast-Panjgah',fa:'راست',pat:'TJJTTJJ',
  desc:'Shown with the pattern the Nosa app lists as “Rast”: T J J, a whole tone, then T J J.',
  descFa:'با الگویی که نرم‌افزار نوسا با نام «راست» آورده است: T J J، یک پرده، و دوباره T J J.'},
 {id:'afshari',g:'Avaz & gusheh',src:'nosa',name:'Araq (Afshari)',fa:'عراق افشاری',pat:'TBTTTJJ',
  desc:'Listed in the Nosa app as “Araq Afshari” — from the Shur family.',
  descFa:'در نرم‌افزار نوسا با نام «عراق افشاری» آمده است — از خانواده‌ی شور.'},
 {id:'mokhalef',g:'Avaz & gusheh',src:'nosa',name:'Mokhalef (Segah)',fa:'مخالف سه‌گاه',pat:'TBTTJTJ',
  desc:'Mokhalef, the high climactic gusheh of Segah.',
  descFa:'مخالف، گوشه‌ی اوجِ سه‌گاه.'},
 {id:'araq',g:'Avaz & gusheh',src:'nosa',name:'Araq (Mahur)',fa:'عراق ماهور',pat:'TBTTTTB',
  desc:'Araq as a gusheh of Mahur, as listed in the Nosa app.',
  descFa:'عراق به‌عنوان گوشه‌ای از ماهور، مطابق نرم‌افزار نوسا.'},
 {id:'saba',g:'Avaz & gusheh',src:'nosa',name:'Saba (Persian intervals)',fa:'صبا (فواصل ایرانی)',pat:'TJJJSBT',
  desc:'Saba with Persian step sizes. Compare with the Arabic-interval version, where an augmented second replaces the J S pair.',
  descFa:'صبا با فواصل ایرانی. آن را با نسخه‌ی فواصل عربی مقایسه کنید که در آن یک دوم افزوده جای جفت J S را می‌گیرد.'},
 {id:'sabaAr',g:'Avaz & gusheh',src:'nosa',name:'Saba (Arabic intervals)',fa:'صبا (فواصل عربی)',pat:'TJJBHBT',
  desc:'The same maqam shape with Arabic intervals: note the B H B cluster.',
  descFa:'همان شکل مقام با فواصل عربی: به خوشه‌ی B H B توجه کنید.'}
];
const M=Object.fromEntries(MODES.map(m=>[m.id,m]));
MODES.forEach(m=>{if(m.parent){const p=M[m.parent];m.pat=p.pat.slice(m.rot)+p.pat.slice(0,m.rot)}});
const SAME_NOTES={abuata:1,afsh:1,nava:1};
function derivedDesc(m){ // generated description for a derived mode, with an example on the current key
  const p=M[m.parent],ord=L2(['1st','2nd','3rd','4th','5th','6th','7th'][m.rot],['اول','دوم','سوم','چهارم','پنجم','ششم','هفتم'][m.rot]);
  const d=degs(p),start=spell(m.rot,d[m.rot]).txt,key=spell(0,d[0]).txt;
  let t=L2(`Same notes as ${p.name} on the same key, starting from its ${ord} degree and staying in the same octave. With ${p.name} on ${key}, ${m.name} starts on ${start}.`,
           `همان نت‌های ${p.fa} روی همان کلید، با شروع از درجه‌ی ${ord} و ماندن در همان اکتاو. اگر ${p.fa} روی ${key} باشد، ${m.fa} از ${start} شروع می‌شود.`);
  if(SAME_NOTES[m.id])t+=L2(' Abu Ata, Afshari and Nava share this set of notes; what tells them apart is melody and emphasis, which a scale alone cannot show.',' ابوعطا، افشاری و نوا همین مجموعه‌ی نت‌ها را دارند؛ تفاوتشان در ملودی و تأکیدهاست که گام به‌تنهایی نشان نمی‌دهد.');
  return t;
}
const mName=m=>L2(m.name,m.fa), mAlt=m=>L2(m.fa,m.name);
const GENUS={TTB:['major / Mahur','ماژور / ماهور'],TBT:['minor (Dorian)','مینور (دورین)'],BTT:['Phrygian','فریژین'],JJT:['Shur','شور'],JTJ:['Segah','سه‌گاه'],TJJ:['Rast','راست'],JSB:['Chahargah','چهارگاه'],BHB:['Hijaz / harmonic','حجاز / هارمونیک']};
const gName=g=>GENUS[g]?L2(...GENUS[g]):'—';
const TONICS=[[0,0],[1,0],[2,-1],[2,0],[3,0],[4,0],[5,0],[6,-1]];
const LET_EN=['Do','Re','Mi','Fa','Sol','La','Si'],LET_FA=['دو','ر','می','فا','سل','لا','سی'];
const LET=()=>S.lang==='fa'?LET_FA:LET_EN;
const tonicName=i=>LET()[TONICS[i][0]]+(TONICS[i][1]<0?'♭':'');
const PC12=[[0,''],[0,'♯'],[1,''],[2,'♭'],[2,''],[3,''],[3,'♯'],[4,''],[5,'♭'],[5,''],[6,'♭'],[6,'']];

const S={mode:'shur',cmp:'minor',tonic:0,tuning:'nosa',timbre:'pluck',bpm:84,drone:false,vol:.8,lang:'en',...store.get('settings',{})};
if(!['pluck','sine'].includes(S.timbre))S.timbre='pluck'; // settings saved by the tar/setar version
if(!TUN[S.tuning])S.tuning='nosa'; // 'pyth' from older versions
S.drone=false;if(typeof S.tonic!=='number'||!TONICS[S.tonic])S.tonic=0;
const tun=()=>TUN[S.tuning];
/* degree positions (cents from the key note) read from the Nosa app's circle, per mode */
const NOSA_DEG={
  JJTTBTT:[0,143.5,294.13,498.04,701.95,792.17,996.08,1200],   // Shur
  TBTTTJJ:[0,203.91,294.13,498.04,701.95,905.86,1049.36,1200], // Araq Afshari
  JTJJTTJ:[53.28,203.91,407.82,551.32,701.95,905.86,1109.77,1253.28], // Segah: starts 53.28¢ above the key note, as in Nosa
  JTJTJTJ:[53.28,203.91,407.82,551.32,755.23,905.86,1109.77,1253.28], // Segah on Mi♭: degree 5 = Si koron (Nosa's variable 755.23), per Maestro Motebassem
  TBTTJTJ:[0,203.91,294.13,498.04,701.95,845.45,1049.36,1200], // Mokhalef Segah
  JSBTBTT:[0,143.5,407.82,498.04,701.95,792.17,996.08,1200],   // Homayoun
  JSBTJSB:[0,143.5,407.82,498.04,701.95,845.45,1109.77,1200],  // Chahargah
  TTBTTTB:[0,203.91,407.82,498.04,701.95,905.86,1109.77,1200], // Mahur / Major
  TBTTTTB:[0,203.91,294.13,498.04,701.95,905.86,1109.77,1200], // Araq Mahur
  TJJTTJJ:[0,203.91,347.41,498.04,701.95,905.86,1049.36,1200], // Rast
  TJJJSBT:[0,203.91,347.41,498.04,641.54,905.86,996.08,1200],  // Saba (Persian)
  TJJBHBT:[0,203.91,347.41,498.04,588.26,905.86,996.08,1200]   // Saba (Arabic)
};
/* Nosa's bracketed (variable) degrees: [degree index 0-6, cents from the key note] */
const NOSA_ALT={
  shur:[[1,90.22],[4,641.54],[5,845.45]], afshari:[[2,347.41],[6,996.08]], segah:[[0,0],[4,755.23]],
  mokhalef:[[2,347.41],[6,996.08]], homayoun:[[1,90.22],[2,294.13],[5,845.45],[5,905.86]], chahargah:[[4,641.54]],
  mahur:[[2,294.13],[2,347.41],[5,845.45],[6,996.08]], araq:[[2,407.82],[6,996.08]],
  saba:[[1,90.22],[1,143.5]], sabaAr:[[1,90.22],[1,143.5]], major:[[3,611.73],[4,815.64]]
};
/* Segah on Mi♭ (Nosa tuning): degree 5 Si koron instead of Si♭, as recommended by Maestro Motebassem */
const segahMM=()=>S.tuning==='nosa'&&S.tonic===2;
function syncSegah(){M.segah.pat=segahMM()?'JTJTJTJ':'JTJJTTJ'}
const alts=m=>{if(S.tuning!=='nosa')return [];if(m.id==='segah'&&segahMM())return [[0,0],[4,701.95]];if(m.parent){const k=m.rot;return alts(M[m.parent]).map(([j,c])=>[(j-k+7)%7,j>=k?c:c+1200])}return NOSA_ALT[m.id]||[]};
const degsPat=pat=>{if(S.tuning==='nosa'&&NOSA_DEG[pat])return NOSA_DEG[pat];let c=0;const o=[0];for(const k of pat){c+=tun()[k];o.push(c)}return o};
/* a derived mode (Maestro Motebassem's grouping) = its parent's notes on the same key, starting from degree rot+1, in the same octave */
const degs=m=>{if(typeof m==='string')return degsPat(m);if(!m.parent)return degsPat(m.pat);const p=degs(M[m.parent]),k=m.rot,o=[];for(let i=0;i<8;i++){const j=k+i;o.push(j<=7?p[j]:p[j-7]+1200)}return o};
const ROT=m=>m.rot||0; // letter offset for spelling a derived mode's degrees
/* a tetrachord's three steps: from a Nosa mode that starts with it when possible */
const genusCents=g=>{const m=MODES.find(m=>!m.parent&&m.pat.startsWith(g));if(m){const d=degs(m);return d.slice(1,4).map(c=>c-d[0])}let c=0;return [...g].map(k=>c+=tun()[k])};
const stepCents=k=>k==='J'&&tun().Jl?(Math.random()<.5?tun().J:tun().Jl):tun()[k];
const tonicCents=(ti=S.tonic)=>{const [l,a]=TONICS[ti];return tun().nat[l]+a*tun().flat};
const tonicFreq=(ti=S.tonic)=>{let f=261.63*Math.pow(2,tonicCents(ti)/1200);return f>370?f/2:f};

const KORON='<svg class="acc" width="8" height="14" viewBox="0 0 8 14" aria-label="koron"><title>koron</title><path d="M1.5 0.5V13.5M1.5 7.5L7 10.5L1.5 13.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
const SORI='<svg class="acc" width="9" height="14" viewBox="0 0 9 14" aria-label="sori"><title>sori</title><path d="M4.5 0.5V13.5M1 6L8 4M1 10L8 8M4.5 0.5L7.5 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
/* note spelling: letter from degree, accidental from the cent deviation vs the natural note */
function spell(i,cents,ti=S.tonic){
  const [l]=TONICS[ti];const k=l+i, letter=k%7, oct=Math.floor(k/7);
  const d=tonicCents(ti)+cents-(tun().nat[letter]+1200*oct);
  const kor=L2(' koron',' کُرُن'),sor=L2(' sori',' سُری');
  let acc='',txt='',sh='';
  if(d<-170){acc=txt=sh='♭♭'} else if(d<-80){acc=txt=sh='♭'} else if(d<-25){acc=KORON;txt=kor;sh='k'}
  else if(d>150){acc=txt=sh='♯♯'} else if(d>80){acc=txt=sh='♯'} else if(d>25){acc=SORI;txt=sor;sh='s'}
  const n=LET()[letter];
  const semi={'♭♭':-2,'♭':-1,'♯':1,'♯♯':2}[sh]||0; // korons/sori are measured from the plain letter
  return {html:`<bdi>${n}${acc}</bdi>`,txt:n+txt,name:n,sh,ref:100*([0,2,4,5,7,9,11][letter]+semi+12*oct),key:n+(semi<0?'♭'.repeat(-semi):'♯'.repeat(semi))};
}

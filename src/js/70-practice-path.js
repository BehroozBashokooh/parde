/* Parde · src/js/70-practice-path.js
   Practice path tab: staged plan with checkboxes saved per browser.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
/* ---------- plan ---------- */
const STAGES=[
 [['Whole and half steps','پرده و نیم‌پرده'],['Hear T vs B; the major scale as T T B · T · T T B.','T و B را از هم تشخیص دهید؛ گام ماژور به صورت T T B · T · T T B.'],
  [['Ear training → Step size, level 1','تربیت شنوایی ← اندازه‌ی فاصله، سطح ۱'],['Explorer: Major, drone on, up & down','کاوشگر: ماژور، واخوان روشن، بالا و پایین'],['Sing major on degree numbers','ماژور را با شماره‌ی درجه‌ها بخوانید']]],
 [['Major vs minor','ماژور در برابر مینور'],['Minor lowers degrees 3, 6, 7. Learn the three Western tetrachords.','مینور درجه‌های ۳، ۶ و ۷ را پایین می‌آورد. سه دانگ غربی را بیاموزید.'],
  [['Ear training → Major or minor (both levels)','تربیت شنوایی ← ماژور یا مینور (هر دو سطح)'],['Ear training → Tetrachord level 1','تربیت شنوایی ← دانگ، سطح ۱'],['Explorer: Major compared with Natural minor','کاوشگر: ماژور در مقایسه با مینور طبیعی']]],
 [['The koron step J','فاصله‌ی کُرُن: J'],['The neutral step between B and T. Shur = natural minor with a koron 2nd.','فاصله‌ی میانه، بین B و T. شور = مینور طبیعی با درجه‌ی دوم کُرُن.'],
  [['Ear training → Step size level 2','تربیت شنوایی ← اندازه‌ی فاصله، سطح ۲'],['Explorer: Shur compared with Natural minor — play one then the other','کاوشگر: شور در مقایسه با مینور طبیعی — یکی پس از دیگری'],['Echo drill in Shur','تمرین پژواک در شور']]],
 [['Shur and its family','شور و خانواده‌اش'],['Shur\'s J J T tetrachord; Araq (Afshari) and its J J ending.','دانگ J J T شور؛ عراق افشاری و پایان J J آن.'],
  [['Ear training → Tetrachord level 2','تربیت شنوایی ← دانگ، سطح ۲'],['Ear training → Degree over drone, Shur','تربیت شنوایی ← درجه روی واخوان، در شور'],['Explorer: Shur vs Araq (Afshari)','کاوشگر: شور در برابر عراق افشاری']]],
 [['Chahargah and Homayoun','چهارگاه و همایون'],['The J S B tetrachord, and how it differs from harmonic minor\'s B H B.','دانگ J S B و تفاوتش با B H B مینور هارمونیک.'],
  [['Ear training → Step size level 3','تربیت شنوایی ← اندازه‌ی فاصله، سطح ۳'],['Explorer: Chahargah vs Harmonic minor, Homayoun vs Chahargah','کاوشگر: چهارگاه در برابر مینور هارمونیک، همایون در برابر چهارگاه'],['Ear training → Which mode? level 2','تربیت شنوایی ← کدام گام؟ سطح ۲']]],
 [['Segah, Rast, Mahur','سه‌گاه، راست، ماهور'],['Complete the dastgah set; Segah\'s tonic on a koron note.','تکمیل مجموعه‌ی دستگاه‌ها؛ نت پایه‌ی سه‌گاه روی یک نت کُرُن.'],
  [['Ear training → Tetrachord level 3','تربیت شنوایی ← دانگ، سطح ۳'],['Ear training → Which mode? level 3','تربیت شنوایی ← کدام گام؟ سطح ۳'],['Echo drill in each dastgah','تمرین پژواک در هر دستگاه']]]
];
function renderPlan(){
  const done=store.get('plan',{});
  $('#stages').innerHTML=STAGES.map(([h,p,items],i)=>`<div class="stage"><div class="no">${S.lang==='fa'?'۱۲۳۴۵۶'[i]:i+1}</div><div><h4>${L2(...h)}</h4><div class="muted" style="font-size:.9rem">${L2(...p)}</div><ul style="list-style:none;padding:0">${items.map((it,j)=>`<li><label class="chk"><input type="checkbox" id="pl-${i}-${j}" ${done[i+'-'+j]?'checked':''}> <span>${L2(...it)}</span></label></li>`).join('')}</ul></div></div>`).join('');
}


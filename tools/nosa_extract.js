/* Parde · tools/nosa_extract.js
   How the Nosa numbers in Parde were obtained — reproducible in any browser.

   1. Open https://music.nosa.com/ScalesTest/
   2. Open the browser's developer console (Chrome: View → Developer → JavaScript Console)
   3. Paste this whole file and press Enter.

   It prints:
   - the interval constants defined in the app's JavaScript bundle
     (in the version read for Parde: T=203.91, B=90.22, J=143.5; the large J, S and H are derived from these)
   - for every mode in the mode menu, the position of each scale degree on the circle.
     Each degree label is drawn with an SVG rotate(angle); cents from the key note = angle × 1200/360.
     Labels in brackets, e.g. "(2)", are Nosa's variable degrees.
*/
(async () => {
  // 1. constants from the bundle
  const src = [...document.scripts].map(s => s.src).find(u => /\/assets\/index-.*\.js$/.test(u));
  if (src) {
    const code = await fetch(src).then(r => r.text());
    const i = code.indexOf('203.91');
    console.log('Constants around T=203.91:', i >= 0 ? code.slice(i - 40, i + 120) : 'not found');
  }
  // 2. degree positions for each mode
  const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => /Shour/.test(o.text)));
  const read = () => [...document.querySelectorAll('svg text')]
    .filter(e => /^\(?\d\)?$/.test(e.textContent.trim()))
    .map(e => {
      const m = (e.getAttribute('transform') || '').match(/rotate\(([-\d.]+)/);
      return `${e.textContent.trim()}=${m ? (parseFloat(m[1]) * 10 / 3).toFixed(2) : '?'}`;
    }).join('  ');
  const rows = [];
  for (let k = 0; k < sel.options.length; k++) {
    sel.selectedIndex = k;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    rows.push(`${sel.options[k].text}:  ${read()}`);
  }
  console.log(rows.join('\n'));
})();

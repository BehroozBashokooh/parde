/* Parde · src/js/00-core.js
   DOM helpers, per-browser storage (localStorage, wrapped so the app works without it), Nosa link.
   Fragment of one shared scope: tools/build.py concatenates src/js/*.js in name order
   inside a single (()=>{ ... })() closure. Not an ES module. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem('dlab-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('dlab-'+k,JSON.stringify(v))}catch(e){}}};
const NOSA='https://music.nosa.com/ScalesTest/';


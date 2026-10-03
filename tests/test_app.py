"""Automated checks for Parde, run in a real (headless) Chromium via Playwright.

    pip install -r requirements-dev.txt && python -m playwright install chromium
    python3 tools/build.py && python -m pytest -q

What is checked
- the page loads and every tab works without JavaScript errors, in English and in Persian
- every Nosa mode's degrees and variable degrees match the values read from Nosa's app
  (tests/nosa_reference.json), to the 0.1 cent shown in the table
- avaz derived from Shur / Homayoun start on the right note (Maestro Motebassem's grouping)
- Segah on Mi♭ uses Si koron as degree 5; other keys keep Nosa's Segah
- the plucked-string synth has no silent/NaN samples and is in tune to within 0.5 cent
"""
import json
import pathlib
import re

import pytest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
REF = json.loads((ROOT / "tests" / "nosa_reference.json").read_text(encoding="utf-8"))
TOL = 0.06  # table shows one decimal


@pytest.fixture(scope="module")
def browser():
    if not INDEX.exists():
        pytest.exit("index.html missing - run: python3 tools/build.py")
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        yield b
        b.close()


@pytest.fixture()
def page(browser):
    pg = browser.new_page(viewport={"width": 1200, "height": 1000})
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.goto(INDEX.as_uri())
    pg.wait_for_timeout(300)
    yield pg
    assert pg.errors == [], pg.errors
    pg.close()


def table(pg):
    """Rows of the degree table as lists of cell texts (header skipped)."""
    return pg.eval_on_selector_all(
        "#dtable tr:not(:first-child)", "rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim()))")


def choose(pg, mode, tonic="0", tuning="nosa"):
    pg.select_option("#tuning", tuning)
    pg.select_option("#tonic", tonic)
    pg.select_option("#mode", mode)
    pg.wait_for_timeout(60)


def test_all_tabs_both_languages(page):
    for _ in range(2):  # English, then Persian
        for tab in ["explore", "intervals", "ear", "plan"]:
            page.click(f'nav.tabs [data-tab="{tab}"]')
        page.click("nav.tabs [data-tab='ear']")
        for q in ["interval", "majmin", "tetra", "dastgah", "degree"]:
            page.click(f'[data-qt="{q}"]')
            page.click("#qans .btn")
        page.click("#qStop")
        page.click("nav.tabs [data-tab='explore']")
        page.click("#langBtn")
    assert page.get_attribute("#app", "dir") == "ltr"


@pytest.mark.parametrize("mode", sorted(REF["modes"]))
def test_degrees_match_nosa(page, mode):
    ref = REF["modes"][mode]
    choose(page, mode)
    rows = table(page)
    rel = [float(r[2]) for r in rows[:7]]
    want = [d - ref["degrees"][0] for d in ref["degrees"]]
    assert all(abs(a - b) <= TOL for a, b in zip(rel, want)), (rel, want)
    if ref["degrees"][0]:  # Segah starts above the key note, as in Nosa
        assert f"+{round(ref['degrees'][0])}¢" in rows[0][5]


@pytest.mark.parametrize("mode", sorted(REF["modes"]))
def test_variable_degrees_match_nosa(page, mode):
    ref = REF["modes"][mode]
    choose(page, mode)
    got = sorted(float(re.search(r"(-?[\d.]+)¢", t).group(1))
                 for t in page.eval_on_selector_all(".altbtn", "es=>es.map(e=>e.innerText)"))
    want = sorted(v - ref["degrees"][0] for v in ref["variable"])
    assert len(got) == len(want) and all(abs(a - b) <= TOL for a, b in zip(got, want)), (got, want)


@pytest.mark.parametrize("mode,tonic,start", [
    ("abuata", "1", "Sol"), ("afsh", "1", "Sol"), ("nava", "1", "Sol"),
    ("bayattork", "1", "Fa"), ("dashti", "1", "La"),
    ("esfahan", "5", "Do"),   # Homayoun on Sol -> Esfahan starts on Do
])
def test_derived_modes_start_note(page, mode, tonic, start):
    choose(page, mode, tonic)
    assert table(page)[0][1].startswith(start)


def test_segah_mi_flat_recommendation(page):
    choose(page, "segah", "2")                       # Mi♭
    assert abs(float(table(page)[4][2]) - 701.95) <= TOL   # Si koron: pure fifth above Mi koron
    assert page.is_visible("#mNote")
    choose(page, "segah", "0")                       # Do: Nosa's original Segah
    assert abs(float(table(page)[4][2]) - 648.67) <= TOL
    assert not page.is_visible("#mNote")


def test_synth_in_tune_and_not_silent(browser):
    audio = (ROOT / "src" / "js" / "30-audio.js").read_text(encoding="utf-8")
    synth = audio[audio.index("const ksCache=new Map();"):audio.index("function wavURL(")]
    pg = browser.new_page()
    pg.set_content("<script>const S={timbre:'pluck'};" + synth + "</script>")
    result = pg.evaluate("""async()=>{const out=[];
      for(const f of [196,284.24,440]){
        const sr=44100,oc=new OfflineAudioContext(1,sr*2,sr);note(oc,f,0.05,1.2,oc.destination,.5);
        const d=(await oc.startRendering()).getChannelData(0);let nan=0,pk=0;for(const v of d){if(isNaN(v))nan++;else pk=Math.max(pk,Math.abs(v))}
        const s0=Math.floor(sr*.35),W=4096,ac=l=>{let a=0;for(let i=0;i<W;i++)a+=d[s0+i]*d[s0+i+l];return a};
        let best=-1e9,bl=0;for(let l=Math.floor(sr/(f*1.3));l<=Math.ceil(sr/(f/1.3));l++){const a=ac(l);if(a>best){best=a;bl=l}}
        const y0=ac(bl-1),y1=ac(bl),y2=ac(bl+1),lag=bl+.5*(y0-y2)/(y0-2*y1+y2);
        out.push({f,nan,pk,cents:1200*Math.log2(sr/lag/f)})}
      return out}""")
    pg.close()
    for r in result:
        assert r["nan"] == 0 and r["pk"] > 0.1, r
        assert abs(r["cents"]) < 0.5, r

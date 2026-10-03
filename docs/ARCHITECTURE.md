# Parde: how it is built

Parde is a single-page web app written in **plain HTML, CSS and JavaScript**: no framework, no libraries, no server. Everything, including sound, is generated in the browser. The published app is one file, `index.html`, built from the readable sources in `src/`.

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | The app. **Generated** by `tools/build.py`: edit `src/`, not this file. |
| `src/styles.css` | Design tokens (light/dark), layout, components, right-to-left rules |
| `src/body.html` | Page markup (tabs, controls, containers) |
| `src/fonts.html` | Google Fonts links (offline the app falls back to system fonts) |
| `src/js/00-core.js` … `80-app.js` | JavaScript, concatenated in name order into one closure (see below) |
| `tools/build.py` | Joins `src/` into `index.html` (and, with `--artifact`, the claude.ai artifact form) |
| `tools/nosa_extract.js` | Browser-console script that reads Nosa's interval constants and degree positions |
| `tests/` | Playwright tests, including a check of every mode against `tests/nosa_reference.json` |

### The JavaScript files are one scope

`tools/build.py` wraps all of `src/js/*.js`, in file-name order, inside a single `(()=>{ … })();`. Later files freely use constants and functions defined in earlier ones, so the files are **fragments, not ES modules**. This keeps the shipped app a single dependency-free file. The numeric prefixes fix the order:

| File | Responsibility |
|---|---|
| `00-core.js` | `$`/`$$` DOM helpers, `store` (localStorage wrapped in try/catch), Nosa URL |
| `10-i18n.js` | `TX` (all English and Persian text), `tx(key, vars)`, `L2(en, fa)` |
| `20-theory.js` | Tunings, Nosa data, modes, avaz relations, note spelling, app state `S` |
| `30-audio.js` | Web Audio engine: live playback, offline-render fallback, plucked string, drone |
| `40-explorer.js` | Scale explorer: selects, ruler, cents wheel (SVG), analysis, degree table, echo drill |
| `50-intervals.js` | Building blocks tab |
| `60-ear-training.js` | Quiz generators and scoring |
| `70-practice-path.js` | Practice plan |
| `80-app.js` | Language switching (incl. RTL), feedback button, event wiring. Runs last. |

## The music model (`20-theory.js`)

**Units.** All pitch math is in cents: `cents = 1200 · log₂(f₂/f₁)`. The tonic frequency comes from the chosen key note (Do = 261.63 Hz, folded into roughly 185–370 Hz).

**Step letters** follow the Nosa app: **T** tanini, **B** baqiyye, **J** mojannab, **S** large step, **H** augmented second.

**Tunings** (`TUN`):

| | T | B | J | S | H |
|---|---|---|---|---|---|
| `nosa` | 203.91 | 90.22 | 143.5 (small) / 150.63 (large) | 264.32 | 317.6 |
| `q` (Vaziri 24-TET) | 200 | 100 | 150 | 250 | 300 |

The two J sizes always add up to a Pythagorean minor third (294.13¢ = 32:27).

**Modes** (`MODES`). Each mode has an id, English and Persian names, a step pattern (e.g. Shur `JJTTBTT`), a source tag and descriptions.

- **Degree positions.** In the Nosa tuning, `NOSA_DEG[pattern]` holds each mode's degree positions in cents from the key note, exactly as read from Nosa's circle. Segah starts 53.28¢ above the key note, as in Nosa. In the Vaziri tuning, positions are the running sum of the pattern's step sizes.
- **Variable degrees.** `NOSA_ALT[modeId]` holds Nosa's bracketed (variable) degrees as `[degreeIndex, cents]`.
- **Avaz derived from a dastgah.** A mode with `parent` and `rot` reuses its parent's notes on the same key, starting at degree `rot + 1` and staying in the same octave: Abu Ata, Afshari and Nava (Shur from its 4th), Bayat-e Tork (Shur from its 3rd), Dashti (Shur from its 5th), Esfahan (Homayoun from its 4th). `degs(mode)` rotates the parent's positions; `alts(mode)` rotates the parent's variable degrees; `ROT(mode)` offsets note spelling.
- **Segah on Mi♭.** With the Nosa tuning and Mi♭ as key, degree 5 is Si koron (Nosa's variable 755.23¢) instead of Si♭, and Si♭ becomes the variable form (`segahMM()`, `syncSegah()`).

**Note spelling** (`spell`). The letter comes from the degree number counted from the tonic letter. The accidental comes from the cent deviation against the natural (Pythagorean) note: ±25–80¢ is koron or sori, 80–150¢ is flat or sharp. Koron and sori are drawn as small inline SVGs.

### Where each number comes from

| Item | Source |
|---|---|
| Step patterns, interval constants, degree positions, variable degrees, Segah's 53.28¢ start | Nosa ScalesTest app, read with `tools/nosa_extract.js` (reference copy in `tests/nosa_reference.json`) |
| Avaz grouping under Shur and Homayoun, Segah's 5th degree on Mi♭ | Recommendations of Maestro Hamid Motebassem |
| Natural and harmonic minor | Standard Western theory (built from the same T, B and H) |
| Vaziri 24-TET | Definition: 24 equal quarter tones per octave |

## Sound (`30-audio.js`)

- **Plucked string.** Karplus–Strong. A noise burst is fed through a delay line with an averaging filter, `y[n] = 0.4985·(y[n−N] + y[n−N−1])`, rendered once at a 220 Hz base. The pitch is set exactly with `playbackRate = f / f0`, where `f0 = sr / (N + 0.5)`. A second, quieter, slightly detuned copy imitates a doubled course; the detunes are centred so the pitch stays exact (tested to within 0.5¢).
- **Pure tone.** A sine wave, for exact-pitch listening.
- **Drone.** Sawtooth oscillators on the mode's first degree plus a pure 3:2 fifth, through a low-pass filter.
- **Playback paths.** Live Web Audio when the browser allows it; otherwise the sound is rendered with an `OfflineAudioContext`, encoded as WAV and played through an `<audio>` element. Some embedded or locked-down browsers need this.

## Language and layout

`TX.en` / `TX.fa` hold every string. Elements carry `data-i18n="key"`; `applyLang()` fills them, sets `dir="rtl"` for Persian and re-renders. Musical graphics (ruler, wheel, step letters) stay left-to-right, as in staff notation.

## Build, test, publish

```bash
python3 tools/build.py                 # src/ -> index.html
python3 tools/build.py --artifact      # also dist/parde-artifact.html (claude.ai artifact body)
pip install -r requirements-dev.txt && python -m playwright install chromium
python -m pytest -q                    # 33 checks, including every mode against Nosa's values
```

GitHub Pages serves `index.html` from the `main` branch root; `.nojekyll` makes GitHub serve the files as they are.

## Adding a mode

1. Add an entry to `MODES` in `20-theory.js` (id, `g` group, `src`, names, `pat`, `desc`/`descFa`).
   For an avaz of an existing dastgah, give `parent` and `rot` instead of `pat` and descriptions; they are generated.
2. For the Nosa tuning, add its degree positions to `NOSA_DEG` (and variable degrees to `NOSA_ALT`).
3. Add it to `tests/nosa_reference.json` if it comes from Nosa, rebuild, run the tests.

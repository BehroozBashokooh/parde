# Parde · پرده

Hear and measure the intervals of Persian music — from major and minor to the dastgahs, from the whole tone to the koron.
شنیدن و سنجیدن فواصل موسیقی ایرانی — از ماژور و مینور تا دستگاه‌ها، از پرده تا کُرُن.

**Open the app:** https://behroozbashokooh.github.io/parde/

Scale explorer with a cents wheel and interval ruler, Nosa's variable degrees, avaz shown under their dastgah, drone and echo drill, ear-training quizzes and a practice path, in English and Persian.

## Source and credit

The scale patterns and interval sizes come from [Nosa's ScalesTest app](https://music.nosa.com/ScalesTest/) — *نظام سرکلیدها: بازنمایی کلاس‌های سرکلید و اشل‌ها* (test version 0.1, Dey 1401) — built on the research of Maestro Hamid Motebassem (استاد حمید متبسم) and Mehrdad Momeni, *پژوهشی برای تثبیت سرکلیدها در نگارش موسیقی ایرانی*. Free use of that app is supported by NOSA (Iran Software & Hardware Co.).

The grouping of avaz under their dastgah (Abu Ata, Afshari, Nava, Bayat-e Tork and Dashti under Shur; Esfahan under Homayoun) and Segah's 5th degree on Mi♭ follow recommendations by Maestro Hamid Motebassem (استاد حمید متبسم).

Parde is an independent study companion, not made by or affiliated with Nosa. Its creator does not have the musical knowledge of the creators of the Nosa app, so despite best efforts, errors and mistakes are possible. For authoritative diagrams and notation, rely on the original Nosa app.

## Feedback

Spotted a mistake or have a suggestion? Open an issue in this repository (the app's **Send feedback** button does this for you).

## For developers

Parde is plain **HTML, CSS and JavaScript**: no framework, no dependencies, no server. Sound is synthesised in the browser with the Web Audio API. The published app is the single file `index.html`, generated from the readable sources in `src/`.

```
index.html              the app (generated, don't edit by hand)
src/styles.css          styling, light/dark themes, right-to-left rules
src/body.html           page markup
src/js/00-core.js …     JavaScript, joined in name order into one scope
  20-theory.js          Nosa data, tunings, avaz relations, note spelling
  30-audio.js           Web Audio synthesis
tools/build.py          joins src/ into index.html
tools/nosa_extract.js   reproduces the Nosa values (paste into the browser console on Nosa's page)
tests/                  Playwright tests, incl. every mode checked against Nosa's values
docs/ARCHITECTURE.md    how it works, where every number comes from, how to add a mode
```

```bash
python3 tools/build.py                                   # build index.html from src/
pip install -r requirements-dev.txt
python -m playwright install chromium
python -m pytest -q                                      # run the checks
```

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the data model, the sound engine and the provenance of each value.

## Licence

[MIT](LICENSE): free to use, change and include in other software, including Nosa's, as long as the copyright notice is kept.

# Parde · پرده

Hear and measure the intervals of Persian music — from major and minor to the dastgahs, from the whole tone to the koron.
شنیدن و سنجیدن فواصل موسیقی ایرانی — از ماژور و مینور تا دستگاه‌ها، از پرده تا کُرُن.

**Open the app:** `https://<your-username>.github.io/parde/`

## Source and credit

The scale patterns come from [Nosa's ScalesTest app](https://music.nosa.com/ScalesTest/) — *نظام سرکلیدها: بازنمایی کلاس‌های سرکلید و اشل‌ها* (test version 0.1, Dey 1401) — built on the research of Maestro Hamid Motebassem (استاد حمید متبسم) and Mehrdad Momeni, *پژوهشی برای تثبیت سرکلیدها در نگارش موسیقی ایرانی*. Free use of that app is supported by NOSA (Iran Software & Hardware Co.).

Parde is an independent study companion, not made by or affiliated with Nosa. Its creator does not have the musical knowledge of the creators of the Nosa app, so despite best efforts, errors and mistakes are possible. For authoritative diagrams and notation, rely on the original Nosa app.

## Feedback

Spotted a mistake or have a suggestion? Open an issue in this repository (the app's **Send feedback** button does this for you).

## Technical notes

- A single self-contained `index.html`: no build step, no server code. Fonts load from Google Fonts and fall back to system fonts offline.
- Sound is generated in the browser with the Web Audio API.
- Settings, quiz scores and practice-path ticks are stored in each visitor's own browser (`localStorage`).
- `.nojekyll` tells GitHub Pages to serve the files as-is.

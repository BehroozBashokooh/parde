#!/usr/bin/env python3
"""Build Parde from src/ into a single, self-contained HTML file.

Parde ships as ONE html file (no server, no bundler, no dependencies) so it can be
hosted anywhere, opened offline, or published as a claude.ai artifact.

    python3 tools/build.py            # writes index.html (GitHub Pages / any web host)
    python3 tools/build.py --artifact # also writes dist/parde-artifact.html (claude.ai artifact body)

How the pieces fit together
---------------------------
src/styles.css      -> one <style> block
src/body.html       -> the page markup
src/js/*.js         -> concatenated in file-name order inside ONE closure:
                         (()=>{ 00-core.js 10-i18n.js ... 80-app.js })();
                       The files are fragments of a single scope, not ES modules:
                       later files use functions and constants from earlier ones.
src/fonts.html      -> Google Fonts <link> tags (the app falls back to system fonts offline)
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

TITLE = "Parde"
DESCRIPTION = (
    "Parde (پرده) — hear and measure the intervals of Persian music. Scale patterns and "
    "interval sizes after Nosa's ScalesTest app (music.nosa.com/ScalesTest), based on the research "
    "of Maestro Hamid Motebassem and Mehrdad Momeni."
)
ICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
    "%3Crect width='32' height='32' rx='7' fill='%232c4a9a'/%3E%3Cpath d='M9 7v18M9 15l12 5-12 5' "
    "fill='none' stroke='white' stroke-width='2.4' stroke-linejoin='round'/%3E%3C/svg%3E"
)


def read(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def parts():
    css = read(SRC / "styles.css")
    body = read(SRC / "body.html").rstrip("\n")
    fonts = read(SRC / "fonts.html")
    js_files = sorted((SRC / "js").glob("*.js"))
    if not js_files:
        sys.exit("no JavaScript files found in src/js")
    js = "".join(read(f) for f in js_files)
    return css, body, fonts, js


def artifact_html(css, body, fonts, js) -> str:
    """Body-only form used for the claude.ai artifact (the host adds <html>/<head>)."""
    return (
        f"<title>{TITLE}</title>\n{fonts}<style>\n{css}</style>\n\n{body}\n"
        f"<script>\n(()=>{{\n{js}}})();\n</script>\n"
    )


def page_html(css, body, fonts, js) -> str:
    """Complete standalone document (GitHub Pages, any static host, or opened from disk)."""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESCRIPTION}">
<link rel="icon" href="{ICON}">
{fonts}<style>
:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
body{{margin:0}}
img{{max-width:100%}}
[hidden]{{display:none!important}}
</style>
<style>
{css}</style>
</head>
<body>
{body}
<script>
(()=>{{
{js}}})();
</script>
</body>
</html>
"""


def main():
    css, body, fonts, js = parts()
    out = ROOT / "index.html"
    out.write_text(page_html(css, body, fonts, js), encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    if "--artifact" in sys.argv:
        dist = ROOT / "dist"
        dist.mkdir(exist_ok=True)
        art = dist / "parde-artifact.html"
        art.write_text(artifact_html(css, body, fonts, js), encoding="utf-8")
        print(f"wrote {art.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

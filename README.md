# Remote Code website

Landing page and downloads for **Remote Code**, the Mac menu bar app that runs
Claude Code, Codex and Gemini, with an optional iPhone and iPad app. In the same
ten languages as the apps: English, Türkçe, Deutsch, Español, Français,
Italiano, Português (Brasil), 日本語, 한국어 and 简体中文.

Live at **https://rcode.ardasnturk.com**

Plain HTML, CSS and a little vanilla JS: no build step, no cookies, no
analytics, system fonts only. The QR code library (`vendor/qrcode.min.js`,
[qrcodejs](https://github.com/davidshimjs/qrcodejs) 1.0.0, MIT) is vendored, so
the only third-party request is the GitHub Releases API call that finds the
latest DMG.

| File | |
|---|---|
| `index.html` | Page and English copy |
| `i18n/<lang>.js` | One file per language (keys match `data-i18n` in `index.html`) |
| `main.js` | Language and theme switch, latest DMG, TestFlight QR, copy buttons, motion |
| `styles.css` | Styles, dark and light; everything that moves stops under `prefers-reduced-motion` |
| `assets/` | Icons and app screenshots, one set per language in `assets/shots/` |

The page accepts `?lang=<code>` (`en`, `tr`, `de`, `es`, `fr`, `it`, `pt-BR`, `ja`,
`ko`, `zh-Hans`); without it the saved choice, then the browser language is used.

The Mac panel and window in the hero are HTML recreations of the app's menu and
session monitor, playing a scripted session; their labels are the app's own
strings. The iPhone images are real screenshots from the app's demo Mac. Avoid
`backdrop-filter` outside the navigation: over the moving background it dropped
the page to 1 frame per second.

## Settings

Both live at the top of `main.js`:

* `REPO` — the app repository (`ardasnturk/remote-code`), which also holds the
  Mac release DMGs. The download button resolves the newest `.dmg` asset
  through the GitHub Releases API and falls back to
  `https://github.com/<REPO>/releases/latest`. The Homebrew command shown on the
  page is built from it too.
* `TESTFLIGHT_URL` — the public TestFlight link; the page draws its QR code.
  `assets/testflight-qr.png` is the same code as an image for sharing.
* `TESTFLIGHT_READY` — `false` hides the QR code and says the iPhone app is
  coming instead.

## Development

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

The icons come from the app repository (`docs/icon.png`) and the extension logos
from their sites — never edit them here:

```bash
scripts/sync-from-app.sh   # expects the app at ../remote-code, or REMOTECODE_APP=/path/to/remote-code
```

## Publishing with GitHub Pages

1. Push this repository to `ardasnturk/remote-code-web` (public).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch**, branch **main**, folder **/ (root)** → **Save**.
3. Custom domain: **rcode.ardasnturk.com** (Pages → Custom domain; the `CNAME`
   file in this repo). Keep **Enforce HTTPS** on.

`.nojekyll` makes Pages serve the files as they are.

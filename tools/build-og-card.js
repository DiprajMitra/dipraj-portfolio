/**
 * Render tools/og-card.html to a 1200x630 PNG for Open Graph / Twitter.
 *
 * Usage: node tools/build-og-card.js
 *
 * Writes:
 *   assets/images/og-card.jpg    the OG card, referenced by every page
 *
 * Chrome renders to a PNG first (it is the format the screenshot comes
 * out as) and the card is then re-encoded to JPEG, which is what ships.
 * The card is a flat gradient graphic, so lossless buys nothing and PNG
 * weighs 325KB against JPEG's 75KB. The intermediate PNG never reaches
 * assets/, so it never reaches the deployed tree.
 *
 * The card is built from the site's own design tokens and font stack so
 * it stays in step with the design. If you change --bg / --accent in
 * assets/css/style.css, change them here too — or better, run this
 * script after a design change so the card can never drift.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(__dirname, 'og-card.html');
const PORTRAIT = path.join(ROOT, 'assets', 'images', 'dj.png');
const OUT_JPG = path.join(ROOT, 'assets', 'images', 'og-card.jpg');

/** Locate a headless Chrome/Chromium binary. */
function findChrome() {
    const candidates = [
        process.env.CHROME_PATH,
        ...(process.env.HOME ? [
            path.join(process.env.HOME, '.cache/ms-playwright/chromium-1255/chrome-linux64/chrome'),
        ] : []),
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ].filter(Boolean);

    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    throw new Error(
        'No Chrome binary found. Install Playwright (npm install) or set CHROME_PATH.'
    );
}

/** Load the portrait as a data URI so the HTML is a single self-contained file. */
function portraitDataUri() {
    const ext = path.extname(PORTRAIT).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${fs.readFileSync(PORTRAIT).toString('base64')}`;
}

function main() {
    const chrome = findChrome();
    const html = fs.readFileSync(TEMPLATE, 'utf8').replace('IMG_SRC', portraitDataUri());

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-card-'));
    const page = path.join(tmp, 'card.html');
    fs.writeFileSync(page, html, 'utf8');

    const out = path.join(tmp, 'card.png');
    execFileSync(chrome, [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        `--screenshot=${out}`,
        `file://${page}`,
    ], { stdio: 'inherit' });

    if (!fs.existsSync(out)) throw new Error('Chrome produced no screenshot');

    /* Re-encode to JPEG. The PNG is only Chrome's native output format —
       it is an intermediate, not a deliverable, and it never lands in
       assets/ so it never reaches the deployed tree. */
    execFileSync('python3', [
        '-c',
        [
            'from PIL import Image',
            'import sys',
            'im = Image.open(sys.argv[1]).convert("RGB")',
            'im.save(sys.argv[2], "JPEG", quality=86, optimize=True, progressive=True)',
        ].join('\n'),
        out,
        OUT_JPG,
    ], { stdio: 'inherit' });

    console.log(`wrote ${path.relative(ROOT, OUT_JPG)} (${Math.round(fs.statSync(OUT_JPG).size / 1024)} KB)`);

    fs.rmSync(tmp, { recursive: true, force: true });
}

main();

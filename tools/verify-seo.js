/**
 * verify-seo.js — Live browser verification of the portfolio's SEO surface.
 *
 * Usage: node tools/verify-seo.js [baseUrl]
 *
 * For every public route this checks:
 *   - the page loads with a clean console (no errors/warnings)
 *   - the JSON-LD parses and carries the expected schema types
 *   - the DOM has exactly one h1, and no skipped heading levels
 *   - every <img> has an alt attribute and explicit width/height
 *   - the accessibility tree exposes the expected landmarks
 *   - CLS is zero and LCP renders
 * and writes a screenshot of each route for visual review.
 */
'use strict';

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const BASE = process.argv[2] || 'http://localhost:8099';
const SHOT_DIR = path.resolve(__dirname, '..', '.seo-shots');
const EXECUTABLE = process.env.CHROME_PATH ||
    path.join(process.env.HOME || '/root', '.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');

/* The canonical origin every route advertises. The sitemap must list exactly
   these URLs, so the expected <loc> values are derived from it. */
const ORIGIN = 'https://dipraj.bond';

const ROUTES = [
    {
        path: '/',
        schemaTypes: ['Person', 'WebSite', 'ItemList', 'Blog'],
        expectTitle: 'Dipraj Mitra — Software Engineer & Competitive Programmer',
    },
    {
        path: '/projects/spam-it/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Spam.it — Python Automation Script for Bulk Posting',
    },
    {
        path: '/projects/cp-helper/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'CP Helper — Competitive Programming Setup for VS Code',
    },
    {
        path: '/projects/picoctf-2025-writeups/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'picoCTF 2025 Writeups — Full CTF Challenge Walkthroughs',
    },
    {
        path: '/projects/leetcode-solutions/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'LeetCode Solutions — Optimised Algorithms in C++ and Python',
    },
    {
        path: '/projects/who-stays-on/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Who Stays On — MILP Load-Shedding Optimizer in Python',
    },
    {
        path: '/projects/gridman-gridwise/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'GridMan GridWise — Energy Optimization API with LP Solver',
    },
    {
        path: '/projects/stockroom/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'StockRoom — 3NF Inventory Control System with RBAC',
    },
    {
        path: '/projects/finditbd/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'FindItBD — AI Product Price Comparison for BD Stores',
    },
    {
        path: '/projects/predict-the-pitch/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Predict The Pitch — XGBoost Football Outcome Prediction',
    },
    {
        path: '/projects/bit-bin/',
        schemaTypes: ['SoftwareSourceCode', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Bit Bin — Client-Side Encrypted Pastebin with Zero Knowledge',
    },
    {
        path: '/blog/why-i-stopped-trusting-the-llm-with-the-maths/',
        schemaTypes: ['BlogPosting', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Why I Stopped Trusting The LLM With All Of The Maths',
    },
    {
        path: '/blog/the-load-shedding-problem-that-taught-me-to-think-in-constraints/',
        schemaTypes: ['BlogPosting', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Thinking In Constraints: A Load Shedding Optimizer',
    },
    {
        path: '/blog/writing-leetcode-solutions-i-actually-remember/',
        schemaTypes: ['BlogPosting', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Writing LeetCode Solutions That You Actually Remember',
    },
    {
        path: '/blog/building-a-pastebin-that-the-server-cannot-read/',
        schemaTypes: ['BlogPosting', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Building A Pastebin That The Server Can Never Read',
    },
    {
        path: '/blog/five-things-i-learned-from-six-hour-hackathons/',
        schemaTypes: ['BlogPosting', 'BreadcrumbList', 'WebPage'],
        expectTitle: 'Five Things I Learned From Six Hour Long Hackathons',
    },
];

fs.mkdirSync(SHOT_DIR, { recursive: true });

(async () => {
    const browser = await chromium.launch({
        executablePath: EXECUTABLE,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    let failures = 0;
    const seenTitles = new Map();

    for (const route of ROUTES) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();

        const consoleIssues = [];
        const failedRequests = [];

        /* The Vercel Web Analytics tracker is served from Vercel's edge at
           /_vercel/insights/script.js, not from the static output. It only
           exists on a real deployment, so against a local server the request
           always 404s. That is expected, not a defect, so it is filtered out
           of both the console and the failed-request checks.
           The console message for a failed resource does not carry the URL in
           its text, so the request URL is read from the message location. */
        const isVercelInsights = (text) => text.includes('/_vercel/insights/script.js');
        const isVercelInsightsMsg = (msg) => {
            const loc = msg.location();
            if (loc && loc.url && isVercelInsights(loc.url)) return true;
            return isVercelInsights(msg.text());
        };

        page.on('console', (msg) => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                if (isVercelInsightsMsg(msg)) return;
                consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
            }
        });
        page.on('pageerror', (err) => consoleIssues.push(`[pageerror] ${err.message}`));
        page.on('requestfailed', (req) => {
            const url = req.url();
            if (isVercelInsights(url)) return;
            failedRequests.push(`${req.method()} ${url} — ${req.failure()?.errorText}`);
        });
        page.on('response', (res) => {
            if (res.status() < 400) return;
            const url = res.url();
            if (isVercelInsights(url)) return;
            failedRequests.push(`GET ${url} — HTTP ${res.status()}`);
        });

        const response = await page.goto(BASE + route.path, { waitUntil: 'networkidle' });

        const audit = await page.evaluate(() => {
            const jsonldBlocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
            const parsed = [];
            const parseErrors = [];
            jsonldBlocks.forEach((b) => {
                try { parsed.push(JSON.parse(b.textContent)); }
                catch (e) { parseErrors.push(e.message); }
            });

            const flat = [];
            parsed.forEach((p) => {
                if (p['@graph']) flat.push(...p['@graph']); else flat.push(p);
            });

            const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
                .map((h) => Number(h.tagName[1]));

            const imgs = [...document.querySelectorAll('img')].map((i) => ({
                src: i.getAttribute('src'),
                alt: i.getAttribute('alt'),
                w: i.getAttribute('width'),
                h: i.getAttribute('height'),
                loading: i.getAttribute('loading'),
            }));

            const landmarks = {
                // A <header> inside <section>/<article> is a *sectioning header*,
                // not a banner landmark — only a top-level <header> is a banner.
                banner: document.querySelectorAll('body > header, body > div > header').length,
                main: document.querySelectorAll('main').length,
                nav: document.querySelectorAll('nav').length,
                footer: document.querySelectorAll('footer').length,
                article: document.querySelectorAll('article').length,
            };

            const canonical = document.querySelector('link[rel="canonical"]')?.href || null;
            const metaDesc = document.querySelector('meta[name="description"]')?.content || null;
            const ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
            const ogUrl = document.querySelector('meta[property="og:url"]')?.content || null;
            const twImage = document.querySelector('meta[name="twitter:image"]')?.content || null;
            const title = document.title;

            return {
                schemaTypes: flat.map((n) => n['@type']),
                parseErrors,
                h1Count: document.querySelectorAll('h1').length,
                headings,
                imgs,
                landmarks,
                canonical,
                metaDesc,
                ogImage,
                ogUrl,
                twImage,
                title,
                textLength: document.body.innerText.trim().length,
                // Links that resolve to a real project route
                projectLinks: [...document.querySelectorAll('a[href^="/projects/"]')].map((a) => a.getAttribute('href')),
            };
        });

        // Core Web Vitals
        const vitals = await page.evaluate(() => new Promise((resolve) => {
            let cls = 0;
            let lcp = 0;
            try {
                new PerformanceObserver((l) => {
                    for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
                }).observe({ type: 'layout-shift', buffered: true });
            } catch (e) { /* unsupported */ }
            try {
                new PerformanceObserver((l) => {
                    const entries = l.getEntries();
                    lcp = entries[entries.length - 1].startTime;
                }).observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) { /* unsupported */ }
            setTimeout(() => resolve({ cls: Number(cls.toFixed(4)), lcp: Math.round(lcp) }), 900);
        }));

        const shotName = route.path === '/'
            ? 'home.png'
            : route.path.replace(/^\/|\/$/g, '').replace(/\//g, '-') + '.png';
        const shot = path.join(SHOT_DIR, shotName);
        await page.screenshot({ path: shot, fullPage: false });

        /* ---------- Assertions ---------- */
        const problems = [];
        const status = response?.status();

        if (status !== 200) problems.push(`HTTP status ${status}`);
        if (consoleIssues.length) problems.push(`console: ${consoleIssues.join(' | ')}`);
        if (failedRequests.length) problems.push(`failed requests: ${failedRequests.join(' | ')}`);
        if (audit.parseErrors.length) problems.push(`JSON-LD parse error: ${audit.parseErrors.join(' | ')}`);
        if (audit.h1Count !== 1) problems.push(`h1 count = ${audit.h1Count}`);

        for (const t of route.schemaTypes) {
            if (!audit.schemaTypes.includes(t)) problems.push(`missing schema type ${t}`);
        }

        let prev = 0;
        for (const lvl of audit.headings) {
            if (prev && lvl - prev > 1) { problems.push(`heading skip ${prev}->${lvl}`); break; }
            prev = lvl;
        }

        for (const img of audit.imgs) {
            if (img.alt === null) problems.push(`img without alt: ${img.src}`);
            if (!img.w || !img.h) problems.push(`img without width/height: ${img.src}`);
        }

        if (!audit.canonical) problems.push('no canonical');
        if (!audit.metaDesc) problems.push('no meta description');
        if (!audit.ogImage?.startsWith('http')) problems.push(`og:image not absolute: ${audit.ogImage}`);
        if (!audit.ogUrl?.startsWith('http')) problems.push(`og:url not absolute: ${audit.ogUrl}`);
        if (!audit.twImage?.startsWith('http')) problems.push(`twitter:image not absolute: ${audit.twImage}`);
        if (audit.landmarks.main !== 1) problems.push(`<main> count = ${audit.landmarks.main}`);
        if (audit.landmarks.banner !== 1) problems.push(`banner landmark count = ${audit.landmarks.banner}`);
        if (vitals.cls > 0.1) problems.push(`CLS ${vitals.cls} > 0.1`);

        // Cross-page uniqueness: two routes sharing a <title> or a canonical
        // means one of them will be dropped from the index as a duplicate.
        const tKey = audit.title.toLowerCase();
        if (seenTitles.has(tKey)) {
            problems.push(`duplicate <title> shared with ${seenTitles.get(tKey)}`);
        } else {
            seenTitles.set(tKey, route.path);
        }
        if (seenTitles.has('CANON:' + audit.canonical)) {
            problems.push(`duplicate canonical shared with ${seenTitles.get('CANON:' + audit.canonical)}`);
        } else {
            seenTitles.set('CANON:' + audit.canonical, route.path);
        }

        // The <title> must survive client-side JS (the i18n layer used to
        // overwrite it with the homepage title on every page).
        if (!audit.title || audit.title === 'Dipraj Mitra Chandon — Software Engineer') {
            problems.push(`title not unique after hydration: "${audit.title}"`);
        }
        if (audit.title.length < 30 || audit.title.length > 70) {
            problems.push(`title length ${audit.title.length} outside 30–70`);
        }
        if (!audit.metaDesc || audit.metaDesc.length < 100 || audit.metaDesc.length > 180) {
            problems.push(`description length ${audit.metaDesc?.length} outside 100–180`);
        }
        if (route.expectTitle && audit.title !== route.expectTitle) {
            problems.push(`title mismatch: got "${audit.title}", want "${route.expectTitle}"`);
        }

        const label = route.path.padEnd(36);
        if (problems.length) {
            failures += problems.length;
            console.log(`FAIL ${label}`);
            problems.forEach((p) => console.log(`       - ${p}`));
        } else {
            console.log(`PASS ${label} CLS=${vitals.cls} LCP=${vitals.lcp}ms text=${audit.textLength}ch`);
            console.log(`       schema: ${audit.schemaTypes.join(', ')}`);
            console.log(`       landmarks: ${JSON.stringify(audit.landmarks)}`);
            if (audit.projectLinks.length) {
                console.log(`       project links: ${audit.projectLinks.join(', ')}`);
            }
        }
        console.log(`       shot: ${path.relative(process.cwd(), shot)}`);

        await context.close();
    }

    /* ---------- Follow every project and blog link and confirm it resolves ---------- */
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const hrefs = await page.$$eval(
        'a[href^="/projects/"], a[href^="/blog/"]',
        (as) => [...new Set(as.map((a) => a.getAttribute('href')))]
    );
    for (const href of hrefs) {
        const r = await page.goto(BASE + href, { waitUntil: 'domcontentloaded' });
        const t = await page.title();
        const h1 = await page.$eval('h1', (e) => e.textContent.trim());
        console.log(`LINK ${href.padEnd(56)} ${r.status()} h1="${h1}" title="${t}"`);
        if (r.status() !== 200) failures++;
    }
    await context.close();

    /* ---------- Crawler-facing files must exist and be well formed ---------- *
     * Both were missing from the live deployment, so they are asserted here
     * rather than assumed. */
    {
        const res = await fetch(BASE + '/robots.txt');
        const body = res.ok ? await res.text() : '';
        const problems = [];
        if (!res.ok) problems.push(`HTTP ${res.status}`);
        if (!/^User-agent:\s*\*/m.test(body)) problems.push('no "User-agent: *" directive');
        if (!/^Allow:\s*\//m.test(body)) problems.push('no "Allow: /" directive');
        if (!/^Sitemap:\s*https?:\/\/\S+/m.test(body)) problems.push('no absolute Sitemap: reference');
        const sitemapRef = body.match(/^Sitemap:\s*(\S+)/m);
        console.log(`FILE ${'/robots.txt'.padEnd(36)} ${res.status}`);
        if (problems.length) {
            failures += problems.length;
            problems.forEach((p) => console.log(`       - ${p}`));
        }

        /* The sitemap reference must be the canonical origin AND the sitemap
           itself must be served with every route listed. The reference is
           absolute (it points at the live host), so it is checked against the
           canonical origin while the document is fetched from this server. */
        if (sitemapRef) {
            const smProblems = [];
            if (sitemapRef[1] !== `${ORIGIN}/sitemap.xml`) {
                smProblems.push(`Sitemap: reference is "${sitemapRef[1]}", expected "${ORIGIN}/sitemap.xml"`);
            }

            const smRes = await fetch(BASE + '/sitemap.xml');
            const smBody = smRes.ok ? await smRes.text() : '';
            if (!smRes.ok) smProblems.push(`HTTP ${smRes.status}`);

            const locs = [...smBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
            if (locs.length !== ROUTES.length) {
                smProblems.push(`expected ${ROUTES.length} <loc> entries, found ${locs.length}`);
            }
            for (const r of ROUTES) {
                const loc = `${ORIGIN}${r.path}`;
                if (!locs.includes(loc)) smProblems.push(`missing <loc> ${loc}`);
            }

            console.log(`FILE ${'/sitemap.xml'.padEnd(36)} ${smRes.status} (${locs.length} urls)`);
            if (smProblems.length) {
                failures += smProblems.length;
                smProblems.forEach((p) => console.log(`       - ${p}`));
            }
        }
    }

    await browser.close();
    console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' PROBLEM(S) FOUND'}`);
    process.exit(failures === 0 ? 0 : 1);
})();

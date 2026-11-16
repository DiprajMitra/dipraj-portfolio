/**
 * build-project-pages.js — Builds the deployable site into public/.
 *
 * Usage: node tools/build-project-pages.js
 *
 * The project registry lives in assets/js/projects.js. This script evaluates it
 * in a sandbox and writes public/projects/<slug>/index.html for each entry, so
 * the detail pages can never drift from the homepage grid or the sitemap.
 *
 * The whole site is emitted into public/ because that is Vercel's output
 * directory (see vercel.json#outputDirectory). Only site content lands there —
 * package.json, the build tools and the README stay out of the published tree.
 *
 * Each generated page contains:
 *   - a unique <title> and <meta name="description"> (SEO ranges asserted below)
 *   - a self-referencing canonical URL
 *   - Open Graph + Twitter card tags with absolute URLs
 *   - JSON-LD: SoftwareSourceCode + BreadcrumbList + WebPage
 *   - semantic landmarks and exactly one <h1>
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public');
const REGISTRY = path.join(ROOT, 'assets', 'js', 'projects.js');
const POST_REGISTRY = path.join(ROOT, 'assets', 'js', 'posts.js');

/** Marker in index.html where the build injects the homepage JSON-LD. */
const HOME_SCHEMA_MARKER = '<!--BUILD:HOME_SCHEMA-->';

/* ---------- Load the registry in a sandbox so we can reuse it verbatim ---------- */

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(REGISTRY, 'utf8'), sandbox, { filename: REGISTRY });
const { site, all: PROJECTS } = sandbox.window.PortfolioProjects;

vm.runInContext(fs.readFileSync(POST_REGISTRY, 'utf8'), sandbox, { filename: POST_REGISTRY });
const POSTS = sandbox.window.POSTS;

/* ---------- Helpers ---------- */

const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** JSON-LD is injected into a <script> block — escape only the sequence that can close it. */
const jsonLd = (obj) => JSON.stringify(obj, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const abs = (rel) => site.origin + rel;
const OG_IMAGE = abs('/assets/images/preview.png');

/**
 * The one list of identity profiles.
 *
 * It feeds two things: the JSON-LD `sameAs` graph (which lets a search
 * engine match this person to the accounts) and the visible rel="me"
 * links in the footer (the HTML-side equivalent, which lets a crawler
 * match them without parsing the schema). One source, so the two can
 * never drift apart.
 */
const IDENTITIES = [
    { label: 'GitHub', url: 'https://github.com/DiprajMitra' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/dipraj-mitra/' },
    { label: 'X', url: 'https://x.com/DiprajMitra_007' },
    { label: 'Instagram', url: 'https://www.instagram.com/diprajmitra123/' },
    // Competitive programming identity. This is the handle that ties
    // name searches to the algorithmic work, so it belongs in the
    // graph alongside the social profiles.
    { label: 'Codeforces', url: 'https://codeforces.com/profile/dipraj_007' },
    { label: 'Virtual Judge', url: 'https://vjudge.net/user/dipraj007' },
];

/** The rel="me" identity row, rendered into every page footer. */
const identityRow = () => `            <ul class="footer__me" aria-label="Profiles">
${IDENTITIES.map((i) => `                <li><a rel="me noopener noreferrer" href="${i.url}" target="_blank">${esc(i.label)}</a></li>`).join('\n')}
            </ul>`;

function assertSeo(p) {
    const t = p.metaTitle.length;
    const d = p.metaDescription.length;
    if (t < 50 || t > 60) {
        throw new Error(`[${p.slug}] metaTitle is ${t} chars — must be 50–60`);
    }
    if (d < 150 || d > 160) {
        throw new Error(`[${p.slug}] metaDescription is ${d} chars — must be 150–160`);
    }
}

function personSchema() {
    return {
        '@type': 'Person',
        '@id': site.origin + '/#person',
        name: site.author,
        // Every spelling a person might search for — the schema.org
        // `alternateName` is what lets a search for the Bengali name resolve
        // to this entity.
        alternateName: [site.authorFull, 'দ্বীপরাজ মিত্র চন্দন'],
        url: site.origin + '/',
        jobTitle: 'Software Engineer & Computer Science Student',
        description: 'Software Engineer, Full-Stack Developer, Competitive Programmer and Cybersecurity (CTF) competitor at the University of Asia Pacific.',
        affiliation: {
            '@type': 'CollegeOrUniversity',
            name: 'University of Asia Pacific',
        },
        knowsAbout: [
            'Full-Stack Development',
            'FastAPI',
            'React',
            'Machine Learning',
            'Competitive Programming',
            'Cybersecurity',
            'Capture The Flag (CTF)',
            'Data Structures and Algorithms',
            'Python',
            'C++',
            'JavaScript',
            'Automation',
        ],
        sameAs: IDENTITIES.map((i) => i.url),
    };
}

/* ---------- Page template ---------- */

function renderPage(p, index, bundle) {
    const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(index + 1) % PROJECTS.length];
    const url = abs(`/projects/${p.slug}/`);
    const prevUrl = abs(`/projects/${prev.slug}/`);
    const nextUrl = abs(`/projects/${next.slug}/`);

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareSourceCode',
                '@id': url + '#code',
                name: p.title,
                description: p.metaDescription,
                url,
                codeRepository: p.repo,
                programmingLanguage: p.tech.filter((t) => /^[A-Za-z+#]/.test(t)),
                author: { '@id': site.origin + '/#person' },
                creator: { '@id': site.origin + '/#person' },
                dateModified: p.updated,
                keywords: p.tech.join(', '),
                inLanguage: 'en',
                abstract: p.problem + ' ' + p.solution,
                image: OG_IMAGE,
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
                    { '@type': 'ListItem', position: 2, name: 'Projects', item: abs('/#projects') },
                    { '@type': 'ListItem', position: 3, name: p.title, item: url },
                ],
            },
            {
                '@type': 'WebPage',
                '@id': url + '#webpage',
                url,
                name: p.metaTitle,
                description: p.metaDescription,
                isPartOf: { '@id': site.origin + '/#website' },
                about: { '@id': site.origin + '/#person' },
                inLanguage: 'en',
                dateModified: p.updated,
                primaryImageOfPage: OG_IMAGE,
            },
        ],
    };

    return `<!DOCTYPE html>
<html lang="en" data-lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(p.metaTitle)}</title>
    <meta name="description" content="${esc(p.metaDescription)}">
    <meta name="author" content="${esc(site.authorFull)}">
    <meta name="theme-color" content="#0b1120">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

    <link rel="canonical" href="${url}">
    <link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${site.origin}/feed.xml">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${esc(site.name)}">
    <meta property="og:locale" content="${site.locale}">
    <meta property="og:title" content="${esc(p.metaTitle)}">
    <meta property="og:description" content="${esc(p.metaDescription)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="640">
    <meta property="og:image:alt" content="${esc(p.imageAlt)}">
    <meta property="article:author" content="${esc(site.authorFull)}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(p.metaTitle)}">
    <meta name="twitter:description" content="${esc(p.metaDescription)}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    <meta name="twitter:image:alt" content="${esc(p.imageAlt)}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">

    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' font-family='monospace' font-weight='bold' fill='%236366f1'>D</text></svg>">

    <script type="application/ld+json">
${jsonLd(schema)}
    </script>

    <script>
        (function () {
            try {
                var saved = localStorage.getItem('portfolio.theme');
                var mode = saved === 'light' || saved === 'dark'
                    ? saved
                    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.setAttribute('data-theme', mode);
                document.documentElement.classList.add(mode === 'light' ? 'light-mode' : 'dark-mode');

                var lang = localStorage.getItem('portfolio.lang');
                if (lang !== 'bn' && lang !== 'en') {
                    lang = (navigator.languages || [navigator.language || 'en'])
                        .some(function (l) { return String(l).toLowerCase().slice(0, 2) === 'bn'; }) ? 'bn' : 'en';
                }
                document.documentElement.setAttribute('lang', lang);
                document.documentElement.setAttribute('data-lang', lang);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-lang', 'en');
            }
        })();
    </script>

    <!--
      Vercel Web Analytics.
      The queue stub must exist before the tracker script loads, otherwise any
      event fired in between is dropped. The tracker itself is served by
      Vercel at /_vercel/insights/script.js once Web Analytics is enabled on
      the project; if it is not enabled the request 404s harmlessly and the
      site behaves exactly as before.
    -->
    <script>
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
</head>
<body class="dark-mode" data-page-meta="static">

    <svg class="svg-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <symbol id="icon-github" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12.5.5Z"/></symbol>
        <symbol id="icon-linkedin" viewBox="0 0 24 24"><path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></symbol>
        <symbol id="icon-mail" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 5h16a1 1 0 1 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 1 1 1-1Zm0 1.5v.6l8 5 8-5v-.6M4 18.5V7.9l8 5 8-5v10.6"/></symbol>
        <symbol id="icon-arrow-right" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></symbol>
        <symbol id="icon-arrow-up" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m-6 6 6-6 6 6"/></symbol>
        <symbol id="icon-chevron-down" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></symbol>
        <symbol id="icon-external" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6m0-6L10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></symbol>
        <symbol id="icon-moon" viewBox="0 0 24 24"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></symbol>
        <symbol id="icon-sun" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12L6.34 7.76 4.22 5.64Zm12.02 12.02 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm2.12-13.44 1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM6.34 16.24l1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12Z"/></symbol>
        <symbol id="icon-code" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12"/></symbol>
        <symbol id="icon-spark" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.4l-1.9-5.6L4.5 9.9 10.1 8 12 2.5ZM19 15l.95 2.55L22.5 18.5l-2.55.95L19 22l-.95-2.55L15.5 18.5l2.55-.95L19 15Z"/></symbol>
    </svg>

    <a class="skip-link" href="#main" data-i18n="nav.skip">Skip to main content</a>

    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <header class="header" id="site-header">
        <nav class="navbar container" aria-label="Primary">
            <a href="/" class="logo">
                <span class="logo__mark" aria-hidden="true">&gt;_</span>
                <span class="logo__text">dipraj<span class="logo__accent">.bond</span></span>
            </a>

            <ul class="nav-menu" id="nav-menu">
                <li><a href="/#home" class="nav-link" data-i18n="nav.home">Home</a></li>
                <li><a href="/#about" class="nav-link" data-i18n="nav.about">About</a></li>
                <li><a href="/#projects" class="nav-link" data-i18n="nav.projects">Projects</a></li>
                <li><a href="/#experience" class="nav-link" data-i18n="nav.experience">Experience</a></li>
                <li><a href="/#contact" class="nav-link" data-i18n="nav.contact">Contact</a></li>
            </ul>

            <div class="nav-actions">
                <button type="button" id="lang-toggle" class="lang-toggle" data-lang-switch aria-label="Switch language to Bangla">
                    <span aria-hidden="true">বাং</span>
                </button>
                <button type="button" id="theme-toggle" class="icon-btn" aria-label="Switch to light mode">
                    <svg class="icon icon--moon" aria-hidden="true"><use href="#icon-moon"/></svg>
                    <svg class="icon icon--sun" aria-hidden="true"><use href="#icon-sun"/></svg>
                </button>
                <button type="button" id="menu-toggle" class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    </header>

    <main id="main">

        <section class="pd-hero">
            <div class="container">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <a href="/" data-i18n="nav.home">Home</a>
                    <span class="breadcrumb__sep" aria-hidden="true">/</span>
                    <a href="/#projects" data-i18n="nav.projects">Projects</a>
                    <span class="breadcrumb__sep" aria-hidden="true">/</span>
                    <span aria-current="page">${esc(p.title)}</span>
                </nav>

                <div class="pd-hero__grid">
                    <div class="pd-hero__content">
                        <span class="pd-hero__cat">${esc(p.categoryLabel)}</span>
                        <h1 class="pd-hero__title">${esc(p.title)}</h1>
                        <p class="pd-hero__tagline" data-i18n="projects.${p.slug}.tagline">${esc(p.tagline)}</p>
                        <div class="pd-hero__actions">
                            <a href="${esc(p.repo)}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
                                <span data-i18n="projects.view">View repository</span>
                                <svg class="icon" aria-hidden="true"><use href="#icon-external"/></svg>
                            </a>${p.demo ? `
                            <a href="${esc(p.demo)}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                                <span data-i18n="projects.demo">Live demo</span>
                                <svg class="icon" aria-hidden="true"><use href="#icon-external"/></svg>
                            </a>` : ''}
                            <a href="/#projects" class="btn btn--ghost">
                                <span data-i18n="projects.all">All projects</span>
                                <svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"/></svg>
                            </a>
                        </div>
                        <ul class="pd-tags">
${p.tech.map((t) => `                            <li>${esc(t)}</li>`).join('\n')}
                        </ul>
                    </div>

                    <div class="pd-hero__media">
                        <img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="900" height="600" fetchpriority="high">
                    </div>
                </div>
            </div>
        </section>

        <section class="pd-section">
            <div class="container">
                <h2 class="pd-section__title" data-i18n="pd.overview">Overview</h2>
                <div class="pd-prose">
                    <p data-i18n="projects.${p.slug}.problem">${esc(p.problem)}</p>
                    <p data-i18n="projects.${p.slug}.solution">${esc(p.solution)}</p>
                </div>
            </div>
        </section>

        <section class="pd-section">
            <div class="container">
                <h2 class="pd-section__title" data-i18n="pd.features">What it does</h2>
                <ul class="pd-list">
${p.highlights.map((h) => `                    <li>${esc(h)}</li>`).join('\n')}
                </ul>
            </div>
        </section>

        <section class="pd-section">
            <div class="container">
                <h2 class="pd-section__title" data-i18n="pd.stack">Tech stack</h2>
                <div class="pd-prose">
                    <p>Built with ${p.tech.map(esc).join(', ')}.</p>
                </div>
                <ul class="pd-tags">
${p.tech.map((t) => `                    <li>${esc(t)}</li>`).join('\n')}
                </ul>
            </div>
        </section>

        <section class="pd-section">
            <div class="container">
                <h2 class="pd-section__title" data-i18n="pd.source">Source code</h2>
                <div class="pd-prose">
                    <p>The full source for ${esc(p.title)} is published on GitHub and is free to read, clone and fork. If you spot an improvement or want to report a bug, open an issue on the repository.</p>
                </div>
                <div class="pd-hero__actions">
                    <a href="${esc(p.repo)}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
                        <span data-i18n="projects.view">View repository</span>
                        <svg class="icon" aria-hidden="true"><use href="#icon-external"/></svg>
                    </a>
                </div>
            </div>
        </section>

        <nav class="container pd-nav" aria-label="More projects">
            <a class="pd-nav__item" href="${prevUrl}">
                <span class="pd-nav__label">← Previous</span>
                <span class="pd-nav__title">${esc(prev.title)}</span>
            </a>
            <a class="pd-nav__item pd-nav__item--next" href="${nextUrl}">
                <span class="pd-nav__label">Next →</span>
                <span class="pd-nav__title">${esc(next.title)}</span>
            </a>
        </nav>

    </main>

    <footer class="footer">
        <div class="container footer__inner">
            <p class="footer__copy">
                &copy; <span id="year">2026</span> ${esc(site.authorFull)}. <span data-i18n="footer.built">Built with love and too much coffee.</span>
            </p>
${identityRow()}
            <a href="/#home" class="footer__top">
                <span data-i18n="footer.backToTop">Back to top</span>
                <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg>
            </a>
        </div>
    </footer>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <script src="/assets/js/i18n.js"></script>
    <script>
        window.PORTFOLIO_TRANSLATIONS = ${jsonLd(bundle)};
    </script>
    <script src="/assets/js/script.js"></script>
    <script src="/assets/js/analytics.js"></script>
</body>
</html>
`;
}

/* ---------- Blog page template ---------- */

/** Render a post's body blocks as semantic HTML. */
function renderBlocks(blocks) {
    return blocks.map((b) => {
        switch (b.type) {
            case 'h2':
                return `                <h2>${esc(b.text)}</h2>`;
            case 'ul':
                return `                <ul>\n${b.items.map((i) => `                    <li>${esc(i)}</li>`).join('\n')}\n                </ul>`;
            case 'quote':
                return `                <blockquote>\n                    <p>${esc(b.text)}</p>\n                </blockquote>`;
            case 'code':
                return `                <pre class="blog-code"><code class="language-${esc(b.lang || 'text')}">${esc(b.text)}</code></pre>`;
            case 'links': {
                /* A short list of the things the post is about. Outbound links
                   give the reader somewhere to go next and give search
                   engines the relationship between the post and the repo. */
                const items = b.items.map((i) => {
                    const href = esc(i.href || '#');
                    const rel = /^https?:/i.test(i.href || '') ? ' target="_blank" rel="noopener noreferrer"' : '';
                    return `                    <li><a href="${href}"${rel}>${esc(i.text)}</a></li>`;
                }).join('\n');
                return `                <ul class="blog-links">\n${items}\n                </ul>`;
            }
            default:
                return `                <p>${esc(b.text)}</p>`;
        }
    }).join('\n');
}

function renderPost(post, index) {
    const prev = POSTS[(index - 1 + POSTS.length) % POSTS.length];
    const next = POSTS[(index + 1) % POSTS.length];
    const url = abs(`/blog/${post.slug}/`);
    const published = post.date;
    const updated = post.updated || post.date;

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': url + '#post',
                url,
                headline: post.title,
                description: post.metaDescription,
                author: { '@id': site.origin + '/#person' },
                creator: { '@id': site.origin + '/#person' },
                publisher: { '@id': site.origin + '/#person' },
                datePublished: published,
                dateModified: updated,
                inLanguage: 'en',
                keywords: post.category,
                articleSection: post.category,
                wordCount: post.body.reduce((n, b) => {
                    let t = b.text || '';
                    if (b.type === 'ul') t = b.items.join(' ');
                    else if (b.type === 'links') t = b.items.map((i) => i.text).join(' ');
                    return n + t.split(/\s+/).filter(Boolean).length;
                }, 0),
                image: OG_IMAGE,
                mainEntityOfPage: { '@id': url + '#webpage' },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
                    { '@type': 'ListItem', position: 2, name: 'Blog', item: abs('/#blog') },
                    { '@type': 'ListItem', position: 3, name: post.title, item: url },
                ],
            },
            {
                '@type': 'WebPage',
                '@id': url + '#webpage',
                url,
                name: post.metaTitle,
                description: post.metaDescription,
                isPartOf: { '@id': site.origin + '/#website' },
                about: { '@id': site.origin + '/#person' },
                inLanguage: 'en',
                datePublished: published,
                dateModified: updated,
                primaryImageOfPage: OG_IMAGE,
            },
        ],
    };

    return `<!DOCTYPE html>
<html lang="en" data-lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(post.metaTitle)}</title>
    <meta name="description" content="${esc(post.metaDescription)}">
    <meta name="author" content="${esc(site.authorFull)}">
    <meta name="theme-color" content="#0b1120">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="en" href="${url}">
    <link rel="alternate" hreflang="x-default" href="${url}">
    <link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${site.origin}/feed.xml">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${esc(site.name)}">
    <meta property="og:locale" content="${site.locale}">
    <meta property="og:title" content="${esc(post.metaTitle)}">
    <meta property="og:description" content="${esc(post.metaDescription)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="640">
    <meta property="og:image:alt" content="${esc(post.title)}">
    <meta property="article:published_time" content="${published}">
    <meta property="article:modified_time" content="${updated}">
    <meta property="article:author" content="${esc(site.authorFull)}">
    <meta property="article:section" content="${esc(post.category)}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(post.metaTitle)}">
    <meta name="twitter:description" content="${esc(post.metaDescription)}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    <meta name="twitter:image:alt" content="${esc(post.title)}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">

    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' font-family='monospace' font-weight='bold' fill='%236366f1'>D</text></svg>">

    <script type="application/ld+json">
${jsonLd(schema)}
    </script>

    <script>
        (function () {
            try {
                var saved = localStorage.getItem('portfolio.theme');
                var mode = saved === 'light' || saved === 'dark'
                    ? saved
                    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.setAttribute('data-theme', mode);
                document.documentElement.classList.add(mode === 'light' ? 'light-mode' : 'dark-mode');

                var lang = localStorage.getItem('portfolio.lang');
                if (lang !== 'bn' && lang !== 'en') {
                    lang = (navigator.languages || [navigator.language || 'en'])
                        .some(function (l) { return String(l).toLowerCase().slice(0, 2) === 'bn'; }) ? 'bn' : 'en';
                }
                document.documentElement.setAttribute('lang', lang);
                document.documentElement.setAttribute('data-lang', lang);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-lang', 'en');
            }
        })();
    </script>

    <!--
      Vercel Web Analytics.
      The queue stub must exist before the tracker script loads, otherwise any
      event fired in between is dropped. The tracker itself is served by
      Vercel at /_vercel/insights/script.js once Web Analytics is enabled on
      the project; if it is not enabled the request 404s harmlessly and the
      site behaves exactly as before.
    -->
    <script>
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
</head>
<body class="dark-mode" data-page-meta="static">

    <svg class="svg-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <symbol id="icon-github" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12.5.5Z"/></symbol>
        <symbol id="icon-linkedin" viewBox="0 0 24 24"><path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></symbol>
        <symbol id="icon-mail" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 5h16a1 1 0 1 1 1 1v12a1 1 0 1 1-1 1H4a1 1 0 1 1-1-1V6a1 1 0 1 1 1-1Zm0 1.5v.6l8 5 8-5v-.6M4 18.5V7.9l8 5 8-5v10.6"/></symbol>
        <symbol id="icon-arrow-right" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></symbol>
        <symbol id="icon-arrow-up" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m-6 6 6-6 6 6"/></symbol>
        <symbol id="icon-chevron-down" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></symbol>
        <symbol id="icon-external" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6m0-6L10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></symbol>
        <symbol id="icon-moon" viewBox="0 0 24 24"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></symbol>
        <symbol id="icon-sun" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12L6.34 7.76 4.22 5.64Zm12.02 12.02 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm2.12-13.44 1.42 1.42-2.12 2.12-1.42-1.42L18.16 4.2ZM6.34 16.24l1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12Z"/></symbol>
        <symbol id="icon-code" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12"/></symbol>
        <symbol id="icon-spark" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.4l-1.9-5.6L4.5 9.9 10.1 8 12 2.5ZM19 15l.95 2.55L22.5 18.5l-2.55.95L19 22l-.95-2.55L15.5 18.5l2.55-.95L19 15Z"/></symbol>
    </svg>

    <a class="skip-link" href="#main" data-i18n="nav.skip">Skip to main content</a>

    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <header class="header" id="site-header">
        <nav class="navbar container" aria-label="Primary">
            <a href="/" class="logo">
                <span class="logo__mark" aria-hidden="true">&gt;_</span>
                <span class="logo__text">dipraj<span class="logo__accent">.bond</span></span>
            </a>

            <ul class="nav-menu" id="nav-menu">
                <li><a href="/#home" class="nav-link" data-i18n="nav.home">Home</a></li>
                <li><a href="/#about" class="nav-link" data-i18n="nav.about">About</a></li>
                <li><a href="/#projects" class="nav-link" data-i18n="nav.projects">Projects</a></li>
                <li><a href="/#blog" class="nav-link" data-i18n="nav.blog">Blog</a></li>
                <li><a href="/#experience" class="nav-link" data-i18n="nav.experience">Experience</a></li>
                <li><a href="/#contact" class="nav-link" data-i18n="nav.contact">Contact</a></li>
            </ul>

            <div class="nav-actions">
                <button type="button" id="lang-toggle" class="lang-toggle" data-lang-switch aria-label="Switch language to Bangla">
                    <span aria-hidden="true">বাং</span>
                </button>
                <button type="button" id="theme-toggle" class="icon-btn" aria-label="Switch to light mode">
                    <svg class="icon icon--moon" aria-hidden="true"><use href="#icon-moon"/></svg>
                    <svg class="icon icon--sun" aria-hidden="true"><use href="#icon-sun"/></svg>
                </button>
                <button type="button" id="menu-toggle" class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    </header>

    <main id="main">

        <article class="blog-post">
            <header class="blog-hero">
                <div class="container">
                    <nav class="breadcrumb" aria-label="Breadcrumb">
                        <a href="/" data-i18n="nav.home">Home</a>
                        <span class="breadcrumb__sep" aria-hidden="true">/</span>
                        <a href="/#blog" data-i18n="nav.blog">Blog</a>
                        <span class="breadcrumb__sep" aria-hidden="true">/</span>
                        <span aria-current="page">${esc(post.title)}</span>
                    </nav>

                    <div class="blog-hero__meta">
                        <span class="blog-hero__cat">${esc(post.category)}</span>
                        <time class="blog-hero__date" datetime="${published}">${esc(published)}</time>
                        <span class="blog-hero__read">${post.readMinutes} min read</span>
                    </div>

                    <h1 class="blog-hero__title">${esc(post.title)}</h1>
                    <p class="blog-hero__excerpt">${esc(post.excerpt)}</p>
                </div>
            </header>

            <div class="container">
                <div class="blog-body">
${renderBlocks(post.body)}
                </div>
            </div>

            <nav class="container pd-nav" aria-label="More posts">
                <a class="pd-nav__item" href="${abs(`/blog/${prev.slug}/`)}">
                    <span class="pd-nav__label">&larr; Previous</span>
                    <span class="pd-nav__title">${esc(prev.title)}</span>
                </a>
                <a class="pd-nav__item pd-nav__item--next" href="${abs(`/blog/${next.slug}/`)}">
                    <span class="pd-nav__label">Next &rarr;</span>
                    <span class="pd-nav__title">${esc(next.title)}</span>
                </a>
            </nav>
        </article>

    </main>

    <footer class="footer">
        <div class="container footer__inner">
            <p class="footer__copy">
                &copy; <span id="year">2026</span> ${esc(site.authorFull)}. <span data-i18n="footer.built">Built with love and too much coffee.</span>
            </p>
${identityRow()}
            <a href="/#home" class="footer__top">
                <span data-i18n="footer.backToTop">Back to top</span>
                <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg>
            </a>
        </div>
    </footer>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <script src="/assets/js/i18n.js"></script>
    <script src="/assets/js/script.js"></script>
    <script src="/assets/js/analytics.js"></script>
</body>
</html>
`;
}

/* ---------- Project translation bundle ----------
 * Emitted as a JSON island in each page so the i18n layer can swap the
 * Bangla copy without a second build step or a network request. */
const translationBundle = { en: {}, bn: {} };
PROJECTS.forEach((p) => {
    translationBundle.en[`projects.${p.slug}.problem`] = p.problem;
    translationBundle.en[`projects.${p.slug}.solution`] = p.solution;
    translationBundle.en[`projects.${p.slug}.tagline`] = p.tagline;
    translationBundle.bn[`projects.${p.slug}.problem`] = p.problemBn;
    translationBundle.bn[`projects.${p.slug}.solution`] = p.solutionBn;
    translationBundle.bn[`projects.${p.slug}.tagline`] = p.taglineBn;
});

/* ---------- Write ---------- */

/** Recursively copy a directory tree. */
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDir(from, to);
        else fs.copyFileSync(from, to);
    }
}

/* Start from a clean output directory so a removed project can never leave a
   stale page behind in the published site. */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let written = 0;
PROJECTS.forEach((p, i) => {
    assertSeo(p);
    const dir = path.join(OUT, 'projects', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'index.html');
    fs.writeFileSync(out, renderPage(p, i, translationBundle), 'utf8');
    console.log('wrote', path.relative(ROOT, out));
    written += 1;
});

POSTS.forEach((post, i) => {
    assertSeo(post);
    const dir = path.join(OUT, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'index.html');
    fs.writeFileSync(out, renderPost(post, i), 'utf8');
    console.log('wrote', path.relative(ROOT, out));
    written += 1;
});

/* ---------- Homepage JSON-LD (Person + WebSite + ItemList) ---------- */

const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        personSchema(),
        {
            '@type': 'WebSite',
            '@id': site.origin + '/#website',
            name: site.name,
            url: site.origin + '/',
            description: 'Portfolio of Dipraj Mitra, Software Engineer and Computer Science student at the University of Asia Pacific.',
            inLanguage: 'en',
            publisher: { '@id': site.origin + '/#person' },
            author: { '@id': site.origin + '/#person' },
            // Tells a search engine what the site offers as an entry point
            // beyond the homepage: the project index and the blog feed.
            potentialAction: [
                {
                    '@type': 'ReadAction',
                    target: abs('/#projects'),
                },
                {
                    '@type': 'ReadAction',
                    target: abs('/feed.xml'),
                },
            ],
        },
        {
            '@type': 'ItemList',
            '@id': site.origin + '/#projects',
            name: 'Projects by Dipraj Mitra',
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            numberOfItems: PROJECTS.length,
            itemListElement: PROJECTS.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: abs(`/projects/${p.slug}/`),
                name: p.title,
            })),
        },
        {
            '@type': 'Blog',
            '@id': site.origin + '/#blog',
            name: 'Dipraj Mitra — Blog',
            url: abs('/#blog'),
            inLanguage: 'en',
            author: { '@id': site.origin + '/#person' },
            publisher: { '@id': site.origin + '/#person' },
            // The RSS feed is a first-class entry point for the blog, so it
            // is named in the schema as well as in the page head.
            potentialAction: {
                '@type': 'ReadAction',
                target: abs('/feed.xml'),
            },
            blogPost: POSTS.map((post) => ({
                '@type': 'BlogPosting',
                '@id': abs(`/blog/${post.slug}/`) + '#post',
                url: abs(`/blog/${post.slug}/`),
                headline: post.title,
                datePublished: post.date,
                dateModified: post.updated || post.date,
            })),
        },
        {
            '@type': 'ItemList',
            '@id': site.origin + '/#blog-list',
            name: 'Blog posts by Dipraj Mitra',
            numberOfItems: POSTS.length,
            itemListElement: POSTS.map((post, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: abs(`/blog/${post.slug}/`),
                name: post.title,
            })),
        },
    ],
};

/* ---------- Copy the static parts of the site into public/ ---------- */

const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!homepage.includes(HOME_SCHEMA_MARKER)) {
    throw new Error(`index.html is missing the ${HOME_SCHEMA_MARKER} marker — the homepage JSON-LD cannot be injected.`);
}
fs.writeFileSync(
    path.join(OUT, 'index.html'),
    homepage.replace(HOME_SCHEMA_MARKER, `<script type="application/ld+json">\n${jsonLd(homeSchema)}\n    </script>`),
    'utf8'
);
console.log('wrote public/index.html');

fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(OUT, 'robots.txt'));
console.log('wrote public/robots.txt');

copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
console.log('wrote public/assets/');

/* ---------- sitemap.xml (generated from the same registry) ---------- */

const TODAY = '2026-11-16';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
        <loc>${site.origin}/</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
${PROJECTS.map((p) => `    <url>
        <loc>${site.origin}/projects/${p.slug}/</loc>
        <lastmod>${p.updated}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`).join('\n')}
${POSTS.map((post) => `    <url>
        <loc>${site.origin}/blog/${post.slug}/</loc>
        <lastmod>${post.updated || post.date}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.6</priority>
    </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap, 'utf8');
console.log('wrote public/sitemap.xml');

/* ---------- feed.xml (RSS 2.0, generated from the same post registry) ---------- */

/** XML text nodes: escape the five entities, then drop characters XML 1.0 forbids. */
const xml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

/** RFC 822 date, e.g. "Wed, 24 Sep 2026 00:00:00 GMT". */
const rfc822 = (iso) => {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toUTCString();
};

/**
 * Flatten a post's block array into readable prose for the feed body.
 * Full HTML lives on the post page; the feed carries a plain-text summary
 * so readers can pick it up in any feed reader.
 */
function postText(post) {
    const out = [];
    for (const b of post.body) {
        if (b.type === 'p' || b.type === 'h2' || b.type === 'h3' || b.type === 'quote') {
            out.push(b.text);
        } else if (b.type === 'ul' || b.type === 'ol') {
            out.push((b.items || []).join('\n'));
        } else if (b.type === 'code') {
            out.push(b.text || '');
        }
    }
    return out.join('\n\n').trim();
}

const feedItems = POSTS.map((post) => `    <item>
        <title>${xml(post.metaTitle)}</title>
        <link>${site.origin}/blog/${post.slug}/</link>
        <guid isPermaLink="true">${site.origin}/blog/${post.slug}/</guid>
        <pubDate>${rfc822(post.date)}</pubDate>
        <category>${xml(post.category || 'Engineering')}</category>
        <description>${xml(post.metaDescription)}</description>
        <content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/">${xml(postText(post))}</content:encoded>
    </item>`).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${xml(site.name)}</title>
        <link>${site.origin}/</link>
        <description>${xml('Writing on software engineering, competitive programming and security — from Dipraj Mitra.')}</description>
        <language>en</language>
        <lastBuildDate>${rfc822(TODAY)}</lastBuildDate>
        <atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml"/>
${feedItems}
    </channel>
</rss>
`;

fs.writeFileSync(path.join(OUT, 'feed.xml'), feed, 'utf8');
console.log('wrote public/feed.xml');

console.log(`\n${written} project page(s) written to public/.`);


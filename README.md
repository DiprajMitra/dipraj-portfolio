# 🚀 Personal Portfolio | Dipraj Mitra Chandon (দ্বীপরাজ মিত্র চন্দন)

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://dipraj-portfolio-ten.vercel.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/dipraj-mitra/)

A modern, responsive personal portfolio with a **CSE terminal boot sequence**, a
token-driven design system, and full **bilingual English / বাংলা** support.

---

## 🔗 Live Demo
**[View Live Project →](https://dipraj-portfolio-ten.vercel.app/)**

## 📸 Screenshots
<p align="center">
  <img src="assets/images/preview.png" alt="Portfolio Preview" width="800px">
</p>

## 🛠 Tech Stack
- **Frontend:** HTML5, CSS3 (Vanilla, custom properties), JavaScript (ES2018+)
- **Icons:** Inline SVG sprite (no render-blocking icon CDN)
- **Fonts:** Inter (Latin UI) · JetBrains Mono (code) · Noto Sans Bengali (বাংলা)
- **Animations:** Intersection Observer (scroll reveal, scroll spy, counters)
- **i18n:** Custom dependency-free translation layer
- **Contact System:** FormSubmit.co (AJAX/Fetch) with client-side validation
- **Hosting:** Vercel

## 🔍 SEO Architecture

Every project has its **own crawlable route** with unique metadata, so each one
is individually indexable rather than hidden behind a modal.

| Route | Purpose |
|---|---|
| `/` | Homepage — `Person` + `WebSite` + `ItemList` JSON-LD |
| `/projects/spam-it/` | Project case study — `SoftwareSourceCode` + `BreadcrumbList` + `WebPage` JSON-LD |
| `/projects/cp-helper/` | ” |
| `/projects/picoctf-2025-writeups/` | ” |
| `/projects/leetcode-solutions/` | ” |
| `/sitemap.xml` | Generated from the project registry |
| `/robots.txt` | `Allow: /` + sitemap reference |

**What each route ships with**
- Unique `<title>` (50–60 chars) and `<meta name="description">` (150–160 chars)
- Self-referencing `<link rel="canonical">` — absolute, one per page
- Full Open Graph (`og:title`/`og:description`/`og:url`/`og:type`/`og:image`/`og:site_name`)
  and Twitter Card (`summary_large_image`) tags with **absolute** image URLs
- JSON-LD structured data injected into `<head>`
- Exactly one `<h1>`, no skipped heading levels, semantic landmarks
- Descriptive `alt` text and explicit `width`/`height` on every image (CLS-safe)
- Breadcrumb navigation with `aria-label` and `aria-current="page"`

**Single source of truth:** all project metadata lives in
[`assets/js/projects.js`](assets/js/projects.js). The detail pages and
`sitemap.xml` are generated from it — they can never drift apart.

### Project registry

```js
{
  slug: 'spam-it',                    // URL segment
  metaTitle: '…',                     // 50–60 chars
  metaDescription: '…',               // 150–160 chars
  problem: '…', solution: '…',        // indexable prose
  problemBn: '…', solutionBn: '…',    // Bangla prose
  tech: ['Python', 'Automation'],      // tech stack
  highlights: ['…'],                  // measurable outcomes
  repo: 'https://github.com/…',
  image: '…', imageAlt: '…',
  updated: '2026-11-16',              // drives <lastmod>
}
```

### Build & verify

```bash
npm install          # playwright-core, for verification only
npm run build        # regenerate projects/*/index.html + sitemap.xml
npm run serve        # http://localhost:8099
npm run verify:seo   # headless Chrome audit of every route
npm run check        # build + verify
```

`verify:seo` asserts, for each route: HTTP 200, clean console, valid JSON-LD
with the expected schema types, exactly one `<h1>`, no heading-level skips,
`alt` + `width`/`height` on every image, absolute OG/Twitter image URLs, unique
`<title>` and canonical across all pages, CLS < 0.1, and that every
`/projects/` link resolves. Screenshots land in `.seo-shots/`.

> **Note:** the project pages set `data-page-meta="static"` on `<body>`, which
> tells the i18n layer *not* to overwrite their `<title>` with the homepage's.
> Without it every project page would ship a duplicate title and be dropped
> from the index as a duplicate.

## ✨ Key Features

### 💻 Terminal Loader
A developer-themed boot sequence with animated typing, a live status log and a
progress bar. Auto-skips for users who prefer reduced motion.

### 🌍 Bilingual (English / বাংলা)
- One-click language switch in the navbar — **no page reload, no flash**
- Every string, placeholder, `aria-label` and the `<title>`/`<meta>` are translated
- Bangla gets its own font stack (Noto Sans Bengali) with tuned line-height
- Choice is persisted in `localStorage`; the browser language is detected on first visit

### 🌓 Dark / Light Mode
- Follows the OS `prefers-color-scheme` by default, then remembers your choice
- Resolved **before first paint** by an inline script — no flash of the wrong theme

### 🧩 Project Filtering
Filter the grid by category (Tools / Web / Security / Algorithms) with an
accessible empty state.

### 📊 Scroll Experience
Scroll-progress bar, active-section scroll spy, staggered scroll reveals and
animated stat counters.

### ♿ Accessibility
- Semantic landmarks, skip link, one `h1`, no skipped heading levels
- Visible `:focus-visible` rings on every interactive element
- All body text meets WCAG AA contrast (≥ 4.5:1) in both themes
- Full `prefers-reduced-motion` support
- Every control has an accessible name; images have `alt` text

### 📧 Functional Contact Form
Client-side validation with inline error messages, a honeypot field to block
bots, and real-time delivery status feedback.

### 🚀 Performance
Zero runtime dependencies, inline SVG icons (no icon-font download), lazy-loaded
project images, and `requestAnimationFrame`-throttled scroll handlers.

## 📂 Folder Structure
```text
dipraj-portfolio/
├── assets/
│   ├── css/
│   │   └── style.css      # Design tokens, themes, components
│   ├── images/            # Profile & preview images
│   └── js/
│       ├── i18n.js        # EN/BN translation layer
│       ├── projects.js    # Project registry (single source of truth)
│       └── script.js      # Behaviour modules
├── projects/
│   ├── spam-it/index.html            # Generated — do not edit by hand
│   ├── cp-helper/index.html
│   ├── picoctf-2025-writeups/index.html
│   └── leetcode-solutions/index.html
├── tools/
│   ├── build-project-pages.js # Renders project pages + sitemap.xml
│   └── verify-seo.js          # Headless-Chrome SEO audit
├── index.html             # Homepage
├── sitemap.xml            # Generated
├── robots.txt
├── vercel.json            # cleanUrls, trailingSlash, canonical redirects
└── .gitignore
```

## 🎨 Design System

All styling is driven by CSS custom properties defined at the top of
`assets/css/style.css`:

| Token group | Examples |
|---|---|
| **Colour** | `--bg`, `--text`, `--accent`, `--border`, `--gradient` (overridden per theme) |
| **Typography** | `--font-sans`, `--font-mono`, `--font-bn`, fluid `--fs-*` scale via `clamp()` |
| **Space** | `--sp-1` … `--sp-10` |
| **Shape** | `--radius-sm` … `--radius-full` |
| **Motion** | `--ease`, `--ease-out`, `--dur-fast` … `--dur-slow` |

To rebrand, change `--accent` / `--gradient` and the two theme blocks — everything
else inherits.

## ⚙️ Installation & Local Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dipraj2/dipraj-portfolio.git
   ```
2. **Navigate to the folder:**
   ```bash
   cd dipraj-portfolio
   ```
3. **Open in Browser:**
   Simply open `index.html` or use the Live Server extension in VS Code.

> **Note:** the hero has a *Download Résumé* button pointing at `assets/resume.pdf`.
> Drop your PDF at that exact path (or update the `href` in `index.html`) before deploying.

## 🌐 Adding a Language
1. Add a locale block to `DICT` in `assets/js/i18n.js` and list the locale in `SUPPORTED`.
2. Add the matching font stack to `html[data-lang="xx"]` rules in `assets/css/style.css`.
3. Add the locale to the detection list in the inline `<head>` script in `index.html`.

## ➕ Adding a Project
1. Append an entry to the `PROJECTS` array in `assets/js/projects.js`.
   Keep `metaTitle` at 50–60 characters and `metaDescription` at 150–160 —
   the build script asserts both and will fail loudly otherwise.
2. Write the `problem` / `solution` prose. This is the body copy search
   engines index, so describe the problem, the approach and the outcome —
   not just the tech stack.
3. Run `npm run build`. This creates `projects/<slug>/index.html`, adds the
   route to `sitemap.xml`, and regenerates the translation bundle.
4. Add a matching card to the project grid in `index.html` (title link +
   "Read case study" CTA pointing at `/projects/<slug>/`).
5. Run `npm run verify:seo` to confirm the new route passes every check.

## 🚀 Deployment Instructions
This project is optimized for **Vercel**:
1. Connect your GitHub account to Vercel.
2. Select the `dipraj-portfolio` repository.
3. Click **Deploy**. Vercel will automatically detect the static files.

## 🤝 Contact
- **Name:** Dipraj Mitra Chandon (দ্বীপরাজ মিত্র চন্দন)
- **Email:** [dipraj.mitra123@gmail.com](mailto:dipraj.mitra123@gmail.com)
- **Location:** Kazipara, Dhaka, Bangladesh

---
*Built with ❤️ and Passion by Dipraj.*

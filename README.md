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
│       └── script.js      # Behaviour modules
├── index.html             # Single entry point
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

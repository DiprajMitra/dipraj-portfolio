/**
 * i18n.js — Bilingual (English / বাংলা) translation layer.
 *
 * Strategy: every translatable node in index.html carries a `data-i18n` key
 * (textContent) or `data-i18n-attr` (attribute map, e.g. "placeholder:key").
 * Switching locale swaps the DOM in place — no reload, no layout shift.
 *
 * The Bangla locale also swaps the body font stack (via `html[data-lang="bn"]`)
 * so Bengali glyphs render with a proper conjunct-aware face instead of a
 * Latin fallback.
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'portfolio.lang';
    const SUPPORTED = ['en', 'bn'];

    const DICT = {
        en: {
            /* ---- meta / document ---- */
            'meta.description': 'Dipraj Mitra is a software engineer and competitive programmer building full-stack apps, security tooling and AI experiments at the University of Asia Pacific.',
            'meta.title': 'Dipraj Mitra — Software Engineer & Competitive Programmer',

            /* ---- loader ---- */
            'loader.title': 'bash — dipraj.bond — 80x24',
            'loader.status.init': 'Initializing',
            'loader.status.modules': 'Loading core modules',
            'loader.status.network': 'Establishing secure connection',
            'loader.status.assets': 'Compiling portfolio assets',
            'loader.status.ux': 'Optimizing user experience',
            'loader.status.done': 'Access granted. Welcome.',

            /* ---- chrome / nav ---- */
            'nav.skip': 'Skip to main content',
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.projects': 'Projects',
            'nav.experience': 'Experience',
            'nav.contact': 'Contact',
            'nav.theme.dark': 'Switch to dark mode',
            'nav.theme.light': 'Switch to light mode',
            'nav.lang.toggle': 'বাংলা',
            'nav.lang.label': 'Switch language to Bangla',
            'nav.menu.open': 'Open menu',
            'nav.menu.close': 'Close menu',

            /* ---- hero ---- */
            'hero.greeting': "Hello, I'm",
            'hero.name': 'Dipraj Mitra Chandon',
            'hero.roles': ['Software Engineer', 'Problem Solver', 'Security Enthusiast', 'CS Student'],
            'hero.bio': 'Computer Science student turning curiosity into working software — from algorithmic problem solving to security tooling and AI experiments.',
            'hero.cta.projects': 'View Projects',
            'hero.cta.contact': "Let's Talk",
            'hero.cta.resume': 'Download Résumé',
            'hero.scroll': 'Scroll to explore',
            'hero.badge': 'Available for internships',
            'hero.portrait': 'Portrait of Dipraj Mitra Chandon',

            /* ---- stats ---- */
            'stats.projects': 'Projects Shipped',
            'stats.problems': 'Problems Solved',
            'stats.commits': 'Commits',
            'stats.languages': 'Languages',

            /* ---- about ---- */
            'about.title': 'About Me',
            'about.subtitle': 'The person behind the terminal',
            'about.p1': "I'm currently pursuing a Bachelor's in Computer Science at the University of Asia Pacific, where I build a strong foundation in data structures, algorithms and software engineering. My journey into tech started with a simple question — how does this actually work underneath? — and it turned into a habit of taking things apart and rebuilding them better.",
            'about.p2': 'Most of my work sits at the intersection of systems and security: automation tooling, CTF writeups, and competitive programming solutions where efficiency under pressure matters. When I am not shipping code you will find me in a hackathon, reading a postmortem, or contributing to open source.',
            'about.skills.title': 'Technical Skills',
            'about.skills.subtitle': 'Languages, frameworks and tools I reach for',
            'about.principles': 'How I Work',
            'about.principle1.title': 'First principles',
            'about.principle1.body': 'Understand the mechanism before reaching for the tool.',
            'about.principle2.title': 'Ship, then refine',
            'about.principle2.body': 'Working software beats a perfect plan every single time.',
            'about.principle3.title': 'Explain it clearly',
            'about.principle3.body': 'If I cannot write it down, I do not understand it yet.',

            /* ---- skills ---- */
            'skills.langs': 'Languages',
            'skills.web': 'Web & Frameworks',
            'skills.data': 'Data & AI',
            'skills.tools': 'Tools & Platforms',

            /* ---- projects ---- */
            'projects.title': 'Projects',
            'projects.subtitle': 'Things I have built, broken and rebuilt',
            'projects.filter.all': 'All',
            'projects.filter.tools': 'Tools',
            'projects.filter.web': 'Web',
            'projects.filter.security': 'Security',
            'projects.filter.algorithms': 'Algorithms',
            'projects.view': 'View repository',
            'projects.read': 'Read case study',
            'projects.all': 'All projects',
            'projects.empty': 'No projects in this category yet.',

            /* ---- project detail page ---- */
            'pd.overview': 'Overview',
            'pd.features': 'What it does',
            'pd.stack': 'Tech stack',
            'pd.source': 'Source code',
            'projects.p1.title': 'Spam.it',
            'projects.p1.body': 'An automated comment-spamming tool built to explore scripting, rate limiting and automation patterns end to end.',
            'projects.p2.title': 'CP Helper (VS Code)',
            'projects.p2.body': 'A complete competitive-programming environment for C++ — templates, debugging config and a tested local judge setup.',
            'projects.p3.title': 'picoCTF 2025 Writeups',
            'projects.p3.body': 'Full walkthroughs and solutions for the picoCTF 2025 cybersecurity challenges, written for other learners to follow.',
            'projects.p4.title': 'LeetCode Solutions',
            'projects.p4.body': 'A growing collection of optimized LeetCode solutions with complexity notes for each approach.',

            /* ---- experience ---- */
            'exp.title': 'Education & Experience',
            'exp.subtitle': 'Where the fundamentals came from',
            'exp.degree': 'B.S. Computer Science',
            'exp.degree.body': "Focusing on software engineering, distributed systems and artificial intelligence. Dean's List across recent semesters.",
            'exp.hsc': 'Higher Secondary Certificate',
            'exp.hsc.body': 'Completed Higher Secondary in Science with GPA 5.',
            'exp.ssc': 'High School Graduation',
            'exp.ssc.body': 'Completed Secondary School Certificate in Science with GPA 5.',
            'exp.present': 'Present',

            /* ---- contact ---- */
            'contact.title': 'Get In Touch',
            'contact.subtitle': 'Open to internships, collaborations and interesting problems',
            'contact.heading': "Let's Talk",
            'contact.body': "I am currently looking for internship opportunities. If you have a question, a role, or just want to say hi — drop me a message and I will get back to you.",
            'contact.email': 'Email',
            'contact.location': 'Location',
            'contact.available': 'Typically replies within a day',
            'contact.form.name': 'Your name',
            'contact.form.email': 'Your email',
            'contact.form.message': 'Your message',
            'contact.form.subject': 'Subject',
            'contact.form.submit': 'Send Message',
            'contact.form.sending': 'Sending…',
            'contact.form.success': 'Message Sent',
            'contact.form.failed': 'Failed to Send',
            'contact.form.copy': 'Copy email',
            'contact.form.copied': 'Copied',
            'contact.form.required': 'This field is required.',
            'contact.form.invalidEmail': 'Please enter a valid email address.',
            'contact.form.honeypot': 'Leave this field empty.',

            /* ---- footer ---- */
            'footer.name': 'Dipraj Mitra Chandon',
            'footer.built': 'Built with love and too much coffee.',
            'footer.backToTop': 'Back to top',

            /* ---- misc ---- */
            'toast.copySuccess': 'Email copied to clipboard',
            'scroll.progress': 'Page progress',
        },

        bn: {
            /* ---- meta / document ---- */
            'meta.description': 'দ্বীপরাজ মিত্র চন্দন — কম্পিউটার সায়েন্স শিক্ষার্থী ও ডেভেলপার, সফটওয়্যার, সিকিউরিটি টুলিং ও এইআই প্রকল্প নিয়ে কাজ করছেন।',
            'meta.title': 'দ্বীপরাজ মিত্র চন্দন — সফটওয়্যার ইঞ্জিনিয়ার',

            /* ---- loader ---- */
            'loader.title': 'bash — dipraj.bond — 80x24',
            'loader.status.init': 'শুরু হচ্ছে',
            'loader.status.modules': 'মূল মডিউল লোড হচ্ছে',
            'loader.status.network': 'নিরাপদ সংযোগ স্থাপন হচ্ছে',
            'loader.status.assets': 'পোর্টফোলিও অ্যাসেট কম্পাইল হচ্ছে',
            'loader.status.ux': 'ইউজার এক্সপেরিয়েন্স উন্নত করা হচ্ছে',
            'loader.status.done': 'অ্যাক্সেস গ্রান্টেড। স্বাগতম।',

            /* ---- chrome / nav ---- */
            'nav.skip': 'মূল কনটেন্টে যান',
            'nav.home': 'হোম',
            'nav.about': 'পরিচিতি',
            'nav.projects': 'প্রকল্প',
            'nav.experience': 'অভিজ্ঞতা',
            'nav.contact': 'যোগাযোগ',
            'nav.theme.dark': 'ডার্ক মোডে যান',
            'nav.theme.light': 'লাইট মোডে যান',
            'nav.lang.toggle': 'English',
            'nav.lang.label': 'ভাষা পরিবর্তন করে ইংরেজিতে যান',
            'nav.menu.open': 'মেনু খুলুন',
            'nav.menu.close': 'মেনু বন্ধ করুন',

            /* ---- hero ---- */
            'hero.greeting': 'হ্যালো, আমি',
            'hero.name': 'দ্বীপরাজ মিত্র চন্দন',
            'hero.roles': ['সফটওয়্যার ইঞ্জিনিয়ার', 'সমস্যা সমাধানকারী', 'সাইবার নিরাপত্তা আগ্রহী', 'সিএস শিক্ষার্থী'],
            'hero.bio': 'কম্পিউটার সায়েন্স শিক্ষার্থী — অ্যালগরিদম সমস্যা সমাধান থেকে সিকিউরিটি টুলিং ও এইআই পরীক্ষা, সবকিছু নিয়ে কাজ করছি।',
            'hero.cta.projects': 'প্রকল্প দেখুন',
            'hero.cta.contact': 'কথা বলি',
            'hero.cta.resume': 'সিভি ডাউনলোড',
            'hero.scroll': 'নিচে স্ক্রল করুন',
            'hero.badge': 'ইন্টার্নশিপের জন্য উপলব্ধ',
            'hero.portrait': 'দ্বীপরাজ মিত্র চন্দনের প্রতিকৃতি',

            /* ---- stats ---- */
            'stats.projects': 'সম্পন্ন প্রকল্প',
            'stats.problems': 'সমাধান করা সমস্যা',
            'stats.commits': 'কমিট',
            'stats.languages': 'ভাষা',

            /* ---- about ---- */
            'about.title': 'আমার সম্পর্কে',
            'about.subtitle': 'টার্মিনালের ওপারে মানুষটা কে',
            'about.p1': 'আমি বর্তমানে ইউনিভার্সিটি অফ এশিয়া প্যাসিফিকে ব্যাচেলর অব সায়েন্স (কম্পিউটার সায়েন্স) করছি। ডেটা স্ট্রাকচার, অ্যালগরিদম ও সফটওয়্যার ইঞ্জিনিয়ারিংয়ে ভিত্তি তৈরি করছি। প্রযুক্তিতে আগ্রহ শুরু হয়েছিল একটি সহজ প্রশ্ন থেকে — "ভেতরে আসলে কী ঘটছে?" — আর তারপর সেটি রীতিমিশো ভেঙে আরও ভালোভাবে গড়ার অভ্যাসে পরিণত হয়েছে।',
            'about.p2': 'আমার বেশিরভাগ কাজ সিস্টেম আর নিরাপত্তার মাঝামাঝি — অটোমেশন টুলিং, CTF রাইটআপ এবং কম্পিটিটিভ প্রোগ্রামিং সলিউশন, যেখানে চাপের মধ্যে দক্ষতা গুরুত্বপূর্ণ। কোড লেখার বাইরে সময় কাটে হ্যাকাথনে, পোস্টমর্টেম পড়তে বা ওপেন সোর্সে অবদান রেখে।',
            'about.skills.title': 'টেকনিক্যাল স্কিল',
            'about.skills.subtitle': 'যেসব ভাষা, ফ্রেমওয়ার্ক ও টুল আমি ব্যবহার করি',
            'about.principles': 'আমার কাজের ধরন',
            'about.principle1.title': 'মূল নীতি থেকে শুরু',
            'about.principle1.body': 'টুল ব্যবহারের আগে বুঝে নিই কীভাবে কাজ করে।',
            'about.principle2.title': 'আগে শিপ, পরে পরিশীলন',
            'about.principle2.body': 'নিখুঁত পরিকল্পনার চেয়ে কাজ করা সফটওয়্যারই ভালো।',
            'about.principle3.title': 'সহজভাবে ব্যাখ্যা করা',
            'about.principle3.body': 'লিখে বোঝাতে না পারলে বুঝতেই পারিনি।',

            /* ---- skills ---- */
            'skills.langs': 'ভাষা',
            'skills.web': 'ওয়েব ও ফ্রেমওয়ার্ক',
            'skills.data': 'ডেটা ও এইআই',
            'skills.tools': 'টুল ও প্ল্যাটফর্ম',

            /* ---- projects ---- */
            'projects.title': 'প্রকল্প',
            'projects.subtitle': 'যা তৈরি করেছি, ভেঙেছি আর আবার গড়েছি',
            'projects.filter.all': 'সব',
            'projects.filter.tools': 'টুলস',
            'projects.filter.web': 'ওয়েব',
            'projects.filter.security': 'সিকিউরিটি',
            'projects.filter.algorithms': 'অ্যালগরিদম',
            'projects.view': 'রিপোজিটরি দেখুন',
            'projects.read': 'বিস্তারিত পড়ুন',
            'projects.all': 'সব প্রকল্প',
            'projects.empty': 'এই ক্যাটাগরিতে এখনো কোনো প্রকল্প নেই।',

            /* ---- project detail page ---- */
            'pd.overview': 'সংক্ষিপ্ত পরিচিতি',
            'pd.features': 'কী করে',
            'pd.stack': 'টেক স্ট্যাক',
            'pd.source': 'সোর্স কোড',
            'projects.p1.title': 'Spam.it',
            'projects.p1.body': 'একটি স্বয়ংক্রিয় কমেন্ট-স্প্যামিং টুল — স্ক্রিপ্টিং, রেট লিমিটিং ও অটোমেশন প্যাটার্ন বোঝার জন্য তৈরি।',
            'projects.p2.title': 'CP Helper (VS Code)',
            'projects.p2.body': 'C++-এর জন্য সম্পূর্ণ কম্পিটিটিভ প্রোগ্রামিং পরিবেশ — টেমপ্লেট, ডিবাগ কনফিগ ও টেস্ট করা লোকাল জাজ সেটআপ।',
            'projects.p3.title': 'picoCTF 2025 রাইটআপ',
            'projects.p3.body': 'picoCTF 2025 সাইবার সিকিউরিটি চ্যালেঞ্জের সম্পূর্ণ সমাধান ও ব্যাখ্যা, অন্য শিক্ষার্থীদের জন্য লেখা।',
            'projects.p4.title': 'LeetCode সলিউশন',
            'projects.p4.body': 'অপটিমাইজড LeetCode সলিউশনের ক্রমবর্ধমান সংগ্রহ, প্রতিটির সাথে জটিলতা বিশ্লেষণ।',

            /* ---- experience ---- */
            'exp.title': 'শিক্ষা ও অভিজ্ঞতা',
            'exp.subtitle': 'মূল ভিত্তি যেখানে তৈরি হয়েছিল',
            'exp.degree': 'বি.এস. কম্পিউটার সায়েন্স',
            'exp.degree.body': 'সফটওয়্যার ইঞ্জিনিয়ারিং, ডিস্ট্রিবিউটেড সিস্টেম ও কৃত্রিম বুদ্ধিমত্তা নিয়ে মনোযোগী। সাম্প্রতিক সেমিস্টরে ডিনস লিস্ট।',
            'exp.hsc': 'উচ্চ মাধ্যমিক সার্টিফিকেট',
            'exp.hsc.body': 'বিজ্ঞান বিভাগে উচ্চ মাধ্যমিক সম্পন্ন করেছি, জিপিএ ৫।',
            'exp.ssc': 'মাধ্যমিক স্কুল সার্টিফিকেট',
            'exp.ssc.body': 'বিজ্ঞান বিভাগে মাধ্যমিক সম্পন্ন করেছি, জিপিএ ৫।',
            'exp.present': 'বর্তমান',

            /* ---- contact ---- */
            'contact.title': 'যোগাযোগ করুন',
            'contact.subtitle': 'ইন্টার্নশিপ, সহযোগিতা ও আকর্ষণীয় সমস্যার জন্য প্রস্তুত',
            'contact.heading': 'কথা বলি',
            'contact.body': 'আমি বর্তমানে ইন্টার্নশিপের সুযোগ খুঁজছি। কোনো প্রশ্ন থাকলে, কোনো সুযোগ থাকলে, কিংবা শুধুই হাই বলতে চাইলে — বার্তা পাঠান, আমি উত্তর দেওয়ার চেষ্টা করব।',
            'contact.email': 'ইমেইল',
            'contact.location': 'অবস্থান',
            'contact.available': 'সাধারণত একদিনের মধ্যে উত্তর দিই',
            'contact.form.name': 'আপনার নাম',
            'contact.form.email': 'আপনার ইমেইল',
            'contact.form.message': 'আপনার বার্তা',
            'contact.form.subject': 'বিষয়',
            'contact.form.submit': 'বার্তা পাঠান',
            'contact.form.sending': 'পাঠানো হচ্ছে…',
            'contact.form.success': 'বার্তা পাঠানো হয়েছে',
            'contact.form.failed': 'পাঠানো যায়নি',
            'contact.form.copy': 'ইমেইল কপি করুন',
            'contact.form.copied': 'কপি হয়েছে',
            'contact.form.required': 'এই ঘরটি পূরণ করা আবশ্যক।',
            'contact.form.invalidEmail': 'সঠিক ইমেইল ঠিকানা দিন।',
            'contact.form.honeypot': 'এই ঘরটি খালি রাখুন।',

            /* ---- footer ---- */
            'footer.name': 'দ্বীপরাজ মিত্র চন্দন',
            'footer.built': 'ভালোবাসা আর প্রচুর কফি দিয়ে তৈরি।',
            'footer.backToTop': 'উপরে ফিরে যান',

            /* ---- misc ---- */
            'toast.copySuccess': 'ইমেইল ক্লিপবোর্ডে কপি হয়েছে',
            'scroll.progress': 'পৃষ্ঠার অগ্রগতি',
        },
    };

    /**
     * Resolve a translation key for a locale, falling back to English and then
     * to the raw key so a missing string is visible rather than blank.
     *
     * Page-level bundles (window.PORTFOLIO_TRANSLATIONS) are consulted first —
     * they carry the long-form project copy that is too verbose for the
     * shared DICT and is emitted per-page by the build script.
     */
    function translate(locale, key) {
        const pageBundle = global.PORTFOLIO_TRANSLATIONS && global.PORTFOLIO_TRANSLATIONS[locale];
        if (pageBundle && Object.prototype.hasOwnProperty.call(pageBundle, key)) {
            return pageBundle[key];
        }
        const bundle = DICT[locale] || DICT.en;
        if (Object.prototype.hasOwnProperty.call(bundle, key)) {
            return bundle[key];
        }
        if (Object.prototype.hasOwnProperty.call(DICT.en, key)) {
            return DICT.en[key];
        }
        return key;
    }

    /** Detect the best initial locale: saved choice → browser → English. */
    function detectLocale() {
        // The pre-paint inline script already resolved the locale and set
        // data-lang on <html>. Prefer that so the font stack and text do not
        // flash between languages while this file loads.
        const pre = document.documentElement.getAttribute('data-lang');
        if (pre && SUPPORTED.indexOf(pre) !== -1) return pre;

        let saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            /* storage unavailable (private mode) — fall through */
        }
        if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

        const nav = (navigator.languages || [navigator.language || 'en'])
            .map(function (l) { return String(l).toLowerCase().slice(0, 2); });
        for (let i = 0; i < nav.length; i++) {
            if (nav[i] === 'bn') return 'bn';
        }
        return 'en';
    }

    function persistLocale(locale) {
        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch (e) {
            /* ignore */
        }
    }

    /**
     * Apply a locale to the document.
     * @param {string} locale 'en' | 'bn'
     */
    function apply(locale) {
        const loc = SUPPORTED.indexOf(locale) === -1 ? 'en' : locale;

        // 1. Text nodes: <span data-i18n="nav.home">
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.getAttribute('data-i18n');
            const value = translate(loc, key);
            // Preserve inner markup only when explicitly opted in via data-i18n-html.
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });

        // 2. Attribute maps: <input data-i18n-attr="placeholder:contact.form.name">
        document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            const pairs = el.getAttribute('data-i18n-attr').split('|');
            pairs.forEach(function (pair) {
                const parts = pair.split(':');
                if (parts.length !== 2) return;
                const attr = parts[0].trim();
                const key = parts[1].trim();
                el.setAttribute(attr, translate(loc, key));
            });
        });

        // 2b. Text of an element that wraps nested markup:
        //     <a data-i18n-text="projects.p1.title">Spam.it</a>
        //     Sets textContent without destroying the child elements.
        document.querySelectorAll('[data-i18n-text]').forEach(function (el) {
            const key = el.getAttribute('data-i18n-text');
            el.textContent = translate(loc, key);
        });

        // 3. Document-level metadata
        const html = document.documentElement;
        html.setAttribute('lang', loc === 'bn' ? 'bn' : 'en');
        html.setAttribute('data-lang', loc);

        // Pages that own their SEO metadata (e.g. /projects/<slug>/) opt out of
        // the locale swap with data-page-meta="static" on <body>. Overwriting a
        // project page's unique <title> with the homepage's would collapse every
        // project into one duplicate title in the index.
        const pageMeta = document.body && document.body.getAttribute('data-page-meta') === 'static';

        if (!pageMeta) {
            const desc = document.querySelector('meta[name="description"]');
            if (desc) desc.setAttribute('content', translate(loc, 'meta.description'));

            const title = document.querySelector('title');
            if (title) title.textContent = translate(loc, 'meta.title');
        }

        // 4. Language switch button label shows the *other* language
        const langBtn = document.querySelector('[data-lang-switch]');
        if (langBtn) {
            langBtn.textContent = translate(loc, 'nav.lang.toggle');
            langBtn.setAttribute('aria-label', translate(loc, 'nav.lang.label'));
        }

        // 5. Notify listeners (typing rotator, loader, etc.)
        document.dispatchEvent(new CustomEvent('localechange', { detail: { locale: loc } }));
    }

    function getLocale() {
        return document.documentElement.getAttribute('data-lang') || 'en';
    }

    function setLocale(locale) {
        persistLocale(locale);
        apply(locale);
    }

    function toggleLocale() {
        setLocale(getLocale() === 'bn' ? 'en' : 'bn');
    }

    // Expose a minimal API. `t` is used by JS-rendered strings (toasts, loader).
    global.I18n = {
        locales: SUPPORTED,
        t: translate,
        get: getLocale,
        set: setLocale,
        toggle: toggleLocale,
        toggleLocale: toggleLocale,
        apply: apply,
        detect: detectLocale,
    };
})(window);

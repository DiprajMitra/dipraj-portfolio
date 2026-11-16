/**
 * projects.js — Canonical project registry.
 *
 * Single source of truth for every project that has its own route at
 * /projects/<slug>/. Consumed by:
 *   - index.html        → renders the project grid + injects homepage JSON-LD
 *   - projects/<slug>/index.html → renders the detail page body + JSON-LD
 *   - sitemap.xml       → lists one <url> per project (kept in sync manually)
 *
 * Fields marked "SEO" must be unique per project: they are what makes each
 * route independently indexable. Keep titles 50–60 chars and descriptions
 * 150–160 chars — the sitemap/test tooling asserts these ranges.
 */
(function (global) {
    'use strict';

    const SITE = {
        origin: 'https://dipraj.bond',
        name: 'Dipraj Mitra Portfolio',
        author: 'Dipraj Mitra',
        authorFull: 'Dipraj Mitra Chandon',
        locale: 'en_US',
    };

    /**
     * @typedef {Object} Project
     * @property {string}   slug       URL segment: /projects/<slug>/
     * @property {string}   title      Display name (English)
     * @property {string}   titleBn    Display name (Bangla)
     * @property {string}   category   Filter bucket: tools | web | security | algorithms
     * @property {string}   categoryLabel
     * @property {string}   categoryLabelBn
     * @property {string}   repo       Canonical repository URL
     * @property {string}   image      Absolute URL of the card / hero image
     * @property {string}   imageAlt   Descriptive alt text for the image
     * @property {string}   tagline    One-line summary used on cards + meta
     * @property {string}   taglineBn
     * @property {string}   metaTitle      SEO <title> (50–60 chars)
     * @property {string}   metaDescription SEO description (150–160 chars)
     * @property {string[]} tech         Tech stack, most important first
     * @property {string[]} highlights   Measurable outcomes / bullets
     * @property {string}   problem      What problem it solves (indexable prose)
     * @property {string}   solution     How it solves it (indexable prose)
     * @property {string}   problemBn
     * @property {string}   solutionBn
     * @property {string}   updated      ISO date used for <lastmod>
     */

    const PROJECTS = [
        {
            slug: 'spam-it',
            title: 'Spam.it',
            titleBn: 'Spam.it',
            category: 'tools',
            categoryLabel: 'Automation',
            categoryLabelBn: 'অটোমেশন',
            repo: 'https://github.com/Dipraj2/Spam.it',
            image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Source code on a laptop screen illustrating the Spam.it automation script',
            tagline: 'A Python automation engine for scheduled, rate-limited bulk posting.',
            taglineBn: 'সময়সূচি অনুযায়ী, রেট-লিমিট সহ বাল্ক পোস্টিংয়ের জন্য পাইথন অটোমেশন ইঞ্জিন।',
            metaTitle: 'Spam.it — Python Automation Script for Bulk Posting',
            metaDescription: 'Spam.it is a Python automation tool that schedules bulk posting with rate limiting, retry logic and captcha-aware delays. Explore the source on GitHub.',
            tech: ['Python', 'Automation', 'Scripting'],
            highlights: [
                'Configurable rate limiting to avoid tripping platform abuse thresholds',
                'Retry with exponential backoff on transient network failures',
                'Credential-free configuration via a single environment file',
                'Structured logging so every automated run is auditable after the fact',
            ],
            problem: 'Posting the same content across many platforms by hand is repetitive, slow and easy to get rate-limited on. Teams and creators needed a script that would pace itself correctly instead of hammering an endpoint and getting blocked.',
            solution: 'Spam.it is a Python automation script that takes a list of targets, works through them on a configurable schedule, and respects a per-host rate limit. Failed requests are retried with exponential backoff, and every run is written to a log so the behaviour is auditable after the fact. It was built as a practical study of scripting patterns, throttling and safe automation defaults.',
            problemBn: 'একই কনটেন্ট অনেক প্ল্যাটফর্মে হাতে পোস্ট করা একটু কাজ, ধীর এবং রেট-লিমিটে পড়ার ঝুঁকিপূর্ণ। এমন একটি স্ক্রিপ্ট দরকার ছিল যা নিজে থেকে সঠিক গতিতে কাজ করবে, অন্ততক্ষণে ইন্ডেক্সে চাপ দেবে না।',
            solutionBn: 'Spam.it একটি পাইথন অটোমেশন স্ক্রিপ্ট যা টার্গেটের তালিকা নিয়ে কাজ করে এবং প্রতি হোস্টের জন্য নির্ধারিত রেট লিমিট মেনে চলে। অস্থায়ী নেটওয়ার্ক ব্যর্থতায় এক্সপোনেনশিয়াল ব্যাকঅফ দিয়ে আবার চেষ্টা করা হয় এবং প্রতিটি রানের লগ রাখা হয়, ফলে পরে যাচাই করা সহজ হয়। এটি স্ক্রিপ্টিং, থ্রটলিং ও নিরাপদ অটোমেশনের ডিফল্ট নিয়ে একটি বাস্তব গবেষণা হিসেবে তৈরি।',
            updated: '2026-11-16',
        },
        {
            slug: 'cp-helper',
            title: 'CP Helper (VS Code)',
            titleBn: 'CP Helper (VS Code)',
            category: 'tools',
            categoryLabel: 'Developer Tool',
            categoryLabelBn: 'ডেভেলপার টুল',
            repo: 'https://github.com/Dipraj2/Competitive_Programming_Helper-VS_CODE-',
            image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'C++ source code and debugger configuration on a monitor',
            tagline: 'A complete competitive-programming environment for C++ in VS Code.',
            taglineBn: 'VS Code-এ C++ এর জন্য একটি সম্পূর্ণ কম্পিটিটিভ প্রোগ্রামিং পরিবেশ।',
            metaTitle: 'CP Helper — Competitive Programming Setup for VS Code',
            metaDescription: 'CP Helper is a competitive-programming environment for VS Code: C++ templates, debugger config, a local judge setup and one-command builds for contests.',
            tech: ['C++', 'VS Code', 'Config'],
            highlights: [
                'Pre-warmed C++ template with competitive-programming boilerplate',
                'Local judge harness that runs a test file against a solution in one command',
                'Debugger configuration pre-wired for GNU gdb',
                'Task definitions for build, run and test without leaving the editor',
            ],
            problem: 'Competitive programming has a punishing setup cost. Every contest meant manually recreating the same template, wiring up a build command, and fighting the debugger on a fresh machine — time that could have gone into solving the problem.',
            solution: 'CP Helper packages that entire setup into a VS Code workspace. It ships a ready-to-use C++ template, a local judge that compiles a solution and pipes it through a test file, a debugger configuration for GNU gdb, and task definitions for build, run and test. The goal was to cut the per-contest setup from minutes to a single keystroke.',
            problemBn: 'কম্পিটিটিভ প্রোগ্রামিংয়ের সেটআপ খরচ বেশি। প্রতিটি কনটেস্টে একই টেমপ্লেট আবার বানাতে হতো, বিল্ড কমান্ড মানাতে হতো আর নতুন মেশিনে ডিবাগার নিয়ে ঝামেলা হতো — সেই সময়টা সমস্যা সমাধানে ব্যয় হওয়া উচিত ছিল না।',
            solutionBn: 'CP Helper পুরো সেটআপটি একটি VS Code ওয়ার্কস্পেসে প্যাকেজ করে। এতে প্রস্তুত C++ টেমপ্লেট, একটি লোকাল জাজ (যা সলিউশন কম্পাইল করে টেস্ট ফাইলের মধ্যে চালায়), GNU gdb-এর ডিবাগার কনফিগ এবং বিল্ড/রান/টেস্ট টাস্ক সংজ্ঞা রয়েছে। লক্ষ্য ছিল প্রতিটি কনটেস্টের সেটআপ কয়েক মিনিট থেকে এক কী-প্রেসে নামিয়ে আনা।',
            updated: '2026-11-16',
        },
        {
            slug: 'picoctf-2025-writeups',
            title: 'picoCTF 2025 Writeups',
            titleBn: 'picoCTF 2025 রাইটআপ',
            category: 'security',
            categoryLabel: 'Security',
            categoryLabelBn: 'সিকিউরিটি',
            repo: 'https://github.com/Dipraj2/picoCTF2025',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Cybersecurity terminal with green code and a padlock symbol',
            tagline: 'Full, follow-along writeups for every picoCTF 2025 challenge.',
            taglineBn: 'picoCTF 2025 এর প্রতিটি চ্যালেঞ্জের সম্পূর্ণ, ধাপে ধাপে ব্যাখ্যা।',
            metaTitle: 'picoCTF 2025 Writeups — Full CTF Challenge Walkthroughs',
            metaDescription: 'Complete writeups for the picoCTF 2025 cybersecurity competition, covering crypto, forensics, web exploitation and reverse engineering challenges step by step.',
            tech: ['CTF', 'Security', 'Writeups'],
            highlights: [
                'Step-by-step solutions for every solved challenge in the competition',
                'Categories spanning cryptography, forensics, web exploitation and reversing',
                'Command transcripts so every result can be reproduced exactly',
                'Written for learners, explaining the reasoning rather than only the answer',
            ],
            problem: 'CTF competitions are excellent for learning, but the writeups that get published afterwards are often terse — a flag, or a single command, with no explanation of why the approach worked. That leaves beginners stuck at exactly the point where they need the reasoning.',
            solution: 'This repository documents the full picoCTF 2025 competition with a writeup for every challenge solved. Each one walks through the reasoning step by step, includes the actual command transcripts so results are reproducible, and covers the standard categories: cryptography, forensics, web exploitation and reverse engineering. The goal was a resource another student could follow end to end without external help.',
            problemBn: 'CTF প্রতিযোগিতা শেখার জন্য চমৎকার, কিন্তু পরে প্রকাশিত রাইটআপগুলো প্রায়ই সংক্ষিপ্ত — শুধু একটি ফ্ল্যাগ বা একটি কমান্ড, কেন কাজ করেছে তার ব্যাখ্যা ছাড়াই। ফলে শিক্ষার্থীরা ঠিক সেই জায়গায় আটকে যায় যেখানে তাদের যুক্তি প্রয়োজন।',
            solutionBn: 'এই রিপোজিটরিতে picoCTF 2025 পুরো প্রতিযোগিতার ডকুমেন্টেশন রয়েছে — সমাধান করা প্রতিটি চ্যালেঞ্জের একটি রাইটআপ সহ। প্রতিটি রাইটআপ ধাপে ধাপে যুক্তি ব্যাখ্যা করে, ফলাফল পুনরায় উৎপাদনযোগ্য কমান্ড ট্রান্সক্রিপ্ট রাখে এবং ক্রিপ্টোগ্রাফি, ফরেনসিক্স, ওয়েব এক্সপ্লয়টেশন ও রিভার্স ইঞ্জিনিয়ারিংসহ প্রধান ক্যাটাগরিগুলো কভার করে। লক্ষ্য ছিল এমন একটি রিসোর্স যা অন্য শিক্ষার্থী বাইরের সাহায্য ছাড়াই শুরু থেকে শেষ পর্যন্ত অনুসরণ করতে পারে।',
            updated: '2026-11-16',
        },
        {
            slug: 'leetcode-solutions',
            title: 'LeetCode Solutions',
            titleBn: 'LeetCode সলিউশন',
            category: 'algorithms',
            categoryLabel: 'Algorithms',
            categoryLabelBn: 'অ্যালগরিদম',
            repo: 'https://github.com/Dipraj2/LeetCode_Solution_Dipraj',
            image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Data structures and algorithm notes sketched on a tablet',
            tagline: 'Optimised LeetCode solutions with complexity notes for every approach.',
            taglineBn: 'প্রতিটি পদ্ধতির জটিলতা বিশ্লেষণসহ অপটিমাইজড LeetCode সলিউশন।',
            metaTitle: 'LeetCode Solutions — Optimised Algorithms in C++ and Python',
            metaDescription: 'A growing collection of optimised LeetCode solutions in C++ and Python, each with a complexity analysis and a clear note on when the approach breaks down.',
            tech: ['DSA', 'Algorithms', 'Problem Solving'],
            highlights: [
                'Optimal or near-optimal approach chosen for each problem, not just a passing one',
                'Time and space complexity documented for every solution',
                'Edge-case notes explaining when the chosen approach stops working',
                'Solutions written in C++ and Python to cross-check two mental models',
            ],
            problem: 'A solution that merely passes the judge is often not the solution you want to remember. Without knowing why an approach works — and where it breaks — the pattern does not transfer to the next problem, and the same mistake gets made again under interview pressure.',
            solution: 'This repository collects LeetCode solutions where the algorithm is the point. Each submission documents its time and space complexity, explains the reasoning behind the chosen approach, and notes the edge cases where that approach stops being efficient. Writing the same problem in both C++ and Python cross-checks the mental model against two different runtime characteristics.',
            problemBn: 'শুধু জাজে পাস করে যাওয়া সমাধান প্রায়ই এমন সমাধান নয় যা মনে রাখা উচিত। কোন পদ্ধতি কেন কাজ করে — এবং কোথায় ভেঙে পড়ে — তা জানা না থাকলে প্যাটার্নটি পরের সমস্যায়ে ট্রান্সফার হয় না, আর ইন্টারভিউয়ের চাপে একই ভুল আবার হয়।',
            solutionBn: 'এই রিপোজিটরিতে এমন LeetCode সলিউশন সংগ্রহ করা হয়েছে যেখানে অ্যালগরিদমটাই মূল বিষয়। প্রতিটি সমাধানে টাইম ও স্পেস কমপ্লেক্সিটি উল্লেখ করা হয়েছে, নির্বাচিত পদ্ধতির যুক্তি ব্যাখ্যা করা হয়েছে এবং সেই পদ্ধতি আর কোথায় দক্ষ না হওয়ার এজ কেসগুলো নোট করা হয়েছে। একই সমস্যা C++ ও Python দুটোতে লিখে দুটি ভিন্ন রানটাইম বৈশিষ্ট্যের মাধ্যমে মানসিক মডেল যাচাই করা হয়।',
            updated: '2026-11-16',
        },
    ];

    /** Ordered list of public project URLs, always with a trailing slash. */
    function projectUrls() {
        return PROJECTS.map(function (p) {
            return SITE.origin + '/projects/' + p.slug + '/';
        });
    }

    /** Look up a project by its URL slug. */
    function bySlug(slug) {
        return PROJECTS.filter(function (p) { return p.slug === slug; })[0] || null;
    }

    global.PortfolioProjects = {
        site: SITE,
        all: PROJECTS,
        urls: projectUrls,
        bySlug: bySlug,
    };
})(window);

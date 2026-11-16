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
            repo: 'https://github.com/DiprajMitra/Spam.it',
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
            repo: 'https://github.com/DiprajMitra/Competitive_Programming_Helper-VS_CODE-',
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
            repo: 'https://github.com/DiprajMitra/picoCTF2025',
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
            repo: 'https://github.com/DiprajMitra/LeetCode_Solution_Dipraj',
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
        {
            slug: 'who-stays-on',
            title: 'Who Stays On',
            titleBn: 'Who Stays On',
            category: 'web',
            categoryLabel: 'Optimization',
            categoryLabelBn: 'অপটিমাইজেশন',
            repo: 'https://github.com/DiprajMitra/Who-Stays-On',
            demo: 'https://who-stays-on.vercel.app',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Industrial power generator and electrical grid equipment',
            tagline: 'A MILP solver that decides which shops keep the lights on during load shedding.',
            taglineBn: 'লোড-শেডিংয়ের সময় কোন দোকানে বিদ্যুৎ থাকবে তা ঠিক করে দেয় এমন একটি MILP সলভার।',
            metaTitle: 'Who Stays On — MILP Load-Shedding Optimizer in Python',
            metaDescription: 'Who Stays On is a Mixed-Integer Linear Programming solver that optimizes diesel generator load-shedding rosters for shopping complexes, using FastAPI and PuLP.',
            tech: ['Python', 'FastAPI', 'PuLP', 'MILP'],
            highlights: [
                'Maximises total shop value while honouring every hard constraint at once',
                'MILP formulation in PuLP solved by HiGHS, with an explicit infeasibility path',
                'Pydantic v2 request validation plus a dry-run endpoint that checks the payload without solving',
                'Bundled vanilla-JS frontend served from the same FastAPI process, no CDN needed',
            ],
            problem: 'A shopping complex on a diesel generator has to decide which shops keep running during each outage hour, and getting it wrong is expensive in both directions. Run too many and the generator burns past its fuel budget. Run too few and you black out shops you promised to keep lit. The roster has to respect the generator capacity for every hour, the total fuel available across the day, the maximum number of consecutive dark hours any single shop can tolerate, and the shops marked as mandatory during outages. All of those pull against each other, so no greedy rule works.',
            solution: 'I modelled the whole roster as one Mixed-Integer Linear Program and handed it to PuLP, which solves it with HiGHS. The objective maximises the total value of powered shops per hour, while capacity, fuel budget and consecutive-dark-hour limits become hard constraints that the solver cannot violate. The API returns either a full schedule or an explicit infeasibility result, so a caller can tell the difference between a bad roster and an impossible one. A separate dry-run endpoint validates the payload shape without paying for a solve, which made testing the frontend much faster.',
            problemBn: 'ডিজেল জেনারেটরে চলা একটি শপিং কমপ্লেক্সকে প্রতিটি আউটেজ ঘণ্টায় কোন দোকান চালু রাখতে হবে তা ঠিক করতে হয়, আর ভুল সিদ্ধান্ত দুদিক থেকেই দামি। বেশি দোকান চালু করলে জেনারেটর ফুয়েল বাজেট ছাড়িয়ে যাবে। কম রাখলে প্রতিশ্রুতি দেওয়া দোকান বন্ধ থাকবে। রোস্টারে জেনারেটরের ঘণ্টাভিত্তিক ক্যাপাসিটি, দিনভর ফুয়েলের হিসাব, একটি দোকান সর্বোচ্চ কত ঘণ্টা একটানা বন্ধ থাকতে পারে, আর আউটেজের সময় বাধ্যতামূলক দোকানগুলো — সব একসাথে কাজ করে, তাই কোনো সরল নিয়মে সমাধান হয় না।',
            solutionBn: 'পুরো রোস্টারটিকে একটি মিক্সড-ইন্টিজার লিনিয়ার প্রোগ্রাম হিসেবে মডেল করে PuLP-কে দিয়েছি, যা HiGHS দিয়ে সমাধান করে। অবজেক্টিভ হলো প্রতি ঘণ্টায় বিদ্যুৎযুক্ত দোকানের মোট ভ্যালু সর্বাধিক করা, আর ক্যাপাসিটি, ফুয়েল বাজেট ও ধারাবাহিক বন্ধ থাকার সীমা কঠিন কনস্ট্রেন্ট হিসেবে বসে, যা সলভার ভাঙতে পারে না। API পূর্ণ সময়সূচি অথবা স্পষ্ট ইনফিজিবিলিটি ফলাফল ফেরত দেয়, তাই কলার বুঝতে পারে রোস্টার খারাপ নাকি সমাধানই নেই। আলাদা একটি ড্রাই-রান এন্ডপয়েন্ট সমাধান না করেই পেলোড যাচাই করে, যা ফ্রন্টএন্ড টেস্টিং অনেক দ্রুত করে দিয়েছে।',
            updated: '2026-10-12',
        },
        {
            slug: 'gridman-gridwise',
            title: 'GridMan (GridWise)',
            titleBn: 'GridMan (GridWise)',
            category: 'web',
            categoryLabel: 'Optimization',
            categoryLabelBn: 'অপটিমাইজেশন',
            repo: 'https://github.com/DiprajMitra/GridMan',
            demo: 'https://grid-man.vercel.app',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Solar panels and a smart energy grid under a clear sky',
            tagline: 'An energy dispatch engine where the LLM reads the request and math decides.',
            taglineBn: 'এমন একটি এনার্জি ডিসপ্যাচ ইঞ্জিন যেখানে LLM অনুরোধ পড়ে আর গণিত সিদ্ধান্ত নেয়।',
            metaTitle: 'GridMan GridWise — Energy Optimization API with LP Solver',
            metaDescription: 'GridMan is a microgrid dispatch engine pairing LLM directive parsing with a deterministic SciPy HiGHS solver to compute optimal 24-hour energy schedules.',
            tech: ['Python', 'FastAPI', 'SciPy', 'React'],
            highlights: [
                'LLM confined to language parsing only, never allowed to do arithmetic',
                'Deterministic guardrails clamp every directive before it reaches the solver',
                'Exact 24-hour dispatch computed by HiGHS simplex and interior point methods',
                'Architecture decisions written up as ADRs, including why the solver is not an LLM',
            ],
            problem: 'A campus microgrid operator wants to describe a dispatch plan in plain language, something like prioritise the labs over the dorms and keep the battery above reserve. Turning that into a schedule that respects battery capacity, hourly demand and reserve margins is a linear program, not a language problem. The tempting shortcut is to hand the whole request to an LLM and let it reason about the numbers too, but then the output is not reproducible and there is no way to prove the constraints were respected.',
            solution: 'I split the system into three layers with a hard boundary between them. The LLM layer does one job only: turning natural language into JSON directives. A deterministic guardrail layer then clamps those directives, enforcing array bounds, hour ranges and battery reserve before anything reaches the solver. The optimization layer computes the schedule with SciPy HiGHS, which gives an exact answer rather than an approximation. Each of those boundaries is written up as an architecture decision record, because the reasoning is the point and the code alone does not explain why the LLM was fenced off.',
            problemBn: 'ক্যাম্পাস মাইক্রোগ্রিড অপারেটর সাধারণ ভাষায় ডিসপ্যাচ পরিকল্পনা বলতে চান, যেমন ডর্ম আগে রাখো আর ব্যাটারি রিজার্ভের উপরে রাখো। কিন্তু এটিকে এমন সময়সূচিতে রূপ দিতে যেটা ব্যাটারি ক্যাপাসিটি, ঘণ্টাভিত্তিক চাহিদা আর রিজার্ভ মার্জিন মেনে চলে, তা একটি লিনিয়ার প্রোগ্রামের কাজ, ভাষার নয়। সহজ পথ হলে পুরো অনুরোধটি LLM-কে দিয়ে সংখ্যাও বিশ্লেষণ করানো, কিন্তু তাতে আউটপুট পুনরাবৃত্তিযোগ্য হয় না এবং কনস্ট্রেন্ট মেনে চলা হয়েছে কি না প্রমাণ করার কোনো উপায় থাকে না।',
            solutionBn: 'পুরো সিস্টেমটিকে তিনটি লেয়ারে ভাগ করেছি, যার মাঝে কঠিন সীমানা আছে। LLM লেয়ারের একটিমাত্র কাজ: প্রাকৃতিক ভাষা থেকে JSON ডিরেক্টিভে রূপান্তর। এরপর একটি ডিটারমিনিস্টিক গার্ডরেল লেয়ার সেগুলো ক্ল্যাম্প করে, সলভারে পৌঁছানোর আগেই অ্যারে সীমা, ঘণ্টার পরিসীমা আর ব্যাটারি রিজার্ভ বাস্তবায়ন করে। অপটিমাইজেশন লেয়ার SciPy HiGHS দিয়ে সময়সূচি হিসাব করে, যা আনুমানিক নয় বরং হুবহু সঠিক উত্তর দেয়। প্রতিটি সীমানার কারণ আলাদা করে ADR হিসেবে লেখা আছে, কারণ যুক্তিটাই মূল বিষয়।',
            updated: '2026-09-18',
        },
        {
            slug: 'stockroom',
            title: 'StockRoom',
            titleBn: 'StockRoom',
            category: 'web',
            categoryLabel: 'Database',
            categoryLabelBn: 'ডেটাবেস',
            repo: 'https://github.com/DiprajMitra/stockroom',
            demo: 'https://stockroom-gold.vercel.app',
            image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Warehouse shelves and organised inventory boxes',
            tagline: 'A 3NF inventory system with role-based access enforced in two places.',
            taglineBn: 'দুই স্তরে রোল-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রিত একটি 3NF ইনভেন্টরি সিস্টেম।',
            metaTitle: 'StockRoom — 3NF Inventory Control System with RBAC',
            metaDescription: 'StockRoom is a database-driven inventory control system on a Third Normal Form schema, with role-based access control enforced at the API and database layers.',
            tech: ['JavaScript', 'Node.js', 'FreeSQL', 'Oracle'],
            highlights: [
                'Schema normalised to Third Normal Form across products, suppliers and transactions',
                'Role-based access enforced at the API layer and again in the database',
                'PL/SQL triggers and stored procedures carry the business rules, not the app',
                'Tax computed on every transaction from the item and supplier records',
            ],
            problem: 'Most inventory systems look fine until two people touch the data at once, or a rule like tax calculation lives only in the frontend. Once that happens the database and the application disagree about what is true, and the numbers stop matching the shelf. The deeper problem is that access rules applied in application code can be bypassed by anything that reaches the database directly.',
            solution: 'I built the system around a properly normalised Third Normal Form schema, with products, categories, suppliers, purchases and sales as distinct relations so nothing is duplicated and nothing is stored twice. Business rules like tax computation live in PL/SQL triggers and stored procedures rather than in JavaScript, which means the database stays correct even if a client misbehaves. Authorisation is checked twice, once in the Express API and again as database-level grants, so there is no single point where the rule can be skipped. It was my CSE212 database systems lab project.',
            problemBn: 'বেশিরভাগ ইনভেন্টরি সিস্টেম ভালোই চলতে থাকে যতক্ষণ না দুজন একসাথে ডেটা নিয়ে কাজ করে, বা ট্যাক্স হিসাবের মতো নিয়ম শুধু ফ্রন্টএন্ডে থাকে। তখন ডেটাবেস আর অ্যাপ্লিকেশন দুজন আলাদা কথা বলে, আর হিসাব আর তাকার জিনিসের সাথে মেলে না। আরও গভীর সমস্যা হলো অ্যাপ্লিকেশন কোডে করা অ্যাক্সেস নিয়ম ডেটাবেসে সরাসরি পৌঁছানো যেকোনো কিছু এড়িয়ে যেতে পারে।',
            solutionBn: 'সিস্টেমটি একটি সঠিকভাবে নরমালাইজড থার্ড নরমাল ফর্ম স্কিমার উপর দাঁড় করিয়ে বানিয়েছি, যেখানে প্রোডাক্ট, ক্যাটাগরি, সাপ্লায়ার, ক্রয় ও বিক্রয় আলাদা রিলেশন, তাই কিছুই ডুপ্লিকেট হয় না আর একই জিনিস দুবার জমা হয় না। ট্যাক্স হিসাবের মতো বিজনেস রুল JavaScript-এ নয়, PL/SQL ট্রিগার আর স্টোরড প্রসিডিউরে রেখেছি, ফলে ক্লায়েন্ট ভুল করলেও ডেটাবেস ঠিক থাকে। অথরাইজেশন দুইবার যাচাই হয়, একবার Express API-তে আর একবার ডেটাবেস-লেভেল গ্রান্টে, তাই নিয়মটি বাদ পড়ার কোনো একটি জায়গা থাকে না। এটি আমার CSE212 ডেটাবেস সিস্টেমস ল্যাব প্রজেক্ট ছিল।',
            updated: '2026-11-02',
        },
        {
            slug: 'finditbd',
            title: 'FindItBD',
            titleBn: 'FindItBD',
            category: 'web',
            categoryLabel: 'Product',
            categoryLabelBn: 'প্রোডাক্ট',
            repo: 'https://github.com/DiprajMitra/FinditBD',
            demo: 'https://findit-bd.vercel.app',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Person comparing prices on a phone while shopping online',
            tagline: 'Price comparison across Bangladeshi e-commerce stores, in one search.',
            taglineBn: 'বাংলাদেশি ই-কমার্স স্টোরগুলোর দাম একসাথে তুলনা করে।',
            metaTitle: 'FindItBD — AI Product Price Comparison for BD Stores',
            metaDescription: 'FindItBD compares product listings across Daraz, Rayans, GadgetBD, StarTech and Pickaboo so you can find the best price from one search instead of five tabs.',
            tech: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
            highlights: [
                'Aggregates five Bangladeshi stores into one comparable result set',
                'Relevance ranking with an LLM, falling back to rules when no API key is set',
                'Supabase backed search cache with a sixty minute window to cut repeat scrapes',
                'Scraping mode that respects robots.txt by default, with a test flag for local testing',
            ],
            problem: 'Buying something online in Bangladesh usually means opening five tabs, one for each store, and comparing rows by eye. The stores do not agree on field names, on how they rate an item, or even on what a listing is called, so the comparison never happens automatically. And every manual check is a repeat request to a store that did not ask to be scraped on every visit.',
            solution: 'FindItBD pulls listings from Daraz, Rayans, GadgetBD, StarTech and Pickaboo, normalises them into a single comparable shape, and ranks the results by relevance to the query. An LLM handles the relevance judgement, but it is optional: without an API key the app falls back to rule-based scoring so the feature still works. Search results are cached in Supabase for sixty minutes, which removes the repeat scraping entirely on popular queries. The scraper defaults to a mode that respects robots.txt, and a separate test mode exists only for local development.',
            problemBn: 'বাংলাদেশে অনলাইনে কিছু কিনতে গেলে সাধারণত পাঁচটা ট্যাব খুলতে হয়, একটি করে প্রতিটি স্টোরের জন্য, তারপর চোখে লাইন মিলিয়ে দাম দেখতে হয়। স্টোরগুলোর ফিল্ড নাম, রেটিং স্কেল আর প্রোডাক্টের নামকরণ এক নয়, তাই স্বয়ংক্রিয় তুলনা কখনোই হয় না। আর প্রতিটি ম্যানুয়াল চেক মানে স্টোরে বারবার অনুরোধ, যেটা তারা প্রতিবার চাননি।',
            solutionBn: 'FindItBD ডারাজ, রায়ান্স, গ্যাজেটবিডি, স্টারটেক ও পিকাবু থেকে লিস্টিং সংগ্রহ করে, এগুলোকে একটি তুলনযোগ্য আকারে নরমালাইজ করে এবং কোয়েরির সাথে প্রাসঙ্গিকতা অনুযায়ী সাজায়। LLM প্রাসঙ্গিকতা যাচাই করে, তবে সেটি ঐচ্ছিক: API কী না থাকলে অ্যাপ নিয়ম-ভিত্তিক স্কোরিংয়ে ফিরে যায়, তাই ফিচারটি কাজ করতেই থাকে। সার্চ রেজাল্ট Supabase-এ ৬০ মিনিটের জন্য ক্যাশ করা হয়, যা জনপ্রিয় কোয়েরিতে বারবার স্ক্র্যাপিং পুরোপুরি বন্ধ করে দেয়। স্ক্র্যাপারের ডিফল্ট মোড robots.txt মেনে চলে, আর আলাদা টেস্ট মোড শুধু লোকাল ডেভেলপমেন্টের জন্য।',
            updated: '2026-06-02',
        },
        {
            slug: 'predict-the-pitch',
            title: 'Predict The Pitch',
            titleBn: 'Predict The Pitch',
            category: 'web',
            categoryLabel: 'Machine Learning',
            categoryLabelBn: 'মেশিন লার্নিং',
            repo: 'https://github.com/DiprajMitra/PredictThePitch',
            demo: 'https://predict-the-pitch.vercel.app',
            image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Football stadium pitch under floodlights',
            tagline: 'Expected goals and win probabilities for Champions League fixtures.',
            taglineBn: 'চ্যাম্পিয়ন্স লিগ ম্যাচের জন্য এক্সপেক্টেড গোলস ও জয়ের সম্ভাবনা।',
            metaTitle: 'Predict The Pitch — XGBoost Football Outcome Prediction',
            metaDescription: 'Predict The Pitch is an XGBoost football prediction engine calculating expected goals and win probabilities for Champions League fixtures, above 55% accuracy.',
            tech: ['XGBoost', 'Python', 'FastAPI', 'React'],
            highlights: [
                'Two XGBoost regressors estimate expected goals for each side separately',
                'A separate classifier predicts home, draw and away probabilities',
                'Hierarchy enforcement keeps the scoreline consistent with the probabilities',
                'Handles two-legged ties and neutral-venue finals correctly',
            ],
            problem: 'Most football prediction models are a single regression that outputs a score, and the score often contradicts what the rest of the data says. A model can report a one all draw while simultaneously believing the away team will win sixty percent of the time, and the person reading it has no idea which number to trust. Tournament formats make it worse, because a two-legged tie and a neutral venue final are not the same problem as a plain league fixture.',
            solution: 'I built it as two layers. Two XGBoost regressors estimate the expected goals for each side from their attacking and defensive form. A separate XGBoost classifier ignores the scoreline entirely and works out the home, draw and away probabilities. When the two disagree, a hierarchy algorithm lets the classifier win and adjusts the scoreline to match, so the prediction shown to the user is always internally consistent. Backtesting on held out data put win, draw and loss accuracy above fifty five percent. The model reads team form rather than team names, which is what lets it handle two-legged ties and neutral venues.',
            problemBn: 'বেশিরভাগ ফুটবল প্রিডিকশন মডেল একটি সিঙ্গেল রিগ্রেশন যা স্কোর দেয়, কিন্তু সেই স্কোর বাকি ডেটার সাথে বিরোধ করে। মডেল একই সাথে ১-১ ড্র অনুমান করতে পারে আর সেই সাথে বিপক্ষী দলকে ৬০% জয়ের সম্ভাবনা দিতে পারে, পড়া মানুষ বুঝতে পারে না কোন সংখ্যায় বিশ্বাস করবে। টুর্নামেন্ট ফরম্যাট আরও কঠিন করে, কারণ দুই লেগের টাই আর নিউট্রাল ভেনিউ ফাইনাল একই সমস্যা নয়।',
            solutionBn: 'আমি এটি দুই লেয়ারে বানিয়েছি। দুটি XGBoost রিগ্রেসর আক্রমণ ও রক্ষা ফর্ম থেকে প্রতিটি দলের এক্সপেক্টেড গোল হিসাব করে। আলাদা একটি XGBoost ক্লাসিফায়ার স্কোরলাইন একদম উপেক্ষা করে হোম, ড্র ও অ্যাওয়ে সম্ভাবনা বের করে। দুটি অসম্মতি হলে একটি হায়ারার্কি অ্যালগরিদম ক্লাসিফায়ারকে জিতায় এবং স্কোরলাইন সেই অনুযায়ী ঠিক করে দেয়, ফলে ব্যবহারকারী যা দেখেন তা সবসময় ভেতরে সামঞ্জস্যপূর্ণ। হোল্ড-আউট ডেটায় ব্যাকটেস্ট করে উইন, ড্র ও লস অ্যাকুরেসি ৫৫%-এর বেশি এসেছে। মডেল দলের নাম নয়, ফর্ম পড়ে, যা কারণেই এটি দুই লেগের টাই ও নিউট্রাল ভেনিউ সামলাতে পারে।',
            updated: '2026-05-05',
        },
        {
            slug: 'bit-bin',
            title: 'Bit Bin',
            titleBn: 'Bit Bin',
            category: 'security',
            categoryLabel: 'Security',
            categoryLabelBn: 'সিকিউরিটি',
            repo: 'https://github.com/DiprajMitra/Bit_Bin',
            demo: 'https://bitbin.vercel.app',
            image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=900&q=80',
            imageAlt: 'Padlock and encrypted code on a dark screen',
            tagline: 'A pastebin that encrypts in the browser so the server never sees your text.',
            taglineBn: 'এমন একটি পেস্টবিন যেখানে ব্রাউজারেই এনক্রিপশন হয়, সার্ভার টেক্সট দেখেই না।',
            metaTitle: 'Bit Bin — Client-Side Encrypted Pastebin with Zero Knowledge',
            metaDescription: 'Bit Bin is a Next.js pastebin that encrypts text in the browser using AES-GCM with PBKDF2 key derivation, so your passwords and pastes never reach the server.',
            tech: ['Next.js', 'TypeScript', 'Supabase', 'AES-GCM'],
            highlights: [
                'AES-GCM 256 bit encryption with PBKDF2 key derivation, done in the browser',
                'Server never receives the plaintext or the key, so it cannot read your paste',
                'Burn after read deletes the paste from the database the moment it is opened',
                'Expiry timers from ten minutes up to a month, with a view count and audit panel',
            ],
            problem: 'A pastebin usually stores whatever you give it in plain text, which makes it fine for sharing a snippet and terrible for sharing anything else. The interesting part of the problem is that the fix cannot live on the server, because the whole point is that the server should not be able to read the content at all. Any design where the server holds the key has not solved the problem, it has just moved the trust boundary.',
            solution: 'Bit Bin encrypts the paste inside the browser using AES-GCM with a key derived through PBKDF2. The password never leaves the client, and neither does the plaintext, so the server is storing ciphertext and nothing else. On top of that it supports burn after read, which deletes the row from the database the instant the paste is loaded, and expiry timers from ten minutes to a month. Registered users get a dashboard with view counts, lifespan state and a delete control.',
            problemBn: 'পেস্টবিন সাধারণত যা দিল তা প্লেইন টেক্সটে সংরক্ষণ করে, ফলে কোনো স্নিপেট শেয়ার করার জন্য ঠিক আর বাকি সবকিছুর জন্য বিপজ্জনক। সমস্যার মজার অংশ হলো সমাধান সার্ভারে থাকতে পারে না, কারণ মূল কথা তো সার্ভার যেন কনটেন্ট পড়তে না পারে। যেকোনো ডিজাইন যেখানে সার্ভারে কী থাকে, সেটা সমস্যা সমাধান করেনি, শুধু ট্রাস্ট বাউন্ডারি সরিয়েছে।',
            solutionBn: 'Bit Bin ব্রাউজারের ভিতরেই PBKDF2 দিয়ে ডেরাইভ করা কী ব্যবহার করে AES-GCM দিয়ে পেস্ট এনক্রিপ্ট করে। পাসওয়ার্ড ক্লায়েন্ট থেকে বের হয় না, প্লেইনটেক্সটও বের হয় না, তাই সার্ভার শুধু সাইফারটেক্সট রাখে। এর উপরে বার্ন আফটার রিড আছে, যা পেস্ট ওপেন হওয়ার সঙ্গে সঙ্গে ডেটাবেস থেকে রোড মুছে দেয়, আর ১০ মিনিট থেকে এক মাস পর্যন্ত এক্সপায়ারি টাইমার। রেজিস্টার্ড ইউজাররা ভিউ কাউন্ট, লাইফস্প্যান স্টেট আর ডিলিট কন্ট্রোলসহ ড্যাশবোর্ড পান।',
            updated: '2026-07-19',
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

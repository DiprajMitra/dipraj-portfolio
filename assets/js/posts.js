/**
 * posts.js — Canonical blog registry.
 *
 * Single source of truth for every post that has its own route at
 * /blog/<slug>/. Consumed by:
 *   - index.html        → renders the blog list + injects homepage JSON-LD
 *   - blog/<slug>/index.html → renders the post body + JSON-LD
 *   - sitemap.xml       → lists one <url> per post
 *
 * Same contract as projects.js: metaTitle 50–60 chars, metaDescription
 * 150–160 chars, asserted by the build.
 *
 * Body content lives in `body` as an array of blocks so the build can render
 * real semantic HTML without parsing markdown:
 *   { type: 'p',  text: '...' }
 *   { type: 'h2', text: '...' }
 *   { type: 'ul', items: ['...', '...'] }
 *   { type: 'quote', text: '...' }
 *   { type: 'code', lang: 'python', text: '...' }
 */
(function (global) {
    'use strict';

    const POSTS = [
        {
            slug: 'why-i-stopped-trusting-the-llm-with-the-maths',
            title: 'Why I stopped trusting the LLM with the maths',
            titleBn: 'কেন আমি এলএলএমকে গণিতে বিশ্বাস করা ছেড়ে দিয়েছি',
            date: '2026-09-24',
            readMinutes: 7,
            category: 'Engineering',
            categoryBn: 'ইঞ্জিনিয়ারিং',
            metaTitle: 'Why I Stopped Trusting The LLM With All Of The Maths',
            metaDescription: 'A look at fencing off an LLM behind a deterministic guardrail layer, and why the model should read your request but never do the arithmetic itself here.',
            excerpt: 'The language model was really good at turning English into JSON. It was also, quietly, making up numbers. So I drew a line and made the maths boring.',
            excerptBn: 'ভাষা মডেল ইংরেজি থেকে JSON বানাতে খুব ভালো ছিল। কিন্তু সংখ্যা নিয়ে সে নিজে থেকে বানিয়ে বলছিল। তাই আমি একটা সীমা টেনে দিলাম, আর গণিতকে বানালাম একেবারে নীরব।',
            body: [
                {
                    type: 'p',
                    text: 'I built GridMan during the BUP CSE Fest hackathon. It is a microgrid dispatch engine: you describe an energy schedule in plain language, and it works out a 24-hour power allocation for a campus. The demo was convincing. The first version, at least.',
                },
                {
                    type: 'p',
                    text: 'What broke was not the language understanding. That part was fine. The LLM took "keep the labs lit and hold the battery above reserve" and turned it into clean JSON every time. The problem was what happened next. I had let the model into the part of the system where the numbers were computed, and once the numbers came from a model rather than a solver, the output stopped being trustworthy in a way I could not pin down.',
                },
                {
                    type: 'p',
                    text: 'It is worth being precise about the failure. The model did not hallucinate wildly. It produced plausible hours, plausible battery levels, plausible dispatch schedules. They just quietly violated constraints. A battery reserve of 20 percent became 15. An hour nobody had a demand for got a full allocation. Nothing looked obviously wrong, which is exactly why it was dangerous.',
                },
                { type: 'h2', text: 'The fix was to stop trying to be clever' },
                {
                    type: 'p',
                    text: 'The obvious reaction is to prompt harder. Add an instruction telling the model to double check its arithmetic, ask it to show its work, maybe give it a few examples of what a correct schedule looks like. I tried versions of this. They made the output look more convincing without making it more correct, which is the worst possible combination.',
                },
                {
                    type: 'p',
                    text: 'The change that actually worked was to give the model a smaller job. Now it does exactly one thing: turn prose into structured directives. It never sees a battery level, never picks an hour, never computes a total. Everything downstream of it is deterministic code.',
                },
                {
                    type: 'ul',
                    items: [
                        'The LLM parses natural language into a JSON directive list. Nothing more.',
                        'A guardrail layer clamps every value into range and enforces the rules that must never bend.',
                        'A linear programming solver computes the schedule, and it either has a feasible answer or it does not.',
                    ],
                },
                {
                    type: 'p',
                    text: 'There is a middle layer in there because the boundary needs more than a schema. If someone says "schedule for hour 47", the value has to be rejected before it reaches the solver. If someone says "drain the battery completely", the reserve rule has to clamp it. Those checks are boring, which is the entire point. They are code you can read, test and trust.',
                },
                { type: 'h2', text: 'Why not just use one good model' },
                {
                    type: 'p',
                    text: 'The honest answer is that I still do use an LLM, and it is genuinely useful. Parsing "prioritise the chemistry lab over the dorm block but keep the cold storage running" into a priority list is a language task. It is also a task where a rule-based parser would need a hundred special cases and would still get the phrasing wrong half the time.',
                },
                {
                    type: 'p',
                    text: 'What I do not do is let the output of that parse influence the arithmetic without a gate. The moment the model touches a number, the number gets validated by something that does not hallucinate.',
                },
                {
                    type: 'quote',
                    text: 'Use a model for the part of the problem that is fuzzy. Use a solver for the part that must be exact. Never let them share a variable.',
                },
                { type: 'h2', text: 'The part I did not expect' },
                {
                    type: 'p',
                    text: 'The thing nobody tells you about building an LLM boundary is that the boundary itself becomes the interesting engineering. Writing the ADRs for this project, I spent more time on "why is the LLM not allowed to touch this number" than on the prompt that gets the JSON out in the first place.',
                },
                {
                    type: 'p',
                    text: 'That is a good sign, I think. If the interesting decision is which tool does which part of the job, you are probably building something that will still work next year. If the interesting decision is what to write in the system prompt, you are probably building something that will break quietly.',
                },
                {
                    type: 'p',
                    text: 'I also kept a fallback path: when the LLM call times out or fails, a deterministic extractor handles the request using regex and heuristics. It is worse than the model, but it is always there, and it never invents a constraint. A system with a reliable fallback and an unreliable fast path beats a system with only the unreliable fast path.',
                },
            ],
        },
        {
            slug: 'the-load-shedding-problem-that-taught-me-to-think-in-constraints',
            title: 'The load shedding problem that taught me to think in constraints',
            titleBn: 'লোড শেডিং সমস্যাটা আমাকে কনস্ট্রেন্ট দিয়ে ভাবতে শিখিয়েছিল',
            date: '2026-10-18',
            readMinutes: 8,
            category: 'Algorithms',
            categoryBn: 'অ্যালগরিদম',
            metaTitle: 'Thinking In Constraints: A Load Shedding Optimizer',
            metaDescription: 'How modelling a generator roster as a mixed integer linear program turned a pile of competing business rules into one objective with a few hard constraints.',
            excerpt: 'Six rules that all disagreed with each other. The answer was not a cleverer greedy heuristic, it was writing the rules down as constraints and letting a solver do the work.',
            excerptBn: 'ছয়টা নিয়ম, যেগুলো প্রত্যেকটাই অন্যগুলোর সাথে দ্বন্দ্ব করছিল। সমাধান আরও চালাক থাকা গ্রিডি হিউরিস্টিক নয়, ছিল নিয়মগুলো কনস্ট্রেন্ট হিসেবে লিখে সলভারকে দিয়ে কাজ করানো।',
            body: [
                {
                    type: 'p',
                    text: 'The hackathon brief was about roster optimisation in unreliable grids. A shopping complex runs on a diesel generator, the grid cuts out for a few hours a day, and somebody has to decide which shops keep the lights on. It sounds like a scheduling problem and it is not, because the constraints all pull in different directions.',
                },
                {
                    type: 'ul',
                    items: [
                        'Each shop has a power draw in kW and a value per hour it stays lit.',
                        'The generator has a capacity that applies to every single hour.',
                        'There is a total fuel budget for the whole day, not just per hour.',
                        'Each shop has a limit on how many consecutive hours it can stay dark.',
                        'Some shops are marked mandatory during outages.',
                        'The generator runs on fuel tiers, so cost per kW changes as the day goes on.',
                    ],
                },
                {
                    type: 'p',
                    text: 'Any one of those on its own is easy. Together they are the reason I could not write a heuristic that worked, and the reason the project ended up using a mixed integer linear program instead.',
                },
                { type: 'h2', text: 'Why greedy kept failing me' },
                {
                    type: 'p',
                    text: 'My first instinct was the obvious one. Sort shops by value per hour, light the most valuable ones first, stop when you hit capacity. It works on a clean example and it breaks on the first interesting case, because the fuel budget is a global constraint and the consecutive dark hours are a local one.',
                },
                {
                    type: 'p',
                    text: 'Consider a high value shop that only draws two kW. Greedy will light it every hour because the value is high. But if that shop runs for twelve hours straight and its dark limit is six, you have now painted yourself into a corner where the fuel budget is exhausted in the evening and the high value shop has to go dark anyway. Greedy cannot see that because it never looks ahead.',
                },
                {
                    type: 'p',
                    text: 'Trying to fix that with lookahead heuristics turned into an arms race. Every special case I added created another one somewhere else. By the third attempt the code was harder to reason about than the problem deserved.',
                },
                { type: 'h2', text: 'Writing the rules as constraints' },
                {
                    type: 'p',
                    text: 'The reset came from treating the rules as what they actually are, which is mathematics rather than procedure. The decision variable is binary: for each shop and each hour, is it powered or not. The objective maximises total value. Every rule becomes either a constraint or a coefficient.',
                },
                {
                    type: 'p',
                    text: 'In PuLP that ends up looking roughly like this. The variables come first, then the objective, then each rule as its own line.',
                },
                {
                    type: 'code',
                    lang: 'python',
                    text: 'import pulp\n\nhours = range(24)\nx = pulp.LpVariable.dicts("powered", (shops, hours), cat="Binary")\n\nroster = pulp.LpProblem("roster", pulp.LpMaximize)\nroster += pulp.lpSum(value[s] * x[s][h] for s in shops for h in hours)\n\n# Generator capacity, every hour\nfor h in hours:\n    roster += pulp.lpSum(draw[s] * x[s][h] for s in shops) <= capacity\n\n# Fuel budget across the whole day\nroster += pulp.lpSum(draw[s] * x[s][h] * fuel_rate(h) for s in shops for h in hours) <= fuel_budget\n\n# No shop stays dark longer than its limit\nfor s in shops:\n    for start in hours:\n        window = [(start + k) % 24 for k in range(max_dark[s] + 1)]\n        roster += pulp.lpSum(x[s][h] for h in window) >= 1',
                },
                {
                    type: 'p',
                    text: 'The nice thing about this framing is that the solver does the lookahead for me, and does it exactly. The consecutive dark hours constraint in particular is a sliding window over a cyclic 24 hour day, which is a genuinely awkward thing to hand code correctly. Written as a constraint it is four lines and it just works.',
                },
                { type: 'h2', text: 'Infeasible is a valid answer' },
                {
                    type: 'p',
                    text: 'One thing I changed early was making infeasibility a first class result. The API returns either a full roster or a clear statement that no roster satisfies the constraints, with a dry run endpoint that validates the payload shape without paying for a solve.',
                },
                {
                    type: 'p',
                    text: 'This sounds obvious. It was not. My first version assumed every request was solvable and returned whatever the solver produced, including the partial garbage you get from an infeasible model. A partial roster that looks like a real roster is worse than an error, because the operator cannot tell the difference.',
                },
                {
                    type: 'quote',
                    text: 'If the constraints cannot all be met, say so plainly. Do not return a schedule that quietly breaks one of them.',
                },
                { type: 'h2', text: 'What I would tell myself six months earlier' },
                {
                    type: 'p',
                    text: 'When a problem has several rules that contradict each other, that is a signal to model it, not a signal to write a smarter greedy. If you find yourself adding special cases to your heuristic, you are usually trying to express a constraint that the constraint system was designed to express for free.',
                },
                {
                    type: 'p',
                    text: 'The other thing worth remembering is how much time the modelling takes. The solver call is instant. Getting the model right, with the right variables and the right constraints in the right places, took me most of the build. That is normal, and it is not wasted time.',
                },
            ],
        },
        {
            slug: 'writing-leetcode-solutions-i-actually-remember',
            title: 'Writing LeetCode solutions I actually remember',
            titleBn: 'এমন LeetCode সলিউশন লেখা যা আমি সত্যিই মনে রাখি',
            date: '2026-05-28',
            readMinutes: 6,
            category: 'Algorithms',
            categoryBn: 'অ্যালগরিদম',
            metaTitle: 'Writing LeetCode Solutions That You Actually Remember',
            metaDescription: 'Why most of my LeetCode solutions failed to stick, and the three things I now write down for every problem so the pattern survives the next interview.',
            excerpt: 'A solution that passes the judge is not the same as a solution that survives. Most of mine failed the second test until I started writing down where the approach breaks.',
            excerptBn: 'জাজে পাস করা সমাধান আর মনে থাকা সমাধান এক জিনিস নয়। আমার বেশিরভাগ সলিউশন দ্বিতীয় পরীক্ষায় টেকেনি, যতক্ষণ না প্রতিটির সাথে কোথায় পদ্ধতিটি ভেঙে পড়ে তা লিখে রাখা শুরু করেছি।',
            body: [
                {
                    type: 'p',
                    text: 'I have solved a lot of LeetCode problems. For a long time, almost none of them stuck. I would solve a hard problem on a Sunday, get the green check, and then three weeks later fail a different problem that used the same idea. Not slightly fail either. Sit there for twenty minutes convinced there is no approach, when the approach was sitting in my own repository.',
                },
                { type: 'h2', text: 'The problem with a passing solution' },
                {
                    type: 'p',
                    text: 'A LeetCode submission is optimised for one thing: passing the hidden tests. That is a reasonable goal for the judge and a terrible goal for learning, because the judge does not care whether you understood anything. It cannot tell the difference between a genuine insight and a pattern you half remember from a blog post you read in March.',
                },
                {
                    type: 'p',
                    text: 'So I changed what I write down. The code itself is now the least interesting part of the entry.',
                },
                {
                    type: 'ul',
                    items: [
                        'Why this approach and not the obvious one. Usually the obvious one is O(n squared) and the constraint on n rules it out, so I write down the constraint that killed it.',
                        'The complexity, written next to the code rather than in my head.',
                        'The edge case where this stops working. This is the part I was always skipping and it is the part that actually transfers.',
                    ],
                },
                { type: 'h2', text: 'The edge case note changed everything' },
                {
                    type: 'p',
                    text: 'Take the standard two sum problem. The hash map approach is O(n) and most people know it cold. What almost nobody writes down is what happens when the array contains duplicates, or when the problem asks for the indices rather than the values, or when the same element can be used twice.',
                },
                {
                    type: 'p',
                    text: 'Writing "this breaks when the same element can be used twice, because the check for existence is not the same as the check for count" took thirty seconds and it is the reason I have not fumbled that family of problems since.',
                },
                {
                    type: 'p',
                    text: 'The pattern I have settled on is that a solution is not finished until I can state the boundary at which it stops working. If I cannot name that boundary, I do not actually understand the solution, I just have working code.',
                },
                { type: 'h2', text: 'Writing it twice on purpose' },
                {
                    type: 'p',
                    text: 'I keep most of my solutions in C++, but I write a substantial number in Python too. This started as an accident and turned into one of the best habits I have.',
                },
                {
                    type: 'p',
                    text: 'A Python solution that uses a set and a C++ solution that uses an unordered map are the same algorithm, but they do not feel the same when you write them. The Python version has no explicit index handling. The C++ version has iterator invalidation to think about. Writing both forces you to notice which parts of your mental model are about the algorithm and which parts are just about the language you happen to be using.',
                },
                {
                    type: 'p',
                    text: 'Twice is also a cheap test. If I cannot write the solution in a second language, I probably do not understand the first one yet.',
                },
                { type: 'h2', text: 'What I do not bother with' },
                {
                    type: 'p',
                    text: 'I do not chase the shortest possible code. A slightly longer solution that I understand beats a golfed one that I have to re-derive in six months. I also stopped rewriting solutions I had already written well. The value is in the notes and the reasoning, and reformatting code produces neither.',
                },
                {
                    type: 'quote',
                    text: 'The goal is not to have the most solutions. It is to have a repository you can actually learn from when you cannot sleep at 2am before an interview.',
                },
                {
                    type: 'p',
                    text: 'The repository is still growing and still rough around the edges. But the entries I have written this way are the ones I remember, which is the whole point.',
                },
            ],
        },
        {
            slug: 'building-a-pastebin-that-the-server-cannot-read',
            title: 'Building a pastebin that the server cannot read',
            titleBn: 'এমন পেস্টবিন বানানো যেটা সার্ভার পড়তে পারে না',
            date: '2026-07-24',
            readMinutes: 7,
            category: 'Security',
            categoryBn: 'সিকিউরিটি',
            metaTitle: 'Building A Pastebin That The Server Can Never Read',
            metaDescription: 'Encrypting paste text in the browser with AES-GCM and PBKDF2 so the server only ever stores ciphertext, plus what burn after read really needs from a database.',
            excerpt: 'The interesting part of zero knowledge is not the crypto. It is deciding that the server is allowed to know almost nothing, and then living with the consequences.',
            excerptBn: 'জিরো নলেজের মজার অংশ ক্রিপ্টো নয়, বরং সার্ভারের প্রায় কিছুই জানার অনুমতি দেওয়ার সিদ্ধান্ত, আর তার পরিণতি সামলানো।',
            body: [
                {
                    type: 'p',
                    text: 'Bit Bin started as a weekend project and became the thing I am most proud of architecturally, mostly because of what it refuses to do. A regular pastebin encrypts nothing, stores your text in plain columns, and hands it back to anyone with the URL. That is fine for sharing a config snippet. It is a bad idea for anything else.',
                },
                { type: 'h2', text: 'The obvious server side fix is not a fix' },
                {
                    type: 'p',
                    text: 'The first version encrypted on the server with a key stored in the database. It stopped anyone reading the database directly, which sounds like progress. But the server can still decrypt, which means the server can still read. If the trust boundary you care about is the server, you have not moved it.',
                },
                {
                    type: 'p',
                    text: 'Real zero knowledge means the encryption happens before the data leaves the browser, with a key the server never receives. If you cannot write down the server plaintext, you have not solved the problem.',
                },
                { type: 'h2', text: 'How it actually works' },
                {
                    type: 'p',
                    text: 'When you paste something, the browser derives a key from your password using PBKDF2 and encrypts the text with AES-GCM. That ciphertext, plus a salt, is what gets sent to the server. The password itself never leaves the client.',
                },
                {
                    type: 'p',
                    text: 'AES-GCM matters here for a specific reason beyond being a good general purpose cipher. It is authenticated encryption, which means the ciphertext carries a tag that will fail to verify if anyone tampered with it. That turns a subtle problem, where an attacker modifies the stored ciphertext and hopes the server decrypts it into something different, into an immediate and loud failure.',
                },
                {
                    type: 'p',
                    text: 'The decryption side is symmetric. You open the paste, the browser derives the same key from the password you type, fetches the ciphertext, and decrypts locally. If you type the wrong password, GCM authentication fails and you get an error rather than garbage.',
                },
                { type: 'h2', text: 'Burn after read is the hard part' },
                {
                    type: 'p',
                    text: 'The feature I spent the most time on was not the encryption. It was burn after read: a paste that deletes itself from the database the moment it is loaded, permanently.',
                },
                {
                    type: 'p',
                    text: 'The naive implementation is a read followed by a delete, which has a race in it. If two people open the URL at the same moment, both can read it before either delete lands. The fix is to make the read and the delete one atomic operation at the database level, so exactly one request gets the row and the rest get nothing.',
                },
                {
                    type: 'quote',
                    text: 'Burn after read is not a delete that happens to be fast. It is a read and a delete that are the same statement.',
                },
                {
                    type: 'p',
                    text: 'There is a second problem that people tend to forget. A database row that has been deleted is still recoverable from backups, and it is still in the write ahead log. If you want the content to genuinely be gone, the delete has to propagate into the backups too, and that is a different conversation from the one your application layer is having.',
                },
                { type: 'h2', text: 'Expiry and the view count' },
                {
                    type: 'p',
                    text: 'Expiry timers run from ten minutes up to a month, with an option for never. The implementation is less interesting than it sounds, which is a compliment. A scheduled cleanup job deletes rows past their expiry, and the view count uses an atomic incrementing function in the database rather than a read followed by a write from the application, which would lose counts under concurrent loads.',
                },
                {
                    type: 'p',
                    text: 'Registered users get a small dashboard showing view counts, lifespan state and a delete control. Anonymous users keep their last five creations in localStorage, because losing a paste you just wrote because you refreshed the page is a bad experience even when the paste is meant to be temporary.',
                },
                { type: 'h2', text: 'What I would build differently' },
                {
                    type: 'p',
                    text: 'If I rebuilt this today I would use the Web Crypto API directly instead of pulling in a crypto library, and I would add a clear warning in the UI when someone shares a burn after read link. Not because the feature is dangerous, but because the semantics are unusual and a recipient deserves to know the page they are opening will not be there in ten seconds.',
                },
                {
                    type: 'p',
                    text: 'I would also spend more time on the client side key derivation settings. PBKDF2 iteration counts are a number you set once and forget about, and that number is the actual security of the whole scheme. Making it configurable, and showing the user what it is set to, is the kind of thing that matters more than it looks.',
                },
            ],
        },
        {
            slug: 'five-things-i-learned-from-six-hour-hackathons',
            title: 'Five things I learned from six hour hackathons',
            titleBn: 'ছয় ঘণ্টার হ্যাকাথন থেকে যে পাঁচটি জিনিস শিখলাম',
            date: '2026-05-11',
            readMinutes: 5,
            category: 'Career',
            categoryBn: 'ক্যারিয়ার',
            metaTitle: 'Five Things I Learned From Six Hour Long Hackathons',
            metaDescription: 'Notes on scoping, demoing and shipping under a hard deadline, written after competing in university hackathons including BUP CSE Fest and a 5th place finish.',
            excerpt: 'The judging criteria do not care how many lines you wrote. They care whether it works, on their machine, when they try it. Everything else is negotiable.',
            excerptBn: 'জুরির মানদণ্ড লিখে কত লাইন লিখেছো তা দেখে না। তারা দেখে কাজটা কাজ করে কি না, তাদের মেশিনে, তখন তারা চেষ্টা করলে। বাকি সব আলোচনাযোগ্য।',
            body: [
                {
                    type: 'p',
                    text: 'I have now done enough hackathons to have opinions about them, including some opinions I did not expect to have. The most useful thing I have taken away is that the format rewards a different set of skills than the format advertises.',
                },
                { type: 'h2', text: 'One: scope is the whole game' },
                {
                    type: 'p',
                    text: 'In my first hackathon I built a transport verification prototype with facial recognition and QR scanning. In six hours, with a team, that is a lot of surface area. We got a working prototype, and it was genuinely the most technically ambitious thing I had done at the time.',
                },
                {
                    type: 'p',
                    text: 'It also did not win, and looking back I understand why. We had spent the first hour arguing about the recognition approach and the next two on infrastructure. We had a demo but not a product, and the two things we had built hardest were the two things the judges cared least about.',
                },
                {
                    type: 'p',
                    text: 'Now I plan backwards from the demo. What is the one thing that must work when the judges walk up? Everything else is optional and I will cut it without hesitating if time gets tight. In the BUP CSE Fest round that meant the energy optimisation solver was the priority, and the pretty dashboard could be a rectangle if necessary. It was not, but it was not the reason it was good either.',
                },
                { type: 'h2', text: 'Two: the demo is a separate artefact' },
                {
                    type: 'p',
                    text: 'The thing that actually gets judged is not your app. It is the three minutes where somebody else uses it. Those are different jobs.',
                },
                {
                    type: 'p',
                    text: 'Practically, that means: seed the database with data that shows the value immediately, because a blank form demonstrates nothing. Make the first action obvious, so you are not explaining the interface while the judges wait. Have a fallback video of the working app, because wifi at a venue is a coin flip and a blank screen while the network recovers is the worst possible outcome.',
                },
                {
                    type: 'p',
                    text: 'The video fallback sounds like overengineering. It is not. It is about twenty minutes of work that saves the entire demo.',
                },
                { type: 'h2', text: 'Three: decide what you are not doing' },
                {
                    type: 'p',
                    text: 'In a six hour window, every feature you decide not to build buys back thinking time for the ones you keep. The teams that struggle are usually the ones that keep everything.',
                },
                {
                    type: 'p',
                    text: 'The hard part is that abandonment feels wrong in the moment. You have spent two hours on the auth system and now you are throwing it out. My rule now is to write down the three things that must work before starting, and to look at that list whenever I feel the pull to add a fourth thing. If it is not on the list and it is not a thirty second change, it waits.',
                },
                { type: 'h2', text: 'Four: pick the boring stack' },
                {
                    type: 'p',
                    text: 'Both of my strong hackathon finishes used Python and FastAPI on the backend, which I know well. I could have used something more impressive, and I would have spent the first two hours fighting the framework instead of solving the problem.',
                },
                {
                    type: 'p',
                    text: 'This is not a rule against learning new tools. It is a rule about which six hours you want to be the hard ones. If the hackathon is where you intend to learn the new tool, accept that you will probably finish last. If you want to finish, use what you know and be fast.',
                },
                { type: 'h2', text: 'Five: the pitch matters as much as the code' },
                {
                    type: 'p',
                    text: 'At the BUP CSE Fest round the judges were assessing whether the problem was worth solving, not just whether the solution worked. My GridMan team placed as a finalist, and I think a meaningful part of that was how clearly we framed the problem. We spent time explaining why the dispatch decision was genuinely hard, which made the solution sound like the right amount of engineering.',
                },
                {
                    type: 'p',
                    text: 'This is a different skill from the technical one and nobody teaches it. The habit that helps is describing the problem to a friend who does not work in the area and seeing if they ask a good question. If they do, the framing is working. If they just nod, it is not.',
                },
                {
                    type: 'p',
                    text: 'None of this makes the code easy. The technical work is still the hard part, and it is still most of the work. But the parts around it, the scoping, the demo, the pitch, are what turn a working project into a placed one, and they are cheap to practise compared to the hours spent on the solver itself.',
                },
            ],
        },
    ];

    /** Ordered list of public post URLs, always with a trailing slash. */
    function postUrls() {
        return POSTS.map(function (p) {
            return SITE.origin + '/blog/' + p.slug + '/';
        });
    }

    /** Look up a post by its URL slug. */
    function bySlug(slug) {
        return POSTS.find(function (p) {
            return p.slug === slug;
        }) || null;
    }

    global.POSTS = POSTS;
    global.postUrls = postUrls;
    global.postBySlug = bySlug;
})(typeof window !== 'undefined' ? window : globalThis);

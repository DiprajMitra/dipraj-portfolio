/**
 * script.js — Portfolio behaviour layer.
 *
 * Vanilla ES2018+, no dependencies. Every module is defensive: if its markup
 * is absent the module no-ops instead of throwing. All timers are tracked so
 * they can be cancelled when the user prefers reduced motion.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------
     * Utilities
     * ---------------------------------------------------------------- */

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /** All pending timeouts, so they can be cleared on teardown. */
    const timers = new Set();
    function later(fn, ms) {
        const id = window.setTimeout(function () {
            timers.delete(id);
            fn();
        }, ms);
        timers.add(id);
        return id;
    }
    function clearLater(id) {
        if (id != null) {
            window.clearTimeout(id);
            timers.delete(id);
        }
    }

    function debounce(fn, wait) {
        let t = null;
        return function () {
            const args = arguments;
            const ctx = this;
            window.clearTimeout(t);
            t = window.setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* ------------------------------------------------------------------
     * Theme (dark / light) — persisted, defaults to system preference
     * ---------------------------------------------------------------- */

    const Theme = {
        KEY: 'portfolio.theme',

        current: function () {
            return document.body.classList.contains('light-mode') ? 'light' : 'dark';
        },

        apply: function (mode) {
            const light = mode === 'light';
            const html = document.documentElement;
            const body = document.body;

            html.classList.toggle('light-mode', light);
            html.classList.toggle('dark-mode', !light);
            html.setAttribute('data-theme', light ? 'light' : 'dark');

            if (body) {
                body.classList.toggle('light-mode', light);
                body.classList.toggle('dark-mode', !light);
            }

            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', light ? '#f7f8fc' : '#070b16');

            const btn = $('#theme-toggle');
            if (btn) {
                const loc = window.I18n ? window.I18n.get() : 'en';
                btn.setAttribute('aria-label', window.I18n
                    ? window.I18n.t(loc, light ? 'nav.theme.dark' : 'nav.theme.light')
                    : (light ? 'Switch to dark mode' : 'Switch to light mode'));
            }
        },

        init: function () {
            // The pre-paint inline script in <head> already resolved the theme,
            // so read it from <html> rather than re-deciding (which would
            // cause a flash). Fall back to localStorage, then system pref.
            const html = document.documentElement;
            let mode = html.getAttribute('data-theme');

            if (mode !== 'light' && mode !== 'dark') {
                let saved = null;
                try { saved = localStorage.getItem(Theme.KEY); } catch (e) { /* ignore */ }
                if (saved === 'light' || saved === 'dark') {
                    mode = saved;
                } else {
                    mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                }
            }

            Theme.apply(mode);

            const btn = $('#theme-toggle');
            if (!btn) return;
            btn.addEventListener('click', function () {
                const next = Theme.current() === 'dark' ? 'light' : 'dark';
                Theme.apply(next);
                try { localStorage.setItem(Theme.KEY, next); } catch (e) { /* ignore */ }
            });
        }
    };

    /* ------------------------------------------------------------------
     * Terminal loader
     * ---------------------------------------------------------------- */

    const Loader = {
        PHRASES: [
            { key: 'loader.status.init', type: 'Initializing system', log: 'boot: kernel handshake ok' },
            { key: 'loader.status.modules', type: 'Loading core modules', log: 'load: 12 modules resolved' },
            { key: 'loader.status.network', type: 'Establishing secure connection', log: 'tls: session established (AES-256)' },
            { key: 'loader.status.assets', type: 'Compiling portfolio assets', log: 'build: assets compiled in 142ms' },
            { key: 'loader.status.ux', type: 'Optimizing user experience', log: 'perf: layout stable, 0 CLS' },
            { key: 'loader.status.done', type: 'Access granted. Welcome.', log: 'ready: welcome, dipraj@engineer' }
        ],
        CODE: [
            "import { engine } from 'portfolio-core';",
            "const profile = new Developer('Dipraj Mitra');",
            "profile.addSkill(['Java', 'C++', 'Python', 'React']);",
            "while (loading) { updateProgress(); }",
            "sudo systemctl start web-server.service",
            "GET /api/v1/projects HTTP/1.1 200 OK",
            "Encryption: AES-256-GCM initialized.",
            "Buffer overflow protection: ENABLED",
            "Neural network weights: LOADED",
            "Memory leak detection: NEGATIVE",
            "Compiling style.scss -> style.css...",
            "git commit -m 'ship it' --amend --no-verify"
        ],

        run: function () {
            const root = $('#loader');
            if (!root) return;

            const typed = $('#loader-typed');
            const status = $('#loader-status');
            const bar = $('#loader-progress');
            const pct = $('#loader-percent');
            const code = $('#loader-code');
            const log = $('#loader-log');

            // Decorative code rain
            if (code) {
                code.textContent = Loader.CODE.join('\n') + '\n' + Loader.CODE.slice().reverse().join('\n');
            }

            // Reduced motion / already-visited: skip straight to done.
            if (reduceMotion.matches) {
                Loader.finish(root);
                return;
            }

            let phraseIdx = 0;
            let charIdx = 0;
            let progress = 0;
            let done = false;

            function setStatus(idx) {
                if (!status) return;
                const key = Loader.PHRASES[idx].key;
                status.textContent = window.I18n ? window.I18n.t(window.I18n.get(), key) : Loader.PHRASES[idx].type;
            }

            function pushLog(idx) {
                if (!log) return;
                const line = document.createElement('div');
                line.className = 'ok';
                line.textContent = '✓ ' + Loader.PHRASES[idx].log;
                log.appendChild(line);
                // Keep only the last three lines visible
                while (log.children.length > 3) log.removeChild(log.firstChild);
            }

            function typeNext() {
                if (done) return;
                const phrase = Loader.PHRASES[phraseIdx].type;

                if (charIdx < phrase.length) {
                    typed.textContent += phrase.charAt(charIdx);
                    charIdx++;
                    later(typeNext, 10 + Math.random() * 16);
                } else {
                    pushLog(phraseIdx);
                    if (phraseIdx < Loader.PHRASES.length - 1) {
                        later(function () {
                            phraseIdx++;
                            charIdx = 0;
                            typed.textContent = '';
                            setStatus(phraseIdx);
                            typeNext();
                        }, 190);
                    }
                }
            }

            function tick() {
                if (done) return;
                progress = Math.min(100, progress + Math.random() * 4.5 + 2.2);
                bar.style.width = progress + '%';
                pct.textContent = Math.floor(progress);

                if (progress >= 100) {
                    done = true;
                    setStatus(Loader.PHRASES.length - 1);
                    later(function () { Loader.finish(root); }, 300);
                    return;
                }
                later(tick, 40);
            }

            setStatus(0);
            typeNext();
            tick();
        },

        finish: function (root) {
            root.classList.add('is-hidden');
            document.body.classList.add('is-loaded');
            later(function () {
                if (root.parentNode) root.parentNode.removeChild(root);
            }, 700);
        }
    };

    /* ------------------------------------------------------------------
     * Header state + scroll spy
     * ---------------------------------------------------------------- */

    const Navigation = {
        init: function () {
            const header = $('#site-header');
            const navMenu = $('#nav-menu');
            const menuToggle = $('#menu-toggle');
            const navLinks = $$('.nav-link');
            const bar = $('#scroll-progress-bar');
            const progressWrap = $('.scroll-progress');

            function menuLabel(open) {
                const loc = window.I18n ? window.I18n.get() : 'en';
                const key = open ? 'nav.menu.close' : 'nav.menu.open';
                if (window.I18n) return window.I18n.t(loc, key);
                return open ? 'Close menu' : 'Open menu';
            }

            function closeMenu() {
                if (!navMenu || !menuToggle) return;
                navMenu.classList.remove('is-open');
                menuToggle.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', menuLabel(false));
            }

            if (menuToggle) {
                menuToggle.addEventListener('click', function () {
                    const open = navMenu.classList.toggle('is-open');
                    menuToggle.classList.toggle('is-open', open);
                    menuToggle.setAttribute('aria-expanded', String(open));
                    menuToggle.setAttribute('aria-label', menuLabel(open));
                });
            }

            // Keep the menu's accessible name in sync when the locale changes
            document.addEventListener('localechange', function () {
                if (!navMenu || !menuToggle) return;
                menuToggle.setAttribute('aria-label', menuLabel(navMenu.classList.contains('is-open')));
            });

            navLinks.forEach(function (link) {
                link.addEventListener('click', closeMenu);
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeMenu();
            });

            document.addEventListener('click', function (e) {
                if (!navMenu || !navMenu.classList.contains('is-open')) return;
                if (navMenu.contains(e.target) || (menuToggle && menuToggle.contains(e.target))) return;
                closeMenu();
            });

            // Sticky header + scroll progress (rAF-throttled)
            let ticking = false;
            function onScroll() {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(function () {
                    const y = window.scrollY || window.pageYOffset;
                    if (header) header.classList.toggle('is-stuck', y > 24);

                    const max = document.documentElement.scrollHeight - window.innerHeight;
                    const ratio = max > 0 ? Math.min(1, y / max) : 0;
                    if (bar) bar.style.width = (ratio * 100).toFixed(2) + '%';
                    if (progressWrap) {
                        progressWrap.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
                    }
                    ticking = false;
                });
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();

            // Scroll spy — IntersectionObserver instead of scroll maths
            const sections = $$('main section[id]');
            if ('IntersectionObserver' in window && sections.length) {
                const visible = new Map();
                const spy = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
                    });
                    let bestId = null;
                    let bestRatio = 0;
                    visible.forEach(function (ratio, id) {
                        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
                    });
                    if (!bestId) return;
                    navLinks.forEach(function (link) {
                        link.classList.toggle('is-active', link.getAttribute('href') === '#' + bestId);
                    });
                }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

                sections.forEach(function (s) { spy.observe(s); });
            }
        }
    };

    /* ------------------------------------------------------------------
     * Hero role rotator
     * ---------------------------------------------------------------- */

    const Rotator = {
        timer: null,

        phrases: function () {
            const loc = window.I18n ? window.I18n.get() : 'en';
            const key = 'hero.roles';
            if (!window.I18n) return ['Software Engineer', 'Problem Solver', 'Security Enthusiast', 'CS Student'];
            const list = window.I18n.t(loc, key);
            return Array.isArray(list) ? list : [String(list)];
        },

        start: function () {
            const el = $('#typing-text');
            if (!el) return;

            let list = Rotator.phrases();
            let idx = 0;
            let chars = 0;
            let deleting = false;

            function render() {
                const word = list[idx];
                el.textContent = deleting ? word.slice(0, --chars) : word.slice(0, ++chars);

                let delay;
                if (!deleting && chars === word.length) {
                    deleting = true;
                    delay = 1900;
                } else if (deleting && chars === 0) {
                    deleting = false;
                    idx = (idx + 1) % list.length;
                    delay = 420;
                } else {
                    delay = deleting ? 45 : 95;
                }
                Rotator.timer = later(render, delay);
            }

            render();

            // Restart with new phrases when the locale changes
            document.addEventListener('localechange', function () {
                clearLater(Rotator.timer);
                list = Rotator.phrases();
                idx = 0;
                chars = 0;
                deleting = false;
                el.textContent = '';
                render();
            });
        }
    };

    /* ------------------------------------------------------------------
     * Scroll reveal
     * ---------------------------------------------------------------- */

    const Reveal = {
        init: function () {
            const items = $$('[data-reveal]');
            if (!items.length) return;

            if (reduceMotion.matches || !('IntersectionObserver' in window)) {
                items.forEach(function (el) { el.classList.add('is-visible'); });
                return;
            }

            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const siblings = el.parentElement ? $$('[data-reveal]', el.parentElement) : [];
                    const position = siblings.indexOf(el);
                    el.style.transitionDelay = position > 0 ? Math.min(position * 70, 350) + 'ms' : '';
                    el.classList.add('is-visible');
                    observer.unobserve(el);
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

            items.forEach(function (el) { observer.observe(el); });
        }
    };

    /* ------------------------------------------------------------------
     * Animated counters
     * ---------------------------------------------------------------- */

    const Counters = {
        init: function () {
            const counters = $$('.counter');
            if (!counters.length) return;

            function run(el) {
                const target = parseInt(el.getAttribute('data-count'), 10) || 0;
                if (reduceMotion.matches) {
                    el.textContent = target.toLocaleString();
                    return;
                }
                const duration = 1400;
                const start = performance.now();
                function frame(now) {
                    const p = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * eased).toLocaleString();
                    if (p < 1) window.requestAnimationFrame(frame);
                }
                window.requestAnimationFrame(frame);
            }

            if (!('IntersectionObserver' in window)) {
                counters.forEach(run);
                return;
            }

            const obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    run(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.5 });

            counters.forEach(function (el) { obs.observe(el); });
        }
    };

    /* ------------------------------------------------------------------
     * Project filtering
     * ---------------------------------------------------------------- */

    const Filters = {
        init: function () {
            const buttons = $$('.filter');
            const grid = $('#project-grid');
            if (!buttons.length || !grid) return;

            const projects = $$('.project', grid);
            const empty = $('#projects-empty');

            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const filter = btn.getAttribute('data-filter');

                    buttons.forEach(function (b) {
                        b.classList.toggle('is-active', b === btn);
                        b.setAttribute('aria-pressed', String(b === btn));
                    });

                    let shown = 0;
                    projects.forEach(function (card) {
                        const match = filter === 'all' || card.getAttribute('data-category') === filter;
                        card.classList.toggle('is-hidden', !match);
                        if (match) {
                            shown++;
                            // Restart the reveal transition on the newly shown card
                            card.classList.remove('is-visible');
                            window.requestAnimationFrame(function () {
                                card.classList.add('is-visible');
                            });
                        }
                    });

                    if (empty) empty.hidden = shown !== 0;
                });
            });
        }
    };

    /* ------------------------------------------------------------------
     * Contact form
     * ---------------------------------------------------------------- */

    const ContactForm = {
        endpoint: 'https://formsubmit.co/ajax/dipraj.mitra123@gmail.com',

        init: function () {
            const form = $('#contact-form');
            if (!form) return;

            const submit = $('#cf-submit');
            const status = $('#form-status');

            function setError(input, message) {
                const field = input.closest('.field');
                if (!field) return;
                field.classList.add('has-error');
                const slot = $('[data-error-for="' + input.id + '"]', field);
                if (slot) slot.textContent = message;
                input.setAttribute('aria-invalid', 'true');
            }

            function clearError(input) {
                const field = input.closest('.field');
                if (!field) return;
                field.classList.remove('has-error');
                const slot = $('[data-error-for="' + input.id + '"]', field);
                if (slot) slot.textContent = '';
                input.removeAttribute('aria-invalid');
            }

            function validate() {
                const t = window.I18n ? window.I18n.t(window.I18n.get(), 'contact.form') : {};
                const required = t.required || 'This field is required.';
                const invalidEmail = t.invalidEmail || 'Please enter a valid email address.';

                let ok = true;
                let firstBad = null;

                ['cf-name', 'cf-email', 'cf-message'].forEach(function (id) {
                    const input = $('#' + id);
                    if (!input) return;
                    clearError(input);

                    const value = input.value.trim();
                    if (!value) {
                        setError(input, required);
                        ok = false;
                        if (!firstBad) firstBad = input;
                        return;
                    }
                    if (id === 'cf-email' && !EMAIL_RE.test(value)) {
                        setError(input, invalidEmail);
                        ok = false;
                        if (!firstBad) firstBad = input;
                    }
                });

                if (firstBad) firstBad.focus();
                return ok;
            }

            form.addEventListener('submit', async function (e) {
                e.preventDefault();

                // Honeypot — a filled hidden field means a bot. Pretend success.
                const honeypot = $('#cf-company');
                if (honeypot && honeypot.value) {
                    form.reset();
                    return;
                }

                if (!validate()) return;

                const t = window.I18n ? window.I18n.t(window.I18n.get(), 'contact.form') : {};
                const original = submit.innerHTML;

                submit.disabled = true;
                submit.classList.add('is-loading');
                submit.innerHTML = '<span>' + (t.sending || 'Sending…') + '</span>';
                if (status) {
                    status.textContent = '';
                    status.className = 'form-status';
                }

                const payload = {
                    name: $('#cf-name').value.trim(),
                    email: $('#cf-email').value.trim(),
                    subject: $('#cf-subject') ? $('#cf-subject').value.trim() : '',
                    message: $('#cf-message').value.trim()
                };

                try {
                    const response = await fetch(ContactForm.endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    const type = response.headers.get('content-type') || '';
                    let result = null;

                    if (type.indexOf('application/json') !== -1) {
                        result = await response.json();
                    } else {
                        const text = await response.text();
                        if (!response.ok) throw new Error('HTTP ' + response.status);
                        result = { success: 'true', message: text.substring(0, 120) };
                    }

                    const ok = String(result.success) === 'true' || result.success === true;
                    if (!ok) throw new Error(result.message || 'Submission failed');

                    submit.classList.remove('is-loading');
                    submit.classList.add('is-success');
                    submit.innerHTML = '<span>' + (t.success || 'Message Sent') + '</span>';
                    if (status) {
                        status.textContent = payload.name + ' — ' + (t.success || 'Message Sent');
                        status.classList.add('is-success');
                    }
                    form.reset();
                    $$('.field', form).forEach(clearError);
                } catch (err) {
                    console.error('[portfolio] contact submission failed:', err);
                    submit.classList.remove('is-loading');
                    submit.classList.add('is-error');
                    submit.innerHTML = '<span>' + (t.failed || 'Failed to Send') + '</span>';
                    if (status) {
                        status.textContent = (t.failed || 'Failed to Send') +
                            (err && err.message ? ' (' + err.message + ')' : '');
                        status.classList.add('is-error');
                    }
                } finally {
                    later(function () {
                        submit.disabled = false;
                        submit.classList.remove('is-success', 'is-error');
                        submit.innerHTML = original;
                    }, 5000);
                }
            });

            // Clear the error state as the user types
            ['cf-name', 'cf-email', 'cf-message'].forEach(function (id) {
                const input = $('#' + id);
                if (!input) return;
                input.addEventListener('input', function () { clearError(input); });
            });
        }
    };

    /* ------------------------------------------------------------------
     * Copy email + toast
     * ---------------------------------------------------------------- */

    const Clipboard = {
        toastTimer: null,

        show: function (message) {
            const toast = $('#toast');
            if (!toast) return;
            toast.textContent = message;
            toast.classList.add('is-visible');
            clearLater(Clipboard.toastTimer);
            Clipboard.toastTimer = later(function () {
                toast.classList.remove('is-visible');
            }, 2600);
        },

        init: function () {
            const btn = $('#copy-email');
            if (!btn) return;

            btn.addEventListener('click', async function () {
                const email = 'dipraj.mitra123@gmail.com';
                const t = window.I18n ? window.I18n.t(window.I18n.get(), 'toast') : {};
                const label = btn.querySelector('span');

                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(email);
                    } else {
                        const helper = document.createElement('textarea');
                        helper.value = email;
                        helper.setAttribute('readonly', '');
                        helper.style.position = 'fixed';
                        helper.style.opacity = '0';
                        document.body.appendChild(helper);
                        helper.select();
                        document.execCommand('copy');
                        document.body.removeChild(helper);
                    }
                    if (label) label.textContent = (window.I18n ? window.I18n.t(window.I18n.get(), 'contact.form.copied') : 'Copied');
                    Clipboard.show(t.copySuccess || 'Email copied to clipboard');
                    later(function () {
                        if (label) {
                            label.textContent = window.I18n
                                ? window.I18n.t(window.I18n.get(), 'contact.form.copy')
                                : 'Copy email';
                        }
                    }, 2200);
                } catch (err) {
                    console.warn('[portfolio] clipboard unavailable:', err);
                }
            });
        }
    };

    /* ------------------------------------------------------------------
     * Language switch
     * ---------------------------------------------------------------- */

    const Language = {
        init: function () {
            if (!window.I18n) return;

            const btn = $('#lang-toggle');
            if (!btn) return;

            btn.addEventListener('click', function () {
                window.I18n.toggleLocale();
            });

            // Keep the loader's status line in sync if language changes mid-load
            document.addEventListener('localechange', function () {
                const status = $('#loader-status');
                if (status && status.textContent) {
                    const key = status.getAttribute('data-i18n');
                    if (key) status.textContent = window.I18n.t(window.I18n.get(), key);
                }
            });
        }
    };

    /* ------------------------------------------------------------------
     * Misc
     * ---------------------------------------------------------------- */

    const Misc = {
        init: function () {
            // Footer year
            const year = $('#year');
            if (year) year.textContent = String(new Date().getFullYear());

            // Smooth-scroll for in-page anchors, offset for the sticky header
            $$('a[href^="#"]').forEach(function (anchor) {
                anchor.addEventListener('click', function (e) {
                    const id = anchor.getAttribute('href');
                    if (!id || id === '#') return;
                    const target = document.querySelector(id);
                    if (!target) return;
                    e.preventDefault();
                    const offset = ($('#site-header') ? $('#site-header').offsetHeight : 0) + 12;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({
                        top: top,
                        behavior: reduceMotion.matches ? 'auto' : 'smooth'
                    });
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                });
            });

            // Pause the rotator when the tab is hidden (saves CPU)
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    clearLater(Rotator.timer);
                }
            });
        }
    };

    /* ------------------------------------------------------------------
     * Boot
     * ---------------------------------------------------------------- */

    function boot() {
        // 1. Language first — it affects the loader text and font stack.
        if (window.I18n) {
            window.I18n.apply(window.I18n.detect());
        }

        Theme.init();
        Language.init();
        Loader.run();
        Navigation.init();
        Rotator.start();
        Reveal.init();
        Counters.init();
        Filters.init();
        ContactForm.init();
        Clipboard.init();
        Misc.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

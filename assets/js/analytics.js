/**
 * analytics.js — Vercel Web Analytics: custom event tracking.
 *
 * Vercel injects `/_vercel/insights/script.js` when Web Analytics is enabled
 * on the project, and that script reports page views on its own. This file
 * only adds the custom events, which answer the question page views cannot:
 * which project gets opened, which post gets read, and whether anyone
 * actually downloads the resume.
 *
 * Everything is defensive. If Analytics is not enabled on the Vercel project,
 * `window.va` never appears and every call here is a no-op. The site must
 * never break because a tracking script is missing.
 */
(function () {
    'use strict';

    /* The queue stub is declared inline in <head> so events fired before the
       tracker script loads are buffered rather than dropped. Before that stub
       exists there is nothing to call, so track() falls back to a local queue. */
    var pending = [];

    function hasTracker() {
        return typeof window.va === 'function';
    }

    /**
     * Fire a custom event.
     *
     * @param {string} name   Event name shown in the Vercel dashboard.
     * @param {Object} [data] Optional flat object of properties.
     */
    function track(name, data) {
        if (!name) return;

        if (!hasTracker()) {
            // The tracker script has not loaded yet. Buffer it, but cap the
            // buffer so a slow script cannot grow the array without bound.
            if (pending.length < 50) pending.push([name, data]);
            return;
        }

        try {
            if (data) window.va('event', { name: name, data: data });
            else window.va('event', { name: name });
        } catch (err) {
            /* A tracking failure must never surface to the user. */
        }
    }

    /* Flush anything captured before the tracker script arrived. */
    function flush() {
        if (!hasTracker() || !pending.length) return;
        var queued = pending.slice();
        pending.length = 0;
        queued.forEach(function (item) {
            track(item[0], item[1]);
        });
    }

    /* ---------- Page-level hooks ---------- */

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    /* Slugify a URL into a short, readable event property. */
    function slug(path) {
        var parts = String(path || '').split('/').filter(Boolean);
        if (!parts.length) return 'home';
        return parts.join('/');
    }

    onReady(function () {
        /* The tracker script sets window.va itself; we only need to know when
           it is ready. Polling briefly is cheaper than another script tag and
           keeps the head clean. */
        var tries = 0;
        (function waitForTracker() {
            if (hasTracker()) {
                flush();
            } else if (tries++ < 40) {
                setTimeout(waitForTracker, 250);
            }
        })();

        /* 1. Resume download. The hero button is the single highest intent
              action on the page, so it gets its own event rather than being
              buried in a generic outbound-click bucket. */
        var resumeLink = document.querySelector('a[href$="/assets/resume.pdf"], a[href="assets/resume.pdf"]');
        if (resumeLink) {
            resumeLink.addEventListener('click', function () {
                track('resume_download', { page: slug(location.pathname) });
            });
        }

        /* 2. Project cards. The title link and the "Read case study" CTA both
              point at the case study, so both are tracked and the project
              slug is sent as a property. */
        var projectLinks = document.querySelectorAll('.project__title-link, .project__cta');
        Array.prototype.forEach.call(projectLinks, function (link) {
            link.addEventListener('click', function () {
                track('project_click', { project: slug(link.getAttribute('href')) });
            });
        });

        /* 3. Blog posts. */
        var blogLinks = document.querySelectorAll('.blog-card__title a, .blog-card a');
        Array.prototype.forEach.call(blogLinks, function (link) {
            link.addEventListener('click', function () {
                track('blog_post_open', { post: slug(link.getAttribute('href')) });
            });
        });

        /* 4. Contact form. Only a successful submission is worth recording;
              failures are logged to the console by the form handler already.
              The form posts asynchronously, so the submit event fires before we
              know the outcome. The handler marks success with an `is-success`
              class on the submit button, so watch that button directly.
              The observer is attached up front rather than from inside the
              submit handler: by the time the submit handler runs, the form
              module has already swapped the button's class list, and an
              observer attached at that point can miss the transition. */
        var form = document.getElementById('contact-form');
        var submitBtn = document.getElementById('cf-submit');
        if (form && submitBtn) {
            var seenSuccess = false;
            new MutationObserver(function () {
                if (seenSuccess) return;
                if (submitBtn.classList.contains('is-success')) {
                    seenSuccess = true;
                    track('contact_form_submit', { page: slug(location.pathname) });
                }
            }).observe(submitBtn, { attributes: true, attributeFilter: ['class'] });
        }

        /* 5. Language toggle. The i18n layer dispatches a localechange event
              after it swaps the strings, which is a cleaner signal than
              watching the button's class. */
        document.addEventListener('localechange', function (e) {
            var locale = (e.detail && e.detail.locale) || 'en';
            track('language_toggle', { locale: locale });
        });

        /* 6. Outbound links to code, profiles and live demos. */
        var external = document.querySelectorAll('a[target="_blank"]');
        Array.prototype.forEach.call(external, function (link) {
            link.addEventListener('click', function () {
                var href = link.getAttribute('href') || '';
                var host = '';
                try { host = new URL(href, location.href).hostname; } catch (err) { host = ''; }
                if (!host || host.indexOf(location.hostname) !== -1) return;
                track('external_click', { host: host });
            });
        });
    });

    /* Expose the helper so other modules can record events without
       reaching into window.va themselves. */
    window.PortfolioAnalytics = {
        track: track,
        flush: flush,
    };
})();

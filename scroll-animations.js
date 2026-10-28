/*
 * Scroll animations
 * -----------------
 *  1. Scroll progress bar at the top of the page.
 *  2. Scroll-linked fade for sections, cards, timeline items, grids and the footer:
 *     items fade in and rise up gradually as they enter from the bottom of the screen,
 *     and fade out gradually as they leave through the top. Scrolling back up plays the
 *     same thing in reverse (the effect follows the scroll position, it is not a one-shot).
 *  5. Timeline: the accent line draws itself as you scroll, markers pop in.
 *  6. Navigation scroll-spy: the menu link of the current section is highlighted.
 *  7. Hero: portrait parallax, orbit rings rotate with scroll, text drifts and fades.
 *  8. Project cover images drift inside their frames (parallax).
 *
 * Works for content rendered later by portfolio-loader.js (MutationObserver),
 * waits for the preloader to finish, and does nothing for visitors who prefer
 * reduced motion. Content is only hidden by JavaScript, so it can never get
 * stuck invisible if this file fails to load.
 */
(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  root.classList.add('sa-js');

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- 1. Scroll progress bar ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ---------- Scroll-linked effects (one rAF-throttled loop) ---------- */
  const heroVisual = document.querySelector('.hero-visual');
  const heroCopy = document.querySelector('.hero-copy');
  let lastSpyKey = '';
  let ticking = false;

  function updateHero(y, vh) {
    if (!heroVisual || y > vh * 1.4) return;
    const wide = window.innerWidth > 900;
    heroVisual.style.setProperty('--sa-py', `${Math.min(90, y * 0.14).toFixed(1)}px`);
    heroVisual.style.setProperty('--sa-rot', `${(y * 0.12).toFixed(1)}deg`);
    if (heroCopy) {
      heroCopy.style.setProperty(
        '--sa-cy',
        wide ? `${-Math.min(60, y * 0.08).toFixed(1)}px` : '0px'
      );
      heroCopy.style.setProperty(
        '--sa-fade',
        wide ? clamp(1 - y / (vh * 0.95), 0.2, 1).toFixed(3) : '1'
      );
    }
  }

  function updateTimelines(vh) {
    document.querySelectorAll('.timeline').forEach((t) => {
      const r = t.getBoundingClientRect();
      let p;
      if (r.bottom < 0) p = 1;
      else if (r.top > vh) p = 0;
      else p = clamp((vh * 0.65 - r.top) / Math.max(r.height, 1), 0, 1);
      t.style.setProperty('--sa-line', p.toFixed(3));
    });
  }

  function updateCovers(vh) {
    document.querySelectorAll('.project-cover').forEach((c) => {
      const r = c.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) return;
      const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2), -1, 1);
      c.style.setProperty('--cy', `${(-p * 14).toFixed(1)}px`);
    });
  }

  /* ---------- Scroll-linked fade (items rise in from the bottom, fade out at the top) ---------- */
  const tracked = [];
  const ease = (t) => t * t * (3 - 2 * t);
  const ENTER_ZONE = 0.22; // share of the screen height used for fading in
  const EXIT_ZONE = 0.2; // share of the screen height used for fading out
  const RISE = 44; // px an item travels upward while fading in
  const DRIFT = 26; // px an item keeps moving up while fading out

  function updateFade(y, vh) {
    // forget elements that were removed from the page (filters / re-renders)
    for (let i = tracked.length - 1; i >= 0; i--) if (!tracked[i].isConnected) tracked.splice(i, 1);
    if (!tracked.length) return;
    const max = Math.max(0, root.scrollHeight - vh);
    const header = document.querySelector('.header');
    const topEdge = (header ? header.offsetHeight : 72) * 0.6;
    const rects = tracked.map((el) => el.getBoundingClientRect()); // read first ...
    tracked.forEach((el, i) => {
      // ... then write
      const r = rects[i];
      let o = 0,
        ty = 0,
        sc = 1;
      if (r.width > 0 || r.height > 0) {
        // Fade in: from the bottom edge of the screen up to ENTER_ZONE.
        // Elements near the end of the page can never travel that far, so stop where they can.
        const lowestTop = r.top - (max - y);
        const enterEnd = Math.min(vh - 1, Math.max(vh * (1 - ENTER_ZONE), lowestTop + 2));
        const pin = ease(clamp((vh - r.top) / Math.max(vh - enterEnd, 1), 0, 1));
        // Fade out: while the element's bottom edge travels up under the header.
        const highestBottom = r.bottom + y;
        const exitStart = Math.max(
          topEdge + 1,
          Math.min(topEdge + vh * EXIT_ZONE, highestBottom - 2)
        );
        const pout = ease(clamp((r.bottom - topEdge) / Math.max(exitStart - topEdge, 1), 0, 1));
        const p = Math.min(pin, pout);
        o = p;
        ty = (1 - pin) * RISE - (1 - pout) * DRIFT;
        if (el.dataset.sf === 'zoom') sc = 0.95 + 0.05 * p;
      }
      const key = o.toFixed(3) + '|' + ty.toFixed(1) + '|' + sc.toFixed(3);
      if (el._sfKey === key) return;
      el._sfKey = key;
      el.style.opacity = o.toFixed(3);
      el.style.translate = `0 ${ty.toFixed(1)}px`;
      el.style.scale = sc === 1 ? '' : sc.toFixed(3);
    });
  }

  function updateScrollSpy(y, vh) {
    const sections = document.querySelectorAll('main > section[id]');
    if (!sections.length) return;
    let active = sections[0].id;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= vh * 0.4) active = s.id;
    });
    if (y + vh >= root.scrollHeight - 4) active = sections[sections.length - 1].id;
    const links = document.querySelectorAll('.nav-menu a[href^="#"]');
    const key = active + ':' + links.length;
    if (key === lastSpyKey) return;
    lastSpyKey = key;
    links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + active;
      a.classList.toggle('sa-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function tick() {
    const y = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    updateHero(y, vh);
    updateTimelines(vh);
    updateCovers(vh);
    updateFade(y, vh);
    updateScrollSpy(y, vh);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Content and header render after load; refresh once things settle.
  document.addEventListener('portfolio:loaded', onScroll);
  document.addEventListener('portfolio:components-ready', () => {
    lastSpyKey = '';
    onScroll();
  });
  window.addEventListener('load', () => {
    lastSpyKey = '';
    onScroll();
  });
  onScroll();

  /* ---------- Which elements take part ---------- */
  // selector -> variant (first match wins); 'zoom' also scales slightly
  const TARGETS = [
    ['.section-head', 'fade'],
    ['.about-copy', 'up'],
    ['.fact-grid', 'up'],
    ['.timeline-item', 'up'],
    ['.skill-card', 'up'],
    ['.project', 'up'],
    ['.research-card', 'up'],
    ['.education', 'up'],
    ['.course-card', 'up'],
    ['.certificate', 'zoom'],
    ['.stat', 'zoom'],
    ['.repo', 'up'],
    ['.gallery-card', 'zoom'],
    ['.contact-box', 'zoom'],
    ['.github-cta', 'up'],
    ['.collection-more', 'fade'],
    ['.collection-tools', 'fade'],
    ['footer .footer-inner', 'fade'],
    ['.reveal', 'up'],
  ];
  const SELECTOR = TARGETS.map((t) => t[0]).join(',');

  function variantFor(el) {
    for (const [sel, variant] of TARGETS) if (el.matches(sel)) return variant;
    return 'up';
  }

  function prepare(el) {
    if (el.dataset.sf || el.closest('.hero') || el.closest('.modal, .lightbox')) return;
    if (el.parentElement && el.parentElement.closest('.sf')) return; // never nest two fades
    el.dataset.sf = variantFor(el);
    // Take over from the older .reveal mechanism so the two never fight.
    el.classList.remove('reveal', 'show');
    el.classList.add('sf');
    tracked.push(el);
  }

  function scan(node) {
    if (!(node instanceof Element)) return;
    if (node.matches(SELECTOR)) prepare(node);
    node.querySelectorAll(SELECTOR).forEach(prepare);
  }

  // Tag everything now (so nothing flashes), then keep up with content rendered later.
  scan(document.body);
  new MutationObserver((mutations) => {
    mutations.forEach((m) => m.addedNodes.forEach(scan));
    onScroll();
  }).observe(document.body, { childList: true, subtree: true });

  // Filters, tabs and image loading change the page height without scrolling: refresh then too.
  if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(document.body);
  ['click', 'input', 'change', 'keyup'].forEach((evt) =>
    document.addEventListener(evt, () => setTimeout(onScroll, 60), { passive: true })
  );
  onScroll();
})();

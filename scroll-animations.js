/*
 * Scroll animations
 * -----------------
 *  1. Scroll progress bar at the top of the page.
 *  2. Reveal-on-scroll for sections, cards, timeline items, grids and the footer,
 *     with direction variants and a staggered entrance for items that appear together.
 *  3. Inside revealed cards: tags, skill pills, facts and skill bars cascade in.
 *  4. Section headings: eyebrow slides in, title wipes in, description follows.
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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

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
      heroCopy.style.setProperty('--sa-cy', wide ? `${-Math.min(60, y * 0.08).toFixed(1)}px` : '0px');
      heroCopy.style.setProperty('--sa-fade', wide ? clamp(1 - y / (vh * 0.95), 0.2, 1).toFixed(3) : '1');
    }
  }

  function updateTimelines(vh) {
    document.querySelectorAll('.timeline').forEach(t => {
      const r = t.getBoundingClientRect();
      let p;
      if (r.bottom < 0) p = 1;
      else if (r.top > vh) p = 0;
      else p = clamp((vh * 0.65 - r.top) / Math.max(r.height, 1), 0, 1);
      t.style.setProperty('--sa-line', p.toFixed(3));
    });
  }

  function updateCovers(vh) {
    document.querySelectorAll('.project-cover').forEach(c => {
      const r = c.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) return;
      const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2), -1, 1);
      c.style.setProperty('--cy', `${(-p * 14).toFixed(1)}px`);
    });
  }

  function updateScrollSpy(y, vh) {
    const sections = document.querySelectorAll('main > section[id]');
    if (!sections.length) return;
    let active = sections[0].id;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * 0.4) active = s.id; });
    if (y + vh >= root.scrollHeight - 4) active = sections[sections.length - 1].id;
    const links = document.querySelectorAll('.nav-menu a[href^="#"]');
    const key = active + ':' + links.length;
    if (key === lastSpyKey) return;
    lastSpyKey = key;
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + active;
      a.classList.toggle('sa-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
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
  document.addEventListener('portfolio:components-ready', () => { lastSpyKey = ''; onScroll(); });
  window.addEventListener('load', () => { lastSpyKey = ''; onScroll(); });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  // selector -> animation variant (first match wins)
  const TARGETS = [
    ['.section-head', 'fade'],      // its children animate individually
    ['.about-copy', 'left'],
    ['.fact-grid', 'right'],
    ['.timeline-item', 'left'],
    ['.skill-card', 'up'],
    ['.project', 'up'],
    ['.research-card', 'up'],
    ['.education', 'left'],
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
    ['.reveal', 'up']
  ];
  const SELECTOR = TARGETS.map(t => t[0]).join(',');
  const CHILD_SELECTOR = '.tags span, .skill-pill, .language-item, .fact';
  const DURATION = 1500;     // must outlast the longest child transition in the CSS
  const STAGGER = 90;        // ms between items revealed in the same batch
  const MAX_DELAY = 450;

  const pending = [];
  let observer = null;

  function variantFor(el) {
    for (const [sel, variant] of TARGETS) if (el.matches(sel)) return variant;
    return 'up';
  }

  function prepare(el) {
    if (el.dataset.sa || el.closest('.hero') || el.closest('.modal, .lightbox, #chatbot, [class*="greeting"]')) return;
    el.dataset.sa = el.dataset.saVariant || variantFor(el);
    // Take over from the older .reveal mechanism so the two never fight.
    el.classList.remove('reveal', 'show');
    el.classList.add('sa');
    if (observer) observer.observe(el); else pending.push(el);
  }

  function scan(node) {
    if (!(node instanceof Element)) return;
    if (node.matches(SELECTOR)) prepare(node);
    node.querySelectorAll(SELECTOR).forEach(prepare);
  }

  function reveal(entries) {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);

    visible.forEach((entry, i) => {
      const el = entry.target;
      observer.unobserve(el);
      const delay = Math.min(MAX_DELAY, i * STAGGER);
      el.style.setProperty('--sa-delay', `${delay}ms`);
      // Index the inner pieces so they cascade one after another.
      el.querySelectorAll(CHILD_SELECTOR).forEach((c, n) => c.style.setProperty('--i', n));
      el.classList.add('sa-in');
      // Once finished, drop the helper classes so the element's normal
      // hover transitions and transforms from style.css work again.
      setTimeout(() => {
        el.classList.remove('sa', 'sa-in');
        el.style.removeProperty('--sa-delay');
      }, DURATION + delay + 150);
    });
  }

  function start() {
    observer = new IntersectionObserver(reveal, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    pending.splice(0).forEach(el => observer.observe(el));
  }

  // Tag everything now (so nothing flashes), but start observing only after the
  // preloader has gone, otherwise the first screen animates out of sight.
  scan(document.body);
  new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(scan));
  }).observe(document.body, { childList: true, subtree: true });

  if (document.getElementById('preloader')) setTimeout(start, 1300); else start();
})();

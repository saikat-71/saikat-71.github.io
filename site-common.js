/*
 * Shared site functions
 * ---------------------
 * This file is used by the public pages for common things such as the header,
 * footer, theme switcher, custom cursor, SEO information and service worker.
 *
 * I keep these common features here instead of copying the same code into
 * every HTML page.
 */
/* ============================================================
   Saikat Portfolio - Shared Site System
   Single source of truth: data/portfolio.json
   Shared: header, footer, theme, cursor, navigation, SEO, PWA
   ============================================================ */
(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const page = body?.dataset.page || (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '') || 'home';
  const THEME_KEY = 'saikat-theme';
  const DATA_URL = new URL('./data/portfolio.json', location.href).href;

  const DEFAULT_SITE = {
    name: 'Md Sobahan Hasan Saikat',
    tagline: 'CSE student focused on software, analytics, machine learning and practical technology projects.',
    github: 'https://github.com/saikat-71',
    linkedin: 'https://www.linkedin.com/in/sobahansaikat/',
    email: 'md.shsaikat71@gmail.com',
    url: 'https://saikat-71.github.io/',
    navigation: [
      ['Home', 'index.html#home', 'fa-solid fa-house'],
      ['About', 'index.html#about', 'fa-solid fa-user'],
      ['Skills', 'index.html#skills', 'fa-solid fa-code'],
      ['Projects', 'projects.html', 'fa-solid fa-folder-open'],
      ['Experience', 'experience.html', 'fa-solid fa-briefcase'],
      ['Education', 'education.html', 'fa-solid fa-graduation-cap'],
      ['Research', 'research.html', 'fa-solid fa-flask'],
      ['Courses', 'courses.html', 'fa-solid fa-book-open'],
      ['Certifications', 'certificates.html', 'fa-solid fa-certificate'],
      ['Contact', 'index.html#contact', 'fa-solid fa-envelope']
    ].map(x => ({ label: x[0], href: x[1], icon: x[2] }))
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // Read the user's saved theme, falling back to the system preference.
  function getTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch (_) { return 'dark'; }
  }

  // Change the theme and remember it for the next visit.
  function applyTheme(value) {
    value = value === 'light' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, value); localStorage.removeItem('theme'); } catch (_) {}
    root.dataset.theme = value;
    body.classList.toggle('light', value === 'light');
    root.classList.toggle('theme-light-preload', value === 'light');
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const light = value === 'light';
      btn.setAttribute('aria-pressed', String(light));
      btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      const icon = btn.querySelector('i');
      if (icon) icon.className = light ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = value === 'light' ? '#f4f7fb' : '#070b10';
  }

  applyTheme(getTheme());
  window.setPortfolioTheme = applyTheme;

  function fallbackData() {
    return { site: DEFAULT_SITE, about: {}, projects: [], skills: [], education: [], experience: [], research: [], courses: [], certificates: [], visibility: {} };
  }

  function loadData() {
    if (window.__portfolioData) return Promise.resolve(window.__portfolioData);
    if (!window.__portfolioPromise) {
      window.__portfolioPromise = fetch(DATA_URL, { cache: 'no-store' })
        .then(response => {
          if (!response.ok) throw new Error('portfolio.json request failed: ' + response.status);
          return response.json();
        })
        .then(data => {
          window.__portfolioData = data;
          return data;
        });
    }
    return window.__portfolioPromise;
  }
  window.portfolioDataPromise = window.portfolioDataPromise || loadData();

  function siteOf(data) {
    const source = data?.site || {};
    return {
      ...DEFAULT_SITE,
      ...source,
      navigation: Array.isArray(source.navigation) && source.navigation.length ? source.navigation : DEFAULT_SITE.navigation
    };
  }

  // Build the shared header so every public page looks the same.
  function renderHeader(data) {
    if (body.classList.contains('admin-page')) return;
    const isHome = page === 'home' || page === 'index';
    const existing = document.querySelector('body > header.header');
    const header = existing || document.createElement('header');
    header.className = 'header';
    // Keep the original, compact portfolio header format. Content remains centralized here.
    const visibility = data?.visibility || {};
    const homeLinks = [
      ['Home', isHome ? '#home' : 'index.html#home'],
      ['About', isHome ? '#about' : 'index.html#about'],
      ['Skills', isHome ? '#skills' : 'index.html#skills'],
      ['Projects', isHome ? '#projects' : 'index.html#projects', 'projects'],
      ['Experience', isHome ? '#experience' : 'index.html#experience', 'experience'],
      ['Research', isHome ? '#research' : 'index.html#research', 'research'],
      ['Contact', isHome ? '#contact' : 'index.html#contact']
    ].filter(item => !item[2] || visibility[item[2]] !== false);
    const navHtml = homeLinks.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('');
    header.innerHTML = `
      <nav class="nav container">
        <a class="brand brand-logo" href="${isHome ? '#home' : 'index.html#home'}" aria-label="Saikat home">
          <img src="images/Logo.webp" alt="Saikat logo" loading="lazy" decoding="async">
        </a>
        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark and light mode" aria-pressed="false"><i class="fa-solid fa-sun"></i></button>
        <button class="menu-toggle" type="button" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
        <div class="nav-menu">
          ${navHtml}
          <a class="nav-cv" href="documents/CV.pdf" download>Download CV</a>
        </div>
      </nav>`;
    if (!existing) body.insertBefore(header, body.firstElementChild || null);
    applyTheme(getTheme());
    return header;
  }

  function initQuickNavigator(data) {
    if (body.classList.contains('admin-page') || document.querySelector('.quick-menu')) return;
    const site = siteOf(data);
    const wrap = document.createElement('div');
    wrap.className = 'quick-menu';
    const visibility = data?.visibility || {};
    const links = [
      ['Home', 'index.html#home', 'fa-solid fa-house'],
      ['About', 'index.html#about', 'fa-solid fa-user'],
      ['Skills', 'index.html#skills', 'fa-solid fa-code'],
      ['Projects', 'projects.html', 'fa-solid fa-folder-open', 'projects'],
      ['Experience', 'experience.html', 'fa-solid fa-briefcase', 'experience'],
      ['Education', 'education.html', 'fa-solid fa-graduation-cap', 'education'],
      ['Research', 'research.html', 'fa-solid fa-flask', 'research'],
      ['Courses', 'courses.html', 'fa-solid fa-book-open', 'courses'],
      ['Certifications', 'certificates.html', 'fa-solid fa-certificate', 'certificates'],
      ['Contact', 'index.html#contact', 'fa-solid fa-envelope'],
      ['View CV', 'documents/CV.pdf', 'fa-solid fa-file-pdf'],
      ['GitHub', site.github || 'https://github.com/saikat-71', 'fa-brands fa-github']
    ].filter(item => !item[3] || visibility[item[3]] !== false);
    wrap.innerHTML = `
      <button class="quick-menu-toggle" type="button" aria-label="Open quick navigation" aria-expanded="false"><i class="fa-solid fa-ellipsis"></i></button>
      <div class="quick-menu-panel" aria-hidden="true">
        <div class="quick-menu-head"><strong>Quick Navigation</strong><button class="quick-menu-close" type="button" aria-label="Close navigation"><i class="fa-solid fa-xmark"></i></button></div>
        ${links.map(([label, href, icon]) => `<a href="${esc(href)}"${label === 'View CV' || label === 'GitHub' ? ' target="_blank" rel="noopener"' : ''}><i class="${esc(icon)}"></i><span>${esc(label)}</span></a>`).join('')}
        <button class="quick-theme-toggle" type="button"><i class="fa-solid fa-sun"></i><span>Light / Dark Mode</span></button>
      </div>`;
    document.body.appendChild(wrap);
    const toggle = wrap.querySelector('.quick-menu-toggle');
    const panel = wrap.querySelector('.quick-menu-panel');
    const close = () => { wrap.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true'); };
    toggle.addEventListener('click', e => { e.stopPropagation(); const open = wrap.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); panel.setAttribute('aria-hidden', String(!open)); });
    wrap.querySelector('.quick-menu-close').addEventListener('click', close);
    wrap.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    wrap.querySelector('.quick-theme-toggle').addEventListener('click', () => { applyTheme(body.classList.contains('light') ? 'dark' : 'light'); });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Build the shared footer from the same portfolio data.
  function renderFooter(data) {
    if (body.classList.contains('admin-page')) return;
    const site = siteOf(data);
    const existing = document.querySelector('body > footer');
    const nav = site.navigation || DEFAULT_SITE.navigation;
    const visibility = data?.visibility || {};
    const hiddenByLabel = {
      Projects: 'projects',
      Experience: 'experience',
      Education: 'education',
      Research: 'research',
      Courses: 'courses',
      Certifications: 'certificates'
    };
    const quick = nav.filter(n => {
      const key = hiddenByLabel[n.label];
      return ['About', 'Projects', 'Experience', 'Education', 'Research', 'Courses', 'Certifications'].includes(n.label)
        && (!key || visibility[key] !== false);
    });
    const footer = existing || document.createElement('footer');
    footer.innerHTML = `
      <div class="container footer-grid">
        <div class="footer-about">
          <a class="brand brand-logo footer-logo" href="${page === 'home' ? '#home' : 'index.html#home'}"><img src="images/Logo.webp" alt="${esc(site.name)} logo" loading="lazy" decoding="async" width="92" height="40"></a>
          <p>${esc(site.tagline)}</p>
        </div>
        <div class="footer-column"><h4>Quick Links</h4>${quick.map(n => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('')}</div>
        <div class="footer-column"><h4>Explore</h4><a href="github.html">Live GitHub</a><a href="documents/CV.pdf" target="_blank" rel="noopener">View CV</a><a href="index.html#contact">Contact</a></div>
        <div class="footer-column"><h4>Connect</h4><a href="${esc(site.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i> LinkedIn</a><a href="mailto:${esc(site.email)}"><i class="fa-solid fa-envelope"></i> Email</a></div>
      </div>
      <div class="container footer-bottom"><p>© <span class="footer-year">${new Date().getFullYear()}</span> ${esc(site.name)}. All Rights Reserved.</p><span>Built with HTML, CSS &amp; JavaScript.</span></div>`;
    if (!existing) body.appendChild(footer);
    footer.querySelectorAll('.footer-year').forEach(y => y.textContent = new Date().getFullYear());
    return footer;
  }

  function applySEO(data) {
    const site = siteOf(data);
    const seo = site.seo || {};
    const info = site.pages?.[page] || site.pages?.home || {};
    let title = info.title || seo.defaultTitle || document.title || site.name;
    if (page === 'project' && location.search) {
      const id = new URLSearchParams(location.search).get('id');
      const item = (data.projects || []).find(x => x.id === id);
      if (item) title = `${item.title} | ${site.name}`;
    }
    const description = info.description || seo.defaultDescription || document.querySelector('meta[name="description"]')?.content || '';
    document.title = title;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', description);
    if (seo.keywords) setMeta('keywords', seo.keywords);
    const setProp = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };
    setProp('og:title', title); setProp('og:description', description); setProp('og:type', 'website'); setProp('og:url', location.href);
    setProp('og:image', new URL(seo.image || 'images/profile.webp', location.href).href);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = location.href.split('#')[0];
  }

  function bindInteractions() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      if (btn.dataset.themeBound) return;
      btn.dataset.themeBound = '1';
      btn.addEventListener('click', () => applyTheme(body.classList.contains('light') ? 'dark' : 'light'));
    });
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (menuButton && menu && !menuButton.dataset.bound) {
      menuButton.dataset.bound = '1';
      const close = () => { menu.classList.remove('open'); body.classList.remove('menu-open'); menuButton.querySelector('i')?.classList.replace('fa-xmark', 'fa-bars'); };
      menuButton.addEventListener('click', () => {
        const open = menu.classList.toggle('open'); body.classList.toggle('menu-open', open);
        const icon = menuButton.querySelector('i');
        if (icon) { icon.classList.toggle('fa-bars', !open); icon.classList.toggle('fa-xmark', open); }
      });
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
  }

  // Custom cursor is only enabled when a mouse/fine pointer is available.
  function initCursor() {
    if (!window.matchMedia || !matchMedia('(pointer:fine)').matches || body.dataset.cursorReady) return;
    body.dataset.cursorReady = '1';
    let dot = document.querySelector('.cursor-dot');
    let ring = document.querySelector('.cursor-ring');
    if (!dot) { dot = document.createElement('div'); dot.className = 'cursor-dot'; body.appendChild(dot); }
    if (!ring) { ring = document.createElement('div'); ring.className = 'cursor-ring'; body.appendChild(ring); }
    body.classList.add('has-custom-cursor');
    let x = -100, y = -100, raf = 0;
    const paint = () => { raf = 0; dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`; ring.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`; };
    window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    const interactive = 'a,button,input,select,textarea,[role="button"],.project,.certificate,.research-card,.education,.repo-card,.timeline-card';
    document.addEventListener('pointerover', e => { if (e.target instanceof Element && e.target.closest(interactive)) ring.classList.add('active'); }, { passive: true });
    document.addEventListener('pointerout', e => { if (e.target instanceof Element && e.target.closest(interactive) && !(e.relatedTarget instanceof Element && e.relatedTarget.closest(interactive))) ring.classList.remove('active'); }, { passive: true });
  }

  function initHeaderScrollBehavior() {
    const header = document.querySelector('body > header.header');
    if (!header || header.dataset.scrollBound === '1') return;
    header.dataset.scrollBound = '1';
    let lastY = window.scrollY || 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;
      if (y <= 12) {
        header.classList.remove('header-hidden');
      } else if (y > lastY + 4) {
        header.classList.add('header-hidden');
      } else if (y < lastY - 4) {
        header.classList.remove('header-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  // Register the service worker after the page has loaded.
  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=20261008-v9').catch(err => console.warn('PWA registration failed:', err)));
  }

  // IMPORTANT: render with fallback immediately. The header/footer must never depend on JSON/network success.
  const fallback = fallbackData();
  renderHeader(fallback);
  renderFooter(fallback);
  initQuickNavigator(fallback);
  bindInteractions();
  initHeaderScrollBehavior();
  initCursor();
  initPWA();

  loadData().then(data => {
    renderHeader(data);
    renderFooter(data);
    initQuickNavigator(data);
    applySEO(data);
    bindInteractions();
    initHeaderScrollBehavior();
    window.portfolioData = data;
    document.dispatchEvent(new CustomEvent('portfolio:components-ready', { detail: data }));
  }).catch(error => {
    console.error('Portfolio data could not be loaded:', error);
    applySEO(fallback);
    document.dispatchEvent(new CustomEvent('portfolio:components-ready', { detail: fallback }));
  });
})();

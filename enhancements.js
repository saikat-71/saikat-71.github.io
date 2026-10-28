/*
 * Extra UI improvements
 * ---------------------
 * This file contains optional helpers for the portfolio pages, such as
 * search/filter boxes, lightboxes, image fallbacks and keyboard support.
 * The main content still comes from data/portfolio.json.
 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
    );
  const page = location.pathname.split('/').pop().toLowerCase() || 'index.html';
  const controllers = {};

  // Thin progress bar at the top of the page.
  function addProgress() {
    if ($('#scrollProgress')) return;
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function addToast() {
    if ($('#siteToast')) return;
    const t = document.createElement('div');
    t.id = 'siteToast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    window.portfolioToast = (msg) => {
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._timer);
      t._timer = setTimeout(() => t.classList.remove('show'), 2200);
    };
  }
  function improveLinks() {
    $$('a[target="_blank"]').forEach((a) => {
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  }
  function addCopyEmail() {
    $$('a[href^="mailto:"]').forEach((a) => {
      if (a.dataset.copyReady) return;
      a.dataset.copyReady = '1';
    });
  }

  // Shared search/filter toolbar used on collection pages.
  function toolbar(kind, mount, options = {}) {
    if (!mount || mount.previousElementSibling?.classList.contains('collection-tools')) return null;
    const box = document.createElement('div');
    box.className = 'collection-tools';
    box.innerHTML = /* HTML */ `<div class="collection-search">
        <i class="fa-solid fa-magnifying-glass"></i
        ><input
          type="search"
          placeholder="Search ${esc(kind)}..."
          aria-label="Search ${esc(kind)}"
        />
      </div>
      ${options.filter !== false ? `<select class="collection-filter" aria-label="Filter ${esc(kind)}"><option value="">All</option></select>` : ''}<button
        type="button"
        class="collection-reset"
        aria-label="Reset search and filter"
      >
        <i class="fa-solid fa-rotate-left"></i><span>Reset</span></button
      ><span class="collection-count"></span>`;
    mount.parentNode.insertBefore(box, mount);
    return box;
  }
  function cardCategory(card) {
    return String(card.dataset.category || card.dataset.filter || '').trim();
  }
  function filterCards(box, mount, kind) {
    const input = $('input', box),
      select = $('select', box),
      count = $('.collection-count', box),
      reset = $('.collection-reset', box);
    const cards = () => $$(':scope > article', mount);
    const refresh = () => {
      const q = input.value.trim().toLowerCase(),
        f = (select?.value || '').toLowerCase();
      let visible = 0;
      cards().forEach((c) => {
        const text = c.textContent.toLowerCase();
        const cat = cardCategory(c).toLowerCase();
        const ok = !q || text.includes(q);
        const matches = !f || cat === f;
        c.hidden = !(ok && matches);
        if (ok && matches) visible++;
      });
      count.textContent = `${visible} ${kind}${visible === 1 ? '' : 's'} shown`;
      let empty = $('.collection-empty', mount);
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'collection-empty';
          mount.appendChild(empty);
        }
        empty.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><strong>No ${esc(kind)} found</strong><span>Try another keyword or filter.</span>`;
      } else if (empty) empty.remove();
    };
    const build = () => {
      if (!select) {
        refresh();
        return;
      }
      const vals = new Map();
      cards().forEach((c) => {
        const cat = cardCategory(c);
        if (cat) vals.set(cat.toLowerCase(), cat);
      });
      const current = select.value;
      const label = kind === 'project' ? 'All Categories' : 'All';
      select.innerHTML =
        `<option value="">${label}</option>` +
        Array.from(vals.values())
          .sort((a, b) => a.localeCompare(b))
          .map((v) => `<option value="${esc(v.toLowerCase())}">${esc(v)}</option>`)
          .join('');
      if ([...select.options].some((o) => o.value === current)) select.value = current;
      refresh();
    };
    input.addEventListener('input', refresh);
    if (select) select.addEventListener('change', refresh);
    if (reset)
      reset.addEventListener('click', () => {
        input.value = '';
        if (select) select.value = '';
        refresh();
        input.focus();
      });
    build();
    return { refresh, build };
  }

  function projectsPageTools() {
    if (page !== 'projects.html') return;
    const mount = $('#allProjectsGrid');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) box = toolbar('projects', mount);
    if (!box) return;
    if (controllers.projects) {
      controllers.projects.build();
      return;
    }
    controllers.projects = filterCards(box, mount, 'project');
  }
  function certificateTools() {
    if (page !== 'certificates.html') return;
    const mount = $('#certificatePageGrid');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) box = toolbar('certificates', mount, { filter: false });
    if (!box) return;
    if (controllers.certificates) {
      controllers.certificates.build();
      return;
    }
    controllers.certificates = filterCards(box, mount, 'certificate');
  }
  function researchTools() {
    if (page !== 'research.html') return;
    const mount = $('.research-full-list');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) box = toolbar('research', mount, { filter: true });
    if (!box) return;
    if (controllers.research) {
      controllers.research.build();
      return;
    }
    controllers.research = filterCards(box, mount, 'research');
  }
  function experienceTools() {
    if (page !== 'experience.html') return;
    const mount = $('.experience-timeline');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) box = toolbar('experience', mount, { filter: false });
    if (!box) return;
    if (controllers.experience) {
      controllers.experience.build();
      return;
    }
    controllers.experience = filterCards(box, mount, 'role');
  }
  function coursesTools() {
    if (page !== 'courses.html') return;
    const mount = $('.courses-page-list');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) {
      box = document.createElement('div');
      box.className = 'collection-tools';
      box.innerHTML =
        '<div class="collection-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Search courses..." aria-label="Search courses"></div>';
      mount.parentNode.insertBefore(box, mount);
    }
    const input = $('input', box);
    if (!input.dataset.bound) {
      input.dataset.bound = '1';
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let visible = 0;
        $$(':scope > article', mount).forEach((c) => {
          const ok = !q || c.textContent.toLowerCase().includes(q);
          c.hidden = !ok;
          if (ok) visible++;
        });
        let empty = $('.collection-empty', mount);
        if (!visible) {
          if (!empty) {
            empty = document.createElement('div');
            empty.className = 'collection-empty';
            mount.appendChild(empty);
          }
          empty.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i><strong>No courses found</strong><span>Try another keyword.</span>';
        } else if (empty) empty.remove();
      });
    }
    input.dispatchEvent(new Event('input'));
  }
  function educationTools() {
    if (page !== 'education.html') return;
    const mount = $('#educationPageList');
    if (!mount) return;
    let box = mount.previousElementSibling?.classList.contains('collection-tools')
      ? mount.previousElementSibling
      : null;
    if (!box) box = toolbar('education', mount, { filter: false });
    if (!box) return;
    if (controllers.education) {
      controllers.education.build();
      return;
    }
    controllers.education = filterCards(box, mount, 'education');
  }
  function githubTools() {
    if (page !== 'github.html') return;
    const mount = $('#repoGrid');
    if (!mount) return;
    const box = toolbar('repositories', mount, { filter: true });
    if (!box) return;
    const input = $('input', box),
      select = $('select', box),
      count = $('.collection-count', box),
      reset = $('.collection-reset', box);
    let initialized = false;
    const refresh = () => {
      const q = input.value.trim().toLowerCase(),
        f = (select?.value || '').toLowerCase();
      let n = 0;
      $$(':scope > article', mount).forEach((c) => {
        const lang = (c.dataset.language || '').toLowerCase(),
          ok = !q || c.textContent.toLowerCase().includes(q),
          matches = !f || lang === f;
        c.hidden = !(ok && matches);
        if (ok && matches) n++;
      });
      count.textContent = `${n} repositories shown`;
      let empty = $('.collection-empty', mount);
      if (!n) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'collection-empty';
          mount.appendChild(empty);
        }
        empty.innerHTML =
          '<i class="fa-solid fa-code"></i><strong>No repositories found</strong><span>Try another keyword or language.</span>';
      } else if (empty) empty.remove();
    };
    const build = () => {
      const vals = new Map();
      $$(':scope > article', mount).forEach((c) => {
        const v = c.dataset.language || '';
        if (v) vals.set(v.toLowerCase(), v);
      });
      if (select)
        select.innerHTML =
          '<option value="">All Languages</option>' +
          Array.from(vals.values())
            .sort((a, b) => a.localeCompare(b))
            .map((v) => `<option value="${esc(v.toLowerCase())}">${esc(v)}</option>`)
            .join('');
      refresh();
      initialized = true;
    };
    input.addEventListener('input', refresh);
    if (select) select.addEventListener('change', refresh);
    reset.addEventListener('click', () => {
      input.value = '';
      select.value = '';
      refresh();
      input.focus();
    });
    const obs = new MutationObserver(() => {
      if (!initialized || $$(':scope > article', mount).some((c) => !c.dataset.filterReady)) {
        $$(':scope > article', mount).forEach((c) => (c.dataset.filterReady = '1'));
        build();
      } else refresh();
    });
    obs.observe(mount, { childList: true });
  }
  // Delegated image preview for dynamically-rendered previous-work galleries.
  // The portfolio content is injected after this script initializes, so bind to
  // document instead of querying gallery cards only once at page load.
  function galleryLightbox() {
    if ($('#galleryLightbox')) return;
    const modal = document.createElement('div');
    modal.id = 'galleryLightbox';
    modal.className = 'lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Previous work image preview');
    modal.innerHTML =
      '<div class="lightbox-backdrop"></div><div class="lightbox-box"><button type="button" class="lightbox-close" aria-label="Close image preview" title="Close"><i class="fa-solid fa-xmark"></i></button><img alt=""><div class="lightbox-caption"></div></div>';
    document.body.appendChild(modal);
    const img = $('img', modal),
      cap = $('.lightbox-caption', modal),
      closeBtn = $('.lightbox-close', modal);
    let lastTrigger = null;
    const close = () => {
      if (!modal.classList.contains('open')) return;
      modal.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
      cap.textContent = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    };
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest(
        '.experience-works-panel .gallery-card img, .experience-works-panel .gallery-card'
      );
      if (!trigger) return;
      const source = trigger.matches('img') ? trigger : trigger.querySelector('img');
      if (!source || source.classList.contains('image-failed')) return;
      e.preventDefault();
      lastTrigger = source;
      img.src = source.currentSrc || source.src;
      img.alt = source.alt || 'Previous work sample';
      const card = source.closest('.gallery-card');
      cap.textContent =
        card?.querySelector('h3')?.textContent?.trim() || source.alt || 'Previous work sample';
      modal.classList.add('open');
      document.body.classList.add('lightbox-open');
      closeBtn.focus({ preventScroll: true });
    });
    $('.lightbox-backdrop', modal).addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtn.focus();
      }
    });
  }
  // If an image fails, use the favicon instead of showing a broken image.
  function imageFallbacks() {
    $$('img').forEach((img) => {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = '1';
      img.addEventListener('error', () => {
        img.classList.add('image-failed');
        if (img.dataset.fallback !== 'done') {
          img.dataset.fallback = 'done';
          img.src = 'images/favicon.webp';
        }
      });
    });
  }
  function keyboardFocus() {
    document.documentElement.classList.add('keyboard-ready');
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Tab') document.documentElement.classList.add('keyboard-user');
      },
      { once: true }
    );
  }
  // Subtle magnetic pull for button-like controls on fine-pointer devices only.
  // Uses CSS individual translate so existing transforms remain intact.
  function addMagneticControls() {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return;
    const selector =
      'button, .btn, a.btn, .nav-cv, .hero-actions a, .project a, .certificate a, .research-card a, .action-btn, [data-magnetic]';
    $$(selector).forEach((el) => {
      if (el.dataset.magneticReady || el.disabled || el.getAttribute('aria-disabled') === 'true')
        return;
      el.dataset.magneticReady = '1';
      let raf = 0;
      const reset = () => {
        cancelAnimationFrame(raf);
        el.style.translate = '';
      };
      el.addEventListener(
        'pointermove',
        (event) => {
          if (event.pointerType !== 'mouse') return;
          const rect = el.getBoundingClientRect();
          const x = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width / 2, 1);
          const y = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height / 2, 1);
          const dx = Math.max(-1, Math.min(1, x)) * 4;
          const dy = Math.max(-1, Math.min(1, y)) * 3;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            el.style.translate = `${dx}px ${dy}px`;
          });
        },
        { passive: true }
      );
      el.addEventListener('pointerleave', reset, { passive: true });
      el.addEventListener('blur', reset);
    });
  }
  // Particle background (shared by every page that has <canvas id="particles">).
  // Sized by screen area and drawn larger/brighter on phones so it stays visible there.
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas || canvas.dataset.running === 'true') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.dataset.running = 'true';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0,
      h = 0,
      dpr = 1,
      mobile = false,
      ps = [];

    const makeParticle = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * (mobile ? 0.45 : 0.28) * (reduceMotion ? 0.5 : 1),
      vy: (Math.random() - 0.5) * (mobile ? 0.45 : 0.28) * (reduceMotion ? 0.5 : 1),
      r: (Math.random() * 1.5 + 0.5) * (mobile ? 1.5 : 1),
    });

    function resize() {
      const widthChanged = Math.abs(window.innerWidth - w) > 1;
      w = window.innerWidth;
      h = window.innerHeight;
      mobile = w <= 768;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Mobile browsers fire resize when the address bar hides; keep particles in that case.
      if (widthChanged || !ps.length) {
        const count = Math.min(90, Math.max(mobile ? 42 : 30, Math.floor((w * h) / 14000)));
        ps = Array.from({ length: count }, makeParticle);
      } else {
        ps.forEach((p) => {
          p.y = Math.min(p.y, h);
        });
      }
    }

    function draw() {
      if (document.hidden) {
        requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      const light = document.body.classList.contains('light');
      const rgb = light ? '7,158,114' : '32,227,162';
      const dotAlpha = mobile ? 0.6 : 0.3;
      const linkAlpha = mobile ? 0.22 : 0.09;
      const linkDist = mobile ? 120 : 110;
      ctx.fillStyle = `rgba(${rgb},${dotAlpha})`;
      ps.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.lineWidth = 0.6;
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(${rgb},${linkAlpha * (1 - d / linkDist)})`;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  function init() {
    initParticles();
    addMagneticControls();
    addProgress();
    addToast();
    improveLinks();
    addCopyEmail();
    galleryLightbox();
    imageFallbacks();
    keyboardFocus();
    projectsPageTools();
    certificateTools();
    researchTools();
    experienceTools();
    educationTools();
    coursesTools();
    githubTools();
    document.addEventListener('portfolio:loaded', () => {
      addMagneticControls();
      projectsPageTools();
      certificateTools();
      researchTools();
      experienceTools();
      educationTools();
      coursesTools();
      githubTools();
      Object.values(controllers).forEach((c) => c && c.build && c.build());
      imageFallbacks();
    });
    document.addEventListener('portfolio:projects-rendered', () => {
      addMagneticControls();
      projectsPageTools();
      controllers.projects && controllers.projects.build();
      imageFallbacks();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

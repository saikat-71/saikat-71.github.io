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
  // Optional public URL for the secure AI Worker. Leave blank to use local answers.
  const CHAT_API_ENDPOINT = 'https://saikat-portfolio-chatbot.md-shsaikat71.workers.dev/'; // Set to your deployed Worker URL after setup; never place API keys here.

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

  // Portfolio-aware chatbot. All factual answers are sourced from portfolio.json.
  function initGreetingAvatar() {
    if (body.classList.contains('admin-page') || document.querySelector('.greeting-assistant')) return;
    const assistant = document.createElement('aside');
    assistant.className = 'greeting-assistant';
    assistant.setAttribute('aria-label', 'Portfolio chatbot');
    assistant.innerHTML = `
      <section class="greeting-bubble" id="greetingBubble" aria-label="Portfolio chatbot" aria-hidden="true">
        <header class="greeting-chat-header">
          <span class="greeting-bot-mark" aria-hidden="true"><i class="fa-solid fa-robot"></i><span></span></span>
          <span class="greeting-chat-heading"><strong>Saikat's Portfolio Assistant</strong><small><span class="greeting-status-dot"></span> <span class="greeting-status-text">Ready to Help</span></small></span>
          <button class="greeting-reset" type="button" aria-label="Start a new conversation" title="New conversation"><i class="fa-solid fa-rotate-left"></i></button>
          <button class="greeting-dismiss" type="button" aria-label="Close chatbot"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="greeting-chat-body" aria-live="polite">
          <div class="greeting-chat-welcome"><strong class="greeting-title">Hello there!</strong><p class="greeting-message">Welcome to my portfolio. Ask me about Saikat, or choose a suggested question.</p></div>
          <div class="greeting-messages" role="log" aria-label="Conversation" aria-live="polite"></div>
        </div>
        <div class="greeting-questions" aria-label="Suggested questions">
          <button type="button" data-question="Who is Saikat?">Who is Saikat?</button>
          <button type="button" data-question="What are his skills?">What are his skills?</button>
          <button type="button" data-question="Tell me about his projects.">Tell me about his projects.</button>
          <button type="button" data-question="How can I contact him?">How can I contact him?</button>
          <button type="button" data-question="Where can I find his CV?">Where can I find his CV?</button>
        </div>
        <form class="greeting-chat-input" aria-label="Ask about the portfolio">
          <input type="text" class="greeting-user-input" placeholder="Ask about Saikat..." aria-label="Your question" maxlength="240" autocomplete="off">
          <button type="submit" aria-label="Send question"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </section>
      <button class="greeting-avatar" type="button" aria-label="Open portfolio chatbot" aria-expanded="false" aria-controls="greetingBubble">
        <span class="greeting-bot-orb" aria-hidden="true"><i class="fa-solid fa-robot"></i><span class="greeting-bot-spark"></span></span>
        <span class="greeting-online-dot" aria-hidden="true"></span>
      </button>`;
    body.appendChild(assistant);

    const bubble = assistant.querySelector('.greeting-bubble');
    const avatar = assistant.querySelector('.greeting-avatar');
    const title = assistant.querySelector('.greeting-title');
    const welcome = assistant.querySelector('.greeting-chat-welcome');
    const questions = assistant.querySelector('.greeting-questions');
    const messages = assistant.querySelector('.greeting-messages');
    const form = assistant.querySelector('.greeting-chat-input');
    const input = assistant.querySelector('.greeting-user-input');
    const statusText = assistant.querySelector('.greeting-status-text');
    if (statusText && window.PORTFOLIO_CHAT_API_URL) statusText.textContent = 'AI + portfolio sources';
    let portfolio = window.portfolioData || null;
    let hasConversation = false;
    let manuallyInteracted = false;
    let autoGreetingOpen = false;
    let pageScrollY = 0;
    let scrollLocked = false;
    let savedBodyStyles = null;
    let requestBusy = false;
    const AI_ENDPOINT = String(window.PORTFOLIO_CHAT_API_URL || CHAT_API_ENDPOINT || '').trim(); // Public endpoint URL only; never put a secret here.
    const HISTORY_KEY = 'saikatPortfolioChatHistoryV1';
    const WELCOME_KEY = 'portfolioGreetingShown';

    function greetingText() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return '☀️ Good morning!';
      if (hour >= 12 && hour < 14) return '🌤️ Good noon!';
      if (hour >= 14 && hour < 18) return '🌤️ Good afternoon!';
      if (hour >= 18 && hour < 21) return '🌇 Good evening!';
      return '🌙 Good night!';
    }
    function lockPageScroll() {
      if (scrollLocked) return;
      pageScrollY = window.scrollY || window.pageYOffset || 0;
      scrollLocked = true;
      savedBodyStyles = {position:body.style.position,top:body.style.top,left:body.style.left,right:body.style.right,width:body.style.width,overflow:body.style.overflow};
      body.dataset.chatScrollLocked = 'true';
      body.style.position = 'fixed';
      body.style.top = `-${pageScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
    }
    function unlockPageScroll() {
      if (!scrollLocked) return;
      scrollLocked = false;
      delete body.dataset.chatScrollLocked;
      if (savedBodyStyles) { Object.entries(savedBodyStyles).forEach(([key,value]) => { body.style[key] = value; }); savedBodyStyles = null; }
      window.scrollTo(0, pageScrollY);
    }
    function openChat(showGreeting = false) {
      lockPageScroll();
      assistant.classList.add('greeting-open');
      bubble.setAttribute('aria-hidden', 'false');
      avatar.setAttribute('aria-expanded', 'true');
      if (showGreeting && !hasConversation) title.textContent = greetingText();
    }
    function closeChat() {
      assistant.classList.remove('greeting-open');
      bubble.setAttribute('aria-hidden', 'true');
      avatar.setAttribute('aria-expanded', 'false');
      unlockPageScroll();
    }
    function textOf(value) {
      if (value == null) return '';
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join('; ');
      if (typeof value === 'object') return Object.entries(value).filter(([k,v]) => !['icon','image','logo','preview','file','credentialUrl'].includes(k) && (typeof v !== 'object' || v === null || Array.isArray(v))).map(([k,v]) => `${k}: ${textOf(v)}`).filter(x => !x.endsWith(': ')).join('. ');
      return '';
    }
    const arr = value => Array.isArray(value) ? value : [];
    const clean = value => textOf(value).replace(/\s+/g, ' ').trim();
    const first = (...values) => values.map(clean).find(Boolean) || '';
    function answerFor(raw) {
      const q = String(raw || '').toLowerCase().trim().replace(/[’‘]/g, "'");
      const d = portfolio || window.portfolioData || window.__portfolioData || {};
      const site = d.site || {}, about = d.about || {};
      const join = values => values.filter(Boolean).join('\n');
      const skills = arr(d.skills).map(x => {
        const list = arr(x.skills).map(clean).filter(Boolean);
        return list.length ? `${first(x.title, 'Skills')}: ${list.join(', ')}` : '';
      }).filter(Boolean);
      const projectSummary = x => {
        const title = first(x.title, x.name);
        const rawDesc = first(x.description, x.overview, x.objective);
        const desc = rawDesc.length > 240 ? rawDesc.slice(0, 237).trimEnd() + '…' : rawDesc;
        const tech = arr(x.tech || x.technologies || x.tools || x.stack).map(clean).filter(Boolean);
        return title ? `${title}${desc ? ` — ${desc}` : ''}${tech.length ? ` (Technologies: ${tech.join(', ')})` : ''}` : '';
      };
      if (!q) return 'Please enter a question about the portfolio.';
      if (/^(hi|hello|hey|salam|assalamu alaikum|good morning|good afternoon|good evening|good night)[!. ]*$/.test(q)) return `${greetingText()} I can answer questions using information published in this portfolio.`;
      if (/\b(cv|resume|résumé|curriculum vitae)\b/.test(q)) return 'Saikat’s CV: documents/CV.pdf';
      if (/\b(contact|email|e-mail|phone|reach|linkedin|github|social link|connect)\b/.test(q)) {
        const facts = arr(about.facts);
        const email = first(site.email, facts.find(x => /email/i.test(x?.label || ''))?.value);
        const phone = first(site.phone, facts.find(x => /phone/i.test(x?.label || ''))?.value);
        const items = [email ? `Email: ${email}` : '', phone ? `Phone: ${phone}` : '', site.github ? `GitHub: ${site.github}` : '', site.linkedin ? `LinkedIn: ${site.linkedin}` : '', site.url ? `Portfolio: ${site.url}` : ''];
        return items.some(Boolean) ? join(items) : 'Contact details are not available in the portfolio data. Please use the website’s Contact section if available.';
      }
      if (/\b(skill|skills|technology|technologies|programming|language|framework|tools|technical|stack)\b/.test(q)) return skills.length ? skills.join('\n') : 'Skills information is not available in the portfolio data.';
      if (/\b(project|projects|portfolio work|built|developed|application|system|dashboard)\b/.test(q)) {
        const sourceProjects = arr(d.projects);
        const specificTerms = [...new Set(q.split(/[^a-z0-9+#.]+/).filter(w => w.length > 3 && !['tell','about','project','projects','portfolio','work','built','developed','what','which','that','with','from','this','his','have','does'].includes(w)))];
        const specific = sourceProjects.map(x => ({x, title:first(x.title,x.name).toLowerCase(), hay:clean(x).toLowerCase()})).filter(r => specificTerms.some(w => r.title.includes(w)));
        const chosen = specific.length && !/\b(all|every|list|which projects|his projects|about his projects)\b/.test(q) ? specific.map(r=>r.x) : sourceProjects;
        const projects = chosen.map(projectSummary).filter(Boolean);
        if (!projects.length) return 'Project information is not available in the portfolio data.';
        return projects.slice(0, /\b(all|every|list|which projects|his projects|about his projects)\b/.test(q) ? projects.length : (specific.length ? 1 : 4)).map((x,i) => `${i+1}. ${x.length > 520 ? x.slice(0,517).trimEnd()+'…' : x}`).join('\n');
      }
      if (/\b(research|paper|publication|brain drain|conference|methodology|dataset|findings)\b/.test(q)) {
        const items = arr(d.research).map(x => `${first(x.title, 'Research')}${first(x.type) ? ` — ${clean(x.type)}` : ''}${first(x.status) ? ` (${clean(x.status)})` : ''}${first(x.abstract, x.description) ? `: ${first(x.abstract, x.description)}` : ''}`).filter(Boolean);
        if (items.length) return items.slice(0, 3).join('\n');
        const interests = arr(d.researchInterests).map(clean).filter(Boolean);
        return interests.length ? `Research interests: ${interests.join(', ')}.` : 'Research information is not available in the portfolio data.';
      }
      if (/\b(certification|certifications|certificate|certificates|course|courses|training|credential)\b/.test(q)) {
        const items = [...arr(d.courses), ...arr(d.certificates)].map(x => [first(x.title), first(x.provider), first(x.year, x.date, x.certificateDate), first(x.description)].filter(Boolean).join(' — ')).filter(Boolean);
        return items.length ? items.slice(0, /all|every|list/.test(q) ? items.length : 4).join('\n') : 'Course and certification information is not available in the portfolio data.';
      }
      if (/\b(education|academic|university|degree|study|studies|aiub|student|graduat|major)\b/.test(q)) {
        const items = arr(d.education).map(x => [first(x.title), first(x.institution), first(x.date, x.year), first(x.major), first(x.description)].filter(Boolean).join(' — ')).filter(Boolean);
        return items.length ? items.slice(0, 3).join('\n') : 'Education information is not available in the portfolio data.';
      }
      if (/\b(experience|employment|career|job|professional role|work history|worked|internship)\b/.test(q)) {
        const items = arr(d.experience).map(x => [first(x.title), first(x.company), first(x.date, x.joiningDate), first(x.description), first(x.tools)].filter(Boolean).join(' — ')).filter(Boolean);
        return items.length ? items.slice(0, 3).join('\n') : 'Professional experience information is not available in the portfolio data.';
      }
      if (/\b(who is|who's|about|introduce|profile|background|tell me about|saikat)\b/.test(q)) {
        const name = first(about.heroName, site.name);
        const intro = arr(about.paragraphs).map(clean).filter(Boolean).slice(0, 2).join(' ');
        const subtitle = first(about.heroSubtitle, site.tagline);
        return [name, subtitle, intro].filter(Boolean).join('\n') || 'Profile information is not available in the portfolio data.';
      }
      const stop = new Set('what which who whom whose when where why how tell me about the and for from does do did is are was were has have his her their this that with into using use can could would will please saikat portfolio more'.split(' '));
      const terms = [...new Set(q.split(/[^a-z0-9+#.]+/).filter(w => w.length > 2 && !stop.has(w)))];
      const records = [];
      for (const [key, items] of Object.entries({projects:d.projects, skills:d.skills, education:d.education, experience:d.experience, research:d.research, courses:d.courses, certificates:d.certificates})) {
        for (const item of arr(items)) {
          const full = clean(item), hay = full.toLowerCase();
          const matched = terms.filter(w => hay.includes(w));
          const score = matched.length / Math.max(terms.length, 1);
          if (matched.length && (matched.length >= 2 || (terms.length === 1 && terms[0].length >= 5))) records.push({score, matched:matched.length, full});
        }
      }
      records.sort((a,b) => b.score - a.score || b.matched - a.matched);
      if (records.length && records[0].score >= 0.5) return `Related portfolio information: ${records[0].full.slice(0, 500)}`;
      return 'I couldn’t find that information in the published portfolio, so I won’t guess. Try asking about skills, projects, education, experience, research, courses, contact details, or the CV.';
    }
    async function requestAI(question) {
      if (!AI_ENDPOINT) return null;
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(AI_ENDPOINT, {
          method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
          body:JSON.stringify({question})
        });
        if (!response.ok) throw new Error(`AI service returned ${response.status}`);
        const payload = await response.json();
        const answer = typeof payload.answer === 'string' ? payload.answer.trim() : '';
        if (!answer || answer.length > 5000) throw new Error('AI service returned an invalid answer');
        return answer;
      } finally { window.clearTimeout(timer); }
    }
    function persistHistory() {
      try {
        const history = [...messages.children].map(el => ({role: el.dataset.role, text: el.querySelector('.greeting-message-text')?.textContent || ''})).filter(x => x.text);
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-40)));
      } catch (_) {}
    }
    function appendMessage(role, text, save = true) {
      const item = document.createElement('div');
      item.className = `greeting-chat-message ${role === 'user' ? 'is-user' : 'is-bot'}`;
      item.dataset.role = role;
      const label = document.createElement('strong');
      label.className = 'greeting-message-label';
      label.textContent = role === 'user' ? 'You' : 'Portfolio assistant';
      const content = document.createElement('p');
      content.className = 'greeting-message-text';
      content.textContent = text;
      item.append(label, content);
      messages.appendChild(item);
      welcome.hidden = true;
      questions.hidden = true;
      hasConversation = true;
      messages.scrollTop = messages.scrollHeight;
      if (save) persistHistory();
    }
    async function sendQuestion(question) {
      if (requestBusy) return;
      appendMessage('user', question);
      requestBusy = true;
      const sendButton = form.querySelector('button[type=submit]');
      if (sendButton) { sendButton.disabled = true; sendButton.setAttribute('aria-busy','true'); }
      const resetButton = assistant.querySelector('.greeting-reset'); if (resetButton) resetButton.disabled = true;
      const pending = document.createElement('div');
      pending.className = 'greeting-chat-message is-bot greeting-chat-loading';
      pending.setAttribute('role','status'); pending.textContent = 'Thinking…'; messages.appendChild(pending); messages.scrollTop = messages.scrollHeight;
      try {
        let reply = null;
        try { reply = await requestAI(question); } catch (error) { console.warn('Portfolio AI unavailable; using verified local answer.', error); }
        pending.remove();
        appendMessage('assistant', reply || answerFor(question));
      } finally {
        pending.remove(); requestBusy = false;
        if (sendButton) { sendButton.disabled = false; sendButton.removeAttribute('aria-busy'); }
        if (resetButton) resetButton.disabled = false;
      }
    }
    function resetChat() {
      if (requestBusy) return;
      messages.replaceChildren();
      hasConversation = false;
      welcome.hidden = false;
      questions.hidden = false;
      title.textContent = 'Hello there!';
      try { sessionStorage.removeItem(HISTORY_KEY); } catch (_) {}
      openChat(false);
      input.focus();
    }
    assistant.querySelector('.greeting-reset').addEventListener('click', resetChat);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && assistant.classList.contains('greeting-open')) closeChat(); });
    avatar.addEventListener('click', () => {
      manuallyInteracted = true;
      autoGreetingOpen = false;
      if (assistant.classList.contains('greeting-open')) closeChat();
      else openChat(!hasConversation);
    });
    assistant.querySelector('.greeting-dismiss').addEventListener('click', () => { manuallyInteracted = true; autoGreetingOpen = false; closeChat(); });
    assistant.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => sendQuestion(button.dataset.question)));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      input.value = '';
      try { if (!portfolio && window.portfolioDataPromise) portfolio = await window.portfolioDataPromise; } catch (_) {}
      sendQuestion(question);
    });
    if (window.portfolioDataPromise && typeof window.portfolioDataPromise.then === 'function') window.portfolioDataPromise.then(data => { portfolio = data || portfolio; }).catch(() => {});
    try {
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(history)) history.slice(-40).forEach(x => { if (x && (x.role === 'user' || x.role === 'assistant') && typeof x.text === 'string') appendMessage(x.role, x.text, false); });
      if (messages.children.length) { hasConversation = true; welcome.hidden = true; questions.hidden = true; }
    } catch (_) {}
    // Show the automatic greeting only once per tab session. Navigation does not reopen it.
    let greeted = false;
    try { greeted = sessionStorage.getItem(WELCOME_KEY) === '1'; } catch (_) {}
    if (!greeted) {
      window.setTimeout(() => { if (!hasConversation && !manuallyInteracted) { autoGreetingOpen = true; openChat(true); } }, 650);
      window.setTimeout(() => { if (autoGreetingOpen && !hasConversation && assistant.classList.contains('greeting-open')) closeChat(); autoGreetingOpen = false; }, 7000);
      try { sessionStorage.setItem(WELCOME_KEY, '1'); } catch (_) {}
    }
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
    setProp('og:title', title); setProp('og:description', description); setProp('og:type', 'website'); setProp('og:url', location.href.split('#')[0]);
    const socialImage = new URL(seo.image || 'images/profile.png', new URL('./', location.href)).href;
    setProp('og:image', socialImage);
    setProp('twitter:card', 'summary_large_image');
    setProp('twitter:title', title);
    setProp('twitter:description', description);
    setProp('twitter:image', socialImage);
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
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=20261020-v17').catch(err => console.warn('PWA registration failed:', err)));
  }

  // IMPORTANT: render with fallback immediately. The header/footer must never depend on JSON/network success.
  const fallback = fallbackData();
  renderHeader(fallback);
  renderFooter(fallback);
  initQuickNavigator(fallback);
  initGreetingAvatar();
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

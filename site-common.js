(function(){
  'use strict';

  // Keep one theme key across every page (legacy "theme" is migrated once).
  const legacy=localStorage.getItem('theme');
  if(!localStorage.getItem('saikat-theme') && legacy){
    localStorage.setItem('saikat-theme',legacy);
  }
  localStorage.removeItem('theme');

  // Floating 3-dot quick navigation: available even when the user is deep in a page.
  if(!document.querySelector('.quick-menu')){
    const wrap=document.createElement('div');
    wrap.className='quick-menu';
    wrap.innerHTML=`
      <button class="quick-menu-toggle" type="button" aria-label="Open quick navigation" aria-expanded="false">
        <i class="fa-solid fa-ellipsis"></i>
      </button>
      <div class="quick-menu-panel" aria-hidden="true">
        <div class="quick-menu-head"><strong>Quick Navigation</strong><button class="quick-menu-close" type="button" aria-label="Close navigation"><i class="fa-solid fa-xmark"></i></button></div>
        <a href="index.html#home"><i class="fa-solid fa-house"></i> Home</a>
        <a href="index.html#about"><i class="fa-solid fa-user"></i> About</a>
        <a href="index.html#skills"><i class="fa-solid fa-code"></i> Skills</a>
        <a href="index.html#projects"><i class="fa-solid fa-folder-open"></i> Projects</a>
        <a href="experience.html"><i class="fa-solid fa-briefcase"></i> Experience</a>
        <a href="education.html"><i class="fa-solid fa-graduation-cap"></i> Academic Background</a>
        <a href="research.html"><i class="fa-solid fa-flask"></i> Academic Research</a>
        <a href="courses.html"><i class="fa-solid fa-book-open"></i> Additional Courses</a>
        <a href="certificates.html"><i class="fa-solid fa-certificate"></i> Learning & Certifications</a>
        <a href="github.html"><i class="fa-brands fa-github"></i> GitHub</a>
        <a href="index.html#contact"><i class="fa-solid fa-envelope"></i> Contact</a>
        <a href="documents/CV.pdf" target="_blank" rel="noopener"><i class="fa-solid fa-file-pdf"></i> View CV</a>
        <a class="quick-whatsapp" href="https://wa.me/8801751027271" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>`;
    document.body.appendChild(wrap);
    const toggle=wrap.querySelector('.quick-menu-toggle');
    const panel=wrap.querySelector('.quick-menu-panel');
    const close=()=>{wrap.classList.remove('open');toggle.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true')};
    toggle.addEventListener('click',()=>{const open=wrap.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));});
    wrap.querySelector('.quick-menu-close').addEventListener('click',close);
    wrap.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
})();

/* ===== Global resilient custom cursor ===== */
(function(){
  if(!window.matchMedia || !matchMedia('(pointer:fine)').matches) return;
  let dot=document.querySelector('.cursor-dot');
  let ring=document.querySelector('.cursor-ring');
  if(!dot){ dot=document.createElement('div'); dot.className='cursor-dot'; dot.setAttribute('aria-hidden','true'); document.body.appendChild(dot); }
  if(!ring){ ring=document.createElement('div'); ring.className='cursor-ring'; ring.setAttribute('aria-hidden','true'); document.body.appendChild(ring); }
  document.body.classList.add('has-custom-cursor');
  const interactive='a,button,input,select,textarea,[role="button"],.project,.certificate,.research-card,.education,.repo-card,.timeline-card';
  const move=e=>{
    const x=e.clientX, y=e.clientY;
    dot.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    ring.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
  };
  window.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerover',e=>{if(e.target instanceof Element && e.target.closest(interactive)) ring.classList.add('active');});
  document.addEventListener('pointerout',e=>{
    if(!(e.target instanceof Element)) return;
    if(e.target.closest(interactive) && !(e.relatedTarget instanceof Element && e.relatedTarget.closest(interactive))) ring.classList.remove('active');
  });
})();


/* ===== Single global theme controller ===== */
(function(){
  'use strict';
  const body=document.body;
  const root=document.documentElement;
  const key='saikat-theme';
  function getTheme(){
    const t=localStorage.getItem(key)||localStorage.getItem('theme');
    return t==='light'?'light':'dark';
  }
  function applyTheme(theme){
    const light=theme==='light';
    body.classList.toggle('light',light);
    root.dataset.theme=theme;
    root.classList.toggle('theme-light-preload',light);
    document.querySelectorAll('.theme-toggle').forEach(btn=>{
      btn.setAttribute('aria-pressed',String(light));
      btn.setAttribute('title',light?'Switch to dark mode':'Switch to light mode');
      btn.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
      const icon=btn.querySelector('i');
      if(icon) icon.className=light?'fa-solid fa-moon':'fa-solid fa-sun';
    });
  }
  function setTheme(theme){
    theme=theme==='light'?'light':'dark';
    localStorage.setItem(key,theme);
    localStorage.removeItem('theme');
    applyTheme(theme);
  }
  window.setPortfolioTheme=setTheme;
  applyTheme(getTheme());
  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    if(btn.dataset.themeSyncBound==='1') return;
    btn.dataset.themeSyncBound='1';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      setTheme(body.classList.contains('light')?'dark':'light');
    });
  });
  window.addEventListener('storage',e=>{
    if(e.key===key) applyTheme(e.newValue==='light'?'light':'dark');
  });
})();

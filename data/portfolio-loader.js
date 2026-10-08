/*
 * Portfolio data loader
 * ---------------------
 * The website keeps most content in data/portfolio.json. This file reads that
 * JSON and puts the information into the HTML pages. Keeping the content in
 * one JSON file makes future updates much easier.
 *
 * The functions below are intentionally kept separate by section so it is
 * easy to find the code for projects, education, certificates, etc.
 */
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  
  // Skills are grouped in the JSON and rendered as cards.
  function renderSkills(data){const root=document.querySelector('.skill-groups');if(!root)return;root.innerHTML=(data.skills||[]).map(s=>`<article class="skill-card reveal"><div class="skill-icon"><i class="${esc(s.icon||'fa-solid fa-star')}"></i></div><h3>${esc(s.title)}</h3>${s.id==='programming'&&s.proficiency?`<div class="language-list">${(s.skills||[]).map(x=>{const n=Math.max(0,Math.min(100,Number(s.proficiency[x]||0)));return `<div class="language-item"><div class="language-top"><span>${esc(x)}</span><strong>${n}%</strong></div><div class="language-track"><span style="width:${n}%"></span></div></div>`}).join('')}</div>`:`<div class="tags">${(s.skills||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div>`}${s.note?`<p class="skill-note">${esc(s.note)}</p>`:''}</article>`).join('');}
  // Render project cards from the projects array.
  function renderProjects(data){const root=document.querySelector('.project-grid');if(!root)return;const items=(data.projects||[]).filter(p=>p.featured!==false);root.innerHTML=items.map((p,i)=>`<article class="project reveal"><div class="project-cover"><img src="${esc(p.cover)}" alt="${esc(p.title)} project cover"><div class="cover-label">${esc(p.label||'PROJECT')}</div></div><div class="project-top"><span class="project-number">${String(i+1).padStart(2,'0')}</span><a href="${esc(p.repo||'#')}" target="_blank" rel="noopener" aria-label="Open GitHub"><i class="fa-brands fa-github"></i></a></div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="tags">${(p.tech||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="project-actions"><a class="project-details btn btn-primary" href="project.html?id=${encodeURIComponent(p.id)}"><i class="fa-solid fa-arrow-right"></i> View project</a>${p.report?`<a class="report-link" href="${esc(p.report)}" target="_blank"><i class="fa-solid fa-file-pdf"></i> Report</a>`:''}</div></article>`).join('');}
  // Home shows the main degree; education.html shows the full list.
  function renderEducation(data){const root=document.querySelector(".education-list");if(!root)return;const isHome=document.body.dataset.page==="home"||document.body.dataset.page==="index";const allItems=(data.education||[]).filter(e=>e.featured!==false);const items=isHome?allItems.filter(e=>/B\.Sc|Bachelor|Undergraduate/i.test(String(e.title||""))).slice(0,1):allItems;root.innerHTML=items.map(e=>`<article class="education reveal"><div class="edu-icon"><i class="${esc(e.icon||"fa-solid fa-graduation-cap")}"></i></div><div><div class="edu-date">${esc(e.date||"")}</div><h3>${esc(e.title||"")}</h3><h4>${esc(e.institution||"")}</h4>${e.major?`<div class="edu-major"><span>Major / Group</span><strong>${esc(e.major)}</strong></div>`:""}<p>${esc(e.description||"")}</p></div></article>`).join("")||`<div class="collection-empty"><strong>No academic records available.</strong></div>`;const section=data.site?.sections?.education||{};const head=document.querySelector("#education .section-head");if(head){const num=head.querySelector("span");const title=head.querySelector("h2");const desc=head.querySelector("p");if(num)num.textContent=`${section.number||"05"} / ${section.label||"EDUCATION"}`;if(title)title.innerHTML=esc(section.title||"Academic background.");if(desc)desc.textContent=section.description||"";}const more=document.querySelector("#education [data-education-more]");if(more){more.textContent=section.moreLabel||"See More Academic Background";more.href=section.moreHref||"education.html";}}
  // Render current/previous professional experience.
  function renderExperience(data){
    const root=document.querySelector('#experience .timeline, .experience-timeline');
    if(!root)return;
    const isSubpage=root.classList.contains('experience-timeline');
    const formatDate=(e)=>{
      if(e.currentlyWorking){return `${e.joiningDate||e.date||''} – Present`}
      if(e.joiningDate||e.endDate){return [e.joiningDate,e.endDate].filter(Boolean).join(' – ')}
      return e.date||'';
    };
    const items=(data.experience||[]).filter(e=>isSubpage || e.featured!==false);
    root.innerHTML=items.map((e,i)=>{
      const workId=`experience-${esc(e.id||i)}-works`;
      const works=Array.isArray(e.previousWorks)?e.previousWorks:[];
      const tools=Array.isArray(e.tools)?e.tools:[];
      const skills=Array.isArray(e.skills)?e.skills:[];
      const showLogo=e.showLogo!==false;
      const showWorks=e.showPreviousWorks!==false;
      const details=isSubpage?`<div class="experience-meta-grid">
          <div><small>JOINED</small><strong>${esc(e.joiningDate||e.date||'—')}</strong></div>
          <div><small>${e.currentlyWorking?'STATUS':'ENDED'}</small><strong>${e.currentlyWorking?'Currently working here':esc(e.endDate||'—')}</strong></div>
        </div>
        <div class="experience-detail-group"><span>TOOLS</span><div class="tags">${tools.length?tools.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Not added yet</span>'}</div></div>
        <div class="experience-detail-group"><span>SKILLS</span><div class="tags">${skills.length?skills.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Not added yet</span>'}</div></div>`:'';
      return `<article class="timeline-item${isSubpage?'':' reveal'}" id="experience-${esc(e.id||i)}" data-category="${esc(e.category||'Experience')}">
        <div class="timeline-marker"></div>
        <div class="timeline-date">${esc(formatDate(e))}</div>
        <div class="timeline-card">
          ${showLogo&&e.logo?`<div class="company-heading"><img src="${esc(e.logo)}" alt="${esc(e.company||'')} company logo" loading="lazy" decoding="async"><div><h3>${esc(e.title||'')}</h3><h4>${esc(e.company||'')}</h4></div></div>`:`<h3>${esc(e.title||'')}</h3><h4>${esc(e.company||'')}</h4>`}
          ${(e.description||[]).map(x=>`<p>${esc(x)}</p>`).join('')}
          ${details}
          ${isSubpage&&showWorks?`<div class="experience-actions"><button type="button" class="btn btn-primary experience-works-button" data-work-toggle="${esc(workId)}" aria-expanded="false"><i class="fa-solid fa-images"></i> View Previous Works <i class="fa-solid fa-chevron-down toggle-icon"></i></button></div>`:''}
        </div>
      </article>
      ${isSubpage&&showWorks?`<section class="experience-works-panel" id="${workId}" hidden>
        <div class="section-head"><span>${esc((e.company||'COMPANY').toUpperCase())} / PREVIOUS WORKS</span><h2>Selected <em>creative work.</em></h2><p>Selected work samples from this professional experience.</p></div>
        ${works.length?`<div class="gallery-grid">${works.map((w,j)=>`<article class="gallery-card"><img src="${esc(w.image||'')}" alt="${esc(w.title||`${e.company||'Company'} work sample ${j+1}`)}" loading="lazy" decoding="async"><div><span>WORK SAMPLE ${String(j+1).padStart(2,'0')}</span><h3>${esc(w.title||`${e.company||'Company'} Work`)}</h3></div></article>`).join('')}</div>`:`<div class="empty-state"><i class="fa-solid fa-images"></i><p>No previous work samples have been added yet.</p><small>Additional work samples are not currently available.</small></div>`}
      </section>`:''}`;
    }).join('');
    if(!isSubpage){
      if(!root.parentElement.querySelector('.experience-more')) root.insertAdjacentHTML('afterend',`<div class="collection-more experience-more"><a class="see-more-link btn btn-primary magnetic" href="experience.html"><i class="fa-solid fa-arrow-right"></i> View All Experience</a></div>`);
      return;
    }
    const setWorkState=(btn,open,scroll=false)=>{
      const id=btn.dataset.workToggle; const panel=document.getElementById(id); if(!panel)return;
      panel.hidden=!open; btn.setAttribute('aria-expanded',String(open));
      btn.innerHTML=open?'<i class="fa-solid fa-images"></i> Hide Previous Works <i class="fa-solid fa-chevron-up toggle-icon"></i>':'<i class="fa-solid fa-images"></i> View Previous Works <i class="fa-solid fa-chevron-down toggle-icon"></i>';
      if(scroll&&open) requestAnimationFrame(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}));
    };
    root.parentElement.querySelectorAll('.experience-works-button').forEach(btn=>btn.addEventListener('click',()=>{
      const panel=document.getElementById(btn.dataset.workToggle); const open=!!panel&&!panel.hidden; setWorkState(btn,!open,!open);
    }));
  }
  // Render additional courses and learning records.
  function renderCourses(data){
    const roots=document.querySelectorAll('.course-list:not(.courses-page-list), .courses-page-list');
    if(!roots.length)return;
    const isPage=document.body.dataset.page==='courses' || document.querySelector('.courses-page-list');
    roots.forEach(root=>{
      const items=data.courses||[];
      const shown=isPage?items:items.filter(c=>c.featured!==false).slice(0,3);
      root.innerHTML=shown.map((c,i)=>`<article class="course-card reveal show"><div class="course-icon"><i class="${esc(c.icon||'fa-solid fa-graduation-cap')}"></i></div><div class="course-content"><div class="course-year">${esc(c.year||c.learningYear||'Year not added')}</div><h3>${esc(c.title||'Untitled Course')}</h3><h4>${esc(c.provider||c.source||'Learning Provider not added')}</h4><p>${esc(c.description||'')}</p>${(c.certificateDate||c.certificateReference)?`<div class="course-meta"><span>${c.certificateDate?`Issued ${esc(c.certificateDate)}`:''}</span>${c.certificateReference?`<span>Ref. ${esc(c.certificateReference)}</span>`:''}</div>`:''}<div class="course-detail-group"><span>TOOLS</span><div class="tags">${(c.tools||[]).length?(c.tools||[]).map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Not added yet</span>'}</div></div><div class="course-detail-group"><span>SKILLS</span><div class="tags">${(c.skills||[]).length?(c.skills||[]).map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Not added yet</span>'}</div></div>${c.certificateFile?`<a class="certificate-credential btn btn-ghost" href="${esc(c.certificateFile)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-certificate"></i> View Certificate</a>`:''}</div></article>`).join('') || '<div class="collection-empty course-empty"><i class="fa-solid fa-book-open"></i><strong>No additional courses added yet.</strong><span>Course records will be presented here as part of the learning journey.</span></div>';
      if(!isPage && !root.parentElement.querySelector('.courses-more')) root.insertAdjacentHTML('afterend',`<div class="collection-more courses-more"><a class="see-more-link btn btn-primary magnetic" href="courses.html"><i class="fa-solid fa-arrow-right"></i> View All Courses</a></div>`);
    });
  }
  function applyVisibility(data){
    const v=data.visibility||{};
    const map={projects:'#projects',experience:'#experience',education:'#education',research:'#research',certificates:'#certificates, #certifications',courses:'#courses'};
    Object.entries(map).forEach(([key,sel])=>{
      const hidden=v[key]===false;
      const el=document.querySelector(sel);
      if(el)el.hidden=hidden;
      document.querySelectorAll(`a[href$="${sel}"], a[href*="index.html${sel}"]`).forEach(a=>a.hidden=hidden);
    });
  }
  // Home/about section.
  function renderAbout(data){
    const a=data.about||{};
    const heroHeading=document.querySelector('.hero h1'); if(heroHeading && a.heroName){const parts=String(a.heroName).trim().split(/\s+/);heroHeading.innerHTML=parts.length>=3?`${esc(parts[0])}<br><span>${esc(parts.slice(1).join(' '))}</span>`:esc(a.heroName);}
    const heroName=document.querySelector('.profile-caption strong'); if(heroName) heroName.textContent=a.heroName||'Md Sobahan Hasan Saikat';
    const heroSub=document.querySelector('.profile-caption span'); if(heroSub) heroSub.textContent=a.heroSubtitle||'B.Sc. in CSE • AIUB';
    const eyebrow=document.querySelector('.hero .eyebrow'); if(eyebrow) eyebrow.textContent=a.heroEyebrow||"HELLO, I'M";
    const availability=document.querySelector('.hero .availability'); if(availability && a.heroAvailability){availability.innerHTML=`<span></span>${esc(a.heroAvailability)}`;}
    const heroText=document.querySelector('.hero .hero-text'); if(heroText && a.heroText) heroText.textContent=a.heroText;
    const metrics=document.querySelector('.hero-metrics');
    if(metrics){
      // Keep the three homepage totals tied to the real content collections.
      const metricItems=[
        ['Projects',(data.projects||[]).length],
        ['Research',(data.research||[]).length],
        ['Experience',(data.experience||[]).length]
      ];
      metrics.innerHTML=metricItems.map(([label,value])=>`<div><strong>${esc(String(value))}</strong><span>${esc(label)}</span></div>`).join('');
    }
    const actions=document.querySelector('.hero-actions'); if(actions&&Array.isArray(a.heroActions)) actions.innerHTML=a.heroActions.map(x=>`<a class="btn btn-${esc(x.style||'ghost')}" href="${esc(x.href||'#')}"${x.download?' download':''}><i class="${esc(x.icon||'fa-solid fa-arrow-right')}"></i> ${esc(x.label||'Open')}</a>`).join('');
    const heading=document.querySelector('#about .section-head h2'); if(heading && a.heading) heading.textContent=a.heading;
    const copy=document.querySelector('.about-copy'); if(copy && Array.isArray(a.paragraphs)) copy.innerHTML=a.paragraphs.map(x=>`<p>${esc(x)}</p>`).join('');
    const facts=document.querySelector('#about .fact-grid'); if(facts && Array.isArray(a.facts)) facts.innerHTML=a.facts.map(x=>`<div class="fact"><i class="${esc(x.icon||'fa-solid fa-circle-info')}"></i><div><small>${esc(x.label||'')}</small><strong>${esc(x.value||'')}</strong></div></div>`).join('');
    const stats=document.querySelector('#about .stats-grid');
    if(stats && Array.isArray(a.stats)){
      const uniqueTools=new Set();
      (data.skills||[]).forEach(group=>(group.skills||[]).forEach(skill=>uniqueTools.add(String(skill).trim())));
      const dynamicValues={
        projects:(data.projects||[]).length,
        featuredProjects:(data.projects||[]).filter(project=>project.featured!==false).length,
        experience:(data.experience||[]).length,
        tools:uniqueTools.size
      };
      stats.innerHTML=a.stats.map(x=>{
        const value=x.dynamic&&dynamicValues[x.dynamic]!==undefined?dynamicValues[x.dynamic]:(x.value||'0');
        return `<div class="stat"><strong data-count="${esc(value)}" data-suffix="${esc(x.suffix||'')}">0</strong><span>${esc(x.label||'')}</span></div>`;
      }).join('');
    }
  }
  function openCertificate(btn){
    const modal=document.getElementById('certificateModal');
    const frame=document.getElementById('certificatePreviewContent');
    if(!modal||!frame)return;
    const title=btn.dataset.title||'Certificate';
    const provider=btn.dataset.provider||'';
    const file=btn.dataset.file||'';
    const preview=btn.dataset.preview||'';
    const titleEl=document.getElementById('modalCertTitle');
    const providerEl=document.getElementById('modalCertProvider');
    const pdfLink=document.getElementById('modalCertPdf');
    if(titleEl)titleEl.textContent=title;
    if(providerEl)providerEl.textContent=provider;
    if(pdfLink){
      if(file && /\.pdf(?:$|\?)/i.test(file)){pdfLink.href=file;pdfLink.hidden=false;}
      else {pdfLink.href='#';pdfLink.hidden=true;}
    }
    if(!modal.dataset.scrollY) modal.dataset.scrollY=String(window.scrollY||window.pageYOffset||0);
    modal.dataset.returnFocus=btn.id||'';
    window.__certificatePreviewTrigger=btn;
    frame.innerHTML=preview
      ? `<img src="${esc(preview)}" alt="${esc(title)} certificate" decoding="async">`
      : file && /\.(png|jpe?g|webp|gif|svg)$/i.test(file)
        ? `<img src="${esc(file)}" alt="${esc(title)} certificate" decoding="async">`
        : file && /\.pdf(?:$|\?)/i.test(file)
          ? `<iframe src="${esc(file)}#view=FitH" title="${esc(title)} certificate"></iframe>`
          : `<div class="certificate-placeholder"><i class="fa-solid fa-certificate"></i><strong>${esc(title)}</strong><p>${file?'Certificate file available. Open the original document to view it.':'No certificate preview file has been added yet.'}</p>${file?`<a class="btn btn-primary" href="${esc(file)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Certificate</a>`:''}</div>`;
    modal.classList.add('certificate-modal-layer','open');
    modal.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('certificate-modal-open');
    document.body.classList.add('certificate-modal-open');
    requestAnimationFrame(()=>modal.querySelector('#certificateModalBack')?.focus({preventScroll:true}));
  }
  function setupCertificateModal(){
    const modal=document.getElementById('certificateModal');
    if(!modal||modal.dataset.ready)return;
    if(modal.parentElement!==document.body) document.body.appendChild(modal);
    modal.classList.add('certificate-modal-layer');
    modal.dataset.ready='1';
    const close=(event)=>{
      if(event){event.preventDefault();event.stopPropagation();}
      const restoreY=Number(modal.dataset.scrollY||0);
      const trigger=window.__certificatePreviewTrigger;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      const frame=document.getElementById('certificatePreviewContent');
      if(frame)frame.replaceChildren();
      document.documentElement.classList.remove('certificate-modal-open');
      document.body.classList.remove('certificate-modal-open');
      modal.removeAttribute('data-scroll-y');
      window.__certificatePreviewTrigger=null;
      requestAnimationFrame(()=>{
        window.scrollTo({top:restoreY,left:0,behavior:'auto'});
        if(trigger&&document.contains(trigger)) trigger.focus({preventScroll:true});
      });
    };
    modal.querySelector('.modal-backdrop')?.addEventListener('click',close);
    modal.querySelector('#certificateModalBack')?.addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close(e);});
  }
  // Render certificate cards and the preview controls.
  function renderCertificates(data){
    const root=document.querySelector('#certificatePageGrid, .cert-grid');if(!root)return;
    setupCertificateModal();
    const isCertificatePage=document.body.dataset.page==='certificates';
    const items=isCertificatePage?(data.certificates||[]):(data.certificates||[]).filter(c=>c.featured!==false);
    const visibleItems=isCertificatePage?items:items.slice(0,4);
    root.innerHTML=visibleItems.map(c=>`<article class="certificate reveal show"><i class="${esc(c.icon||'fa-solid fa-certificate')}"></i><div><h3>${esc(c.title)}</h3><p>${esc(c.provider)}</p>${c.date||c.category?`<small>${esc([c.date,c.category].filter(Boolean).join(' • '))}</small>`:''}${c.reference?`<small>Reference: ${esc(c.reference)}</small>`:''}${c.credentialUrl?`<a class="certificate-credential" href="${esc(c.credentialUrl)}" target="_blank" rel="noopener">Credential <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`:''}<button type="button" class="preview-btn" data-title="${esc(c.title)}" data-provider="${esc(c.provider)}" data-file="${esc(c.file||'')}" data-preview="${esc(c.preview||'')}"><i class="fa-solid fa-eye"></i> Preview</button></div></article>`).join('')+(isCertificatePage?'':`<div class=\"collection-more\"><a class=\"see-more-link btn btn-primary magnetic\" href=\"certificates.html\"><i class=\"fa-solid fa-arrow-right\"></i> View All Certifications</a></div>`);
    root.querySelectorAll('.preview-btn[data-title]').forEach(btn=>btn.addEventListener('click',()=>openCertificate(btn)));
  }
  // Render academic research cards.
  function renderResearch(data){const root=document.querySelector('.research-list');if(!root)return;const items=(data.research||[]).filter(r=>r.featured!==false);const limit=2;root.innerHTML=items.slice(0,limit).map(r=>`<article class="research-card reveal"><div class="research-icon"><i class="fa-solid fa-book-open"></i></div><div><h3>${esc(r.title)}</h3><p>${esc(r.description||r.abstract)}</p><div class="tags">${(r.tags||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div>${r.meta?`<span class="paper-meta">${esc(r.meta)}</span>`:''}<div class="research-actions"><a class="project-details btn btn-primary" href="research.html?id=${encodeURIComponent(r.id)}"><i class="fa-solid fa-arrow-right"></i> View research</a>${r.report?`<a class="report-link" href="${esc(r.report)}" target="_blank"><i class="fa-solid fa-file-pdf"></i> View report</a>`:''}</div></div></article>`).join('')+`<div class="collection-more research-more"><a class="see-more-link btn btn-primary magnetic" href="research.html"><i class="fa-solid fa-arrow-right"></i> View All Research</a></div>`;}
  // This is the main render order used after portfolio.json is loaded.
  function render(data){applyVisibility(data);renderAbout(data);renderSkills(data);renderProjects(data);renderEducation(data);renderExperience(data);renderCourses(data);renderCertificates(data);renderResearch(data);window.portfolioData=data;document.dispatchEvent(new CustomEvent('portfolio:loaded',{detail:data}));}
function load(){
    const promise=window.portfolioDataPromise || fetch('data/portfolio.json',{cache:'no-store'}).then(r=>{if(!r.ok) throw new Error('portfolio.json HTTP '+r.status); return r.json();});
    promise.then(data=>{if(!data||typeof data!=='object')throw new Error('Invalid portfolio data');render(data);}).catch(e=>{
      console.error('Portfolio content could not be retrieved.',e);
      const roots=['.project-grid','.skill-groups','.education-list','#experience .timeline','.experience-timeline','.course-list','.cert-grid','.research-list'];
      roots.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(!el.children.length)el.innerHTML='<div class="collection-empty"><i class="fa-solid fa-circle-exclamation"></i><strong>Portfolio content could not be retrieved.</strong><span>Please open the site through GitHub Pages or a local web server.</span></div>';}));
    });
  }
  load();
})();
/*
 * Simple privacy-friendly analytics helper.
 * No external analytics service is contacted unless it is enabled in the
 * portfolio data.
 */
(function(){'use strict';
  const KEY='saikat-portfolio-analytics-v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}};
  const event=(name,data={})=>{const s=read();s.events=s.events||[];s.events.push({name,data,path:location.pathname,time:new Date().toISOString()});if(s.events.length>500)s.events=s.events.slice(-500);write(s)};
  window.portfolioAnalytics={track:event,get:read,clear:()=>localStorage.removeItem(KEY)};
  event('page_view',{title:document.title});
  document.addEventListener('click',e=>{const a=e.target.closest('a'),b=e.target.closest('button');if(a){const href=a.getAttribute('href')||'';if(/\.(pdf|zip|docx?|xlsx?|pptx?)($|\?)/i.test(href))event('download',{href});else if(a.matches('.project-details,[href*="project.html"]'))event('project_open',{href});}if(b?.matches('.preview-btn'))event('certificate_preview',{title:b.dataset.title||''});},true);
  // Optional GA4: add only the measurement ID in data/portfolio.json.
  function loadGA(data){const id=data?.site?.analytics?.measurementId;if(!id||window.__gaLoaded)return;window.__gaLoaded=true;const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',id,{anonymize_ip:true});}
document.addEventListener('portfolio:loaded',e=>loadGA(e.detail));
if(window.__portfolioData) loadGA(window.__portfolioData);
})();

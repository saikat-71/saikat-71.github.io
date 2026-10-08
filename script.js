/*
 * Main page JavaScript
 * --------------------
 * Small interactions that are used around the portfolio live here.
 * Examples: preloader, typing text, mobile menu, counters, particles and
 * reveal animations.
 */
const preloader=document.getElementById("preloader");
// Hide the loading screen after the page is ready.
function hidePreloader(){
  if(!preloader || preloader.dataset.hidden === "1") return;
  preloader.dataset.hidden="1";
  preloader.style.opacity="0";
  setTimeout(()=>preloader.remove(),450);
}
window.addEventListener("load",()=>setTimeout(hidePreloader,180));
setTimeout(hidePreloader,2500);

let words=["CSE Student","Data Science Enthusiast","Machine Learning Enthusiast","Software Developer"];
const typing=document.getElementById("typing");
let wi=0,ci=0,del=false,typingTimer;
// Simple type/delete animation for the hero text.
function startTyping(nextWords){
  words=Array.isArray(nextWords)&&nextWords.length?nextWords:words;wi=0;ci=0;del=false;clearTimeout(typingTimer);
  function type(){
    if(!typing)return;const w=words[wi];typing.textContent=del?w.slice(0,ci-1):w.slice(0,ci+1);del?ci--:ci++;
    if(!del && ci===w.length){del=true;typingTimer=setTimeout(type,1300);return}
    if(del && ci===0){del=false;wi=(wi+1)%words.length}
    typingTimer=setTimeout(type,del?45:85);
  }
  type();
}
startTyping(words);
document.addEventListener('portfolio:loaded',e=>startTyping(e.detail?.about?.heroRoles));

// Mobile navigation is kept here so it is easy to understand/change later.
function bindMobileMenu(){
  const toggle=document.querySelector(".menu-toggle");
  const menu=document.querySelector(".nav-menu");
  if(!toggle||!menu||toggle.dataset.bound==='1')return;
  toggle.dataset.bound='1';
  function closeMobileMenu(){
    menu.classList.remove("open");document.body.classList.remove("menu-open");
    const i=toggle.querySelector("i");if(i){i.classList.add("fa-bars");i.classList.remove("fa-xmark")}
  }
  toggle.addEventListener("click",()=>{const isOpen=menu.classList.toggle("open");document.body.classList.toggle("menu-open",isOpen);const i=toggle.querySelector("i");if(i){i.classList.toggle("fa-bars",!isOpen);i.classList.toggle("fa-xmark",isOpen)}});
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMobileMenu));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMobileMenu()});
  window.addEventListener("resize",()=>{if(window.innerWidth>900)closeMobileMenu()});
}
bindMobileMenu();
document.addEventListener('portfolio:components-ready',bindMobileMenu);

const reveal=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("show");
      reveal.unobserve(e.target);
    }
  });
},{threshold:.12});

// Observe elements already in the HTML and elements rendered later by portfolio-loader.js.
// Watch cards that should animate into view while scrolling.
function observeRevealElements(){
  document.querySelectorAll(".reveal:not(.show)").forEach(e=>reveal.observe(e));
}
observeRevealElements();
document.addEventListener("portfolio:loaded",observeRevealElements);

const yearEl=document.getElementById("year"); if(yearEl) yearEl.textContent=new Date().getFullYear();


// ===== Advanced Portfolio JavaScript =====
(function(){
  const body=document.body;

  // Animated statistics
  const statObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.querySelectorAll('[data-count]').forEach(el=>{if(el.dataset.done)return;el.dataset.done='1';const target=Number(el.dataset.count), suffix=el.dataset.suffix||'';let start=0;const step=Math.max(1,Math.ceil(target/45));const timer=setInterval(()=>{start=Math.min(target,start+step);el.textContent=start+suffix;if(start>=target)clearInterval(timer)},30)}) ;statObserver.unobserve(entry.target)})},{threshold:.35});window.initPortfolioCounters=()=>{const stats=document.querySelector('.stats-grid');if(stats&&!stats.dataset.counterObserved){stats.dataset.counterObserved='1';statObserver.observe(stats)}};window.initPortfolioCounters();document.addEventListener('portfolio:loaded',()=>window.initPortfolioCounters());

  // Certificate preview modal close controls (buttons are bound by portfolio-loader after dynamic rendering)
  const modal=document.getElementById('certificateModal');
  if(modal){const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};modal.querySelector('.modal-backdrop').addEventListener('click',close);modal.querySelector('.modal-close').addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}

  // Magnetic buttons: lightweight pointer tracking only while the pointer is near a CTA.
  // Dynamic buttons rendered by portfolio-loader are supported automatically.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches){
    let active=null;
    const reset=()=>{if(active){active.style.transform='';active.classList.remove('magnetic-active');active=null}};
    document.addEventListener('pointermove',e=>{
      const el=e.target.closest('.magnetic,.btn,.project-details,.report-link,.preview-btn');
      if(!el || !document.documentElement.contains(el)){reset();return}
      if(el.closest('.modal') && !el.matches('.magnetic,.btn,.project-details,.report-link,.preview-btn')){reset();return}
      if(active!==el){reset();active=el;el.classList.add('magnetic-active')}
      const r=el.getBoundingClientRect();
      const max=10;
      const x=Math.max(-max,Math.min(max,(e.clientX-(r.left+r.width/2))*0.16));
      const y=Math.max(-max,Math.min(max,(e.clientY-(r.top+r.height/2))*0.16));
      el.style.transform=`translate3d(${x}px,${y}px,0)`;
    },{passive:true});
    document.addEventListener('pointerleave',reset);
    document.addEventListener('pointerout',e=>{const to=e.relatedTarget; if(active && !(to instanceof Element && to.closest('.magnetic,.btn,.project-details,.report-link,.preview-btn')))reset()});
  }

  // Particle background
  const canvas=document.getElementById('particles'),ctx=canvas&&canvas.getContext('2d');if(canvas&&ctx){let ps=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight;ps=Array.from({length:Math.min(75,Math.floor(innerWidth/18))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.4}))}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);const light=body.classList.contains('light');ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;ctx.fillStyle=light?'rgba(7,158,114,.28)':'rgba(32,227,162,.28)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.hypot(dx,dy);if(d<110){ctx.strokeStyle=light?`rgba(7,158,114,${.07*(1-d/110)})`:`rgba(32,227,162,${.07*(1-d/110)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.stroke()}}requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw()}
})();

setTimeout(()=>{
  document.querySelectorAll(".hero .reveal:not(.show)").forEach(el=>el.classList.add("show"));
  const p=document.getElementById("preloader");
  if(p){p.style.opacity="0";p.style.visibility="hidden";p.style.pointerEvents="none";setTimeout(()=>p.remove(),220);}
},1200);

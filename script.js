const preloader=document.getElementById("preloader");
window.addEventListener("load",()=>setTimeout(()=>{preloader.style.opacity="0";setTimeout(()=>preloader.remove(),500)},500));

const words=["CSE Student","Data Science Enthusiast","Machine Learning Enthusiast","Software Developer"];
const typing=document.getElementById("typing");
let wi=0,ci=0,del=false;
function type(){
  const w=words[wi];
  typing.textContent=del?w.slice(0,ci-1):w.slice(0,ci+1);
  del?ci--:ci++;
  if(!del && ci===w.length){del=true;setTimeout(type,1300);return}
  if(del && ci===0){del=false;wi=(wi+1)%words.length}
  setTimeout(type,del?45:85);
}
type();

const toggle=document.querySelector(".menu-toggle");
const menu=document.querySelector(".nav-menu");
function closeMobileMenu(){
  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
  const i=toggle.querySelector("i");
  i.classList.add("fa-bars");
  i.classList.remove("fa-xmark");
}
toggle.addEventListener("click",()=>{
  const isOpen=menu.classList.toggle("open");
  document.body.classList.toggle("menu-open",isOpen);
  const i=toggle.querySelector("i");
  i.classList.toggle("fa-bars",!isOpen);
  i.classList.toggle("fa-xmark",isOpen);
});
document.querySelectorAll(".nav-menu a").forEach(a=>a.addEventListener("click",closeMobileMenu));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMobileMenu()});
window.addEventListener("resize",()=>{if(window.innerWidth>900)closeMobileMenu()});

const reveal=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("show");
      reveal.unobserve(e.target);
    }
  });
},{threshold:.12});

// Observe elements already in the HTML and elements rendered later by portfolio-loader.js.
function observeRevealElements(){
  document.querySelectorAll(".reveal:not(.show)").forEach(e=>reveal.observe(e));
}
observeRevealElements();
document.addEventListener("portfolio:loaded",observeRevealElements);

const topBtn=document.getElementById("topBtn");
window.addEventListener("scroll",()=>{
  topBtn.classList.toggle("show",window.scrollY>500);
});
topBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
document.getElementById("year").textContent=new Date().getFullYear();


// ===== Advanced Portfolio JavaScript =====
(function(){
  const body=document.body, theme=document.getElementById('themeToggle');
  const saved=localStorage.getItem('saikat-theme');
  if(saved==='light') body.classList.add('light');
  if(theme) theme.addEventListener('click',()=>{body.classList.toggle('light');localStorage.setItem('saikat-theme',body.classList.contains('light')?'light':'dark');const i=theme.querySelector('i');i.className=body.classList.contains('light')?'fa-solid fa-moon':'fa-solid fa-sun'});

  // Animated statistics
  const statObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.querySelectorAll('[data-count]').forEach(el=>{if(el.dataset.done)return;el.dataset.done='1';const target=Number(el.dataset.count), suffix=el.dataset.suffix||'';let start=0;const step=Math.max(1,Math.ceil(target/45));const timer=setInterval(()=>{start=Math.min(target,start+step);el.textContent=start+suffix;if(start>=target)clearInterval(timer)},30)}) ;statObserver.unobserve(entry.target)})},{threshold:.35});const stats=document.querySelector('.stats-grid');if(stats)statObserver.observe(stats);

  // Certificate preview modal close controls (buttons are bound by portfolio-loader after dynamic rendering)
  const modal=document.getElementById('certificateModal');
  if(modal){const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};modal.querySelector('.modal-backdrop').addEventListener('click',close);modal.querySelector('.modal-close').addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}

  // Custom cursor
  const dot=document.querySelector('.cursor-dot'), ring=document.querySelector('.cursor-ring');if(dot&&ring&&matchMedia('(pointer:fine)').matches){let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;dot.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`});function cursorLoop(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(cursorLoop)}cursorLoop();document.querySelectorAll('a,button,.project,.certificate').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('active'));el.addEventListener('mouseleave',()=>ring.classList.remove('active'))})}

  // Particle background
  const canvas=document.getElementById('particles'),ctx=canvas&&canvas.getContext('2d');if(canvas&&ctx){let ps=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight;ps=Array.from({length:Math.min(75,Math.floor(innerWidth/18))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.4}))}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);const light=body.classList.contains('light');ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;ctx.fillStyle=light?'rgba(7,158,114,.28)':'rgba(32,227,162,.28)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.hypot(dx,dy);if(d<110){ctx.strokeStyle=light?`rgba(7,158,114,${.07*(1-d/110)})`:`rgba(32,227,162,${.07*(1-d/110)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.stroke()}}requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw()}
})();

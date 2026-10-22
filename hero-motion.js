/* Lightweight portrait parallax; disabled on touch devices and for reduced-motion preference. */
(() => {
  const visual = document.querySelector('.hero-visual');
  const photo = visual?.querySelector('.profile-photo');
  if (!visual || !photo || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { photo.style.translate = `${x * 5}px ${y * 3}px`; });
  }, { passive: true });
  visual.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    photo.style.translate = '';
  }, { passive: true });
})();

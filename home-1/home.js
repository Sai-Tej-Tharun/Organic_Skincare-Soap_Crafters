/**
 * ============================================================
 * GlowVeda — Home Page 1 (home.js)
 * ============================================================
 * 01. Hero Canvas — luminous particle trail (pointer-follow)
 * 02. Hero Particles — floating spores
 * 03. Orb Carousel — ingredient auto-rotate + manual dots
 * 04. Wishlist toggle
 * 05. Init
 * ============================================================
 */

'use strict';

/* ============================================================
   01. HERO CANVAS — Luminous trail that follows pointer/touch
   ============================================================ */
const HeroCanvas = (() => {

  let canvas, ctx, W, H;
  let pointer = { x: 0, y: 0 };
  let trails  = [];
  let raf;
  const MAX_TRAILS = 80;

  /**
   * Each trail point: position, velocity, life, size, colour.
   */
  function spawnTrail(x, y) {
    const colors = [
      'rgba(212,168,87,',
      'rgba(107,175,146,',
      'rgba(47,111,78,',
      'rgba(228,192,96,',
    ];
    const col = colors[Math.floor(Math.random() * colors.length)];
    trails.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2 - 0.5,
      life: 1,
      decay: 0.018 + Math.random() * 0.02,
      radius: 2 + Math.random() * 4,
      color: col,
    });
    if (trails.length > MAX_TRAILS) trails.shift();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    trails.forEach(p => {
      p.life -= p.decay;
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   -= 0.02; // slight upward drift

      if (p.life <= 0) return;

      const alpha = p.life * 0.9;
      const r     = p.radius * p.life;

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();

      // Outer glow halo
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grad.addColorStop(0,   p.color + (alpha * 0.4) + ')');
      grad.addColorStop(1,   p.color + '0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Prune dead
    trails = trails.filter(p => p.life > 0);

    raf = requestAnimationFrame(draw);
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x  = e.clientX - rect.left;
    pointer.y  = e.clientY - rect.top;
    for (let i = 0; i < 3; i++) spawnTrail(pointer.x, pointer.y);
  }

  function onTouchMove(e) {
    if (!e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const t    = e.touches[0];
    pointer.x  = t.clientX - rect.left;
    pointer.y  = t.clientY - rect.top;
    for (let i = 0; i < 2; i++) spawnTrail(pointer.x, pointer.y);
  }

  function init() {
    canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Listen on the hero-visual element for richer coverage
    const visual = document.querySelector('.hero-visual');
    if (visual) {
      visual.addEventListener('mousemove', onMouseMove, { passive: true });
      visual.addEventListener('touchmove',  onTouchMove,  { passive: true });
    }

    draw();
  }

  function destroy() {
    cancelAnimationFrame(raf);
  }

  return { init, destroy };
})();


/* ============================================================
   02. HERO PARTICLES — Upward-floating spore dots
   ============================================================ */
const HeroParticles = (() => {

  const COUNT = 35;

  function createParticle(container) {
    const el = document.createElement('div');
    el.classList.add('particle');

    // Random properties
    const size     = 2 + Math.random() * 5;
    const duration = 12 + Math.random() * 18; // 12–30s
    const delay    = Math.random() * 20;       // stagger start
    const left     = Math.random() * 100;
    const colors   = [
      'rgba(212,168,87,0.55)',
      'rgba(107,175,146,0.45)',
      'rgba(47,111,78,0.4)',
      'rgba(200,223,196,0.35)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    el.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${left}%;
      background:${color};
      animation-duration:${duration}s;
      animation-delay:-${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;

    container.appendChild(el);
  }

  function init() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < COUNT; i++) createParticle(container);
  }

  return { init };
})();


/* ============================================================
   03. ORB CAROUSEL — Auto-rotating ingredient showcase
   ============================================================ */
const OrbCarousel = (() => {

  let slides    = [];
  let dots      = [];
  let current   = 0;
  let timer     = null;
  const INTERVAL = 3200; // ms between transitions

  function goTo(index) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    dots[current]?.setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
    dots[current]?.setAttribute('aria-selected', 'true');
  }

  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    timer = setInterval(next, INTERVAL);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  function init() {
    slides = Array.from(document.querySelectorAll('.orb-slide'));
    dots   = Array.from(document.querySelectorAll('.orb-dot'));
    if (!slides.length) return;

    // Bind dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAuto();
        goTo(i);
        startAuto(); // restart timer after manual interaction
      });
    });

    // Pause on orb hover
    const orb = document.querySelector('.hero-visual__orb');
    if (orb) {
      orb.addEventListener('mouseenter', stopAuto);
      orb.addEventListener('mouseleave', startAuto);
    }

    // Keyboard navigation for accessibility
    document.addEventListener('keydown', e => {
      const focused = document.activeElement;
      if (!focused?.classList.contains('orb-dot')) return;
      if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
      if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
    });

    goTo(0);
    startAuto();
  }

  return { init };
})();


/* ============================================================
   04. WISHLIST TOGGLE
   ============================================================ */
function initWishlist() {
  document.querySelectorAll('.product-card__action-btn[aria-label="Add to wishlist"]')
    .forEach(btn => {
      btn.addEventListener('click', function () {
        const active = this.classList.toggle('wishlisted');
        const svg    = this.querySelector('svg');
        if (svg) {
          svg.style.fill   = active ? '#EF4444' : 'none';
          svg.style.stroke = active ? '#EF4444' : 'currentColor';
        }
        this.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');

        if (window.GlowVeda?.ToastManager) {
          window.GlowVeda.ToastManager.show(
            active ? 'Added to wishlist ❤️' : 'Removed from wishlist',
            active ? 'success' : 'info',
            2000
          );
        }
      });
    });
}


/* ============================================================
   05. HERO PARALLAX — subtle depth on mouse move
   ============================================================ */
function initHeroParallax() {
  const hero   = document.querySelector('.hero');
  const visual = document.querySelector('.hero-visual__orb-wrap');
  const glow1  = document.querySelector('.hero-bg__glow--1');
  const glow2  = document.querySelector('.hero-bg__glow--2');
  if (!hero || !visual) return;

  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Normalise to -1 … +1
    const nx = (clientX / innerWidth  - 0.5) * 2;
    const ny = (clientY / innerHeight - 0.5) * 2;

    // Gentle parallax on orb and glows
    visual.style.transform = `translate(${nx * 10}px, ${ny * 8}px)`;
    if (glow1) glow1.style.transform = `translate(${nx * -18}px, ${ny * -14}px) scale(1)`;
    if (glow2) glow2.style.transform = `translate(${nx * 12}px,  ${ny * 10}px) scale(1)`;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    if (visual) visual.style.transform = '';
    if (glow1)  glow1.style.transform  = '';
    if (glow2)  glow2.style.transform  = '';
  });
}


/* ============================================================
   05. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  HeroParticles.init();
  HeroCanvas.init();
  OrbCarousel.init();
  initWishlist();
  initHeroParallax();
});

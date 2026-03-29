/**
 * ============================================================
 * GlowVeda — Pricing Page JavaScript
 * pricing/pricing.js  ·  Version 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Billing Toggle (Monthly / Yearly price swap)
 * 02. FAQ Accordion
 * 03. Scroll Animations
 * 04. Back to Top
 * 05. Stat Counter (loyalty points visual)
 * 06. Init
 * ============================================================
 */

'use strict';


/* ============================================================
   01. BILLING TOGGLE — swap prices between monthly / yearly
   ============================================================ */

function initBillingToggle() {
  const btns   = document.querySelectorAll('.billing-toggle__btn');
  const amounts = document.querySelectorAll('.price-amount');
  const saves   = document.querySelectorAll('.pricing-card__save');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const period = btn.dataset.period; // 'monthly' | 'yearly'

      // Animate price amounts
      amounts.forEach(el => {
        const raw    = period === 'yearly' ? el.dataset.yearly : el.dataset.monthly;
        const target = parseInt(raw, 10);

        // Brief scale-down then up on change
        el.style.transform = 'scale(0.88)';
        el.style.opacity   = '0';
        el.style.transition = 'transform .15s ease, opacity .15s ease';

        setTimeout(() => {
          el.textContent  = Number(target).toLocaleString('en-IN');
          el.style.transform = 'scale(1)';
          el.style.opacity   = '1';
        }, 160);
      });

      // Show/hide saving note
      saves.forEach(el => {
        el.style.display = period === 'yearly' ? 'block' : 'none';
      });
    });
  });
}


/* ============================================================
   02. FAQ ACCORDION
   ============================================================ */

function initPricingFAQ() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const t = other.querySelector('.accordion-trigger');
          const p = other.querySelector('.accordion-panel');
          if (t) t.setAttribute('aria-expanded', 'false');
          if (p) p.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Keyboard: Enter / Space
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}


/* ============================================================
   03. SCROLL ANIMATIONS
   ============================================================ */

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('animated'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => io.observe(el));
}


/* ============================================================
   04. BACK TO TOP
   ============================================================ */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* ============================================================
   05. LOYALTY POINTS COUNTER ANIMATION
   ============================================================ */

function initLoyaltyCounter() {
  const el = document.querySelector('.lcv-pts-num');
  if (!el) return;

  const target   = 6240;
  const duration = 2000;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();

    const start = performance.now();
    function step(now) {
      const p   = Math.min((now - start) / duration, 1);
      const val = Math.round(easeOut(p) * target);
      el.textContent = val.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, { threshold: 0.5 });

  observer.observe(el);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }


/* ============================================================
   06. INIT
   ============================================================ */

(function init() {
  initBillingToggle();
  initPricingFAQ();
  initScrollAnimations();
  initBackToTop();
  initLoyaltyCounter();
})();

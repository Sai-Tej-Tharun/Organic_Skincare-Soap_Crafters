/**
 * ============================================================
 * GlowVeda — Coming Soon Page JavaScript
 * Organic Skincare & Soap Crafters
 * Version: 1.0.0
 * ============================================================
 * Self-contained — no dependency on global.js.
 *
 * TABLE OF CONTENTS:
 * 01. Theme Manager (Dark / Light)
 * 02. RTL Manager
 * 03. Countdown Timer
 * 04. SVG Ring Progress Updater
 * 05. Progress Bar Entrance Animation
 * 06. Email Subscribe Form Handler
 * 07. Copyright Year
 * 08. Cursor Glow Effect
 * 09. Init
 * ============================================================
 */

'use strict';

/* ============================================================
   01. THEME MANAGER
   Reads saved theme or system preference, applies it,
   and binds the toggle button.
   ============================================================ */
const ThemeManager = (() => {
  const KEY   = 'glowveda-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  function getPreferred() {
    const saved = localStorage.getItem(KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    const btn      = document.getElementById('theme-toggle');
    const iconSun  = btn?.querySelector('.icon-sun');
    const iconMoon = btn?.querySelector('.icon-moon');

    if (iconSun && iconMoon) {
      iconSun.style.display  = theme === DARK ? 'block' : 'none';
      iconMoon.style.display = theme === DARK ? 'none'  : 'block';
    }

    if (btn) {
      btn.setAttribute('aria-label',
        theme === DARK ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  function init() {
    apply(getPreferred());

    // Watch for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem(KEY)) apply(e.matches ? DARK : LIGHT);
      });

    document.getElementById('theme-toggle')
      ?.addEventListener('click', toggle);
  }

  return { init };
})();


/* ============================================================
   02. RTL MANAGER
   Toggles text direction and persists the choice.
   ============================================================ */
const RTLManager = (() => {
  const KEY = 'glowveda-rtl';

  function apply(rtl) {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    localStorage.setItem(KEY, rtl ? 'rtl' : 'ltr');

    const btn   = document.getElementById('rtl-toggle');
    const label = btn?.querySelector('.rtl-label');
    if (label) label.textContent = rtl ? 'LTR' : 'RTL';
    btn?.setAttribute('aria-pressed', String(rtl));
    btn?.setAttribute('aria-label', rtl ? 'Switch to LTR' : 'Switch to RTL');
  }

  function toggle() {
    apply(document.documentElement.dir !== 'rtl');
  }

  function init() {
    const saved = localStorage.getItem(KEY);
    apply(saved === 'rtl');
    document.getElementById('rtl-toggle')
      ?.addEventListener('click', toggle);
  }

  return { init };
})();


/* ============================================================
   03. COUNTDOWN TIMER
   Counts down to a configurable launch date.
   Updates every second. Stops at zero.
   ============================================================ */
const CountdownTimer = (() => {

  /**
   * ── CONFIGURE YOUR LAUNCH DATE HERE ──
   * Format: 'YYYY-MM-DDTHH:mm:ss' (local time)
   * Change this to your real launch date.
   */
  const LAUNCH_DATE = new Date('2025-09-01T00:00:00');

  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');

  /**
   * Pads a number to 2 digits.
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  /**
   * Calculates remaining time components.
   * @returns {{ days, hours, mins, secs, total }}
   */
  function getTimeLeft() {
    const now   = Date.now();
    const end   = LAUNCH_DATE.getTime();
    const total = Math.max(0, Math.floor((end - now) / 1000));

    const days  = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins  = Math.floor((total % 3600) / 60);
    const secs  = total % 60;

    return { days, hours, mins, secs, total };
  }

  /**
   * Writes the time values to the DOM.
   */
  function render() {
    const { days, hours, mins, secs } = getTimeLeft();
    if (elDays)  elDays.textContent  = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMins)  elMins.textContent  = pad(mins);
    if (elSecs)  elSecs.textContent  = pad(secs);

    // Also update SVG rings
    RingUpdater.update(days, hours, mins, secs);
  }

  function init() {
    render(); // Immediate render to avoid 1-second blank
    setInterval(render, 1000);
  }

  return { init, getTimeLeft, LAUNCH_DATE };
})();


/* ============================================================
   04. SVG RING PROGRESS UPDATER
   Updates each countdown ring's stroke-dashoffset so
   the circle fills proportionally to the time unit.
   ============================================================ */
const RingUpdater = (() => {
  const CIRCUMFERENCE = 2 * Math.PI * 34; // 213.63…

  const rings = {
    days:  document.getElementById('ring-days'),
    hours: document.getElementById('ring-hours'),
    mins:  document.getElementById('ring-mins'),
    secs:  document.getElementById('ring-secs'),
  };

  /**
   * Sets a ring's dashoffset based on value / max ratio.
   * Full ring = 0 offset. Empty ring = full circumference.
   * @param {SVGCircleElement} el
   * @param {number} value
   * @param {number} max
   */
  function setRing(el, value, max) {
    if (!el) return;
    const ratio  = Math.min(value / max, 1);
    const offset = CIRCUMFERENCE * (1 - ratio);
    el.style.strokeDashoffset = offset;
  }

  /**
   * Updates all four rings.
   * @param {number} days
   * @param {number} hours
   * @param {number} mins
   * @param {number} secs
   */
  function update(days, hours, mins, secs) {
    // Calculate total days until launch for the days ring max
    const totalDays = Math.ceil(
      (CountdownTimer.LAUNCH_DATE - new Date()) / 86400000
    ) || 1;

    setRing(rings.days,  days,  Math.max(totalDays, 1));
    setRing(rings.hours, hours, 23);
    setRing(rings.mins,  mins,  59);
    setRing(rings.secs,  secs,  59);
  }

  return { update };
})();


/* ============================================================
   05. PROGRESS BAR ENTRANCE ANIMATION
   Animates the launch-readiness bar from 0% to its
   target value after a short delay.
   ============================================================ */
const ProgressBar = (() => {

  function init() {
    const fill     = document.getElementById('progress-fill');
    const pctLabel = document.getElementById('progress-pct');
    if (!fill) return;

    // Read the target from the element's inline width
    const targetPct = parseInt(fill.style.width) || 78;

    // Start at 0
    fill.style.width = '0%';

    // Animate to target after page enters
    setTimeout(() => {
      fill.style.width = `${targetPct}%`;

      // Animate number counter
      if (pctLabel) {
        let current = 0;
        const duration = 1400;
        const start    = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          current        = Math.round(eased * targetPct);
          pctLabel.textContent = `${current}%`;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      }
    }, 1600); // Delay matches the animation stagger
  }

  return { init };
})();


/* ============================================================
   06. EMAIL SUBSCRIBE FORM HANDLER
   Validates the email, shows success state with animation.
   ============================================================ */
const SubscribeForm = (() => {

  /**
   * Basic email regex validator.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function init() {
    const form    = document.getElementById('subscribe-form');
    const input   = document.getElementById('subscribe-email');
    const errorEl = document.getElementById('subscribe-error');
    const success = document.getElementById('subscribe-success');
    const btn     = form?.querySelector('.cs-subscribe__btn');

    if (!form || !input) return;

    // Real-time validation feedback
    input.addEventListener('input', () => {
      if (input.value && !isValidEmail(input.value)) {
        errorEl.style.display = 'flex';
      } else {
        errorEl.style.display = 'none';
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const email = input.value.trim();

      // Validate
      if (!email || !isValidEmail(email)) {
        errorEl.style.display = 'flex';
        input.focus();
        // Shake animation
        input.closest('.cs-subscribe__input-wrap').style.animation = 'none';
        requestAnimationFrame(() => {
          input.closest('.cs-subscribe__input-wrap').style.animation = 'shake 0.4s ease';
        });
        return;
      }

      errorEl.style.display = 'none';

      // Loading state
      if (btn) {
        btn.disabled = true;
        const btnText = btn.querySelector('.cs-subscribe__btn-text');
        if (btnText) btnText.textContent = 'Subscribing…';
      }

      // Simulate async subscription
      setTimeout(() => {
        // Hide form, show success
        form.style.display        = 'none';
        success.style.display     = 'flex';

        // Store email in localStorage (real app would POST to API)
        try {
          localStorage.setItem('glowveda-cs-email', email);
        } catch {
          // Ignore storage errors
        }
      }, 1200);
    });
  }

  return { init };
})();


/* ============================================================
   07. COPYRIGHT YEAR
   Keeps the footer year current without manual updates.
   ============================================================ */
function initCopyrightYear() {
  const el = document.getElementById('cs-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ============================================================
   08. CURSOR GLOW EFFECT
   A soft radial gradient that follows the mouse,
   giving a magical organic feel. Desktop only.
   ============================================================ */
const CursorGlow = (() => {

  function init() {
    // Skip on touch / reduced motion
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      background: radial-gradient(
        circle,
        rgba(212, 168, 87, 0.1) 0%,
        rgba(107, 175, 146, 0.06) 50%,
        transparent 70%
      );
      transform: translate(-50%, -50%);
      transition: opacity 0.4s ease;
      opacity: 0;
    `;
    document.body.appendChild(glow);

    let mouseX = 0;
    let mouseY = 0;
    let glowX  = 0;
    let glowY  = 0;
    let raf    = null;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });

    // Smooth follow with lerp
    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateGlow() {
      glowX = lerp(glowX, mouseX, 0.08);
      glowY = lerp(glowY, mouseY, 0.08);
      glow.style.left = `${glowX}px`;
      glow.style.top  = `${glowY}px`;
      raf = requestAnimationFrame(animateGlow);
    }

    raf = requestAnimationFrame(animateGlow);
  }

  return { init };
})();


/* ============================================================
   09. SHAKE KEYFRAME (injected for error feedback)
   ============================================================ */
function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   INIT — runs on DOMContentLoaded
   ============================================================ */
function init() {
  ThemeManager.init();
  RTLManager.init();
  CountdownTimer.init();
  ProgressBar.init();
  SubscribeForm.init();
  initCopyrightYear();
  CursorGlow.init();
  injectShakeKeyframe();

  // Init Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

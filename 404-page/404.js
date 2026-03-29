/**
 * ============================================================
 * GlowVeda — 404 Page JavaScript
 * 404-page/404.js
 * Version: 1.0.0
 * ============================================================
 */

'use strict';

(function init() {
  /* Theme + RTL toggles are handled by global.js automatically.
     Only page-specific behaviour lives here. */

  /**
   * Keyboard: pressing Enter or Space on the logo link triggers click.
   * (already native for <a> — included for any future button-role elements)
   */
  const logo = document.querySelector('.error-logo');
  if (logo) {
    logo.addEventListener('keydown', e => {
      if (e.key === 'Enter') logo.click();
    });
  }

  /**
   * Subtle cursor-parallax on the botanical floaters — desktop only.
   * Moves each floater a tiny amount relative to mouse position
   * for a gentle depth effect.
   */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const floaters = document.querySelectorAll('.floater');
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    // Each floater gets a unique depth factor
    const depths = [0.012, 0.018, 0.010, 0.015, 0.009];

    document.addEventListener('mousemove', e => {
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      floaters.forEach((el, i) => {
        const d = depths[i] || 0.012;
        el.style.transform = `translate(${dx * d}px, ${dy * d}px) rotate(${dx * d * 0.5}deg)`;
      });
    });
  }
})();

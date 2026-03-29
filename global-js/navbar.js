/**
 * ============================================================
 * GlowVeda — Navbar JavaScript
 * global-js/navbar.js
 * ============================================================
 * Works alongside global.js. Can also be used standalone.
 *
 * Features:
 *  - Loads navbar.html into #navbar-placeholder
 *  - Scroll shadow
 *  - Hover-intent desktop dropdowns (with safe delay)
 *  - Click-based fallback for keyboard / touch
 *  - Mobile slide-in drawer with accordion sub-menus
 *  - Focus trap inside mobile drawer
 *  - Active link detection
 *  - Re-binds ThemeManager + RTLManager after injection
 * ============================================================
 */

'use strict';

const NavbarManager = (() => {

  /* ---- Config ---- */
  const HOVER_CLOSE_DELAY = 180; // ms before dropdown hides after mouse leaves

  /* ---- State ---- */
  let closeTimers = new WeakMap();

  /* ----------------------------------------------------------
     LOAD
  ---------------------------------------------------------- */
  async function load() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    try {
      const res  = await fetch('/components/navbar.html');
      if (!res.ok) throw new Error(`navbar fetch ${res.status}`);
      const html = await res.text();
      placeholder.innerHTML = html;
    } catch (e) {
      console.warn('[GlowVeda] Navbar load failed:', e.message);
      return;
    }

    /* Init all features after HTML is in DOM */
    initScroll();
    initDesktopDropdowns();
    initMobileDrawer();
    setActiveLink();

    /* Re-bind global theme/RTL managers (they scan for .theme-toggle etc.) */
    if (window.GlowVeda?.ThemeManager) {
      window.GlowVeda.ThemeManager.bindButtons();
      window.GlowVeda.ThemeManager.apply(window.GlowVeda.ThemeManager.getPreferred());
    }
    if (window.GlowVeda?.RTLManager) {
      window.GlowVeda.RTLManager.bindButtons();
    }
  }


  /* ----------------------------------------------------------
     SCROLL SHADOW
  ---------------------------------------------------------- */
  function initScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ----------------------------------------------------------
     DESKTOP DROPDOWNS — hover-intent with safe delay
  ---------------------------------------------------------- */
  function initDesktopDropdowns() {
    const items = document.querySelectorAll('.nav-item--dropdown');

    items.forEach(item => {
      const trigger  = item.querySelector('.nav-link--has-dropdown');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;

      /* ── Hover: open ── */
      item.addEventListener('mouseenter', () => {
        /* Cancel any pending close timer for this item */
        clearClose(item);
        openDropdown(item, trigger, dropdown);
      });

      /* ── Hover: schedule close after delay ── */
      item.addEventListener('mouseleave', () => {
        scheduleClose(item, trigger, dropdown);
      });

      /* ── Click trigger: toggle (keyboard + touch fallback) ── */
      trigger.addEventListener('click', e => {
        /* Only intercept on non-mouse (touch / keyboard) or when already open */
        const isOpen = item.classList.contains('open');
        if (isOpen) {
          closeDropdown(item, trigger, dropdown);
        } else {
          /* On touch devices prevent default navigation and show dropdown */
          if (e.pointerType === 'touch' || e.pointerType === '') {
            e.preventDefault();
          }
          closeAllDropdowns();
          openDropdown(item, trigger, dropdown);
        }
      });

      /* ── Keyboard: Escape closes ── */
      item.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          closeDropdown(item, trigger, dropdown);
          trigger.focus();
        }
      });
    });

    /* Click outside → close all */
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-item--dropdown')) {
        closeAllDropdowns();
      }
    });
  }

  function openDropdown(item, trigger, dropdown) {
    item.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.removeAttribute('inert');
  }

  function closeDropdown(item, trigger, dropdown) {
    item.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('inert', '');
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-item--dropdown.open').forEach(item => {
      const trigger  = item.querySelector('.nav-link--has-dropdown');
      const dropdown = item.querySelector('.nav-dropdown');
      if (trigger && dropdown) closeDropdown(item, trigger, dropdown);
    });
  }

  function scheduleClose(item, trigger, dropdown) {
    const id = setTimeout(() => closeDropdown(item, trigger, dropdown), HOVER_CLOSE_DELAY);
    closeTimers.set(item, id);
  }

  function clearClose(item) {
    if (closeTimers.has(item)) {
      clearTimeout(closeTimers.get(item));
      closeTimers.delete(item);
    }
  }


  /* ----------------------------------------------------------
     MOBILE DRAWER
  ---------------------------------------------------------- */
  function initMobileDrawer() {
    const hamburger = document.querySelector('.nav-hamburger');
    const drawer    = document.getElementById('mobile-nav');
    const overlay   = document.getElementById('mobile-nav-overlay');
    const closeBtn  = document.querySelector('.mobile-nav__close');
    if (!hamburger || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      overlay?.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      /* Focus first focusable element inside drawer */
      const first = drawer.querySelector('button, a');
      if (first) setTimeout(() => first.focus(), 50);
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay?.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    closeBtn?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);

    /* Escape key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    /* Simple focus trap */
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = [...drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(el => el.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* Close drawer on any <a> link click */
    drawer.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    /* Init mobile accordions */
    initMobileAccordions();
  }


  /* ----------------------------------------------------------
     MOBILE ACCORDION SUB-MENUS
  ---------------------------------------------------------- */
  function initMobileAccordions() {
    const items = document.querySelectorAll('.mob-item--accordion');

    items.forEach(item => {
      const trigger = item.querySelector('.mob-link--parent');
      const sub     = item.querySelector('.mob-sub');
      if (!trigger || !sub) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.dataset.open === 'true';

        /* Close all other accordions */
        items.forEach(other => {
          if (other !== item && other.dataset.open === 'true') {
            other.dataset.open = 'false';
            const t = other.querySelector('.mob-link--parent');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });

        /* Toggle this one */
        item.dataset.open = isOpen ? 'false' : 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }


  /* ----------------------------------------------------------
     ACTIVE LINK DETECTION
  ---------------------------------------------------------- */
  function setActiveLink() {
    const path = window.location.pathname;

    document.querySelectorAll('.nav-link, .nav-dropdown__link, .mob-link, .mob-sub__link')
      .forEach(link => {
        if (!link.href) return;
        try {
          const linkPath = new URL(link.href).pathname;
          const match =
            linkPath === path ||
            (linkPath.length > 1 && path.startsWith(linkPath.replace('/index.html', '')));

          link.classList.toggle('active', match);
          if (match) link.setAttribute('aria-current', 'page');
        } catch (_) { /* ignore malformed hrefs */ }
      });
  }


  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  return { load, setActiveLink };

})();

/* Auto-run if this script is loaded independently */
window.addEventListener('load', NavbarManager.load);

/* Expose on window for global.js to use */
window.NavbarManager = NavbarManager;
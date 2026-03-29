/**
 * ============================================================
 * GlowVeda — Global JavaScript
 * Organic Skincare & Soap Crafters
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. DOM Ready Helper
 * 02. Theme Manager (Dark / Light Mode)
 * 03. RTL Manager
 * 04. Navbar Manager (load, scroll, mobile, active link)
 * 05. Footer Manager (load)
 * 06. Scroll Animation Observer
 * 07. Stat Counter Animations
 * 08. Toast Notification System
 * 09. Modal Manager
 * 10. Lazy Image Loader
 * 11. Smooth Scroll
 * 12. Page Loader
 * 13. Utility Functions
 * 14. Init — Bootstrap everything on DOMContentLoaded
 * ============================================================
 */

'use strict';


/* ============================================================
   01. DOM READY HELPER
   ============================================================ */

/**
 * Executes callback when DOM is fully parsed.
 * @param {Function} fn
 */
function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


/* ============================================================
   02. THEME MANAGER (Dark / Light Mode)
   ============================================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'glowveda-theme';
  const DARK        = 'dark';
  const LIGHT       = 'light';

  /**
   * Returns the user's saved theme or system preference.
   * @returns {'dark'|'light'}
   */
  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  /**
   * Applies the given theme to <html> and updates toggle button icons.
   * @param {'dark'|'light'} theme
   */
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all theme toggle buttons on the page
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const iconSun  = btn.querySelector('.icon-sun');
      const iconMoon = btn.querySelector('.icon-moon');
      if (iconSun && iconMoon) {
        if (theme === DARK) {
          iconSun.style.display  = 'block';
          iconMoon.style.display = 'none';
        } else {
          iconSun.style.display  = 'none';
          iconMoon.style.display = 'block';
        }
      }

      btn.setAttribute('aria-label',
        theme === DARK ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.setAttribute('title',
        theme === DARK ? 'Light Mode' : 'Dark Mode'
      );
    });
  }

  /**
   * Toggles between dark and light.
   */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  /**
   * Initialises the ThemeManager: applies saved theme, binds toggle buttons.
   */
  function init() {
    apply(getPreferred());

    // Listen for system preference changes (no saved override)
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          apply(e.matches ? DARK : LIGHT);
        }
      });

    // Bind buttons present at init time
    bindButtons();
  }

  /**
   * Binds click handlers to all .theme-toggle elements.
   * Call again after dynamic content injection.
   */
  function bindButtons() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.removeEventListener('click', toggle); // prevent duplicates
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, apply, bindButtons, getPreferred };
})();


/* ============================================================
   03. RTL MANAGER
   ============================================================ */

const RTLManager = (() => {
  const STORAGE_KEY = 'glowveda-rtl';

  function isRTL() {
    return document.documentElement.dir === 'rtl';
  }

  function apply(rtl) {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, rtl ? 'rtl' : 'ltr');

    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      btn.setAttribute('aria-label', rtl ? 'Switch to LTR' : 'Switch to RTL');
      btn.setAttribute('title', rtl ? 'Switch to LTR' : 'Switch to RTL');
      btn.setAttribute('aria-pressed', String(rtl));

      // Update button text label
      const label = btn.querySelector('.rtl-label');
      if (label) label.textContent = rtl ? 'LTR' : 'RTL';
    });
  }

  function toggle() {
    apply(!isRTL());
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    apply(saved === 'rtl');
    bindButtons();
  }

  function bindButtons() {
    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      btn.removeEventListener('click', toggle);
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, apply, isRTL, bindButtons };
})();


/* ============================================================
   04. NAVBAR MANAGER
   ============================================================ */

const NavbarManager = (() => {

  /**
   * Dynamically loads navbar HTML from /components/navbar.html
   * into #navbar-placeholder, then re-inits all dependents.
   */
  async function load() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    try {
      const response = await fetch('../components/navbar.html');
      if (!response.ok) throw new Error(`Navbar fetch failed: ${response.status}`);
      const html = await response.text();
      placeholder.innerHTML = html;

      // Re-bind everything that depends on navbar DOM
      initScroll();
      initMobile();
      setActiveLink();
      ThemeManager.bindButtons();
      RTLManager.bindButtons();
    } catch (err) {
      console.warn('[GlowVeda] Navbar could not be loaded:', err.message);
    }
  }

  /**
   * Adds .scrolled class to #navbar when page scrolls past 10px.
   */
  function initScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /**
   * Manages mobile hamburger menu open/close.
   */
  function initMobile() {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on mobile nav link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (
        hamburger.classList.contains('open') &&
        !hamburger.contains(e.target) &&
        !mobileNav.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /**
   * Marks the currently active nav link based on the current page URL.
   */
  function setActiveLink() {
    const currentPath = window.location.pathname;

    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Normalise paths for comparison
      const linkPath = new URL(href, window.location.origin).pathname;
      const isActive = currentPath === linkPath ||
        (linkPath !== '/' && currentPath.startsWith(linkPath.replace('/index.html', '')));

      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  return { load, initScroll, initMobile, setActiveLink };
})();


/* ============================================================
   05. FOOTER MANAGER
   ============================================================ */

const FooterManager = (() => {

  /**
   * Dynamically loads footer HTML from /components/footer.html
   * into #footer-placeholder.
   */
  async function load() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    try {
      const response = await fetch('../components/footer.html');
      if (!response.ok) throw new Error(`Footer fetch failed: ${response.status}`);
      const html = await response.text();
      placeholder.innerHTML = html;

      // Initialise newsletter form inside footer if present
      initNewsletterForm();
    } catch (err) {
      console.warn('[GlowVeda] Footer could not be loaded:', err.message);
    }
  }

  /**
   * Binds the newsletter subscribe form inside the footer.
   */
  function initNewsletterForm() {
    const form = document.querySelector('.footer-newsletter');
    if (!form) return;

    const input  = form.querySelector('input[type="email"]');
    const button = form.querySelector('button');

    if (!button) return;

    button.addEventListener('click', e => {
      e.preventDefault();
      if (!input || !input.value.trim()) {
        ToastManager.show('Please enter your email address.', 'warning');
        return;
      }
      if (!isValidEmail(input.value.trim())) {
        ToastManager.show('Please enter a valid email address.', 'error');
        return;
      }
      ToastManager.show('Thank you for subscribing! 🌿', 'success');
      input.value = '';
    });
  }

  return { load };
})();


/* ============================================================
   06. SCROLL ANIMATION OBSERVER
   ============================================================ */

const ScrollAnimator = (() => {

  let observer = null;

  /**
   * Observes all .animate-on-scroll elements and adds .animated
   * when they enter the viewport.
   */
  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('animated');
      });
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Re-observe newly added elements (e.g. after dynamic content).
   */
  function refresh() {
    if (!observer) {
      init();
      return;
    }
    document.querySelectorAll('.animate-on-scroll:not(.animated)').forEach(el => {
      observer.observe(el);
    });
  }

  return { init, refresh };
})();


/* ============================================================
   07. STAT COUNTER ANIMATIONS
   ============================================================ */

const StatCounter = (() => {

  /**
   * Animates a number from 0 to its target value.
   * @param {HTMLElement} el — element with data-target attribute
   */
  function animateNumber(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
    const start    = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuart(progress) * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Observes .stat-number[data-target] elements and starts
   * counter animation when they scroll into view.
   */
  function init() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.stat-number[data-target]').forEach(animateNumber);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      observer.observe(el);
    });
  }

  return { init };
})();


/* ============================================================
   08. TOAST NOTIFICATION SYSTEM
   ============================================================ */

const ToastManager = (() => {

  let container = null;
  let timeout   = null;

  /**
   * Ensures the toast container exists in the DOM.
   */
  function ensureContainer() {
    if (container) return;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  /**
   * Displays a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration — milliseconds before auto-dismiss
   */
  function show(message, type = 'success', duration = 3500) {
    ensureContainer();

    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    };

    const colorMap = {
      success: '#22C55E',
      error:   '#EF4444',
      warning: '#F59E0B',
      info:    '#3B82F6',
    };

    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: var(--bg-surface, #fff);
      border: 1px solid var(--border-color, #E5E7EB);
      border-left: 4px solid ${colorMap[type] || colorMap.info};
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      font-family: var(--font-body, sans-serif);
      font-size: 14px;
      color: var(--color-text-body, #1F2933);
      max-width: 360px;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    toast.innerHTML = `
      <span style="color: ${colorMap[type]}; flex-shrink: 0;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${escapeHtml(message)}</span>
      <button
        onclick="this.closest('[role=alert]').remove()"
        style="
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted, #6B7280);
          padding: 2px;
          display: flex;
          align-items: center;
          border-radius: 4px;
        "
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(0)';
      });
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  return { show };
})();


/* ============================================================
   09. MODAL MANAGER
   ============================================================ */

const ModalManager = (() => {

  /**
   * Opens a modal by its ID.
   * @param {string} id — modal overlay element id
   */
  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside modal
    const focusable = overlay.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) setTimeout(() => focusable.focus(), 50);

    // Trap focus inside modal
    overlay.addEventListener('keydown', trapFocus);
  }

  /**
   * Closes a modal by its ID.
   * @param {string} id
   */
  function close(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    overlay.classList.remove('open');
    document.body.style.overflow = '';
    overlay.removeEventListener('keydown', trapFocus);
  }

  /**
   * Closes modal when clicking the overlay backdrop.
   * @param {Event} e
   */
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Traps keyboard focus inside the modal.
   * @param {KeyboardEvent} e
   */
  function trapFocus(e) {
    const overlay   = e.currentTarget;
    const focusable = Array.from(overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Binds all [data-modal-open] and [data-modal-close] triggers.
   */
  function init() {
    // Open triggers
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => open(btn.dataset.modalOpen));
    });

    // Close triggers (X buttons)
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => close(btn.dataset.modalClose));
    });

    // Overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', handleOverlayClick);
    });
  }

  return { init, open, close };
})();


/* ============================================================
   10. LAZY IMAGE LOADER
   ============================================================ */

const LazyLoader = (() => {

  /**
   * Uses IntersectionObserver to load images with data-src attributes.
   */
  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all immediately
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  return { init };
})();


/* ============================================================
   11. SMOOTH SCROLL
   ============================================================ */

const SmoothScroll = (() => {

  /**
   * Enables smooth scrolling for all anchor links that point to #hash targets.
   */
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const hash   = anchor.getAttribute('href');
        if (hash === '#' || hash === '#0') return;

        const target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();

        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
          10
        ) || 80;

        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });

        // Update URL hash without triggering scroll
        history.pushState(null, '', hash);
      });
    });
  }

  return { init };
})();


/* ============================================================
   12. PAGE LOADER
   ============================================================ */

const PageLoader = (() => {

  /**
   * Hides the .page-loader element after the page loads.
   */
  function init() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    // Hide on window load (all resources loaded)
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        // Remove from DOM after transition
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, 200);
    });
  }

  return { init };
})();


/* ============================================================
   13. UTILITY FUNCTIONS
   ============================================================ */

/**
 * Escapes HTML to prevent XSS in dynamic content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates an Indian phone number (+91 XXXXXXXXXX).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Debounces a function call.
 * @param {Function} fn
 * @param {number} delay — ms
 * @returns {Function}
 */
function debounce(fn, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttles a function to fire at most once per `limit` ms.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Formats a number as Indian Rupees.
 * @param {number} amount
 * @param {boolean} showSymbol
 * @returns {string}
 */
function formatRupees(amount, showSymbol = true) {
  const formatted = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Truncates a string to maxLength with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Returns a human-readable relative date string.
 * @param {Date|string} date
 * @returns {string}
 */
function timeAgo(date) {
  const now  = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)} days ago`;

  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a URL query parameter value.
 * @param {string} key
 * @returns {string|null}
 */
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Simple form validation helper.
 * @param {HTMLFormElement} form
 * @returns {boolean} — true if all required fields are valid
 */
function validateForm(form) {
  let isValid = true;

  form.querySelectorAll('[required]').forEach(field => {
    const group   = field.closest('.form-group');
    const errorEl = group && group.querySelector('.form-error');

    // Clear previous
    field.classList.remove('error');
    if (errorEl) errorEl.style.display = 'none';

    let fieldValid = true;
    const val = field.value.trim();

    if (!val) {
      fieldValid = false;
    } else if (field.type === 'email' && !isValidEmail(val)) {
      fieldValid = false;
    } else if (field.type === 'tel' && !isValidPhone(val)) {
      fieldValid = false;
    }

    if (!fieldValid) {
      isValid = false;
      field.classList.add('error');
      if (errorEl) {
        errorEl.style.display = 'flex';
        errorEl.textContent   = field.dataset.errorMsg || 'This field is required.';
      }
      field.focus();
    }
  });

  return isValid;
}

/**
 * Copies text to clipboard and shows a toast.
 * @param {string} text
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    ToastManager.show('Copied to clipboard!', 'success', 2000);
  } catch {
    ToastManager.show('Copy failed. Please try manually.', 'error');
  }
}

/**
 * Adds body padding to offset the fixed navbar height.
 */
function applyNavbarOffset() {
  document.body.classList.add('has-navbar');
}

/**
 * Returns the resolved value of a CSS variable.
 * @param {string} varName — e.g. '--color-primary'
 * @returns {string}
 */
function getCSSVar(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Simple tab switcher for tab UI components.
 * Usage: call initTabs() after DOM is ready.
 */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
    const triggers = tabGroup.querySelectorAll('[data-tab]');
    const panels   = tabGroup.querySelectorAll('[data-tab-panel]');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const target = trigger.dataset.tab;

        triggers.forEach(t => {
          t.classList.toggle('active', t.dataset.tab === target);
          t.setAttribute('aria-selected', String(t.dataset.tab === target));
        });

        panels.forEach(panel => {
          panel.classList.toggle('active', panel.dataset.tabPanel === target);
          panel.hidden = panel.dataset.tabPanel !== target;
        });
      });
    });

    // Activate first tab by default
    if (triggers.length) triggers[0].click();
  });
}

/**
 * Accordion / FAQ toggle.
 */
function initAccordion() {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all siblings
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.accordion-item.open').forEach(openItem => {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
          const p = openItem.querySelector('.accordion-panel');
          if (p) p.style.maxHeight = null;
        });
      }

      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Star rating interactive component.
 */
function initStarRating() {
  document.querySelectorAll('.interactive-stars').forEach(widget => {
    const stars = widget.querySelectorAll('[data-star]');
    const input = widget.querySelector('input[name]');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.star, 10);
        if (input) input.value = value;

        stars.forEach(s => {
          const sVal = parseInt(s.dataset.star, 10);
          s.classList.toggle('filled', sVal <= value);
        });
      });

      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.star, 10);
        stars.forEach(s => {
          s.classList.toggle('hover', parseInt(s.dataset.star, 10) <= value);
        });
      });
    });

    widget.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

/**
 * Search / filter for lists.
 * Expects: input[data-search-input] and elements with [data-search-item].
 */
function initSearch() {
  document.querySelectorAll('[data-search-input]').forEach(input => {
    const targetSelector = input.dataset.searchInput;
    const items = document.querySelectorAll(targetSelector);

    input.addEventListener('input', debounce(() => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      items.forEach(item => {
        const text    = item.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        item.style.display = matches ? '' : 'none';
        if (matches) visible++;
      });

      // Show "no results" message
      const noResults = input
        .closest('[data-search-container]')
        ?.querySelector('[data-no-results]');
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    }, 300));
  });
}

/**
 * Back-to-top button functionality.
 */
function initBackToTop() {
  const btn = document.querySelector('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', throttle(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   14. INIT — Bootstrap everything on DOMContentLoaded
   ============================================================ */

onReady(async () => {
  // 1. Apply body navbar padding offset
  applyNavbarOffset();

  // 2. Theme (must be before any render to prevent FOUC)
  ThemeManager.init();

  // 3. RTL
  RTLManager.init();

  // 4. Page loader
  PageLoader.init();

  // 5. Load navbar & footer components (async)
  await Promise.allSettled([
    NavbarManager.load(),
    FooterManager.load(),
  ]);

  // 6. Scroll-triggered animations
  ScrollAnimator.init();

  // 7. Stat counters
  StatCounter.init();

  // 8. Lazy images
  LazyLoader.init();

  // 9. Smooth scroll
  SmoothScroll.init();

  // 10. Modals
  ModalManager.init();

  // 11. Tabs, Accordion, Search, Back-to-top
  initTabs();
  initAccordion();
  initStarRating();
  initSearch();
  initBackToTop();
});


/* ============================================================
   EXPORTS — make utilities available globally for page scripts
   ============================================================ */
window.GlowVeda = {
  ThemeManager,
  RTLManager,
  NavbarManager,
  FooterManager,
  ScrollAnimator,
  StatCounter,
  ToastManager,
  ModalManager,
  LazyLoader,
  SmoothScroll,
  // Utilities
  escapeHtml,
  isValidEmail,
  isValidPhone,
  debounce,
  throttle,
  formatRupees,
  truncate,
  timeAgo,
  randomInt,
  getQueryParam,
  validateForm,
  copyToClipboard,
  getCSSVar,
  initTabs,
  initAccordion,
  initStarRating,
  initSearch,
  initBackToTop,
};

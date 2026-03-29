/**
 * ============================================================
 * GlowVeda — Blogs Page (blogs.js)
 * ============================================================
 * 01. Category Filter
 * 02. Sidebar Search
 * 03. Inline CTA Newsletter Form
 * 04. Sidebar Newsletter Form
 * 05. Pagination
 * 06. Reading progress on blog cards (hover time)
 * 07. Init
 * ============================================================
 */

'use strict';

/* ============================================================
   01. CATEGORY FILTER
   Filters .blog-card--standard and .blog-card--spotlight
   cards by their data-category attribute.
   ============================================================ */
const CategoryFilter = (() => {

  let pills   = [];
  let cards   = [];
  let current = 'all';

  /**
   * Applies the filter — shows/hides cards with a fade.
   * @param {string} filter — data-category value or 'all'
   */
  function applyFilter(filter) {
    current = filter;

    cards.forEach(card => {
      const cat     = card.dataset.category || '';
      const visible = filter === 'all' || cat === filter;

      if (visible) {
        card.style.display = '';
        // Stagger re-entrance
        requestAnimationFrame(() => {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          });
        });
      } else {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(8px)';
        card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        setTimeout(() => {
          if (current !== 'all' && card.dataset.category !== current) {
            card.style.display = 'none';
          }
        }, 260);
      }
    });

    // Update grids — show "no results" if all hidden
    checkEmptyGrids();
  }

  function checkEmptyGrids() {
    document.querySelectorAll('.blog-cards-grid').forEach(grid => {
      const visibleCards = Array.from(
        grid.querySelectorAll('.blog-card--standard')
      ).filter(c => c.style.display !== 'none');

      let noResults = grid.nextElementSibling;
      if (noResults?.classList.contains('no-results-msg')) {
        noResults.remove();
      }

      if (visibleCards.length === 0 && current !== 'all') {
        const msg = document.createElement('p');
        msg.className  = 'no-results-msg';
        msg.style.cssText = `
          text-align: center;
          padding: 32px;
          color: var(--color-text-muted);
          font-style: italic;
          font-family: var(--font-display);
          font-size: var(--text-lg);
          grid-column: 1 / -1;
        `;
        msg.textContent = 'No articles in this category yet — check back soon.';
        grid.after(msg);
      }
    });
  }

  function init() {
    pills = Array.from(document.querySelectorAll('.cat-pill'));
    cards = Array.from(document.querySelectorAll('[data-category]'));

    if (!pills.length) return;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter || 'all';

        // Update active state
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        applyFilter(filter);

        // Update URL hash for bookmarkability
        if (filter === 'all') {
          history.replaceState(null, '', window.location.pathname);
        } else {
          history.replaceState(null, '', `#${filter}`);
        }
      });
    });

    // Restore filter from URL hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const matchPill = pills.find(p => p.dataset.filter === hash);
      if (matchPill) matchPill.click();
    }
  }

  return { init };
})();


/* ============================================================
   02. SIDEBAR SEARCH
   Live-filters card titles as user types.
   ============================================================ */
const SidebarSearch = (() => {

  function init() {
    const input = document.getElementById('sidebar-search-input');
    if (!input) return;

    const allCards = Array.from(document.querySelectorAll(
      '.blog-card--standard, .blog-card--spotlight'
    ));

    // Debounced live search
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        let hits = 0;

        allCards.forEach(card => {
          const titleEl = card.querySelector('.blog-card__title');
          const excerptEl = card.querySelector('.blog-card__excerpt');
          const text = (
            (titleEl?.textContent || '') +
            (excerptEl?.textContent || '')
          ).toLowerCase();

          const matches = !query || text.includes(query);
          card.style.opacity  = matches ? '1' : '0.25';
          card.style.filter   = matches ? ''  : 'grayscale(0.6)';
          card.style.pointerEvents = matches ? '' : 'none';
          if (matches) hits++;
        });

        // Notify screen readers
        const liveRegion = document.getElementById('search-live-region');
        if (liveRegion) {
          liveRegion.textContent = query
            ? `${hits} article${hits !== 1 ? 's' : ''} matching "${query}"`
            : '';
        }
      }, 280);
    });

    // Sidebar search form submission — scroll to grid
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const gridArea = document.getElementById('blogGridArea');
        if (gridArea) {
          gridArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Create live region for a11y
    const liveRegion = document.createElement('div');
    liveRegion.id = 'search-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  return { init };
})();


/* ============================================================
   03. INLINE CTA NEWSLETTER FORM
   ============================================================ */
function initInlineCTA() {
  const form = document.querySelector('.inline-cta__form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();

    if (!email) {
      window.GlowVeda?.ToastManager.show('Please enter your email address.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.GlowVeda?.ToastManager.show('Please enter a valid email address.', 'error');
      return;
    }

    window.GlowVeda?.ToastManager.show(
      'You're subscribed to the GlowVeda Journal! 🌿',
      'success',
      4000
    );
    if (input) input.value = '';
  });
}


/* ============================================================
   04. SIDEBAR NEWSLETTER FORM
   ============================================================ */
function initSidebarNewsletter() {
  const form = document.querySelector('.sidebar-newsletter__form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();

    if (!email) {
      window.GlowVeda?.ToastManager.show('Please enter your email.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.GlowVeda?.ToastManager.show('Invalid email address.', 'error');
      return;
    }

    window.GlowVeda?.ToastManager.show(
      'Welcome to the Glow Letter! Check your inbox Sunday 🌿',
      'success',
      4500
    );
    if (input) input.value = '';
  });
}


/* ============================================================
   05. PAGINATION
   Simple in-page pagination UI (visual-only; extend with
   real data source in production).
   ============================================================ */
function initPagination() {
  const prevBtn  = document.querySelector('.page-btn--prev');
  const nextBtn  = document.querySelector('.page-btn--next');
  const pageBtns = Array.from(document.querySelectorAll('.page-btn-group .page-btn'));
  let currentPage = 1;
  const totalPages = pageBtns.length > 0 ? parseInt(pageBtns[pageBtns.length - 1].textContent) || 8 : 8;

  function updateUI() {
    pageBtns.forEach(btn => {
      const num = parseInt(btn.textContent);
      const active = num === currentPage;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  }

  pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = parseInt(btn.textContent);
      if (!isNaN(num)) {
        currentPage = num;
        updateUI();
        // Scroll back to top of grid
        document.getElementById('blogGridArea')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        if (window.GlowVeda?.ToastManager) {
          window.GlowVeda.ToastManager.show(`Page ${currentPage} of ${totalPages}`, 'info', 1800);
        }
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateUI();
        document.getElementById('blogGridArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        updateUI();
        document.getElementById('blogGridArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}


/* ============================================================
   06. CARD HOVER MICRO-INTERACTION
   Shows a subtle reading time tooltip on card image hover.
   ============================================================ */
function initCardHoverEffects() {
  document.querySelectorAll('.blog-card--standard, .blog-card--spotlight').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.willChange = 'transform, box-shadow';
    });
    card.addEventListener('mouseleave', function () {
      this.style.willChange = 'auto';
    });
  });
}


/* ============================================================
   07. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  CategoryFilter.init();
  SidebarSearch.init();
  initInlineCTA();
  initSidebarNewsletter();
  initPagination();
  initCardHoverEffects();
});

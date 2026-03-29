/**
 * ============================================================
 * GlowVeda — Home Page 2 JavaScript
 * Subscription & Routine Focus
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Routine Builder — Skin Type Selector
 * 02. Billing Toggle (Monthly / Quarterly)
 * 03. Testimonials Slider
 * 04. CTA Subscribe Form
 * 05. Page Init
 * ============================================================
 */

'use strict';

/* ============================================================
   01. ROUTINE BUILDER — Interactive Skin Type Selector
   ============================================================ */

/**
 * Skin routine data for each skin type.
 * Each entry has morning and night step arrays:
 * { name: string, product: string }
 */
const ROUTINES = {
  oily: {
    title: 'Oily Skin Ayurvedic Routine',
    morning: [
      { name: 'Cleanse',        product: 'Neem & Tea Tree Foam Cleanser — controls excess oil from overnight' },
      { name: 'Tone',           product: 'Witch Hazel & Rose Water Toner — tightens enlarged pores' },
      { name: 'Serum',          product: 'Turmeric & Bakuchiol Serum — brightens, controls sebum production' },
      { name: 'Moisturise',     product: 'Oil-Free Aloe Gel Moisturiser — hydrates without adding shine' },
      { name: 'SPF',            product: 'Matte Finish Sunscreen SPF 40 — protects without clogging pores' },
    ],
    night: [
      { name: 'Cleanse',        product: 'Charcoal & Neem Gel Cleanser — deep pore purification' },
      { name: 'Exfoliate',      product: 'Multani Mitti Enzyme Peel (2×/week) — absorbs excess oil, refines texture' },
      { name: 'Treatment',      product: 'Neem & Salicylic Elixir — unclogs pores, prevents breakouts' },
      { name: 'Moisturise',     product: 'Water-Based Ashwagandha Night Gel — lightweight overnight hydration' },
    ],
  },

  dry: {
    title: 'Dry Skin Ayurvedic Routine',
    morning: [
      { name: 'Cleanse',        product: 'Cream Milk Cleanser with Ashwagandha — cleanses without stripping' },
      { name: 'Tone',           product: 'Rose & Glycerin Essence Mist — instantly softens and plumps' },
      { name: 'Serum',          product: 'Hyaluronic Acid & Saffron Serum — deep moisture surge' },
      { name: 'Eye Cream',      product: 'Almond Oil Eye Balm — targets dryness and fine lines around eyes' },
      { name: 'Moisturise + SPF',product: 'Shea & Sandalwood Rich Day Cream SPF 30 — seals in moisture' },
    ],
    night: [
      { name: 'Oil Cleanse',    product: 'Sunflower & Rosehip Cleansing Balm — melts dry-skin impurities' },
      { name: 'Tone',           product: 'Neroli Hydrating Toner — restores moisture barrier' },
      { name: 'Treatment',      product: 'Kumkumadi Night Repair Elixir — deeply nourishes and repairs' },
      { name: 'Night Cream',    product: 'Saffron & Shea Night Butter — intense overnight replenishment' },
      { name: 'Lip Care',       product: 'Beeswax & Honey Lip Balm — heals dry, chapped lips as you sleep' },
    ],
  },

  acne: {
    title: 'Acne-Prone Skin Routine',
    morning: [
      { name: 'Cleanse',        product: 'Neem & Tulsi Antibacterial Cleanser — kills acne-causing bacteria' },
      { name: 'Tone',           product: 'AHA + Turmeric Clarifying Toner — exfoliates, reduces congestion' },
      { name: 'Serum',          product: 'Niacinamide & Neem Serum — minimises pores, reduces inflammation' },
      { name: 'Moisturise',     product: 'Centella Asiatica Soothing Gel — heals blemishes, calms redness' },
      { name: 'SPF',            product: 'Non-Comedogenic Sunscreen SPF 50 — won\'t block pores' },
    ],
    night: [
      { name: 'Double Cleanse', product: 'Jojoba Oil Balm → Neem Foam — removes SPF + unclogs pores' },
      { name: 'Exfoliate',      product: 'BHA + Papaya Enzyme Mask (2×/week) — dissolves dead cells, unclogs' },
      { name: 'Treatment',      product: 'Tea Tree & Salicylic Spot Elixir — targeted blemish treatment overnight' },
      { name: 'Moisturise',     product: 'Madecassoside Night Cream — soothes, fades acne scars while you sleep' },
    ],
  },

  sensitive: {
    title: 'Sensitive Skin Gentle Routine',
    morning: [
      { name: 'Cleanse',        product: 'Oat & Chamomile Gentle Milk Cleanser — zero irritation cleanse' },
      { name: 'Tone',           product: 'Cucumber & Calendula Calming Toner — instant relief and balance' },
      { name: 'Serum',          product: 'Aloe Vera & Centella Soothing Serum — repairs barrier, reduces redness' },
      { name: 'Moisturise',     product: 'Chamomile & Aloe Fragrance-Free Moisturiser — calms reactive skin' },
      { name: 'SPF',            product: 'Mineral Zinc Oxide SPF 35 — gentle physical sun protection' },
    ],
    night: [
      { name: 'Cleanse',        product: 'Rose & Oat Sensitive Micellar Gel — non-stripping, soothing cleanse' },
      { name: 'Mask',           product: 'Kaolin & Calendula Calming Mask (1×/week) — reduces inflammation' },
      { name: 'Treatment',      product: 'Bakuchiol (natural retinol) Night Serum — gentle renewal without irritation' },
      { name: 'Night Cream',    product: 'Cica & Sandalwood Barrier Repair Cream — restores overnight comfort' },
    ],
  },
};

/**
 * Initialises the skin type selector and routine panel.
 */
function initRoutineBuilder() {
  const skinCards   = document.querySelectorAll('.h2-skin-card');
  const routinePanel = document.getElementById('routine-panel');
  const panelTitle  = document.getElementById('routine-panel-title');
  const morningList = document.getElementById('morning-steps');
  const nightList   = document.getElementById('night-steps');

  if (!skinCards.length || !routinePanel) return;

  skinCards.forEach(card => {
    card.addEventListener('click', () => {
      const skinType = card.dataset.skin;
      const routine  = ROUTINES[skinType];
      if (!routine) return;

      // Update aria-checked state
      skinCards.forEach(c => {
        c.setAttribute('aria-checked', 'false');
        c.classList.remove('selected');
      });
      card.setAttribute('aria-checked', 'true');
      card.classList.add('selected');

      // Populate routine panel
      panelTitle.textContent = routine.title;

      morningList.innerHTML = buildStepListHTML(routine.morning);
      nightList.innerHTML   = buildStepListHTML(routine.night);

      // Show panel with animation
      routinePanel.hidden = false;
      routinePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Re-init Lucide for the newly injected SVGs
      if (window.lucide) {
        lucide.createIcons();
      }
    });
  });
}

/**
 * Builds the HTML for a list of routine steps.
 * @param {Array<{name: string, product: string}>} steps
 * @returns {string}
 */
function buildStepListHTML(steps) {
  return steps.map((step, i) => `
    <li style="animation-delay: ${i * 60}ms;">
      <div class="h2-routine-step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div>
      <div>
        <p class="h2-routine-step__name">${escapeStr(step.name)}</p>
        <p class="h2-routine-step__product">${escapeStr(step.product)}</p>
      </div>
    </li>
  `).join('');
}

/**
 * Simple XSS-safe string escaper (mirrors global escapeHtml without depending on it being loaded).
 * @param {string} str
 * @returns {string}
 */
function escapeStr(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}


/* ============================================================
   02. BILLING TOGGLE (Monthly / Quarterly)
   ============================================================ */

/**
 * Initialises the monthly/quarterly billing toggle.
 * Updates all .h2-plan-card__amount elements based on data attributes.
 */
function initBillingToggle() {
  const toggleBtns   = document.querySelectorAll('.h2-toggle-btn');
  const priceAmounts = document.querySelectorAll('.h2-plan-card__amount');

  if (!toggleBtns.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const billing = btn.dataset.billing;

      // Update active state
      toggleBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.billing === billing);
        b.setAttribute('aria-pressed', String(b.dataset.billing === billing));
      });

      // Update prices with animation
      priceAmounts.forEach(amountEl => {
        const value = amountEl.dataset[billing];
        if (!value) return;

        // Quick scale-down → update → scale-up
        amountEl.style.transform  = 'scale(0.85)';
        amountEl.style.opacity    = '0';
        amountEl.style.transition = 'transform 0.18s ease, opacity 0.18s ease';

        setTimeout(() => {
          // Format with Indian locale (comma for thousands)
          amountEl.textContent      = Number(value).toLocaleString('en-IN');
          amountEl.style.transform  = 'scale(1)';
          amountEl.style.opacity    = '1';
        }, 180);
      });
    });
  });
}


/* ============================================================
   03. TESTIMONIALS SLIDER
   ============================================================ */

/**
 * Initialises the testimonials card slider.
 * On desktop: shows 3 cards visible; on tablet: 1.
 */
function initTestimonialsSlider() {
  const track   = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (!track || !prevBtn || !nextBtn) return;

  const cards     = Array.from(track.querySelectorAll('.h2-tcard'));
  const totalCards = cards.length;
  let currentIndex = 0;
  let visibleCount = getVisibleCount();

  /**
   * Returns the number of cards visible at once based on viewport.
   * @returns {number}
   */
  function getVisibleCount() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  /**
   * Returns the max slide index (so we don't go past the last card).
   * @returns {number}
   */
  function getMaxIndex() {
    return Math.max(0, totalCards - visibleCount);
  }

  /**
   * Renders the dot buttons into #testimonial-dots.
   */
  function renderDots() {
    dotsContainer.innerHTML = '';
    const maxIndex = getMaxIndex();

    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className  = `h2-slider-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('aria-selected', String(i === currentIndex));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  /**
   * Updates dots to reflect the current index.
   */
  function updateDots() {
    dotsContainer.querySelectorAll('.h2-slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });
  }

  /**
   * Navigates the slider to a specific index.
   * @param {number} index
   */
  function goTo(index) {
    const maxIndex = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    // Calculate card width as percentage of track
    const cardWidthPct = 100 / visibleCount;
    const translateX   = -(currentIndex * cardWidthPct);

    // Apply the transform to the track
    track.style.transform  = `translateX(${translateX}%)`;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    updateDots();
  }

  /**
   * Applies the visible card width via CSS grid.
   */
  function applyLayout() {
    visibleCount = getVisibleCount();

    // Set track to display cards at correct size
    track.style.display               = 'flex';
    track.style.flexWrap              = 'nowrap';
    track.style.overflow              = 'visible';
    track.style.transform             = 'translateX(0)';
    track.style.transition            = 'none';

    const gapPx = 24; // matches --space-3
    cards.forEach(card => {
      card.style.flex     = `0 0 calc(${100 / visibleCount}% - ${(gapPx * (visibleCount - 1)) / visibleCount}px)`;
      card.style.maxWidth = `calc(${100 / visibleCount}% - ${(gapPx * (visibleCount - 1)) / visibleCount}px)`;
    });

    // Wrap in an outer overflow:hidden container programmatically
    if (!track.parentElement.classList.contains('h2-testimonials__overflow')) {
      track.parentElement.style.overflow = 'hidden';
    }

    currentIndex = 0;
    goTo(0);
    renderDots();
  }

  // Event listeners
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Auto-play
  let autoPlayInterval = setInterval(() => {
    const maxIndex = getMaxIndex();
    if (currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else {
      goTo(0);
    }
  }, 5000);

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  track.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(() => {
      const maxIndex = getMaxIndex();
      goTo(currentIndex < maxIndex ? currentIndex + 1 : 0);
    }, 5000);
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  // Re-layout on resize
  const debouncedResize = debounce(() => {
    applyLayout();
  }, 200);
  window.addEventListener('resize', debouncedResize);

  // Initial layout
  applyLayout();
}

/**
 * Simple debounce — inlined to avoid global.js load-order dependency.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}


/* ============================================================
   04. CTA SUBSCRIBE FORM
   ============================================================ */

/**
 * Handles the hero-area email capture form submission.
 */
function initCTAForm() {
  const form  = document.getElementById('cta-subscribe-form');
  if (!form) return;

  const input = form.querySelector('#cta-email');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const email = input ? input.value.trim() : '';

    // Validation
    if (!email) {
      showToast('Please enter your email address.', 'warning');
      if (input) input.focus();
      return;
    }

    if (!isEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      if (input) input.focus();
      return;
    }

    // Simulate success
    showToast('🌿 Welcome to GlowVeda! Check your inbox for your early access discount.', 'success', 4500);
    form.reset();
  });
}

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Shows a toast via GlowVeda global if available, else console.
 * @param {string} message
 * @param {string} type
 * @param {number} [duration]
 */
function showToast(message, type = 'success', duration = 3500) {
  if (window.GlowVeda && window.GlowVeda.ToastManager) {
    window.GlowVeda.ToastManager.show(message, type, duration);
  }
}


/* ============================================================
   05. PAGE INIT
   ============================================================ */

/**
 * Waits for DOM to be ready, then bootstraps all Home 2 features.
 * Uses a slight delay to ensure global.js components (navbar/footer) are mounted.
 */
function initHome2() {
  // 1. Routine builder
  initRoutineBuilder();

  // 2. Billing toggle
  initBillingToggle();

  // 3. Testimonials slider
  initTestimonialsSlider();

  // 4. CTA form
  initCTAForm();

  // 5. Re-render Lucide icons (some are injected after DOM ready via navbar/footer)
  //    Delay slightly so navbar/footer fetch has completed
  setTimeout(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  }, 600);
}

// Bootstrap once DOM is parsed
if (document.readyState !== 'loading') {
  initHome2();
} else {
  document.addEventListener('DOMContentLoaded', initHome2);
}

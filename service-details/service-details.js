/**
 * ============================================================
 * GlowVeda — Service Details SHARED JavaScript
 * Organic Skincare & Soap Crafters
 * Version: 1.0.0
 * ============================================================
 * This single JS file is shared across ALL six
 * service-details pages. Each page only needs to link
 * to this file alongside global.js.
 *
 * TABLE OF CONTENTS:
 * 01. Service Details Page Init
 * 02. Hero Ken Burns & Parallax
 * 03. Gallery Lightbox
 * 04. Sticky Sidebar Scroll Behaviour
 * 05. FAQ Accordion (extended from global.js)
 * 06. Booking / Enquiry Form Handler
 * 07. Pricing Card Hover Tilt
 * 08. Ingredients Card Entrance
 * 09. Process Steps Reveal
 * 10. Scroll Progress Bar
 * 11. Active Section Highlight (sidebar TOC)
 * 12. Share Page Utility
 * ============================================================
 */

'use strict';

/* ============================================================
   01. SERVICE DETAILS PAGE INIT
   Bootstraps all modules after global.js has loaded.
   ============================================================ */

function initServiceDetailsPage() {
  initSDHero();
  initSDGallery();
  initSDStickyObserver();
  initSDFAQ();
  initSDBookingForm();
  initSDPricingTilt();
  initSDIngredientEntrance();
  initSDProcessReveal();
  initSDScrollProgress();
  initSDShare();
}


/* ============================================================
   02. HERO KEN BURNS & PARALLAX
   Triggers the Ken Burns zoom on the hero image after load,
   and applies a subtle parallax as the user scrolls.
   ============================================================ */

function initSDHero() {
  const hero  = document.querySelector('.sd-hero');
  const bgImg = document.querySelector('.sd-hero__bg img');
  const blob1 = document.querySelector('.sd-hero__blob--1');
  const blob2 = document.querySelector('.sd-hero__blob--2');

  if (!hero) return;

  // Trigger Ken Burns class after a short delay for smooth start
  requestAnimationFrame(() => {
    setTimeout(() => hero.classList.add('loaded'), 200);
  });

  // Parallax on scroll
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const heroH   = hero.offsetHeight || 1;
    const rect    = hero.getBoundingClientRect();

    if (rect.bottom < 0) { ticking = false; return; }

    const progress = Math.min(scrollY / heroH, 1);

    if (bgImg)  bgImg.style.transform  = `scale(1.05) translateY(${progress * 25}px)`;
    if (blob1)  blob1.style.transform  = `translateY(${progress * 45}px)`;
    if (blob2)  blob2.style.transform  = `translateY(${progress * -35}px)`;

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}


/* ============================================================
   03. GALLERY LIGHTBOX
   Opens a fullscreen lightbox overlay when a gallery
   image is clicked. Supports keyboard navigation.
   ============================================================ */

function initSDGallery() {
  const galleryItems = document.querySelectorAll('.sd-gallery__item');
  if (!galleryItems.length) return;

  // Collect all image src + alt pairs
  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return img ? { src: img.src, alt: img.alt } : null;
  }).filter(Boolean);

  // Build lightbox overlay element
  const overlay = document.createElement('div');
  overlay.id = 'sd-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image lightbox');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.93);
    z-index: 9998;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  `;

  const lbImg = document.createElement('img');
  lbImg.style.cssText = `
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    transition: opacity 0.25s ease;
  `;

  const lbCaption = document.createElement('p');
  lbCaption.style.cssText = `
    color: rgba(200,223,196,0.8);
    font-size: 14px;
    text-align: center;
    max-width: 600px;
    font-family: var(--font-body);
  `;

  // Close button
  const lbClose = document.createElement('button');
  lbClose.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  lbClose.setAttribute('aria-label', 'Close lightbox');
  lbClose.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
  `;
  lbClose.addEventListener('mouseenter', () => { lbClose.style.background = 'rgba(255,255,255,0.2)'; });
  lbClose.addEventListener('mouseleave', () => { lbClose.style.background = 'rgba(255,255,255,0.1)'; });

  overlay.append(lbClose, lbImg, lbCaption);
  document.body.appendChild(overlay);

  let currentIndex = 0;

  /**
   * Opens the lightbox at the given image index.
   * @param {number} index
   */
  function openLightbox(index) {
    currentIndex      = index;
    lbImg.src         = images[index].src;
    lbImg.alt         = images[index].alt;
    lbCaption.textContent = images[index].alt;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  /**
   * Closes the lightbox.
   */
  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Bind gallery item clicks
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View full image: ${images[idx]?.alt || 'Gallery image'}`);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
    });
  });

  // Close on overlay backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeLightbox();
  });

  lbClose.addEventListener('click', closeLightbox);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (overlay.style.display !== 'flex') return;

    if (e.key === 'Escape') { closeLightbox(); }
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % images.length;
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = images[currentIndex].src;
        lbCaption.textContent = images[currentIndex].alt;
        lbImg.style.opacity = '1';
      }, 150);
    }
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = images[currentIndex].src;
        lbCaption.textContent = images[currentIndex].alt;
        lbImg.style.opacity = '1';
      }, 150);
    }
  });
}


/* ============================================================
   04. STICKY SIDEBAR SCROLL BEHAVIOUR
   Adjusts the sidebar's top offset dynamically so it never
   overlaps with the navbar. Also detects when to un-stick
   at the bottom of the page.
   ============================================================ */

function initSDStickyObserver() {
  const sidebar = document.querySelector('.sd-sidebar');
  if (!sidebar) return;

  function adjustSidebarTop() {
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10
    ) || 80;

    sidebar.style.top = `${navHeight + 24}px`;
  }

  adjustSidebarTop();
  window.addEventListener('resize', adjustSidebarTop, { passive: true });
}


/* ============================================================
   05. FAQ ACCORDION (Service Details Extended)
   Works with the global.js initAccordion(), but also adds
   smooth max-height transitions via JS measurement.
   ============================================================ */

function initSDFAQ() {
  const accordions = document.querySelectorAll('.sd-faq-list .accordion-item');
  if (!accordions.length) return;

  accordions.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all open siblings first
      document.querySelectorAll('.sd-faq-list .accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
        const p = openItem.querySelector('.accordion-panel');
        if (p) p.style.maxHeight = '0px';
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Initialise ARIA
    trigger.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = '0px';
  });
}


/* ============================================================
   06. BOOKING / ENQUIRY FORM HANDLER
   Validates the booking form, shows success state.
   ============================================================ */

function initSDBookingForm() {
  const form = document.querySelector('.sd-booking-form');
  if (!form) return;

  const submitBtn = form.querySelector('[type="submit"]');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', e => {
    e.preventDefault();

    // Use global validateForm if available
    let isValid = true;

    if (window.GlowVeda && window.GlowVeda.validateForm) {
      isValid = window.GlowVeda.validateForm(form);
    } else {
      // Fallback basic validation
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--color-error)';
        } else {
          field.style.borderColor = '';
        }
      });
    }

    if (!isValid) return;

    // Simulate async submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Sending…
    `;

    // Spinner animation on the button icon
    const spinnerEl = submitBtn.querySelector('svg');
    if (spinnerEl) {
      spinnerEl.style.animation = 'spin 0.8s linear infinite';
    }

    setTimeout(() => {
      form.classList.add('submitted');

      if (window.GlowVeda && window.GlowVeda.ToastManager) {
        window.GlowVeda.ToastManager.show(
          'Enquiry received! We\'ll get back to you within 24 hours. 🌿',
          'success',
          4000
        );
      }
    }, 1600);
  });

  // Real-time field validation feedback
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => {
      const group   = field.closest('.form-group');
      const errorEl = group && group.querySelector('.form-error');

      if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.style.display = 'flex';
          errorEl.textContent   = field.dataset.errorMsg || 'This field is required.';
        }
      } else if (field.type === 'email') {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        field.classList.toggle('error', !isValid && !!field.value);
        if (errorEl) {
          errorEl.style.display = (!isValid && field.value) ? 'flex' : 'none';
          errorEl.textContent   = 'Please enter a valid email address.';
        }
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.style.display = 'none';
      }
    });
  });
}


/* ============================================================
   07. PRICING CARD HOVER TILT
   Subtle 3D perspective tilt on pricing cards as mouse moves.
   Disabled on touch devices.
   ============================================================ */

function initSDPricingTilt() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.sd-pricing-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect      = card.getBoundingClientRect();
      const centerX   = rect.left + rect.width / 2;
      const centerY   = rect.top  + rect.height / 2;
      const mouseX    = e.clientX - centerX;
      const mouseY    = e.clientY - centerY;

      // Max tilt 6deg
      const tiltX = -(mouseY / (rect.height / 2)) * 6;
      const tiltY =  (mouseX / (rect.width  / 2)) * 6;

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ============================================================
   08. INGREDIENTS CARD ENTRANCE
   Staggers the ingredient cards as they enter the viewport.
   ============================================================ */

function initSDIngredientEntrance() {
  const cards = document.querySelectorAll('.sd-ingredient-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  cards.forEach((card, idx) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(20px) scale(0.96)';
    card.style.transition = `opacity 0.5s ease ${idx * 80}ms, transform 0.5s ease ${idx * 80}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  cards.forEach(card => observer.observe(card));
}


/* ============================================================
   09. PROCESS STEPS REVEAL
   Steps on the left-bordered timeline slide in as they
   enter the viewport with staggered timing.
   ============================================================ */

function initSDProcessReveal() {
  const steps = document.querySelectorAll('.sd-process-step');
  if (!steps.length || !('IntersectionObserver' in window)) return;

  steps.forEach((step, idx) => {
    step.style.opacity   = '0';
    step.style.transform = 'translateX(-20px)';
    step.style.transition = `opacity 0.55s ease ${idx * 100}ms, transform 0.55s ease ${idx * 100}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  steps.forEach(step => observer.observe(step));
}


/* ============================================================
   10. SCROLL PROGRESS BAR
   Thin green-to-gold gradient bar pinned to the page top.
   ============================================================ */

function initSDScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'sd-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    z-index: 10000;
    transition: width 0.12s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(100, Math.max(0, pct))}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ============================================================
   11. ACTIVE SECTION HIGHLIGHT (Sidebar TOC)
   If the sidebar contains anchor links (table of contents),
   highlights the one matching the currently visible section.
   ============================================================ */

function initSDShare() {
  const shareBtn = document.querySelector('[data-sd-share]');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const title = document.title;
    const url   = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — no action needed
      }
    } else if (window.GlowVeda && window.GlowVeda.copyToClipboard) {
      window.GlowVeda.copyToClipboard(url);
    } else {
      try {
        await navigator.clipboard.writeText(url);
        if (window.GlowVeda && window.GlowVeda.ToastManager) {
          window.GlowVeda.ToastManager.show('Page link copied!', 'success', 2000);
        }
      } catch {
        // Silent fail
      }
    }
  });
}


/* ============================================================
   PAGE ENTRY
   Runs after global.js completes navbar/footer injection.
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initServiceDetailsPage, 120));
} else {
  setTimeout(initServiceDetailsPage, 120);
}

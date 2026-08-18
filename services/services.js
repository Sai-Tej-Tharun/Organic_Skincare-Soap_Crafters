/**
 * ============================================================
 * GlowVeda — Services Page JavaScript
 * Organic Skincare & Soap Crafters
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Services Page Init
 * 02. Hero Parallax
 * 03. Jump Pill Active State (scroll spy)
 * 04. Service Card Entrance Animations
 * 05. Comparison Table Row Highlight
 * 06. Process Step Connector Animation
 * 07. Scroll Progress Bar
 * ============================================================
 */

'use strict';

/* ============================================================
   01. SERVICES PAGE INIT
   ============================================================ */

function initServicesPage() {
  initHeroParallax();
  initJumpPillScrollSpy();
  initServiceCardEntrance();
  initTableRowHighlight();
  initProcessConnector();
  initScrollProgress();
}


/* ============================================================
   02. HERO PARALLAX
   Subtle vertical movement of the hero background and blobs
   as the user scrolls past the hero section.
   ============================================================ */

function initHeroParallax() {
  const hero  = document.querySelector('.services-hero');
  const blob1 = document.querySelector('.services-hero__blob--1');
  const blob2 = document.querySelector('.services-hero__blob--2');
  const bgImg = document.querySelector('.services-hero__bg img');

  if (!hero) return;

  let ticking = false;

  function update() {
    const scrollY   = window.scrollY;
    const heroH     = hero.offsetHeight || 1;
    const rect      = hero.getBoundingClientRect();

    if (rect.bottom < 0) { ticking = false; return; }

    const progress = Math.min(scrollY / heroH, 1);

    if (blob1) blob1.style.transform = `translateY(${progress * 50}px)`;
    if (blob2) blob2.style.transform = `translateY(${progress * -40}px)`;
    if (bgImg) bgImg.style.transform = `scale(1.05) translateY(${progress * 30}px)`;

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}


/* ============================================================
   03. JUMP PILL SCROLL SPY
   Highlights the active jump pill based on which service
   section is currently visible in the viewport.
   ============================================================ */

function initJumpPillScrollSpy() {
  const pills = document.querySelectorAll('.services-jump-pill');
  if (!pills.length || !('IntersectionObserver' in window)) return;

  /**
   * Map pill href anchors to their corresponding section IDs.
   * e.g. "#custom-soap-crafting" -> "custom-soap-crafting"
   */
  const sectionIds = Array.from(pills).map(pill => {
    const href = pill.getAttribute('href') || '';
    return href.replace('#', '');
  });

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id   = entry.target.id;
          const href = `#${id}`;

          pills.forEach(pill => {
            const isActive = pill.getAttribute('href') === href;
            pill.style.background    = isActive ? 'var(--color-accent)' : '';
            pill.style.borderColor   = isActive ? 'var(--color-accent)' : '';
            pill.style.color         = isActive ? 'var(--color-primary-dark)' : '';
          });
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: '-80px 0px -40% 0px',
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   04. SERVICE CARD ENTRANCE ANIMATIONS
   Service cards slide in from their image side as they
   enter the viewport — left cards from left, right from right.
   ============================================================ */

function initServiceCardEntrance() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  // Apply initial hidden state
  cards.forEach((card, idx) => {
    const isReverse = card.classList.contains('service-card--reverse');
    card.style.opacity   = '0';
    card.style.transform = isReverse ? 'translateX(40px)' : 'translateX(-40px)';
    card.style.transition = `opacity 0.7s ease ${idx * 50}ms, transform 0.7s ease ${idx * 50}ms`;
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
    { threshold: 0.12 }
  );

  cards.forEach(card => observer.observe(card));
}


/* ============================================================
   05. COMPARISON TABLE ROW HIGHLIGHT
   When the user hovers a table row, briefly highlights the
   corresponding service card in the main grid by scrolling
   it into view and flashing its border.
   ============================================================ */

function initTableRowHighlight() {
  const tableRows = document.querySelectorAll('.services-compare__table tbody tr');
  if (!tableRows.length) return;

  /**
   * Maps table row index to service card anchor IDs.
   */
  const serviceIds = [
    'custom-soap-crafting',
    'skincare-consultation',
    'diy-workshops',
    'subscription-boxes',
    'wholesale-bulk',
    'gifting-solutions',
  ];

  tableRows.forEach((row, idx) => {
    const serviceId = serviceIds[idx];
    if (!serviceId) return;

    row.style.cursor = 'pointer';

    /**
     * On row click, smooth-scroll to the matching service card
     * and highlight its border briefly.
     */
    row.addEventListener('click', () => {
      const targetCard = document.getElementById(serviceId);
      if (!targetCard) return;

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10
      ) || 80;

      const top = targetCard.getBoundingClientRect().top + window.scrollY - navHeight - 24;
      window.scrollTo({ top, behavior: 'smooth' });

      // Flash the card border with accent colour
      const originalBorder = targetCard.style.borderColor;
      const originalShadow = targetCard.style.boxShadow;

      targetCard.style.borderColor = 'var(--color-accent)';
      targetCard.style.boxShadow   = '0 0 0 3px rgba(212, 168, 87, 0.35)';
      targetCard.style.transition  = 'border-color 0.3s ease, box-shadow 0.3s ease';

      setTimeout(() => {
        targetCard.style.borderColor = originalBorder;
        targetCard.style.boxShadow   = originalShadow;
      }, 1800);
    });
  });
}


/* ============================================================
   06. PROCESS STEP CONNECTOR ANIMATION
   Pulses the arrow connectors between process steps when
   the how-it-works section enters the viewport.
   ============================================================ */

function initProcessConnector() {
  const connectors = document.querySelectorAll('.services-process__connector');
  const section    = document.querySelector('.services-process');

  if (!connectors.length || !section || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger connector pulses
          connectors.forEach((conn, idx) => {
            setTimeout(() => {
              conn.style.transform  = 'scale(1.3)';
              conn.style.color      = 'var(--color-accent)';
              conn.style.transition = 'transform 0.3s ease, color 0.3s ease';
              setTimeout(() => {
                conn.style.transform = '';
                conn.style.color     = '';
              }, 400);
            }, 400 + idx * 200);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(section);
}


/* ============================================================
   07. SCROLL PROGRESS BAR
   Thin gradient progress bar fixed at the top of the page.
   ============================================================ */

function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    z-index: 10000;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  function update() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = `${Math.min(100, Math.max(0, pct))}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ============================================================
   PAGE ENTRY
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initServicesPage, 100));
} else {
  setTimeout(initServicesPage, 100);
}

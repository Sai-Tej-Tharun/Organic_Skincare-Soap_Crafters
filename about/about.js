/**
 * ============================================================
 * GlowVeda — About Page JavaScript
 * Organic Skincare & Soap Crafters
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. About Page Init
 * 02. Hero Parallax Effect
 * 03. Timeline Reveal Animation
 * 04. Team Card Keyboard Accessibility
 * 05. Certification Icon Pulse
 * 06. Sourcing Card Interactive Map Hint
 * 07. Testimonials Auto-Highlight
 * 08. Scroll Progress Indicator
 * ============================================================
 */

'use strict';

/* ============================================================
   01. ABOUT PAGE INIT
   Bootstrap all about-page-specific features.
   Called after global.js has finished loading the navbar/footer.
   ============================================================ */

/**
 * Main entry point — waits for global.js to be ready,
 * then initialises all about-page modules.
 */
function initAboutPage() {
  initHeroParallax();
  initTimelineReveal();
  initTeamCardKeyboard();
  initCertificationPulse();
  initSourcingCardHints();
  initTestimonialsHighlight();
  initScrollProgress();
}

/* ============================================================
   02. HERO PARALLAX EFFECT
   Subtle vertical parallax on the hero background blobs
   and hero main image as the user scrolls.
   ============================================================ */

function initHeroParallax() {
  const hero      = document.querySelector('.about-hero');
  const blob1     = document.querySelector('.about-blob-1');
  const blob2     = document.querySelector('.about-blob-2');
  const heroImg   = document.querySelector('.about-hero__img-main img');

  if (!hero) return;

  /**
   * Updates parallax translate based on scroll position.
   * Using requestAnimationFrame for 60fps performance.
   */
  let ticking = false;

  function updateParallax() {
    const scrollY   = window.scrollY;
    const heroRect  = hero.getBoundingClientRect();

    // Only apply when hero is in view
    if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) {
      ticking = false;
      return;
    }

    const progress = scrollY / (hero.offsetHeight || 1);

    // Blobs drift subtly
    if (blob1) blob1.style.transform = `translateY(${progress * 40}px)`;
    if (blob2) blob2.style.transform = `translateY(${progress * -30}px)`;

    // Hero image lifts slightly (scale stays in CSS)
    if (heroImg) {
      heroImg.style.transform = `translateY(${progress * 20}px)`;
    }

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
   03. TIMELINE REVEAL ANIMATION
   Each timeline item slides in from its respective side
   (left items from left, right items from right) when they
   enter the viewport.
   ============================================================ */

function initTimelineReveal() {
  const timelineItems = document.querySelectorAll('.about-timeline__item');
  if (!timelineItems.length) return;

  // Apply initial hidden state
  timelineItems.forEach(item => {
    const isLeft   = item.classList.contains('about-timeline__item--left');
    const card     = item.querySelector('.about-timeline__card');
    const img      = item.querySelector('.about-timeline__img');

    if (card) {
      card.style.opacity   = '0';
      card.style.transform = isLeft ? 'translateX(-32px)' : 'translateX(32px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }

    if (img) {
      img.style.opacity   = '0';
      img.style.transform = isLeft ? 'translateX(32px)' : 'translateX(-32px)';
      img.style.transition = 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s';
    }
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    timelineItems.forEach(item => {
      const els = item.querySelectorAll('.about-timeline__card, .about-timeline__img');
      els.forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'translateX(0)';
      });
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const card = item.querySelector('.about-timeline__card');
          const img  = item.querySelector('.about-timeline__img');

          if (card) {
            card.style.opacity   = '1';
            card.style.transform = 'translateX(0)';
          }

          if (img) {
            img.style.opacity   = '1';
            img.style.transform = 'translateX(0)';
          }

          // Animate the dot
          const dot = item.querySelector('.about-timeline__dot');
          if (dot) {
            dot.style.transform = 'scale(1.2)';
            setTimeout(() => { dot.style.transform = ''; }, 400);
          }

          observer.unobserve(item);
        }
      });
    },
    { threshold: 0.2 }
  );

  timelineItems.forEach(item => observer.observe(item));
}


/* ============================================================
   04. TEAM CARD KEYBOARD ACCESSIBILITY
   Allows keyboard users to trigger the hover overlay on team
   cards using Enter or Space, matching mouse hover behaviour.
   ============================================================ */

function initTeamCardKeyboard() {
  const teamCards = document.querySelectorAll('.about-team__card');
  if (!teamCards.length) return;

  teamCards.forEach(card => {
    // Make card focusable
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }

    /**
     * Show overlay on focus (keyboard navigation).
     */
    card.addEventListener('focus', () => {
      const overlay = card.querySelector('.about-team__overlay');
      if (overlay) overlay.style.opacity = '1';
    });

    /**
     * Hide overlay on blur.
     */
    card.addEventListener('blur', () => {
      const overlay = card.querySelector('.about-team__overlay');
      if (overlay) overlay.style.opacity = '';
    });

    /**
     * Activate on Enter / Space for keyboard users.
     */
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const firstLink = card.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  });
}


/* ============================================================
   05. CERTIFICATION ICON PULSE
   Adds a brief pulse animation to certification icons when
   they enter the viewport, giving them a "badge earned" feel.
   ============================================================ */

function initCertificationPulse() {
  const certItems = document.querySelectorAll('.about-cert__item');
  if (!certItems.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const icon = entry.target.querySelector('.about-cert__icon');
          if (icon) {
            // Staggered pulse delay
            setTimeout(() => {
              icon.style.transform = 'scale(1.15)';
              setTimeout(() => {
                icon.style.transform = '';
              }, 250);
            }, idx * 80);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  certItems.forEach(item => {
    const icon = item.querySelector('.about-cert__icon');
    if (icon) {
      icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, color 0.25s ease';
    }
    observer.observe(item);
  });
}


/* ============================================================
   06. SOURCING CARD INTERACTIVE HINTS
   Shows a subtle tooltip-style "learn more" hint on sourcing
   cards when they are hovered for over 1 second, encouraging
   deeper engagement.
   ============================================================ */

function initSourcingCardHints() {
  const sourcingCards = document.querySelectorAll('.about-sourcing__card');
  if (!sourcingCards.length) return;

  sourcingCards.forEach(card => {
    let hoverTimer = null;
    const body = card.querySelector('.about-sourcing__card-body');

    card.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => {
        // Only show if GlowVeda toast is available
        if (window.GlowVeda && window.GlowVeda.ToastManager) {
          const h4 = card.querySelector('h4');
          if (h4) {
            window.GlowVeda.ToastManager.show(
              `We source ${h4.textContent} with full traceability. Ask us about our farm visits!`,
              'info',
              3000
            );
          }
        }
      }, 2000); // 2-second hover before hint
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });
  });
}


/* ============================================================
   07. TESTIMONIALS AUTO-HIGHLIGHT
   Cycles through testimonial cards, applying a subtle
   highlighted ring every 4 seconds to draw attention.
   ============================================================ */

function initTestimonialsHighlight() {
  const testimonials = document.querySelectorAll('.about-testimonials .testimonial-card');
  if (testimonials.length < 2) return;

  let currentIndex = 0;

  function highlightCard(index) {
    testimonials.forEach((card, i) => {
      if (i === index) {
        card.style.boxShadow = `0 0 0 2px var(--color-accent), ${getComputedStyle(document.documentElement).getPropertyValue('--shadow-card-hover')}`;
        card.style.transform = 'translateY(-6px)';
      } else {
        card.style.boxShadow = '';
        card.style.transform = '';
      }
    });
  }

  // Only auto-highlight if the testimonials section is visible
  const section = document.querySelector('.about-testimonials');
  if (!section || !('IntersectionObserver' in window)) return;

  let intervalId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Start cycling when section enters view
          intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            highlightCard(currentIndex);
          }, 4000);

          highlightCard(0); // Highlight first immediately
        } else {
          // Stop when section leaves view
          clearInterval(intervalId);
          testimonials.forEach(card => {
            card.style.boxShadow = '';
            card.style.transform = '';
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);

  // Pause cycling on user hover
  testimonials.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      clearInterval(intervalId);
      testimonials.forEach(c => {
        c.style.boxShadow = '';
        c.style.transform = '';
      });
    });

    card.addEventListener('mouseleave', () => {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        highlightCard(currentIndex);
      }, 4000);
    });
  });
}


/* ============================================================
   08. SCROLL PROGRESS INDICATOR
   Adds a thin green progress bar at the top of the page
   that fills as the user scrolls down the about page.
   ============================================================ */

function initScrollProgress() {
  // Create the progress bar element
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');

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

  /**
   * Updates the progress bar width based on scroll position.
   */
  function updateProgress() {
    const scrollTop    = window.scrollY || document.documentElement.scrollTop;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const clamped       = Math.min(100, Math.max(0, scrollPercent));

    bar.style.width = `${clamped}%`;
    bar.setAttribute('aria-valuenow', Math.round(clamped).toString());
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Run once on load
}


/* ============================================================
   PAGE ENTRY — Wait for global.js to finish bootstrapping,
   then run about-page-specific code.
   ============================================================ */

/**
 * We use DOMContentLoaded with a short defer to ensure
 * global.js has already loaded the navbar/footer components
 * and initialised ThemeManager, RTLManager etc.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to let global.js async nav/footer load resolve
    setTimeout(initAboutPage, 100);
  });
} else {
  setTimeout(initAboutPage, 100);
}

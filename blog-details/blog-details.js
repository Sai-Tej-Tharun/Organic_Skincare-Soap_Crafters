/**
 * ============================================================
 * GlowVeda — Blog Details (Shared JS)
 * blog-details.js  ·  Used by blog-details-1 through 6
 * ============================================================
 * 01. Reading Progress Bar
 * 02. Table of Contents — Build & Scroll Spy
 * 03. ToC Collapse Toggle
 * 04. Article Like Button
 * 05. Share Buttons
 * 06. Comment Form
 * 07. Comment Like / Reply toggles
 * 08. Sidebar Newsletter Form
 * 09. Callout / Pull-quote Scroll Reveal
 * 10. Estimated Reading Time (auto-inject)
 * 11. Highlight Selected Text — mini share pop
 * 12. Back to Article Top (smooth)
 * 13. Init
 * ============================================================
 */

'use strict';


/* ============================================================
   01. READING PROGRESS BAR
   ============================================================ */
const ReadingProgress = (() => {

  function init() {
    const bar     = document.querySelector('.reading-progress');
    const article = document.querySelector('.article-prose');
    if (!bar || !article) return;

    function update() {
      const rect   = article.getBoundingClientRect();
      const total  = article.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct    = Math.min(100, (scrolled / (total - window.innerHeight)) * 100);
      bar.style.width = `${Math.max(0, pct)}%`;

      // Update TOC progress bar too
      const tocBar = document.querySelector('.toc-progress__bar');
      if (tocBar) tocBar.style.width = `${Math.max(0, pct)}%`;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();


/* ============================================================
   02. TABLE OF CONTENTS — Build & Scroll Spy
   ============================================================ */
const TableOfContents = (() => {

  let headings  = [];
  let tocLinks  = [];
  let activeIdx = -1;

  /**
   * Auto-builds TOC from h2/h3 headings inside .article-prose.
   * Falls back to server-rendered TOC if #tocList already exists.
   */
  function build() {
    const prose  = document.querySelector('.article-prose');
    const tocList = document.getElementById('tocList');
    if (!prose || !tocList) return;

    headings = Array.from(prose.querySelectorAll('h2, h3'));
    if (!headings.length) return;

    // Clear any server-rendered placeholder
    tocList.innerHTML = '';

    headings.forEach((heading, i) => {
      // Ensure heading has an id for anchor linking
      if (!heading.id) {
        heading.id = `heading-${i}-${heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 60)}`;
      }

      const li = document.createElement('li');
      li.className = `toc-item toc-item--${heading.tagName.toLowerCase()}`;

      const a = document.createElement('a');
      a.href       = `#${heading.id}`;
      a.className  = 'toc-link';
      a.textContent = heading.textContent.trim();
      a.dataset.index = i;

      a.addEventListener('click', e => {
        e.preventDefault();
        const navH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
          10
        ) || 80;
        const top = heading.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(null, '', `#${heading.id}`);
      });

      li.appendChild(a);
      tocList.appendChild(li);
      tocLinks.push(a);
    });
  }

  /**
   * Scroll spy — highlights the TOC link matching the visible heading.
   */
  function initSpy() {
    if (!headings.length) return;

    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      10
    ) || 80;

    function update() {
      let newActive = 0;

      headings.forEach((heading, i) => {
        const top = heading.getBoundingClientRect().top;
        if (top <= navHeight + 80) newActive = i;
      });

      if (newActive !== activeIdx) {
        activeIdx = newActive;
        tocLinks.forEach((link, i) => {
          link.classList.toggle('active', i === activeIdx);
        });

        // Scroll active link into view inside TOC nav
        const activeLink = tocLinks[activeIdx];
        const tocNav = document.querySelector('.toc-nav');
        if (activeLink && tocNav) {
          const linkTop = activeLink.offsetTop;
          const navH    = tocNav.clientHeight;
          if (linkTop < tocNav.scrollTop || linkTop > tocNav.scrollTop + navH - 40) {
            tocNav.scrollTo({ top: linkTop - navH / 2, behavior: 'smooth' });
          }
        }
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init() {
    build();
    initSpy();
  }

  return { init };
})();


/* ============================================================
   03. TOC COLLAPSE TOGGLE
   ============================================================ */
function initTocToggle() {
  const toggle = document.querySelector('.toc-toggle');
  const nav    = document.querySelector('.toc-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const collapsed = nav.classList.toggle('hidden');
    toggle.classList.toggle('collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expand table of contents' : 'Collapse table of contents');
  });
}


/* ============================================================
   04. ARTICLE LIKE BUTTON
   ============================================================ */
function initLikeButton() {
  const btn = document.querySelector('.article-like');
  if (!btn) return;

  const countEl    = btn.querySelector('.like-count');
  const STORAGE_KEY = `gv-like-${window.location.pathname}`;
  let liked        = localStorage.getItem(STORAGE_KEY) === 'true';
  let count        = parseInt(localStorage.getItem(`${STORAGE_KEY}-count`) || '0', 10) || 0;

  function render() {
    btn.classList.toggle('liked', liked);
    if (countEl) countEl.textContent = count.toLocaleString('en-IN');
    btn.setAttribute('aria-label', liked ? `Unlike this article (${count} likes)` : `Like this article (${count} likes)`);
    btn.setAttribute('aria-pressed', String(liked));
  }

  btn.addEventListener('click', () => {
    liked = !liked;
    count = liked ? count + 1 : Math.max(0, count - 1);
    localStorage.setItem(STORAGE_KEY, String(liked));
    localStorage.setItem(`${STORAGE_KEY}-count`, String(count));
    render();

    if (liked && window.GlowVeda?.ToastManager) {
      window.GlowVeda.ToastManager.show('Thanks for the love! 🌿', 'success', 2000);
    }
  });

  render();
}


/* ============================================================
   05. SHARE BUTTONS
   ============================================================ */
function initShareButtons() {
  const title = document.querySelector('.article-hero__title')?.textContent.trim() || document.title;
  const url   = window.location.href;

  // Twitter / X
  document.querySelectorAll('.share-btn--twitter').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        '_blank', 'noopener,noreferrer,width=600,height=400'
      );
    });
  });

  // Facebook
  document.querySelectorAll('.share-btn--facebook').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank', 'noopener,noreferrer,width=600,height=400'
      );
    });
  });

  // WhatsApp
  document.querySelectorAll('.share-btn--whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
        '_blank', 'noopener,noreferrer'
      );
    });
  });

  // Copy link
  document.querySelectorAll('.share-btn--copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        window.GlowVeda?.ToastManager.show('Link copied to clipboard! 🔗', 'success', 2000);
      } catch {
        window.GlowVeda?.ToastManager.show('Copy failed — please copy manually.', 'error');
      }
    });
  });
}


/* ============================================================
   06. COMMENT FORM
   ============================================================ */
function initCommentForm() {
  const form = document.querySelector('.comment-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameInput    = form.querySelector('[name="comment-name"]');
    const emailInput   = form.querySelector('[name="comment-email"]');
    const messageInput = form.querySelector('[name="comment-message"]');
    let valid = true;

    // Simple validation
    [nameInput, emailInput, messageInput].forEach(field => {
      if (!field) return;
      const empty = !field.value.trim();
      field.classList.toggle('error', empty);
      if (empty) valid = false;
    });

    if (emailInput && emailInput.value.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      emailInput.classList.toggle('error', !emailOk);
      if (!emailOk) valid = false;
    }

    if (!valid) {
      window.GlowVeda?.ToastManager.show('Please fill in all required fields.', 'warning');
      return;
    }

    // Get rating
    const filledStars = form.querySelectorAll('[data-star].filled');
    const rating = filledStars.length || 5;

    window.GlowVeda?.ToastManager.show(
      `Thank you, ${nameInput.value.trim()}! Your comment is under review. 🌿`,
      'success',
      4000
    );
    form.reset();

    // Reset stars
    form.querySelectorAll('[data-star]').forEach(s => s.classList.remove('filled', 'hover'));
  });
}


/* ============================================================
   07. COMMENT LIKE / REPLY TOGGLES
   ============================================================ */
function initCommentInteractions() {
  // Like a comment
  document.querySelectorAll('.comment__action--like').forEach(btn => {
    btn.addEventListener('click', function () {
      const liked = this.classList.toggle('liked');
      const countEl = this.querySelector('.comment-like-count');
      if (countEl) {
        const current = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = liked ? current + 1 : Math.max(0, current - 1);
      }
      this.style.color = liked ? '#EF4444' : '';
    });
  });

  // Reply — scroll to comment form
  document.querySelectorAll('.comment__action--reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const formSection = document.querySelector('.comment-form-section');
      if (!formSection) return;
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameInput = formSection.querySelector('[name="comment-name"]');
      if (nameInput) setTimeout(() => nameInput.focus(), 500);
    });
  });
}


/* ============================================================
   08. SIDEBAR NEWSLETTER FORM
   ============================================================ */
function initSidebarNewsletter() {
  const form = document.querySelector('.sidebar-nl-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.GlowVeda?.ToastManager.show('Please enter a valid email address.', 'error');
      return;
    }

    window.GlowVeda?.ToastManager.show(
      'Welcome to the Glow Letter! 🌿 See you Sunday.',
      'success', 4000
    );
    if (input) input.value = '';
  });
}


/* ============================================================
   09. CALLOUT / PULL-QUOTE SCROLL REVEAL
   (Works alongside global ScrollAnimator for bespoke elements)
   ============================================================ */
function initProseReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.callout, .pull-quote, .ingredient-highlight')
      .forEach(el => el.classList.add('animated'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.callout, .pull-quote, .ingredient-highlight')
    .forEach(el => obs.observe(el));
}


/* ============================================================
   10. ESTIMATED READING TIME (auto-inject)
   ============================================================ */
function injectReadingTime() {
  const prose = document.querySelector('.article-prose');
  const el    = document.querySelector('.article-hero__read-time .rt-value');
  if (!prose || !el) return;

  const words    = prose.textContent.trim().split(/\s+/).length;
  const minutes  = Math.ceil(words / 220); // avg reading speed
  el.textContent = `${minutes} min read`;
}


/* ============================================================
   11. TEXT SELECTION — Mini Share Popup
   ============================================================ */
function initTextHighlightShare() {
  const prose = document.querySelector('.article-prose');
  if (!prose) return;

  // Create floating pop
  const popup = document.createElement('div');
  popup.id = 'highlight-share-popup';
  popup.setAttribute('role', 'tooltip');
  popup.style.cssText = `
    position: fixed;
    z-index: 9998;
    background: var(--color-primary-dark);
    border: 1px solid rgba(107,175,146,0.3);
    border-radius: var(--radius-lg);
    padding: 6px 14px;
    display: none;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #C8DFC4;
    font-family: var(--font-body);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.2s ease;
    white-space: nowrap;
  `;
  popup.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4A857" stroke-width="2.5" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    Quote this
  `;
  document.body.appendChild(popup);

  let selectedText = '';

  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    selectedText = sel?.toString().trim() || '';

    if (selectedText.length < 20 || !prose.contains(sel?.anchorNode)) {
      popup.style.display = 'none';
      return;
    }

    const range = sel.getRangeAt(0);
    const rect  = range.getBoundingClientRect();
    popup.style.display = 'flex';
    popup.style.top  = `${rect.top - 44 + window.scrollY}px`;
    popup.style.left = `${rect.left + rect.width / 2 - 70}px`;
  });

  popup.addEventListener('click', () => {
    if (!selectedText) return;
    const tweetText = `"${selectedText.slice(0, 240)}" — GlowVeda`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank', 'noopener,noreferrer,width=600,height=400'
    );
    popup.style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!popup.contains(e.target)) popup.style.display = 'none';
  });
}


/* ============================================================
   12. SMOOTH SCROLL — BACK TO TOP (article-specific)
   ============================================================ */
function initArticleBackTop() {
  const btn = document.querySelector('.article-back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   13. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ReadingProgress.init();
  TableOfContents.init();
  initTocToggle();
  initLikeButton();
  initShareButtons();
  initCommentForm();
  initCommentInteractions();
  initSidebarNewsletter();
  initProseReveal();
  injectReadingTime();
  initTextHighlightShare();
  initArticleBackTop();

  // Star rating in comment form
  if (window.GlowVeda?.initStarRating) {
    window.GlowVeda.initStarRating();
  }
});

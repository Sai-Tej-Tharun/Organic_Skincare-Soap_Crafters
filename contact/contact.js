/**
 * ============================================================
 * GlowVeda — Contact Page JavaScript
 * contact/contact.js
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Contact Form Handler
 * 02. Skin Type Pill Selector
 * 03. Message Character Counter
 * 04. Lucide Icons Init
 * 05. Page Init
 * ============================================================
 */

'use strict';


/* ============================================================
   01. CONTACT FORM HANDLER
   ============================================================ */

/**
 * Handles the contact form — validates fields and simulates submission.
 */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset previous error states
    clearFormErrors(form);

    // Validate all required fields
    const isValid = validateContactForm(form);
    if (!isValid) return;

    // Show loading state on submit button
    setButtonLoading(submitBtn, true);

    // Simulate async form submission (replace with real API call)
    await simulateSubmission();

    // Reset button state
    setButtonLoading(submitBtn, false);

    // Show success toast
    if (window.GlowVeda?.ToastManager) {
      window.GlowVeda.ToastManager.show(
        'Thank you! Your message has been sent. We\'ll get back to you within 24 hours. 🌿',
        'success',
        5000
      );
    }

    // Reset form
    form.reset();
    resetSkinPills();
    resetCharCounter();
  });
}

/**
 * Validates the contact form fields with detailed error messages.
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateContactForm(form) {
  let isValid = true;
  let firstError = null;

  // ---- First Name ----
  const firstName = form.querySelector('#firstName');
  if (firstName && !firstName.value.trim()) {
    showFieldError(firstName, 'Please enter your first name.');
    if (!firstError) firstError = firstName;
    isValid = false;
  }

  // ---- Last Name ----
  const lastName = form.querySelector('#lastName');
  if (lastName && !lastName.value.trim()) {
    showFieldError(lastName, 'Please enter your last name.');
    if (!firstError) firstError = lastName;
    isValid = false;
  }

  // ---- Email ----
  const email = form.querySelector('#email');
  if (email) {
    if (!email.value.trim()) {
      showFieldError(email, 'Please enter your email address.');
      if (!firstError) firstError = email;
      isValid = false;
    } else if (!isValidEmailLocal(email.value.trim())) {
      showFieldError(email, 'Please enter a valid email address.');
      if (!firstError) firstError = email;
      isValid = false;
    }
  }

  // ---- Phone (optional — validate format if filled) ----
  const phone = form.querySelector('#phone');
  if (phone && phone.value.trim()) {
    const phoneClean = phone.value.trim().replace(/\s/g, '');
    if (!/^(\+91)?[6-9]\d{9}$/.test(phoneClean)) {
      showFieldError(phone, 'Please enter a valid Indian phone number.');
      if (!firstError) firstError = phone;
      isValid = false;
    }
  }

  // ---- Topic / Subject ----
  const topic = form.querySelector('#topic');
  if (topic && !topic.value) {
    showFieldError(topic, 'Please select a topic.');
    if (!firstError) firstError = topic;
    isValid = false;
  }

  // ---- Message ----
  const message = form.querySelector('#message');
  if (message) {
    if (!message.value.trim()) {
      showFieldError(message, 'Please enter your message.');
      if (!firstError) firstError = message;
      isValid = false;
    } else if (message.value.trim().length < 10) {
      showFieldError(message, 'Message must be at least 10 characters.');
      if (!firstError) firstError = message;
      isValid = false;
    }
  }

  // ---- Privacy Consent ----
  const consent = form.querySelector('#privacyConsent');
  const consentError = document.getElementById('consentError');
  if (consent && !consent.checked) {
    if (consentError) consentError.style.display = 'flex';
    if (!firstError) firstError = consent;
    isValid = false;
  }

  // Focus first error field for accessibility
  if (firstError) {
    firstError.focus();
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

/**
 * Shows an error message below a form field.
 * @param {HTMLElement} field
 * @param {string} message
 */
function showFieldError(field, message) {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  const group   = field.closest('.form-group');
  const errorEl = group && group.querySelector('.form-error');
  if (errorEl) {
    errorEl.style.display = 'flex';
    // Update text content but preserve icon
    const textNode = [...errorEl.childNodes].find(n => n.nodeType === 3);
    if (textNode) {
      textNode.textContent = ' ' + message;
    } else {
      errorEl.textContent = message;
    }
  }
}

/**
 * Clears all error states from the form.
 * @param {HTMLFormElement} form
 */
function clearFormErrors(form) {
  form.querySelectorAll('.form-control.error').forEach(field => {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  });

  form.querySelectorAll('.form-error').forEach(el => {
    el.style.display = 'none';
  });

  const consentError = document.getElementById('consentError');
  if (consentError) consentError.style.display = 'none';
}

/**
 * Sets the submit button into a loading/normal state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
function setButtonLoading(btn, loading) {
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = `
      <span style="
        display: inline-block;
        width: 18px; height: 18px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      "></span>
      Sending…
    `;
  } else {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
      Send Message
    `;
  }
}

/**
 * Simulates an async API submission delay.
 * @returns {Promise<void>}
 */
function simulateSubmission() {
  return new Promise(resolve => setTimeout(resolve, 1800));
}

/**
 * Validates an email string.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmailLocal(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ============================================================
   02. SKIN TYPE PILL SELECTOR
   ============================================================ */

/**
 * Initialises the interactive skin type pill selector.
 * Clicking a pill toggles its selected state and updates the hidden input.
 */
function initSkinTypePills() {
  const pills     = document.querySelectorAll('.skin-pill');
  const hiddenInput = document.getElementById('skinType');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const isSelected = pill.getAttribute('aria-pressed') === 'true';

      // Deselect all pills
      pills.forEach(p => {
        p.setAttribute('aria-pressed', 'false');
        p.classList.remove('selected');
      });

      // Toggle current pill
      if (!isSelected) {
        pill.setAttribute('aria-pressed', 'true');
        pill.classList.add('selected');
        if (hiddenInput) hiddenInput.value = pill.dataset.value;
      } else {
        if (hiddenInput) hiddenInput.value = '';
      }
    });

    // Keyboard: Enter or Space triggers click
    pill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pill.click();
      }
    });
  });
}

/**
 * Resets all skin type pills to unselected state.
 */
function resetSkinPills() {
  const pills = document.querySelectorAll('.skin-pill');
  const hiddenInput = document.getElementById('skinType');

  pills.forEach(p => {
    p.setAttribute('aria-pressed', 'false');
    p.classList.remove('selected');
  });

  if (hiddenInput) hiddenInput.value = '';
}


/* ============================================================
   03. MESSAGE CHARACTER COUNTER
   ============================================================ */

const MAX_CHARS = 500;

/**
 * Initialises the character counter for the message textarea.
 */
function initCharCounter() {
  const textarea = document.getElementById('message');
  const counter  = document.getElementById('charCount');
  const wrapper  = counter?.closest('.message-counter');
  if (!textarea || !counter) return;

  // Add maxlength to textarea
  textarea.setAttribute('maxlength', String(MAX_CHARS));

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = len;

    // Update counter color based on usage
    if (wrapper) {
      wrapper.classList.remove('near-limit', 'at-limit');
      if (len >= MAX_CHARS) {
        wrapper.classList.add('at-limit');
      } else if (len >= MAX_CHARS * 0.85) {
        wrapper.classList.add('near-limit');
      }
    }
  });
}

/**
 * Resets the character counter display to 0.
 */
function resetCharCounter() {
  const counter = document.getElementById('charCount');
  const wrapper = counter?.closest('.message-counter');
  if (counter) counter.textContent = '0';
  if (wrapper) wrapper.classList.remove('near-limit', 'at-limit');
}


/* ============================================================
   04. REAL-TIME FIELD VALIDATION (live feedback while typing)
   ============================================================ */

/**
 * Adds live validation feedback as user types / changes fields.
 */
function initLiveValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Clear error when user starts typing/changing
  form.querySelectorAll('.form-control').forEach(field => {
    const events = field.tagName === 'SELECT' ? ['change'] : ['input', 'change'];
    events.forEach(ev => {
      field.addEventListener(ev, () => {
        if (field.classList.contains('error') && field.value.trim()) {
          field.classList.remove('error');
          field.removeAttribute('aria-invalid');
          const group   = field.closest('.form-group');
          const errorEl = group && group.querySelector('.form-error');
          if (errorEl) errorEl.style.display = 'none';
        }
      });
    });
  });

  // Clear consent error when checkbox is checked
  const consent = form.querySelector('#privacyConsent');
  const consentError = document.getElementById('consentError');
  if (consent && consentError) {
    consent.addEventListener('change', () => {
      if (consent.checked) consentError.style.display = 'none';
    });
  }
}


/* ============================================================
   05. FAQ ACCORDION (contact-specific override)
   ============================================================ */

/**
 * Initialises the FAQ accordion with smooth height transitions.
 * Overrides the global accordion init with contact-page specifics.
 */
function initContactFAQ() {
  const items = document.querySelectorAll('.contact-faq-section .accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all open items first
      items.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherTrigger = other.querySelector('.accordion-trigger');
          const otherPanel   = other.querySelector('.accordion-panel');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel)   otherPanel.style.maxHeight = null;
        }
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      }
    });

    // Keyboard accessibility
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}


/* ============================================================
   06. LUCIDE ICONS INIT
   ============================================================ */

/**
 * Initialises all Lucide icons on the page.
 * Called after DOM is ready to ensure all icons render.
 */
function initLucideIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}


/* ============================================================
   07. PAGE INIT
   ============================================================ */

/**
 * Bootstraps all contact page functionality.
 * Called after global.js has loaded navbar/footer components.
 */
function initContactPage() {
  initLucideIcons();
  initContactForm();
  initSkinTypePills();
  initCharCounter();
  initLiveValidation();
  initContactFAQ();
}

/**
 * Wait for global.js to finish loading components before running page init.
 * We use a small delay to allow async navbar/footer loading to complete,
 * then re-run icon init to catch any icons injected by components.
 */
if (document.readyState !== 'loading') {
  initContactPage();
  // Re-init icons after component injection delay
  setTimeout(initLucideIcons, 600);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initContactPage();
    setTimeout(initLucideIcons, 600);
  });
}

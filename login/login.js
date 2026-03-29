/**
 * ============================================================
 * GlowVeda — Auth Pages JavaScript (Login + Register)
 * login/login.js  — shared by login.html & register.html
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Password Eye Toggle
 * 02. Password Strength Meter (Register only)
 * 03. Login Form Validation & Submit
 * 04. Register Form Validation & Submit
 * 05. Live Field Validation (clear errors on input)
 * 06. Button Loading State
 * 07. Init
 * ============================================================
 */

'use strict';


/* ============================================================
   01. PASSWORD EYE TOGGLE
   ============================================================ */

/**
 * Wires up a password visibility toggle button.
 * @param {string} toggleId  — id of the toggle button
 * @param {string} inputId   — id of the password input
 */
function initPasswordToggle(toggleId, inputId) {
  const toggleBtn = document.getElementById(toggleId);
  const input     = document.getElementById(inputId);
  if (!toggleBtn || !input) return;

  const eyeOpen   = toggleBtn.querySelector('.eye-open');
  const eyeClosed = toggleBtn.querySelector('.eye-closed');

  toggleBtn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    // Swap icons
    if (eyeOpen)   eyeOpen.style.display   = isPassword ? 'none'  : 'block';
    if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';

    // Update aria label
    toggleBtn.setAttribute(
      'aria-label',
      isPassword ? 'Hide password' : 'Show password'
    );

    // Keep focus on input after toggle
    input.focus();
  });
}


/* ============================================================
   02. PASSWORD STRENGTH METER (Register only)
   ============================================================ */

/**
 * Calculates password strength score (0–4).
 * @param {string} pw
 * @returns {number} 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/**
 * Initialises the password strength bar for the register form.
 */
function initPasswordStrength() {
  const input    = document.getElementById('regPassword');
  const meter    = document.getElementById('regPasswordStrength');
  const label    = document.getElementById('strengthLabel');
  if (!input || !meter) return;

  input.addEventListener('input', () => {
    const score = getPasswordStrength(input.value);
    meter.setAttribute('data-level', String(score));
    if (label) {
      label.textContent = score > 0 ? STRENGTH_LABELS[score] : '';
    }
  });
}


/* ============================================================
   03. LOGIN FORM VALIDATION & SUBMIT
   ============================================================ */

function initLoginForm() {
  const form      = document.getElementById('login-form');
  const submitBtn = document.getElementById('loginSubmit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthErrors(form);

    let valid   = true;
    let firstEl = null;

    // Email
    const email = form.querySelector('#loginEmail');
    if (email) {
      if (!email.value.trim()) {
        showAuthError(email, 'loginEmailError', 'Please enter your email address.');
        if (!firstEl) firstEl = email;
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showAuthError(email, 'loginEmailError', 'Please enter a valid email address.');
        if (!firstEl) firstEl = email;
        valid = false;
      }
    }

    // Password
    const password = form.querySelector('#loginPassword');
    if (password && !password.value) {
      showAuthError(password, 'loginPasswordError', 'Please enter your password.');
      if (!firstEl) firstEl = password;
      valid = false;
    }

    if (!valid) {
      if (firstEl) firstEl.focus();
      return;
    }

    // Simulate submit
    setAuthButtonLoading(submitBtn, true, 'Signing in…');
    await simulateAuthRequest(1600);
    setAuthButtonLoading(submitBtn, false, 'Sign In');

    // Success — redirect to dashboard (replace with real redirect)
    showAuthSuccess(
      submitBtn,
      'Welcome back! Redirecting…',
      () => { window.location.href = '../admin-dashboard/dashboard.html'; }
    );
  });
}


/* ============================================================
   04. REGISTER FORM VALIDATION & SUBMIT
   ============================================================ */

function initRegisterForm() {
  const form      = document.getElementById('register-form');
  const submitBtn = document.getElementById('registerSubmit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthErrors(form);

    let valid   = true;
    let firstEl = null;

    // First Name
    const firstName = form.querySelector('#regFirstName');
    if (firstName && !firstName.value.trim()) {
      showAuthError(firstName, 'regFirstNameError', 'Required.');
      if (!firstEl) firstEl = firstName;
      valid = false;
    }

    // Last Name
    const lastName = form.querySelector('#regLastName');
    if (lastName && !lastName.value.trim()) {
      showAuthError(lastName, 'regLastNameError', 'Required.');
      if (!firstEl) firstEl = lastName;
      valid = false;
    }

    // Email
    const email = form.querySelector('#regEmail');
    if (email) {
      if (!email.value.trim()) {
        showAuthError(email, 'regEmailError', 'Please enter your email address.');
        if (!firstEl) firstEl = email;
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showAuthError(email, 'regEmailError', 'Please enter a valid email address.');
        if (!firstEl) firstEl = email;
        valid = false;
      }
    }

    // Password
    const password = form.querySelector('#regPassword');
    if (password) {
      if (!password.value) {
        showAuthError(password, 'regPasswordError', 'Please create a password.');
        if (!firstEl) firstEl = password;
        valid = false;
      } else if (password.value.length < 8) {
        showAuthError(password, 'regPasswordError', 'Password must be at least 8 characters.');
        if (!firstEl) firstEl = password;
        valid = false;
      }
    }

    // Terms
    const terms      = form.querySelector('#regTerms');
    const termsError = document.getElementById('regTermsError');
    if (terms && !terms.checked) {
      if (termsError) termsError.textContent = 'You must agree to the terms to continue.';
      if (!firstEl) firstEl = terms;
      valid = false;
    }

    if (!valid) {
      if (firstEl) firstEl.focus();
      return;
    }

    // Simulate submit
    setAuthButtonLoading(submitBtn, true, 'Creating account…');
    await simulateAuthRequest(1800);
    setAuthButtonLoading(submitBtn, false, 'Create Account');

    // Success
    showAuthSuccess(
      submitBtn,
      'Account created! Redirecting…',
      () => { window.location.href = '../admin-dashboard/dashboard.html'; }
    );
  });
}


/* ============================================================
   05. LIVE FIELD VALIDATION (clear errors while typing)
   ============================================================ */

function initLiveAuthValidation() {
  // Clear input error as user types
  document.querySelectorAll('.auth-input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        input.classList.remove('error');
        const errorId = input.getAttribute('aria-describedby');
        if (errorId) {
          // Only clear the first described-by element (the error span)
          const errorEl = document.getElementById(errorId.split(' ')[0]);
          if (errorEl) errorEl.textContent = '';
        }
      }
    });
  });

  // Clear terms error on change
  const terms      = document.getElementById('regTerms');
  const termsError = document.getElementById('regTermsError');
  if (terms && termsError) {
    terms.addEventListener('change', () => {
      if (terms.checked) termsError.textContent = '';
    });
  }
}


/* ============================================================
   06. BUTTON LOADING STATE
   ============================================================ */

/**
 * Sets auth submit button into loading or normal state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 * @param {string} label — button label text
 */
function setAuthButtonLoading(btn, loading, label) {
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = `
      <span style="
        display:inline-block; width:16px; height:16px;
        border:2px solid rgba(255,255,255,0.35);
        border-top-color:#fff;
        border-radius:50%;
        animation:spin 0.7s linear infinite;
        flex-shrink:0;
      "></span>
      ${label}
    `;
  } else {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.textContent = label;
  }
}

/**
 * Shows a success state on the button, then calls callback.
 * @param {HTMLButtonElement} btn
 * @param {string} message
 * @param {Function} callback
 */
function showAuthSuccess(btn, message, callback) {
  if (!btn) return;

  btn.disabled = true;
  btn.style.background = 'var(--color-success)';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    ${message}
  `;

  setTimeout(callback, 1200);
}


/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Shows an error on an auth input field.
 * @param {HTMLInputElement} input
 * @param {string} errorId — id of the error span
 * @param {string} message
 */
function showAuthError(input, errorId, message) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
}

/**
 * Clears all auth error states in a form.
 * @param {HTMLFormElement} form
 */
function clearAuthErrors(form) {
  form.querySelectorAll('.auth-input.error').forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
  });
}

/**
 * Email format validation.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Simulates an async network request.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function simulateAuthRequest(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Add spin keyframe to page if not present */
(function ensureSpinKeyframe() {
  if (document.getElementById('gv-spin-style')) return;
  const style = document.createElement('style');
  style.id = 'gv-spin-style';
  style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
})();


/* ============================================================
   07. INIT
   ============================================================ */

(function init() {
  // Password eye toggles
  initPasswordToggle('toggleLoginPassword', 'loginPassword');
  initPasswordToggle('toggleRegPassword',   'regPassword');

  // Password strength (register only)
  initPasswordStrength();

  // Forms
  initLoginForm();
  initRegisterForm();

  // Live validation
  initLiveAuthValidation();

  // Theme + RTL (global.js exposes GlowVeda managers after DOMContentLoaded)
  // They auto-bind via global.js — no extra work needed here.
})();

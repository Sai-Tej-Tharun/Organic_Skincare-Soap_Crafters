/* ── footer.js ──────────────────────── */
  (function () {
    /* ── Auto-update copyright year ──────────────────────── */
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ── Newsletter form submission ──────────────────────── */
    var form = document.querySelector('.footer-newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : '';

      if (!email) {
        if (window.GlowVeda && window.GlowVeda.ToastManager) {
          window.GlowVeda.ToastManager.show('Please enter your email address.', 'warning');
        }
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (window.GlowVeda && window.GlowVeda.ToastManager) {
          window.GlowVeda.ToastManager.show('Please enter a valid email address.', 'error');
        }
        return;
      }

      /* Simulate successful subscription */
      if (window.GlowVeda && window.GlowVeda.ToastManager) {
        window.GlowVeda.ToastManager.show(
          'Welcome to the GlowVeda family! 🌿 Check your inbox.',
          'success',
          4000
        );
      }
      if (input) input.value = '';
    });
  })();

  
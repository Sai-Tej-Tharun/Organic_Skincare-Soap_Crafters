/**
 * ============================================================
 * GlowVeda — Admin Dashboard JavaScript
 * Version: 1.0.0
 * ============================================================
 * TABLE OF CONTENTS:
 * 01. Theme Manager
 * 02. Sidebar Manager (collapse, mobile)
 * 03. Section Navigation
 * 04. Notification System (full working implementation)
 * 05. Chart Initialisation (Chart.js)
 * 06. Activity Feed (live simulation)
 * 07. Alert Strip Dismiss
 * 08. Search (keyboard shortcut)
 * 09. Date Display
 * 10. Table Interactions
 * 11. Init
 * ============================================================
 */

'use strict';


/* ============================================================
   01. THEME MANAGER
   ============================================================ */
const ThemeManager = (() => {
  const KEY  = 'glowveda-admin-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getPreferred() {
    return localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT);
  }

  function apply(theme) {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    const btn      = document.getElementById('theme-toggle');
    const iconSun  = btn?.querySelector('.icon-sun');
    const iconMoon = btn?.querySelector('.icon-moon');
    if (iconSun)  iconSun.style.display  = theme === DARK ? 'block' : 'none';
    if (iconMoon) iconMoon.style.display = theme === DARK ? 'none'  : 'block';

    btn?.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');

    // Re-render charts after theme change
    setTimeout(() => ChartManager.rerender(), 50);
  }

  function toggle() {
    const current = document.body.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  function init() {
    apply(getPreferred());
    document.getElementById('theme-toggle')?.addEventListener('click', toggle);
  }

  return { init, getTheme: () => document.body.getAttribute('data-theme') || LIGHT };
})();


/* ============================================================
   02. SIDEBAR MANAGER
   ============================================================ */
const SidebarManager = (() => {
  const app     = document.getElementById('dash-app');
  const sidebar = document.getElementById('dash-sidebar');
  const overlay = document.getElementById('mobile-overlay');

  function collapse() {
    app?.classList.toggle('sidebar-collapsed');
    // Re-init Lucide icons in case they get displaced
    if (window.lucide) lucide.createIcons();
  }

  function openMobile() {
    sidebar?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function init() {
    document.getElementById('sidebar-collapse')?.addEventListener('click', collapse);
    document.getElementById('mobile-menu-btn')?.addEventListener('click', openMobile);
    overlay?.addEventListener('click', closeMobile);

    // Close mobile sidebar on nav link click
    document.querySelectorAll('.dash-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) closeMobile();
      });
    });

    // Keyboard: Esc closes mobile menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar?.classList.contains('open')) closeMobile();
    });
  }

  return { init };
})();


/* ============================================================
   03. SECTION NAVIGATION
   ============================================================ */
const SectionNav = (() => {

  function activateSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    // Show target
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update nav links
    document.querySelectorAll('.dash-nav-link[data-section]').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionId);
    });

    // Update breadcrumb
    const label = document.querySelector(`.dash-nav-link[data-section="${sectionId}"] span`);
    const breadcrumb = document.getElementById('current-section-label');
    if (breadcrumb && label) breadcrumb.textContent = label.textContent;
  }

  function init() {
    // Sidebar nav links
    document.querySelectorAll('.dash-nav-link[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        activateSection(link.dataset.section);
      });
    });

    // Inline "View all →" links
    document.querySelectorAll('.dash-link[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        activateSection(link.dataset.section);
      });
    });

    // Notification panel "View all activity" link
    document.querySelector('.dash-notif-panel__view-all')?.addEventListener('click', e => {
      e.preventDefault();
      NotificationSystem.close();
      activateSection('messages');
    });
  }

  return { init, activateSection };
})();


/* ============================================================
   04. NOTIFICATION SYSTEM
   Full working notification system with:
   - Bell button toggle with badge count
   - Panel open/close (click, keyboard, outside click)
   - Notification data with types and timestamps
   - Filter tabs (All / Orders / Reviews / System / Messages)
   - Mark individual as read (click item)
   - Mark all as read
   - Dismiss individual notification
   - Clear all notifications
   - Simulated real-time new notification arrival
   ============================================================ */
const NotificationSystem = (() => {

  /* ── Notification data store ── */
  let notifications = [
    {
      id: 1,
      type: 'order',
      icon: 'shopping-bag',
      iconClass: 'dash-notif-item__icon--order',
      title: 'New order placed — #GV-4821',
      meta: 'Ananya R. ordered Turmeric Soap Kit ×3 · ₹1,497',
      time: '2 min ago',
      read: false,
    },
    {
      id: 2,
      type: 'order',
      icon: 'shopping-bag',
      iconClass: 'dash-notif-item__icon--order',
      title: 'Order #GV-4820 is processing',
      meta: 'Vikram S. — Sandalwood Body Butter · ₹649',
      time: '18 min ago',
      read: false,
    },
    {
      id: 3,
      type: 'review',
      icon: 'star',
      iconClass: 'dash-notif-item__icon--review',
      title: 'New 5-star review received',
      meta: 'Kavitha M. reviewed DIY Workshop — "The most fun experience!"',
      time: '35 min ago',
      read: false,
    },
    {
      id: 4,
      type: 'system',
      icon: 'alert-triangle',
      iconClass: 'dash-notif-item__icon--stock',
      title: 'Low stock alert — Neem Face Wash',
      meta: 'Only 12 units remaining. Reorder recommended.',
      time: '1 hr ago',
      read: false,
    },
    {
      id: 5,
      type: 'message',
      icon: 'message-square',
      iconClass: 'dash-notif-item__icon--message',
      title: 'New wholesale enquiry',
      meta: 'Ravi P. from Wellness Corp — interested in 500+ units/month',
      time: '2 hr ago',
      read: false,
    },
    {
      id: 6,
      type: 'review',
      icon: 'star',
      iconClass: 'dash-notif-item__icon--review',
      title: '5 reviews pending moderation',
      meta: 'Awaiting approval in your Reviews section',
      time: '3 hr ago',
      read: false,
    },
    {
      id: 7,
      type: 'system',
      icon: 'shield-check',
      iconClass: 'dash-notif-item__icon--system',
      title: 'Daily backup completed successfully',
      meta: 'All data backed up at 03:00 AM IST · Next backup in 21 hours',
      time: '5 hr ago',
      read: true,
    },
  ];

  let activeFilter  = 'all';
  let isOpen        = false;
  let nextId        = notifications.length + 1;

  /* ── DOM refs ── */
  const btn         = document.getElementById('notif-btn');
  const panel       = document.getElementById('notif-panel');
  const badge       = document.getElementById('notif-badge');
  const list        = document.getElementById('notif-list');
  const unreadCount = document.getElementById('notif-unread-count');
  const markAllBtn  = document.getElementById('mark-all-read');
  const clearAllBtn = document.getElementById('clear-all');
  const tabs        = document.querySelectorAll('.dash-notif-tab');

  /* ── Helpers ── */

  function getUnreadCount() {
    return notifications.filter(n => !n.read).length;
  }

  function updateBadge() {
    const count = getUnreadCount();
    badge.textContent  = count > 0 ? (count > 99 ? '99+' : count) : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
    btn.setAttribute('aria-label', `Notifications (${count} unread)`);
    if (unreadCount) {
      unreadCount.textContent = count > 0 ? `${count} unread` : 'All caught up';
    }
  }

  /**
   * Generates the icon SVG string for a lucide icon by name.
   * Falls back to bell if icon not found.
   */
  function iconSVG(name) {
    const icons = {
      'shopping-bag':  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      'star':          `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'alert-triangle':`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      'message-square':`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'shield-check':  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
      'refresh-cw':    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    };
    return icons[name] || icons['alert-triangle'];
  }

  /** Dismiss (X) button SVG */
  function dismissSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }

  /**
   * Renders notification items into the list, applying the active filter.
   */
  function renderList() {
    const filtered = activeFilter === 'all'
      ? notifications
      : notifications.filter(n => n.type === activeFilter);

    list.innerHTML = '';

    if (filtered.length === 0) {
      list.innerHTML = `
        <li class="dash-notif-empty" role="listitem">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p>No ${activeFilter === 'all' ? '' : activeFilter + ' '}notifications</p>
        </li>`;
      return;
    }

    filtered.forEach(n => {
      const li = document.createElement('li');
      li.className = `dash-notif-item ${n.read ? 'read' : 'unread'}`;
      li.setAttribute('role', 'listitem');
      li.dataset.id = n.id;

      li.innerHTML = `
        <div class="dash-notif-item__icon ${n.iconClass}">${iconSVG(n.icon)}</div>
        <div class="dash-notif-item__body">
          <p class="dash-notif-item__title">${escapeHtml(n.title)}</p>
          <p class="dash-notif-item__meta">${escapeHtml(n.meta)}</p>
          <time class="dash-notif-item__time">${escapeHtml(n.time)}</time>
        </div>
        <button class="dash-notif-item__dismiss" aria-label="Dismiss notification: ${escapeHtml(n.title)}" data-dismiss="${n.id}">
          ${dismissSVG()}
        </button>`;

      // Mark as read on click (not dismiss)
      li.addEventListener('click', e => {
        if (e.target.closest('[data-dismiss]')) return;
        markRead(n.id);
      });

      // Dismiss on button click
      li.querySelector('[data-dismiss]')?.addEventListener('click', e => {
        e.stopPropagation();
        dismissNotification(n.id, li);
      });

      list.appendChild(li);
    });
  }

  function markRead(id) {
    const n = notifications.find(x => x.id === id);
    if (n && !n.read) {
      n.read = true;
      const li = list.querySelector(`[data-id="${id}"]`);
      li?.classList.remove('unread');
      li?.classList.add('read');
      updateBadge();
    }
  }

  function markAllRead() {
    notifications.forEach(n => { n.read = true; });
    updateBadge();
    renderList();
  }

  function dismissNotification(id, li) {
    li.classList.add('dismissing');
    li.addEventListener('animationend', () => {
      notifications = notifications.filter(n => n.id !== id);
      renderList();
      updateBadge();
    }, { once: true });
  }

  function clearAll() {
    notifications = [];
    renderList();
    updateBadge();
  }

  /* ── Panel open / close ── */

  function open() {
    isOpen = true;
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    renderList();
    // Focus first focusable element
    setTimeout(() => panel.querySelector('button')?.focus(), 50);
  }

  function close() {
    isOpen = false;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }

  function toggle() {
    isOpen ? close() : open();
  }

  /* ── Simulate a new notification arriving every 45 seconds ── */
  const newNotifPool = [
    { type: 'order', icon: 'shopping-bag', iconClass: 'dash-notif-item__icon--order', title: 'New order placed — #GV-{id}', meta: 'A customer just placed a new order · ₹{amt}' },
    { type: 'review', icon: 'star', iconClass: 'dash-notif-item__icon--review', title: 'New customer review submitted', meta: 'Awaiting your moderation in the Reviews section' },
    { type: 'system', icon: 'refresh-cw', iconClass: 'dash-notif-item__icon--system', title: 'Subscription renewal processed', meta: 'A monthly subscription was successfully renewed' },
    { type: 'message', icon: 'message-square', iconClass: 'dash-notif-item__icon--message', title: 'New customer message received', meta: 'A customer sent an enquiry via the contact form' },
  ];

  function simulateNewNotification() {
    const template = newNotifPool[Math.floor(Math.random() * newNotifPool.length)];
    const amount   = (Math.floor(Math.random() * 20) + 3) * 100;
    const newNotif = {
      id:        ++nextId,
      type:      template.type,
      icon:      template.icon,
      iconClass: template.iconClass,
      title:     template.title.replace('{id}', 4800 + nextId),
      meta:      template.meta.replace('{amt}', amount.toLocaleString('en-IN')),
      time:      'Just now',
      read:      false,
    };

    // Prepend to array
    notifications.unshift(newNotif);

    // Shake the bell
    btn.classList.add('shake');
    btn.addEventListener('animationend', () => btn.classList.remove('shake'), { once: true });

    // Update badge
    updateBadge();

    // Re-render if panel is open
    if (isOpen) renderList();
  }

  function init() {
    if (!btn || !panel || !list) return;

    // Initial render
    updateBadge();

    // Toggle on bell click
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });

    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !panel.contains(e.target) && !btn.contains(e.target)) close();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Mark all read
    markAllBtn?.addEventListener('click', e => { e.stopPropagation(); markAllRead(); });

    // Clear all
    clearAllBtn?.addEventListener('click', e => { e.stopPropagation(); clearAll(); });

    // Filter tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', e => {
        e.stopPropagation();
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeFilter = tab.dataset.filter;
        renderList();
      });
    });

    // Simulate new notification every 45s
    setTimeout(simulateNewNotification, 8000); // first one after 8s
    setInterval(simulateNewNotification, 45000);
  }

  return { init, close };
})();


/* ============================================================
   05. CHART MANAGER
   ============================================================ */
const ChartManager = (() => {

  let revenueChart = null;
  let ordersChart  = null;
  let trafficChart = null;

  function isDark() {
    return document.body.getAttribute('data-theme') === 'dark';
  }

  function getColors() {
    return {
      gridColor:   isDark() ? 'rgba(168,195,160,0.08)' : 'rgba(168,195,160,0.2)',
      labelColor:  isDark() ? '#6A9078' : '#6B7280',
      tooltipBg:   isDark() ? '#1A2E1E' : '#FFFFFF',
      tooltipClr:  isDark() ? '#C8DFC4' : '#1F2933',
    };
  }

  function initRevenue() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    const c = getColors();

    const data = [218000, 285000, 261000, 312000, 348000, 392000, 421000, 388000, 445000, 467000, 438000, 482360];
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (₹)',
          data,
          backgroundColor: labels.map((_, i) =>
            i === data.length - 1 ? '#2F6F4E' : 'rgba(47,111,78,0.25)'
          ),
          borderColor: '#2F6F4E',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltipBg,
            titleColor: c.tooltipClr,
            bodyColor: c.labelColor,
            borderColor: 'rgba(168,195,160,0.3)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => `₹${ctx.parsed.y.toLocaleString('en-IN')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: c.labelColor, font: { size: 11 } },
          },
          y: {
            grid: { color: c.gridColor },
            ticks: {
              color: c.labelColor,
              font: { size: 11 },
              callback: v => `₹${(v/1000).toFixed(0)}K`,
            },
          },
        },
      },
    });
  }

  function initOrders() {
    const ctx = document.getElementById('orders-chart');
    if (!ctx) return;

    const c = getColors();

    if (ordersChart) ordersChart.destroy();

    ordersChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Delivered', 'Processing', 'Pending', 'Cancelled'],
        datasets: [{
          data: [842, 248, 124, 34],
          backgroundColor: ['#2F6F4E', '#D4A857', '#6BAF92', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltipBg,
            titleColor: c.tooltipClr,
            bodyColor: c.labelColor,
            borderColor: 'rgba(168,195,160,0.3)',
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    });
  }

  function initTraffic() {
    const ctx = document.getElementById('traffic-chart');
    if (!ctx) return;

    const c = getColors();
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    if (trafficChart) trafficChart.destroy();

    trafficChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'This Week',
            data: [3200, 4100, 3800, 4900, 5600, 4300, 3900],
            borderColor: '#2F6F4E',
            backgroundColor: 'rgba(47,111,78,0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2F6F4E',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
          {
            label: 'Last Week',
            data: [2900, 3600, 3400, 4200, 4800, 3700, 3400],
            borderColor: '#A8C3A0',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#A8C3A0',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltipBg,
            titleColor: c.tooltipClr,
            bodyColor: c.labelColor,
            borderColor: 'rgba(168,195,160,0.3)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('en-IN')} visitors`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: c.labelColor, font: { size: 11 } },
          },
          y: {
            grid: { color: c.gridColor },
            ticks: {
              color: c.labelColor,
              font: { size: 11 },
              callback: v => `${(v/1000).toFixed(0)}K`,
            },
          },
        },
      },
    });
  }

  function rerender() {
    initRevenue();
    initOrders();
    initTraffic();
  }

  function init() {
    // Charts need Chart.js to be loaded
    if (typeof Chart === 'undefined') {
      // Chart.js still loading — retry
      const script = document.querySelector('script[src*="chart.js"]');
      script?.addEventListener('load', () => { initRevenue(); initOrders(); initTraffic(); });
      return;
    }

    // Set global Chart defaults
    Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
    Chart.defaults.animation.duration = 800;

    initRevenue();
    initOrders();
    initTraffic();

    // Revenue year selector
    document.getElementById('revenue-year')?.addEventListener('change', () => {
      // In production, this would fetch new data
      initRevenue();
    });
  }

  return { init, rerender };
})();


/* ============================================================
   06. ACTIVITY FEED — live simulation
   Adds a new activity item every 30 seconds
   ============================================================ */
const ActivityFeed = (() => {

  const feedItems = [
    { type: 'order', icon: 'shopping-bag', iconClass: 'dash-activity-item__icon--order', text: '<strong>New customer</strong> placed order <span class="dash-activity-item__ref">#GV-{id}</span>' },
    { type: 'review', icon: 'star', iconClass: 'dash-activity-item__icon--review', text: '<strong>A customer</strong> left a 5-star review' },
    { type: 'sub', icon: 'refresh-cw', iconClass: 'dash-activity-item__icon--sub', text: '<strong>New subscriber</strong> signed up for quarterly plan' },
    { type: 'msg', icon: 'message-square', iconClass: 'dash-activity-item__icon--msg', text: '<strong>New enquiry</strong> received via contact form' },
  ];

  let orderId = 4822;

  function iconSVGSmall(type) {
    const icons = {
      'shopping-bag':  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      'star':          `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'refresh-cw':    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
      'message-square':`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    };
    return icons[type] || icons['message-square'];
  }

  function addFeedItem() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    const template = feedItems[Math.floor(Math.random() * feedItems.length)];
    const text     = template.text.replace('{id}', ++orderId);

    const li = document.createElement('li');
    li.className = 'dash-activity-item';
    li.style.opacity = '0';
    li.style.transform = 'translateX(-10px)';
    li.innerHTML = `
      <div class="dash-activity-item__icon ${template.iconClass}">${iconSVGSmall(template.icon)}</div>
      <div class="dash-activity-item__text">
        <p>${text}</p>
        <time class="dash-activity-item__time">Just now</time>
      </div>`;

    // Prepend
    feed.insertBefore(li, feed.firstChild);

    // Animate in
    requestAnimationFrame(() => {
      li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      li.style.opacity    = '1';
      li.style.transform  = 'translateX(0)';
    });

    // Remove oldest item if list exceeds 8
    while (feed.children.length > 8) {
      const last = feed.lastChild;
      last.style.opacity = '0';
      setTimeout(() => last.remove(), 400);
    }
  }

  function init() {
    setInterval(addFeedItem, 30000);
  }

  return { init };
})();


/* ============================================================
   07. ALERT STRIP DISMISS
   ============================================================ */
function initAlertStrip() {
  document.querySelectorAll('.dash-alert-strip__dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      const strip = btn.closest('.dash-alert-strip');
      if (strip) {
        strip.style.transition = 'opacity 0.3s ease, max-height 0.4s ease';
        strip.style.opacity    = '0';
        strip.style.maxHeight  = '0';
        strip.style.overflow   = 'hidden';
        strip.style.marginBottom = '0';
        setTimeout(() => strip.remove(), 400);
      }
    });
  });
}


/* ============================================================
   08. SEARCH (Keyboard shortcut ⌘K / Ctrl+K)
   ============================================================ */
function initSearch() {
  const searchInput = document.getElementById('dash-search');
  if (!searchInput) return;

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });
}


/* ============================================================
   09. DATE DISPLAY
   ============================================================ */
function initDateDisplay() {
  const el = document.getElementById('dash-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}


/* ============================================================
   10. TABLE INTERACTIONS
   ============================================================ */
function initTableInteractions() {
  // Select-all checkbox
  document.querySelectorAll('thead input[type="checkbox"]').forEach(masterChk => {
    masterChk.addEventListener('change', () => {
      const table = masterChk.closest('table');
      table?.querySelectorAll('tbody input[type="checkbox"]').forEach(chk => {
        chk.checked = masterChk.checked;
      });
    });
  });
}


/* ============================================================
   UTILITY: XSS-safe HTML escaper
   ============================================================ */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str || '').replace(/[&<>"']/g, m => map[m]);
}


/* ============================================================
   11. INIT
   ============================================================ */
function init() {
  ThemeManager.init();
  SidebarManager.init();
  SectionNav.init();
  NotificationSystem.init();
  initAlertStrip();
  initSearch();
  initDateDisplay();
  initTableInteractions();
  ActivityFeed.init();

  // Charts need slight delay for DOM + Chart.js to be ready
  if (typeof Chart !== 'undefined') {
    ChartManager.init();
  } else {
    // Chart.js might still be loading (defer)
    window.addEventListener('load', () => ChartManager.init());
  }

  // Init Lucide icons
  if (window.lucide) {
    lucide.createIcons();
    // Re-create after icons are replaced by lucide (it replaces <i> tags with SVG)
    setTimeout(() => lucide.createIcons(), 300);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

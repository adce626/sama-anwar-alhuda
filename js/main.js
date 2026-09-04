/* ============================================================
   سما انوار الهدى | Main application script — v2 (multi-page)
   ============================================================ */

'use strict';

var SERVICES = [
  { key: 'catering', href: 'catering.html', icon: 'fa-utensils' },
  { key: 'cleaning', href: 'cleaning.html', icon: 'fa-broom' },
  { key: 'transport', href: 'transport.html', icon: 'fa-truck' },
  { key: 'delivery', href: 'delivery.html', icon: 'fa-bolt' },
  { key: 'workforce', href: 'workforce.html', icon: 'fa-users' }
];

var state = { lang: 'ar', theme: 'light' };

/* ---------- Helpers ---------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function t(path) {
  var dict = I18N[state.lang];
  return path.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, dict) || path;
}

/* ---------- Google Analytics Event Tracking ---------- */
function trackEvent(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params || {});
  }
}

/* ---------- Conversion Tracking ---------- */
function trackConversion(conversionType, value) {
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', {
      'send_to': 'G-XXXXXXXXXX/CONVERSION_ID',
      'value': value || 1,
      'currency': 'IQD',
      'transaction_id': ''
    });
  }
}

// Track phone calls as conversions
function trackPhoneConversion() {
  trackConversion('phone_call');
  trackEvent('phone_conversion', { method: 'phone' });
}

// Track WhatsApp as conversions
function trackWhatsAppConversion() {
  trackConversion('whatsapp');
  trackEvent('whatsapp_conversion', { method: 'whatsapp' });
}

// Track form submissions as conversions
function trackFormConversion(formType) {
  trackConversion('form_submit', 1);
  trackEvent('form_conversion', { form_type: formType || 'unknown' });
}

/* ---------- Theme ---------- */
function applyTheme() {
  document.body.dataset.theme = state.theme;
  try { localStorage.setItem('sah-theme', state.theme); } catch (e) {}
  var icon = $('#themeToggle i');
  if (!icon) return;
  icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  icon.style.animation = 'none';
  void icon.offsetWidth;
  icon.style.animation = 'themeIconSpin 0.5s ease';
}

function initTheme() {
  var stored = null;
  try { stored = localStorage.getItem('sah-theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') state.theme = stored;
  else state.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme();
}

/* ---------- Language ---------- */
function applyLang() {
  var html = document.documentElement;
  html.lang = state.lang;
  html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

  $$('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });

  var toggle = $('#langToggle');
  if (toggle) {
    toggle.textContent = state.lang === 'ar' ? 'EN' : 'AR';
    toggle.setAttribute('aria-label', state.lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }

  document.title = state.lang === 'ar'
    ? 'شركة سما انوار الهدى | Sama Anwar Al-Huda'
    : 'Sama Anwar Al-Huda | شركة سما انوار الهدى';

  document.body.classList.remove('lang-swap');
  void document.body.offsetWidth;
  document.body.classList.add('lang-swap');

  try { localStorage.setItem('sah-lang', state.lang); } catch (e) {}
}

function initLang() {
  var stored = null;
  try { stored = localStorage.getItem('sah-lang'); } catch (e) {}
  state.lang = (stored === 'en' || stored === 'ar') ? stored : 'ar';
  applyLang();
}

/* ---------- Service card renderer ---------- */
function renderServiceCards() {
  $$('[data-services-grid]').forEach(function (grid) {
    var exclude = grid.getAttribute('data-exclude') || '';
    var useTilt = grid.hasAttribute('data-tilt');
    var list = SERVICES.filter(function (s) { return s.key !== exclude; });
    var html = list.map(function (s, i) {
      return '' +
        '<a class="service-card ' + (useTilt ? 'tilt ' : '') + 'reveal" href="' + s.href + '">' +
        '  <span class="svc-count">' + String(i + 1).padStart(2, '0') + '</span>' +
        '  <span class="svc-icon"><i class="fas ' + s.icon + '"></i></span>' +
        '  <h3 class="svc-title" data-i18n="svc.' + s.key + '.title"></h3>' +
        '  <p class="svc-short" data-i18n="svc.' + s.key + '.short"></p>' +
        '  <span class="svc-more"><span data-i18n="prev.more"></span> <i class="fas fa-arrow-right"></i></span>' +
        '</a>';
    }).join('');
    grid.innerHTML = html;
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  var els = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
}

/* ---------- 3D tilt (Home service cards, desktop) ---------- */
function initTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        'perspective(900px) rotateX(' + (-1 * py * 6) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
}

/* ---------- Events ---------- */
function wireEvents() {
  // Navbar scroll state + progress bar
  var navbar = $('#navbar');
  var progress = $('#scrollProgress');
  function onScroll() {
    var y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Toggles (injected header)
  var langToggle = $('#langToggle');
  if (langToggle) langToggle.addEventListener('click', function () {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    trackEvent('language_switch', { language: state.lang });
    renderServiceCards();   // rebuild cards with current lang structure
    initReveal();           // observe the new .reveal elements
    applyLang();            // fill all texts + direction + animation
  });

  var themeToggle = $('#themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    trackEvent('theme_change', { theme: state.theme });
    applyTheme();
  });

  // Hamburger + mobile panel + dropdown
  var burger = $('#hamburger');
  var links = $('#navLinks');
  function closePanel() {
    if (links) links.classList.remove('open');
    if (burger) burger.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.closest('.dropdown')) closePanel();
    });
  }
  var svcToggle = $('#svcToggle');
  var svcDropdown = $('#svcDropdown');
  if (svcToggle && svcDropdown) {
    svcToggle.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 960px)').matches) return; // always open on mobile
      e.preventDefault();
      svcDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (svcDropdown.classList.contains('open') && !e.target.closest('.has-dropdown')) {
        svcDropdown.classList.remove('open');
      }
    });
  }

  // Smooth-scroll same-page anchors only
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = $(id);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });

  // Track phone calls
  $$('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      trackEvent('phone_call', { method: 'click' });
      trackPhoneConversion();
    });
  });

  // Track WhatsApp clicks
  $$('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () {
      trackEvent('whatsapp_click', { method: 'click' });
      trackWhatsAppConversion();
    });
  });

  // Track social media clicks
  $$('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="youtube.com"], a[href*="linkedin.com"], a[href*="pinterest.com"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var platform = 'unknown';
      if (a.href.includes('facebook.com')) platform = 'facebook';
      else if (a.href.includes('instagram.com')) platform = 'instagram';
      else if (a.href.includes('x.com') || a.href.includes('twitter.com')) platform = 'twitter';
      else if (a.href.includes('youtube.com')) platform = 'youtube';
      else if (a.href.includes('linkedin.com')) platform = 'linkedin';
      else if (a.href.includes('pinterest.com')) platform = 'pinterest';
      trackEvent('social_click', { platform: platform });
    });
  });

  // Track service card clicks
  $$('.service-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var service = card.getAttribute('href') ? card.getAttribute('href').replace('.html', '') : 'unknown';
      trackEvent('service_click', { service: service });
    });
  });

  // Track form submissions
  $$('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      var formId = form.getAttribute('id') || form.getAttribute('data-name') || 'unknown';
      trackEvent('form_submit', { form_id: formId });
      trackFormConversion(formId);
    });
  });

  // Cursor glow (fine pointers only)
  var glow = $('#cursorGlow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      glow.classList.add('active');
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    });
    document.addEventListener('mouseleave', function () { glow.classList.remove('active'); });
  }

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Preloader ---------- */
function initPreloader() {
  var pre = $('#preloader');
  if (!pre) return;
  var hide = function () { pre.classList.add('hidden'); };
  window.addEventListener('load', function () { setTimeout(hide, 250); });
  setTimeout(hide, 3500);
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', function () {
  renderServiceCards();
  initTheme();
  initLang();
  wireEvents();
  initReveal();
  initTilt();
  initPreloader();
});
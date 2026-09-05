/* ============================================================
   Shared header & footer — injected into every page.
   Load before main.js (provides #site-header / #site-footer).
   ============================================================ */
(function () {
  'use strict';

  var LOGO = SITE.logo;
  var PHONE_TEL = SITE.phone.tel;
  var PHONE_DISPLAY = SITE.phone.display;
  var WA_HREF = SITE.phone.whatsapp;
  var FB_HREF = SITE.social.facebook;
  var IG_HREF = SITE.social.instagram;
  var TW_HREF = SITE.social.twitter;
  var YT_HREF = SITE.social.youtube;
  var LI_HREF = SITE.social.linkedin;
  var PI_HREF = SITE.social.pinterest;
  var EMAIL = SITE.email;

  var SERVICES = [
    { key: 'catering', href: 'catering.html', icon: 'fa-utensils' },
    { key: 'cleaning', href: 'cleaning.html', icon: 'fa-broom' },
    { key: 'transport', href: 'transport.html', icon: 'fa-truck' },
    { key: 'delivery', href: 'delivery.html', icon: 'fa-bolt' },
    { key: 'workforce', href: 'workforce.html', icon: 'fa-users' },
    { key: 'advertising', href: 'advertising.html', icon: 'fa-bullhorn' }
  ];

  function serviceLinks() {
    return SERVICES.map(function (s) {
      return '<li><a href="' + s.href + '"><i class="fas ' + s.icon + '"></i><span data-i18n="svc.' + s.key + '.title">' + s.key + '</span></a></li>';
    }).join('');
  }

  function footerServiceLinks() {
    return SERVICES.map(function (s) {
      return '<a href="' + s.href + '"><i class="fas fa-angle-right"></i><span data-i18n="svc.' + s.key + '.title"></span></a>';
    }).join('');
  }

  function headerHTML() {
    return '' +
      '<nav class="nav container" aria-label="Main">' +
      '  <a class="brand" href="index.html">' +
      '    <span class="brand-logo-wrap"><img src="' + LOGO + '" width="46" height="46" alt="Sama Anwar Al-Huda"></span>' +
      '    <span class="brand-text"><b data-i18n="brand">...</b><small data-i18n="brandSub">...</small></span>' +
      '  </a>' +
      '  <ul class="nav-links" id="navLinks">' +
      '    <li><a class="nav-link" data-nav="home" href="index.html" data-i18n="nav.home">Home</a></li>' +
      '    <li class="has-dropdown">' +
      '      <a class="nav-link" data-nav="services" href="index.html#services" id="svcToggle" aria-haspopup="true" data-i18n="nav.services">Services</a>' +
      '      <ul class="dropdown" id="svcDropdown">' + serviceLinks() + '</ul>' +
      '    </li>' +
      '    <li><a class="nav-link" data-nav="about" href="about.html" data-i18n="nav.about">About</a></li>' +
      '    <li><a class="nav-link" data-nav="contact" href="contact.html" data-i18n="nav.contact">Contact</a></li>' +
      '  </ul>' +
      '  <div class="nav-tools">' +
      '    <a class="btn btn-red nav-cta" href="tel:' + PHONE_TEL + '"><i class="fas fa-phone"></i><span data-i18n="nav.call">Call</span></a>' +
      '    <button class="lang-toggle" id="langToggle" aria-label="Language"></button>' +
      '    <button class="theme-toggle" id="themeToggle" aria-label="Theme"><i class="fas fa-moon"></i></button>' +
      '    <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '  </div>' +
      '</nav>';
  }

  function footerHTML() {
    return '' +
      '<div class="container footer-grid">' +
      '  <div>' +
      '    <div class="f-brand"><img src="' + LOGO + '" width="56" height="56" alt="Sama Anwar Al-Huda">' +
      '      <span><b data-i18n="brand">...</b><small data-i18n="brandSub">...</small></span></div>' +
      '    <p class="f-tag" data-i18n="footer.tagline"></p>' +
      '    <div class="social-row" style="margin-top:18px">' +
      '      <a href="' + FB_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
      '      <a href="' + IG_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
      '      <a href="' + TW_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a>' +
      '      <a href="' + YT_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="YouTube"><i class="fab fa-youtube"></i></a>' +
      '      <a href="' + LI_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>' +
      '      <a href="' + PI_HREF + '" target="_blank" rel="noopener" class="social-btn" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>' +
      '    </div>' +
      '  </div>' +
      '  <div class="footer-links"><h4 data-i18n="footer.serv"></h4>' + footerServiceLinks() + '</div>' +
      '  <div class="footer-links"><h4 data-i18n="footer.quick"></h4>' +
      '    <a href="index.html"><i class="fas fa-angle-right"></i><span data-i18n="nav.home"></span></a>' +
      '    <a href="about.html"><i class="fas fa-angle-right"></i><span data-i18n="nav.about"></span></a>' +
      '    <a href="contact.html"><i class="fas fa-angle-right"></i><span data-i18n="nav.contact"></span></a>' +
      '  </div>' +
      '  <div class="footer-contact"><h4 data-i18n="footer.contact"></h4>' +
      '    <p><i class="fas fa-phone"></i><a href="tel:' + PHONE_TEL + '" dir="ltr">' + PHONE_DISPLAY + '</a></p>' +
      '    <p><i class="fab fa-whatsapp"></i><a href="' + WA_HREF + '" target="_blank" rel="noopener" dir="ltr">' + PHONE_DISPLAY + '</a></p>' +
      '    <p><i class="fas fa-envelope"></i><a href="mailto:' + EMAIL + '" dir="ltr">' + EMAIL + '</a></p>' +
      '    <p><i class="fas fa-map-marker-alt"></i><span data-i18n="contact.addresstext">Karbala</span></p>' +
      '  </div>' +
      '</div>' +
      '<div class="footer-bottom"><div class="container">© <span id="year"></span> ' +
      '  <span data-i18n="brand">...</span> — <span data-i18n="footer.rights"></span>' +
      '</div></div>';
  }

  function inject() {
    var header = document.getElementById('site-header');
    var footer = document.getElementById('site-footer');
    if (header) header.innerHTML = headerHTML();
    if (footer) footer.innerHTML = footerHTML();

    // Highlight the current page in the nav
    var page = document.body.getAttribute('data-page') || 'home';
    var navMap = {
      index: 'home', catering: 'services', cleaning: 'services', transport: 'services',
      delivery: 'services', workforce: 'services', about: 'about', contact: 'contact'
    };
    var activeNav = navMap[page] || 'home';
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === activeNav) links[i].classList.add('active');
    }
    links = null;
  }

  if (document.getElementById('site-header')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
    else inject();
  }
})();
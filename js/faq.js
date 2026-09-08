/* ============================================================
   سما انوار الهدى | FAQ Accordion
   ============================================================ */
(function() {
  'use strict';
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.faq-question');
    if (!btn) return;
    var item = btn.parentElement;
    var answer = item.querySelector('.faq-answer');
    var isOpen = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item.active').forEach(function(el) {
      el.classList.remove('active');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      el.querySelector('.faq-answer').style.maxHeight = null;
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
})();

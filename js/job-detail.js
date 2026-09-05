/* ============================================================
   سما انوار الهدى | Job Detail Page
   ============================================================ */
(function() {
  'use strict';

  var loadingEl = document.getElementById('jobDetailLoading');
  var contentEl = document.getElementById('jobDetailContent');
  var notFoundEl = document.getElementById('jobDetailNotFound');
  var titleEl = document.getElementById('jobDetailTitle');
  var metaEl = document.getElementById('jobDetailMeta');
  var bodyEl = document.getElementById('jobDetailBody');
  var shareBtns = document.getElementById('jobShareBtns');
  var applyBtn = document.getElementById('jobApplyBtn');
  var applyModal = document.getElementById('applyModal');

  if (!contentEl) return;

  var params = new URLSearchParams(window.location.search);
  var jobId = params.get('id');

  if (!jobId) {
    loadingEl.style.display = 'none';
    notFoundEl.style.display = 'flex';
    return;
  }

  var deptLabels = {
    ar: { cleaning: 'تنظيف', catering: 'تغذية', transport: 'نقل عام', delivery: 'توصيل سريع', workforce: 'تشغيل أيدي عاملة', advertising: 'إعلان وترويج', hospitality: 'خدمات فندقية' },
    en: { cleaning: 'Cleaning', catering: 'Catering', transport: 'General Transport', delivery: 'Express Delivery', workforce: 'Workforce Staffing', advertising: 'Advertising & Promotion', hospitality: 'Hospitality Services' }
  };

  var typeLabels = {
    ar: { full_time: 'دوام كامل', part_time: 'دوام جزئي', contract: 'عقد', temporary: 'مؤقت', permanent: 'دائم' },
    en: { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', temporary: 'Temporary', permanent: 'Permanent' }
  };

  function getLang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return getLang() === 'ar'
      ? d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  async function fetchJob() {
    try {
      var url = SITE.supabase.url;
      var key = SITE.supabase.anonKey;
      if (!url || !key || url === 'YOUR_SUPABASE_URL') throw new Error('Supabase not configured');

      var response = await fetch(url + '/rest/v1/jobs?id=eq.' + jobId + '&status=eq.open', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
      });

      if (!response.ok) throw new Error('Fetch failed');

      var jobs = await response.json();
      if (!jobs || jobs.length === 0) {
        loadingEl.style.display = 'none';
        notFoundEl.style.display = 'flex';
        return;
      }

      var job = jobs[0];
      var lang = getLang();
      var dept = deptLabels[lang][job.department] || job.department;
      var type = typeLabels[lang][job.employment_type] || job.employment_type || '';

      document.title = (job.title || 'الوظيفة') + ' — سما انوار الهدى';

      titleEl.textContent = job.title || '';
      metaEl.innerHTML = '<span class="job-dept-badge"><i class="fas fa-building"></i> ' + dept + '</span>' +
        '<span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ' + (job.location || '') + '</span>' +
        (type ? '<span class="job-meta-item"><i class="fas fa-clock"></i> ' + type + '</span>' : '') +
        '<span class="job-meta-item"><i class="fas fa-calendar-alt"></i> ' + formatDate(job.created_at) + '</span>';

      bodyEl.innerHTML = '<div class="job-detail-desc"><h3>' + (lang === 'ar' ? 'وصف الوظيفة' : 'Job Description') + '</h3><p>' + (job.description || '') + '</p></div>' +
        (job.requirements ? '<div class="job-detail-req"><h3>' + (lang === 'ar' ? 'المتطلبات' : 'Requirements') + '</h3><p>' + job.requirements + '</p></div>' : '') +
        (job.benefits ? '<div class="job-detail-benefits"><h3>' + (lang === 'ar' ? 'المميزات' : 'Benefits') + '</h3><p>' + job.benefits + '</p></div>' : '');

      // Share buttons
      var pageUrl = window.location.href;
      var shareText = lang === 'ar' ? 'شوف هذي الوظيفة: ' + job.title : 'Check this job: ' + job.title;
      shareBtns.innerHTML =
        '<a href="https://wa.me/?text=' + encodeURIComponent(shareText + '\n' + pageUrl) + '" target="_blank" class="share-link share-wa"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
        '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl) + '" target="_blank" class="share-link share-fb"><i class="fab fa-facebook-f"></i> Facebook</a>' +
        '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(pageUrl) + '" target="_blank" class="share-link share-tw"><i class="fab fa-x-twitter"></i> X</a>';

      // Apply button
      applyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof window.openApplyModal === 'function') {
          window.openApplyModal(job.id, job.title);
        } else {
          // Fallback for jobs.html
          window.location.href = 'jobs.html?apply=' + job.id;
        }
      });

      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';

    } catch (err) {
      console.error('Job detail error:', err);
      loadingEl.style.display = 'none';
      notFoundEl.style.display = 'flex';
    }
  }

  fetchJob();
})();

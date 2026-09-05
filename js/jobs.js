/* ============================================================
   سما انوار الهدى | Jobs Page - Fetch from Supabase
   ============================================================ */
(function() {
  'use strict';

  var loadingEl = document.getElementById('jobsLoading');
  var emptyEl = document.getElementById('jobsEmpty');
  var gridEl = document.getElementById('jobsGrid');

  if (!gridEl) return;

  var deptLabels = {
    ar: {
      cleaning: 'تنظيف',
      catering: 'تغذية',
      transport: 'نقل عام',
      delivery: 'توصيل سريع',
      workforce: 'تشغيل أيدي عاملة',
      advertising: 'إعلان وترويج',
      hospitality: 'خدمات فندقية'
    },
    en: {
      cleaning: 'Cleaning',
      catering: 'Catering',
      transport: 'General Transport',
      delivery: 'Express Delivery',
      workforce: 'Workforce Staffing',
      advertising: 'Advertising & Promotion',
      hospitality: 'Hospitality Services'
    }
  };

  var typeLabels = {
    ar: { full_time: 'دوام كامل', part_time: 'دوام جزئي', contract: 'عقد', temporary: 'مؤقت' },
    en: { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', temporary: 'Temporary' }
  };

  function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'ar';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var lang = getLang();
    if (lang === 'ar') {
      return d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderJobCard(job) {
    var lang = getLang();
    var dept = deptLabels[lang][job.department] || job.department;
    var type = typeLabels[lang][job.work_type] || job.work_type || '';
    var desc = job.description || '';
    if (desc.length > 120) desc = desc.substring(0, 120) + '...';

    return '<div class="job-card reveal">' +
      '<div class="job-card-header">' +
        '<span class="job-dept-badge"><i class="fas fa-building"></i> ' + dept + '</span>' +
        '<span class="job-date"><i class="fas fa-calendar-alt"></i> ' + formatDate(job.created_at) + '</span>' +
      '</div>' +
      '<h3 class="job-title">' + (job.title || '') + '</h3>' +
      '<div class="job-meta">' +
        '<span><i class="fas fa-map-marker-alt"></i> ' + (job.location || '') + '</span>' +
        (type ? '<span><i class="fas fa-clock"></i> ' + type + '</span>' : '') +
      '</div>' +
      '<p class="job-desc">' + desc + '</p>' +
    '</div>';
  }

  async function fetchJobs() {
    try {
      var url = SITE.supabase.url;
      var key = SITE.supabase.anonKey;

      if (!url || !key || url === 'YOUR_SUPABASE_URL') {
        throw new Error('Supabase not configured');
      }

      var response = await fetch(url + '/rest/v1/jobs?status=eq.open&order=created_at.desc', {
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + key
        }
      });

      if (!response.ok) throw new Error('Fetch failed');

      var jobs = await response.json();

      loadingEl.style.display = 'none';

      if (!jobs || jobs.length === 0) {
        emptyEl.style.display = 'flex';
        return;
      }

      gridEl.innerHTML = jobs.map(renderJobCard).join('');
      gridEl.style.display = 'grid';

      // Re-init reveal animations for new elements
      if (typeof initReveal === 'function') initReveal();

    } catch (err) {
      console.error('Jobs fetch error:', err);
      loadingEl.style.display = 'none';
      emptyEl.style.display = 'flex';
    }
  }

  fetchJobs();
})();

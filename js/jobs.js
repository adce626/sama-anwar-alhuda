/* ============================================================
   سما انوار الهدى | Jobs Page - Fetch, Filter, Search, Apply
   ============================================================ */
(function() {
  'use strict';

  var loadingEl = document.getElementById('jobsLoading');
  var emptyEl = document.getElementById('jobsEmpty');
  var gridEl = document.getElementById('jobsGrid');
  var searchEl = document.getElementById('jobSearch');
  var filtersEl = document.getElementById('jobFilters');
  var applyModal = document.getElementById('applyModal');

  if (!gridEl) return;

  var allJobs = [];
  var currentFilter = 'all';
  var currentSearch = '';

  var deptLabels = {
    ar: { cleaning: 'تنظيف', catering: 'تغذية', transport: 'نقل عام', delivery: 'توصيل سريع', workforce: 'تشغيل أيدي عاملة', advertising: 'إعلان وترويج', hospitality: 'خدمات فندقية' },
    en: { cleaning: 'Cleaning', catering: 'Catering', transport: 'General Transport', delivery: 'Express Delivery', workforce: 'Workforce Staffing', advertising: 'Advertising & Promotion', hospitality: 'Hospitality Services' }
  };

  var typeLabels = {
    ar: { full_time: 'دوام كامل', part_time: 'دوام جزئي', contract: 'عقد', temporary: 'مؤقت' },
    en: { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', temporary: 'Temporary' }
  };

  function getLang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return getLang() === 'ar'
      ? d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderJobCard(job) {
    var lang = getLang();
    var dept = deptLabels[lang][job.department] || job.department;
    var type = typeLabels[lang][job.work_type] || job.work_type || '';
    var desc = job.description || '';
    if (desc.length > 100) desc = desc.substring(0, 100) + '...';

    return '<div class="job-card reveal" data-dept="' + job.department + '">' +
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
      '<div class="job-card-actions">' +
        '<a href="job.html?id=' + job.id + '" class="btn btn-red btn-sm"><i class="fas fa-eye"></i> ' + (getLang() === 'ar' ? 'التفاصيل' : 'Details') + '</a>' +
        '<button class="btn btn-outline btn-sm job-share-btn" data-id="' + job.id + '" data-title="' + (job.title || '') + '"><i class="fas fa-share-alt"></i></button>' +
      '</div>' +
    '</div>';
  }

  function filterJobs() {
    var filtered = allJobs;
    if (currentFilter !== 'all') {
      filtered = filtered.filter(function(j) { return j.department === currentFilter; });
    }
    if (currentSearch) {
      var q = currentSearch.toLowerCase();
      filtered = filtered.filter(function(j) {
        return (j.title && j.title.toLowerCase().indexOf(q) !== -1) ||
               (j.description && j.description.toLowerCase().indexOf(q) !== -1) ||
               (j.location && j.location.toLowerCase().indexOf(q) !== -1);
      });
    }
    gridEl.innerHTML = filtered.map(renderJobCard).join('');
    emptyEl.style.display = filtered.length === 0 ? 'flex' : 'none';
    gridEl.style.display = filtered.length > 0 ? 'grid' : 'none';
  }

  // Share buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.job-share-btn');
    if (btn) {
      var id = btn.getAttribute('data-id');
      var title = btn.getAttribute('data-title');
      var url = window.location.origin + '/job.html?id=' + id;
      var lang = getLang();
      var text = lang === 'ar' ? 'شوف هذي الوظيفة: ' + title : 'Check this job: ' + title;
      if (btn.classList.contains('share-wa')) {
        window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank');
      } else {
        var shareMenu = btn.nextElementSibling;
        if (shareMenu && shareMenu.classList.contains('share-menu')) {
          shareMenu.classList.toggle('show');
        } else {
          var menu = document.createElement('div');
          menu.className = 'share-menu show';
          menu.innerHTML = '<a href="https://wa.me/?text=' + encodeURIComponent(text + '\n' + url) + '" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" target="_blank"><i class="fab fa-facebook-f"></i> Facebook</a>' +
            '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '" target="_blank"><i class="fab fa-x-twitter"></i> X</a>';
          btn.parentNode.appendChild(menu);
        }
      }
    }
    // Close share menus on outside click
    if (!e.target.closest('.job-share-btn') && !e.target.closest('.share-menu')) {
      document.querySelectorAll('.share-menu.show').forEach(function(m) { m.classList.remove('show'); });
    }
  });

  // Filter buttons
  if (filtersEl) {
    filtersEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filtersEl.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-dept');
      filterJobs();
    });
  }

  // Search
  if (searchEl) {
    searchEl.addEventListener('input', function() {
      currentSearch = this.value.trim();
      filterJobs();
    });
  }

  // Apply modal
  function openApplyModal(jobId, jobTitle) {
    if (!applyModal) return;
    document.getElementById('applyJobId').value = jobId;
    document.getElementById('modalJobTitle').textContent = jobTitle;
    applyModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeApplyModal() {
    if (!applyModal) return;
    applyModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('#modalClose')) closeApplyModal();
    if (e.target === applyModal) closeApplyModal();
  });

  // File upload preview
  var fileUpload = document.getElementById('fileUpload');
  var fileInput = document.getElementById('applyIdImage');
  var fileLabel = document.getElementById('fileUploadLabel');
  var filePreview = document.getElementById('filePreview');

  if (fileUpload && fileInput) {
    fileUpload.addEventListener('click', function() { fileInput.click(); });
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          filePreview.src = e.target.result;
          filePreview.style.display = 'block';
          fileLabel.style.display = 'none';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // Submit application
  var applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = document.getElementById('applySubmitBtn');
      var successEl = document.getElementById('applySuccess');
      var errorEl = document.getElementById('applyError');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (getLang() === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...');
      successEl.style.display = 'none';
      errorEl.style.display = 'none';

      try {
        var url = SITE.supabase.url;
        var key = SITE.supabase.anonKey;
        if (!url || !key || url === 'YOUR_SUPABASE_URL') throw new Error('Supabase not configured');

        // Upload image to Supabase Storage
        var file = fileInput.files[0];
        var fileName = Date.now() + '_' + file.name;
        var formData = new FormData();
        formData.append('file', file);

        var uploadRes = await fetch(url + '/storage/v1/object/job-applications/' + fileName, {
          method: 'POST',
          headers: { 'apikey': key, 'Authorization': 'Bearer ' + key },
          body: formData
        });

        var imageUrl = '';
        if (uploadRes.ok) {
          var uploadData = await uploadRes.json();
          imageUrl = url + '/storage/v1/object/public/job-applications/' + fileName;
        }

        // Submit application
        var appData = {
          job_id: document.getElementById('applyJobId').value,
          full_name: document.getElementById('applyFullName').value.trim(),
          phone: document.getElementById('applyPhone').value.trim(),
          id_image_url: imageUrl
        };

        var res = await fetch(url + '/rest/v1/job_applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(appData)
        });

        if (!res.ok) throw new Error('Submit failed');

        successEl.style.display = 'flex';
        applyForm.reset();
        filePreview.style.display = 'none';
        fileLabel.style.display = '';
      } catch (err) {
        console.error('Application error:', err);
        errorEl.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span data-i18n="jobs.applySubmit"></span>';
      }
    });
  }

  // Expose openApplyModal for job-detail.js
  window.openApplyModal = openApplyModal;

  // Fetch jobs
  async function fetchJobs() {
    try {
      var url = SITE.supabase.url;
      var key = SITE.supabase.anonKey;
      if (!url || !key || url === 'YOUR_SUPABASE_URL') throw new Error('Supabase not configured');

      var response = await fetch(url + '/rest/v1/jobs?status=eq.open&order=created_at.desc', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
      });

      if (!response.ok) throw new Error('Fetch failed');

      allJobs = await response.json();
      loadingEl.style.display = 'none';

      if (!allJobs || allJobs.length === 0) {
        emptyEl.style.display = 'flex';
        return;
      }

      gridEl.innerHTML = allJobs.map(renderJobCard).join('');
      gridEl.style.display = 'grid';

    } catch (err) {
      console.error('Jobs fetch error:', err);
      loadingEl.style.display = 'none';
      emptyEl.style.display = 'flex';
    }
  }

  fetchJobs();
})();

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

  function renderJobCard(job) {
    var lang = getLang();
    var dept = deptLabels[lang][job.department] || job.department;
    var type = typeLabels[lang][job.employment_type] || job.employment_type || '';
    var desc = job.description || '';
    if (desc.length > 100) desc = desc.substring(0, 100) + '...';
    var isOpen = job.status === 'open';
    var statusLabel = isOpen ? (lang === 'ar' ? 'متاحة' : 'Open') : (lang === 'ar' ? 'غير متاحة' : 'Closed');
    var statusClass = isOpen ? 'status-open' : 'status-closed';
    var detailUrl = 'job.html?id=' + job.id;

    return '<a href="' + detailUrl + '" class="job-card-link">' +
      '<div class="job-card" data-dept="' + job.department + '">' +
        '<div class="job-card-header">' +
          '<span class="job-dept-badge"><i class="fas fa-building"></i> ' + dept + '</span>' +
          '<span class="job-status-badge ' + statusClass + '">' + statusLabel + '</span>' +
        '</div>' +
        '<h3 class="job-title">' + (job.title || '') + '</h3>' +
        '<div class="job-meta">' +
          '<span><i class="fas fa-map-marker-alt"></i> ' + (job.location || '') + '</span>' +
          (type ? '<span><i class="fas fa-clock"></i> ' + type + '</span>' : '') +
        '</div>' +
        '<p class="job-desc">' + desc + '</p>' +
      '</div>' +
    '</a>';
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

  // File upload preview — front
  var fileUploadFront = document.getElementById('fileUploadFront');
  var fileInputFront = document.getElementById('applyIdImageFront');
  var fileLabelFront = document.getElementById('fileUploadLabelFront');
  var filePreviewFront = document.getElementById('filePreviewFront');

  if (fileUploadFront && fileInputFront) {
    fileUploadFront.addEventListener('click', function() { fileInputFront.click(); });
    fileInputFront.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          filePreviewFront.src = e.target.result;
          filePreviewFront.style.display = 'block';
          fileLabelFront.style.display = 'none';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // File upload preview — back
  var fileUploadBack = document.getElementById('fileUploadBack');
  var fileInputBack = document.getElementById('applyIdImageBack');
  var fileLabelBack = document.getElementById('fileUploadLabelBack');
  var filePreviewBack = document.getElementById('filePreviewBack');

  if (fileUploadBack && fileInputBack) {
    fileUploadBack.addEventListener('click', function() { fileInputBack.click(); });
    fileInputBack.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          filePreviewBack.src = e.target.result;
          filePreviewBack.style.display = 'block';
          fileLabelBack.style.display = 'none';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // Helper: upload file to storage
  async function uploadFile(file, bucket, supaUrl, supaKey) {
    var fileExt = file.name.split('.').pop();
    var fileName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;
    var formData = new FormData();
    formData.append('file', file);

    var uploadRes = await fetch(supaUrl + '/storage/v1/object/' + bucket + '/' + fileName, {
      method: 'POST',
      headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey },
      body: formData
    });

    if (uploadRes.ok) {
      return supaUrl + '/storage/v1/object/public/' + bucket + '/' + fileName;
    } else {
      var err = await uploadRes.json();
      console.error('[Apply] Upload failed:', err);
      throw new Error('فشل رفع الصورة: ' + (err.message || 'خطأ غير معروف'));
    }
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

        // رفع الصور
        var imageUrlFront = '';
        var imageUrlBack = '';

        var fiFront = document.getElementById('applyIdImageFront');
        if (fiFront && fiFront.files && fiFront.files[0]) {
          console.log('[Apply] Uploading front ID...');
          imageUrlFront = await uploadFile(fiFront.files[0], 'id-documents', url, key);
          console.log('[Apply] Front uploaded:', imageUrlFront);
        }

        var fiBack = document.getElementById('applyIdImageBack');
        if (fiBack && fiBack.files && fiBack.files[0]) {
          console.log('[Apply] Uploading back ID...');
          imageUrlBack = await uploadFile(fiBack.files[0], 'id-documents', url, key);
          console.log('[Apply] Back uploaded:', imageUrlBack);
        }

        var appData = {
          job_id: document.getElementById('applyJobId').value,
          full_name: document.getElementById('applyFullName').value.trim(),
          phone: document.getElementById('applyPhone').value.trim(),
          id_image_url: imageUrlFront || null,
          id_image_back_url: imageUrlBack || null,
          source: 'online'
        };

        console.log('[Apply] Submitting:', appData);
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

        if (!res.ok) {
          var resErr = await res.json();
          console.error('[Apply] Submit failed:', resErr);
          throw new Error('فشل إرسال الطلب');
        }

        console.log('[Apply] Done!');
        successEl.style.display = 'flex';
        applyForm.reset();
        filePreviewFront.style.display = 'none';
        fileLabelFront.style.display = '';
        filePreviewBack.style.display = 'none';
        fileLabelBack.style.display = '';
      } catch (err) {
        console.error('[Apply] Error:', err);
        errorEl.querySelector('span').textContent = err.message || 'حدث خطأ أثناء الإرسال';
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

      var response = await fetch(url + '/rest/v1/jobs?select=*&order=created_at.desc', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }
      });

      console.log('[Jobs] Response status:', response.status);

      if (!response.ok) {
        var errText = await response.text();
        console.error('[Jobs] Error:', errText);
        throw new Error('Fetch failed: ' + response.status);
      }

      allJobs = await response.json();
      console.log('[Jobs] Found:', allJobs.length);
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

  fetchJobs().then(function() {
    var applyParam = new URLSearchParams(window.location.search).get('apply');
    if (applyParam && typeof window.openApplyModal === 'function') {
      var job = allJobs.find(function(j) { return j.id === applyParam; });
      if (job) window.openApplyModal(job.id, job.title);
    }
  });
})();

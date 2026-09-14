/* ============================================================
   سما انوار الهدى | Jobs Page — App Shell Version
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

  function renderJobCard(job) {
    var isOpen = job.status === 'open';
    var badgeClass = isOpen ? 'open' : 'closed';
    var badgeText = isOpen ? 'متاحة' : 'مغلقة';
    var detailUrl = 'job.html?id=' + job.id;
    var meta = '';
    if (job.location) meta += '<span><i class="fas fa-map-marker-alt"></i> ' + job.location + '</span>';
    if (job.employment_type) meta += '<span><i class="fas fa-clock"></i> ' + job.employment_type + '</span>';
    if (job.salary) meta += '<span class="salary"><i class="fas fa-coins"></i> ' + job.salary + '</span>';

    return '<a href="' + detailUrl + '" class="app-job-card">' +
      '<div class="app-job-card-top">' +
        '<span class="app-job-card-title">' + (job.title || '') + '</span>' +
        '<span class="app-job-badge ' + badgeClass + '">' + badgeText + '</span>' +
      '</div>' +
      (meta ? '<div class="app-job-card-meta">' + meta + '</div>' : '') +
      '<div class="app-job-card-footer">' +
        '<span class="details-link">تفاصيل <i class="fas fa-arrow-left"></i></span>' +
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
    gridEl.style.display = filtered.length > 0 ? 'flex' : 'none';
  }

  if (filtersEl) {
    filtersEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.app-chip');
      if (!btn) return;
      filtersEl.querySelectorAll('.app-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-dept');
      filterJobs();
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', function() {
      currentSearch = this.value.trim();
      filterJobs();
    });
  }

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

  var fileUploadFront = document.getElementById('fileUploadFront');
  var fileInputFront = document.getElementById('applyIdImageFront');
  var filePreviewFront = document.getElementById('filePreviewFront');

  if (fileUploadFront && fileInputFront) {
    fileUploadFront.addEventListener('click', function() { fileInputFront.click(); });
    fileInputFront.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          filePreviewFront.src = e.target.result;
          filePreviewFront.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  var fileUploadBack = document.getElementById('fileUploadBack');
  var fileInputBack = document.getElementById('applyIdImageBack');
  var filePreviewBack = document.getElementById('filePreviewBack');

  if (fileUploadBack && fileInputBack) {
    fileUploadBack.addEventListener('click', function() { fileInputBack.click(); });
    fileInputBack.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          filePreviewBack.src = e.target.result;
          filePreviewBack.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

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
      throw new Error('فشل رفع الصورة: ' + (err.message || 'خطأ'));
    }
  }

  var applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = document.getElementById('applySubmitBtn');
      var successEl = document.getElementById('applySuccess');
      var errorEl = document.getElementById('applyError');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ الإرسال...';
      successEl.style.display = 'none';
      errorEl.style.display = 'none';

      try {
        var url = SITE.supabase.url;
        var key = SITE.supabase.anonKey;
        if (!url || !key || url === 'YOUR_SUPABASE_URL') throw new Error('Supabase not configured');

        var imageUrlFront = '';
        var imageUrlBack = '';

        var fiFront = document.getElementById('applyIdImageFront');
        if (fiFront && fiFront.files && fiFront.files[0]) {
          imageUrlFront = await uploadFile(fiFront.files[0], 'id-documents', url, key);
        }

        var fiBack = document.getElementById('applyIdImageBack');
        if (fiBack && fiBack.files && fiBack.files[0]) {
          imageUrlBack = await uploadFile(fiBack.files[0], 'id-documents', url, key);
        }

        var appData = {
          job_id: document.getElementById('applyJobId').value,
          job_title: document.getElementById('modalJobTitle').textContent || null,
          full_name: document.getElementById('applyFullName').value.trim(),
          phone: document.getElementById('applyPhone').value.trim(),
          id_image_url: imageUrlFront || null,
          id_image_back_url: imageUrlBack || null,
          status: 'جديد',
          source: 'online'
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

        if (!res.ok) {
          var resErr = await res.json();
          throw new Error('فشل إرسال الطلب: ' + (resErr.message || resErr.hint || 'خطأ'));
        }

        successEl.style.display = 'flex';
        applyForm.reset();
        if (filePreviewFront) { filePreviewFront.style.display = 'none'; }
        if (filePreviewBack) { filePreviewBack.style.display = 'none'; }
      } catch (err) {
        console.error('[Apply] Error:', err);
        errorEl.querySelector('span').textContent = err.message || 'حدث خطأ أثناء الإرسال';
        errorEl.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال التقديم';
      }
    });
  }

  window.openApplyModal = openApplyModal;

  async function fetchJobs() {
    try {
      var url = SITE.supabase.url;
      var key = SITE.supabase.anonKey;
      if (!url || !key || url === 'YOUR_SUPABASE_URL') throw new Error('Supabase not configured');

      var response = await fetch(url + '/rest/v1/jobs?select=*&order=created_at.desc', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Fetch failed: ' + response.status);

      allJobs = await response.json();
      if (loadingEl) loadingEl.style.display = 'none';

      if (!allJobs || allJobs.length === 0) {
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
      }

      gridEl.innerHTML = allJobs.map(renderJobCard).join('');
      gridEl.style.display = 'flex';
    } catch (err) {
      console.error('Jobs fetch error:', err);
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
    }
  }

  fetchJobs();
})();

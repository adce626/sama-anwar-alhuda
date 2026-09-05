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

      var response = await fetch(url + '/rest/v1/jobs?id=eq.' + jobId + '&select=*', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }
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

      // Apply button — open modal directly on this page
      applyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (applyModal) {
          document.getElementById('applyJobId').value = job.id;
          document.getElementById('modalJobTitle').textContent = job.title;
          applyModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      });

      // Close modal
      var modalClose = document.getElementById('modalClose');
      if (modalClose) {
        modalClose.addEventListener('click', function() {
          applyModal.style.display = 'none';
          document.body.style.overflow = '';
        });
      }
      if (applyModal) {
        applyModal.addEventListener('click', function(e) {
          if (e.target === applyModal) {
            applyModal.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      }

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
            reader.onload = function(ev) {
              filePreview.src = ev.target.result;
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
            var supaUrl = SITE.supabase.url;
            var supaKey = SITE.supabase.anonKey;

            var imageUrl = '';
            if (fileInput.files && fileInput.files[0]) {
              var fileName = Date.now() + '_' + fileInput.files[0].name;
              var formData = new FormData();
              formData.append('file', fileInput.files[0]);
              var uploadRes = await fetch(supaUrl + '/storage/v1/object/job-applications/' + fileName, {
                method: 'POST',
                headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey },
                body: formData
              });
              if (uploadRes.ok) {
                imageUrl = supaUrl + '/storage/v1/object/public/job-applications/' + fileName;
              }
            }

            var appData = {
              job_id: document.getElementById('applyJobId').value,
              full_name: document.getElementById('applyFullName').value.trim(),
              phone: document.getElementById('applyPhone').value.trim(),
              id_image_url: imageUrl
            };

            var res = await fetch(supaUrl + '/rest/v1/job_applications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supaKey,
                'Authorization': 'Bearer ' + supaKey,
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

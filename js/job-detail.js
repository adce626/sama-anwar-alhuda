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
      var isOpen = job.status === 'open';
      var statusLabel = isOpen ? (lang === 'ar' ? 'متاحة' : 'Open') : (lang === 'ar' ? 'غير متاحة' : 'Closed');
      var statusClass = isOpen ? 'status-open' : 'status-closed';

      document.title = (job.title || 'الوظيفة') + ' — سما انوار الهدى';

      titleEl.textContent = job.title || '';
      metaEl.innerHTML = '<span class="job-dept-badge"><i class="fas fa-building"></i> ' + dept + '</span>' +
        '<span class="job-status-badge ' + statusClass + '">' + statusLabel + '</span>' +
        '<span class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ' + (job.location || '') + '</span>' +
        (type ? '<span class="job-meta-item"><i class="fas fa-clock"></i> ' + type + '</span>' : '') +
        '<span class="job-meta-item"><i class="fas fa-calendar-alt"></i> ' + formatDate(job.created_at) + '</span>';

      var applySection = document.querySelector('.job-apply-section');
      if (!isOpen && applySection) {
        applySection.innerHTML = '<div class="closed-notice"><i class="fas fa-info-circle"></i> ' + (lang === 'ar' ? 'هذه الوظيفة مغلقة حالياً — يمكنك تصفح الوظائف الأخرى' : 'This job is currently closed — browse other available positions') + '</div>';
      }

      bodyEl.innerHTML = '<div class="job-detail-desc"><h3>' + (lang === 'ar' ? 'وصف الوظيفة' : 'Job Description') + '</h3><p>' + (job.description || '') + '</p></div>' +
        (job.requirements ? '<div class="job-detail-req"><h3>' + (lang === 'ar' ? 'المتطلبات' : 'Requirements') + '</h3><p>' + job.requirements + '</p></div>' : '') +
        (job.benefits ? '<div class="job-detail-benefits"><h3>' + (lang === 'ar' ? 'المميزات' : 'Benefits') + '</h3><p>' + job.benefits + '</p></div>' : '');

      var pageUrl = window.location.href;
      var shareText = lang === 'ar' ? 'شوف هذي الوظيفة: ' + job.title : 'Check this job: ' + job.title;
      shareBtns.innerHTML =
        '<a href="https://wa.me/?text=' + encodeURIComponent(shareText + '\n' + pageUrl) + '" target="_blank" class="share-link share-wa"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
        '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl) + '" target="_blank" class="share-link share-fb"><i class="fab fa-facebook-f"></i> Facebook</a>' +
        '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(pageUrl) + '" target="_blank" class="share-link share-tw"><i class="fab fa-x-twitter"></i> X</a>';

      applyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (applyModal) {
          document.getElementById('applyJobId').value = job.id;
          document.getElementById('modalJobTitle').textContent = job.title;
          applyModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      });

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
            reader.onload = function(ev) {
              filePreviewFront.src = ev.target.result;
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
            reader.onload = function(ev) {
              filePreviewBack.src = ev.target.result;
              filePreviewBack.style.display = 'block';
              fileLabelBack.style.display = 'none';
            };
            reader.readAsDataURL(this.files[0]);
          }
        });
      }

      // Helper: upload file
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
            var supaUrl = SITE.supabase.url;
            var supaKey = SITE.supabase.anonKey;

            var imageUrlFront = '';
            var imageUrlBack = '';

            if (fileInputFront.files && fileInputFront.files[0]) {
              console.log('[Apply] Uploading front ID...');
              imageUrlFront = await uploadFile(fileInputFront.files[0], 'id-documents', supaUrl, supaKey);
              console.log('[Apply] Front uploaded:', imageUrlFront);
            }

            if (fileInputBack.files && fileInputBack.files[0]) {
              console.log('[Apply] Uploading back ID...');
              imageUrlBack = await uploadFile(fileInputBack.files[0], 'id-documents', supaUrl, supaKey);
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

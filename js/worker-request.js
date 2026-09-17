/* ============================================================
   سما انوار الهدى | Worker Request Form Handler
   ============================================================ */
(function() {
  'use strict';

  var form = document.getElementById('workerRequestForm');
  if (!form) return;

  var submitBtn = document.getElementById('wrSubmitBtn');
  var successMsg = document.getElementById('wrSuccess');
  var errorMsg = document.getElementById('wrError');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ الإرسال...';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    var fullName = document.getElementById('wrFullName').value.trim();
    var phone = document.getElementById('wrPhone').value.trim();
    var workerType = document.getElementById('wrWorkerType').value.trim();
    var workerCount = document.getElementById('wrWorkerCount').value || '1';
    var salary = document.getElementById('wrSalary').value.trim();
    var workTime = document.getElementById('wrWorkTime').value.trim();
    var location = document.getElementById('wrLocation').value.trim();
    var startDate = document.getElementById('wrStartDate').value;
    var description = document.getElementById('wrDescription').value.trim();

    var formData = {
      full_name: fullName,
      phone: phone,
      service_type: 'worker_request',
      message: JSON.stringify({
        worker_type: workerType,
        worker_type_label: workerType,
        worker_count: workerCount,
        salary: salary,
        work_time: workTime,
        location: location,
        start_date: startDate || null,
        description: description
      })
    };

    try {
      var url = SITE.supabase.url;
      var anonKey = SITE.supabase.anonKey;
      
      if (!url || !anonKey || url === 'YOUR_SUPABASE_URL') {
        throw new Error('Supabase not configured');
      }

      var response = await fetch(url + '/rest/v1/service_requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': 'Bearer ' + anonKey,
          'Prefer': 'return=minimal',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        var errText = await response.text();
        throw new Error('Submit failed: ' + errText);
      }

      successMsg.style.display = 'flex';
      form.reset();
      setTimeout(function() { successMsg.style.display = 'none'; }, 5000);

    } catch (err) {
      console.error('Worker request error:', err);
      errorMsg.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الطلب';
    }
  });
})();

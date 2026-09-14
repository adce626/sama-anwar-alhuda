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

    var formData = {
      full_name: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      service_type: 'worker_request',
      message: JSON.stringify({
        worker_type: form.workerType.value.trim(),
        worker_type_label: form.workerType.value.trim(),
        location: form.location.value.trim(),
        description: form.description.value.trim()
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
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Submit failed');

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

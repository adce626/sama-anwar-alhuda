/* ============================================================
   سما انوار الهدى | Service Request Form Handler
   ============================================================ */
(function() {
  'use strict';

  const form = document.getElementById('serviceRequestForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="serviceForm.submitting"></span>';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const formData = {
      full_name: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      service_type: form.serviceType.value,
      message: form.message.value.trim() || null
    };

    try {
      const { url, anonKey } = SITE.supabase;
      
      if (!url || !anonKey || url === 'YOUR_SUPABASE_URL') {
        throw new Error('Supabase not configured');
      }

      const response = await fetch(`${url}/rest/v1/service_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Submit failed');

      successMsg.style.display = 'flex';
      form.reset();
      setTimeout(() => { successMsg.style.display = 'none'; }, 5000);

    } catch (err) {
      console.error('Form error:', err);
      errorMsg.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span data-i18n="serviceForm.submit"></span>';
    }
  });
})();

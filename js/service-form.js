/* ============================================================
   سما انوار الهدى | Service Request Form Handler
   Supports: Supabase (primary) + Web3Forms (fallback)
   ============================================================ */
(function() {
  'use strict';

  const form = document.getElementById('serviceRequestForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');

  // Submit via Web3Forms
  async function submitViaWeb3Forms(formData) {
    const { accessKey } = SITE.web3forms || {};
    
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      throw new Error('Web3Forms not configured');
    }

    const payload = new FormData();
    payload.append('access_key', accessKey);
    payload.append('name', formData.full_name);
    payload.append('phone', formData.phone);
    payload.append('service', formData.service_type);
    payload.append('message', formData.message || 'لا توجد رسالة إضافية');
    payload.append('subject', `طلب خدمة جديد: ${formData.service_type}`);
    payload.append('from_name', 'سما انوار الهدى - نموذج الموقع');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: payload
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Web3Forms submission failed');
    }

    return result;
  }

  // Submit via Supabase
  async function submitViaSupabase(formData) {
    const { url, anonKey } = SITE.supabase || {};
    
    if (!url || !anonKey || url === 'YOUR_SUPABASE_URL') {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${url}/rest/v1/service_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'return=minimal',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Supabase submission failed');
    }

    return response;
  }

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
      // Try Web3Forms first (simpler, no database needed)
      if (SITE.web3forms?.enabled) {
        await submitViaWeb3Forms(formData);
      } else {
        // Fallback to Supabase
        await submitViaSupabase(formData);
      }

      // Success
      successMsg.style.display = 'flex';
      form.reset();
      
      // Auto-hide after 6 seconds
      setTimeout(() => { 
        successMsg.style.display = 'none'; 
      }, 6000);

      // Track conversion (if analytics enabled)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label: formData.service_type
        });
      }

    } catch (err) {
      console.error('Form submission error:', err);
      errorMsg.style.display = 'flex';
      
      // Track error (if analytics enabled)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_error', {
          event_category: 'error',
          event_label: err.message
        });
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span data-i18n="serviceForm.submit"></span>';
    }
  });

  // Validate phone number (Iraq format)
  const phoneInput = form.querySelector('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      // Remove non-numeric characters except + and spaces
      let value = e.target.value.replace(/[^\d\s+]/g, '');
      e.target.value = value;
    });
  }
})();

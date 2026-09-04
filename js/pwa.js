/* ============================================================
   سما انوار الهدى | PWA Registration & Management
   ============================================================ */

'use strict';

var PWA = {
  deferredPrompt: null,
  isInstalled: false,
  isOnline: navigator.onLine,

  // ==================== Initialize ====================
  init: function() {
    this.registerServiceWorker();
    this.setupOnlineStatus();
    this.setupInstallPrompt();
    this.setupUpdates();
    console.log('[PWA] Initialized');
  },

  // ==================== Register Service Worker ====================
  registerServiceWorker: function() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('[PWA] ServiceWorker registered:', registration.scope);
            PWA.registration = registration;
            PWA.checkForUpdates(registration);
          })
          .catch(function(err) {
            console.error('[PWA] ServiceWorker registration failed:', err);
          });
      });
    }
  },

  // ==================== Check for Updates ====================
  checkForUpdates: function(registration) {
    registration.addEventListener('updatefound', function() {
      var newWorker = registration.installing;
      console.log('[PWA] New service worker found');

      newWorker.addEventListener('statechange', function() {
        if (newWorker.state === 'activated') {
          console.log('[PWA] New service worker activated');
          PWA.showUpdateNotification();
        }
      });
    });

    // Check for updates every hour
    setInterval(function() {
      registration.update();
    }, 60 * 60 * 1000);
  },

  // ==================== Show Update Notification ====================
  showUpdateNotification: function() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('تحديث متاح', {
        body: 'يوجد تحديث جديد للموقع. أعد التحميل للحصول على أحدث إصدار.',
        icon: '/assets/logo/logo-192.png',
        badge: '/assets/logo/logo-192.png',
        tag: 'update-notification',
        requireInteraction: true
      });
    }
  },

  // ==================== Setup Online Status ====================
  setupOnlineStatus: function() {
    var self = this;

    window.addEventListener('online', function() {
      self.isOnline = true;
      document.body.classList.remove('offline');
      document.body.classList.add('online');
      self.showStatusMessage('تم الاتصال بالإنترنت', 'success');
      console.log('[PWA] Online');
    });

    window.addEventListener('offline', function() {
      self.isOnline = false;
      document.body.classList.remove('online');
      document.body.classList.add('offline');
      self.showStatusMessage('لا يوجد اتصال بالإنترنت', 'warning');
      console.log('[PWA] Offline');
    });

    // Set initial status
    if (this.isOnline) {
      document.body.classList.add('online');
    } else {
      document.body.classList.add('offline');
    }
  },

  // ==================== Show Status Message ====================
  showStatusMessage: function(message, type) {
    // Remove existing message
    var existing = document.querySelector('.pwa-status');
    if (existing) existing.remove();

    // Create new message
    var status = document.createElement('div');
    status.className = 'pwa-status pwa-status-' + type;
    status.innerHTML = '<span>' + message + '</span>';
    status.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:12px;font-weight:700;font-size:0.9rem;z-index:9999;animation:slideUp 0.3s ease;';

    if (type === 'success') {
      status.style.background = '#22c55e';
      status.style.color = '#fff';
    } else if (type === 'warning') {
      status.style.background = '#f59e0b';
      status.style.color = '#fff';
    }

    document.body.appendChild(status);

    // Remove after 3 seconds
    setTimeout(function() {
      status.style.animation = 'slideDown 0.3s ease forwards';
      setTimeout(function() {
        status.remove();
      }, 300);
    }, 3000);
  },

  // ==================== Setup Install Prompt ====================
  setupInstallPrompt: function() {
    var self = this;

    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      self.deferredPrompt = e;
      console.log('[PWA] Install prompt ready');
      self.showInstallButton();
    });

    window.addEventListener('appinstalled', function() {
      self.isInstalled = true;
      self.deferredPrompt = null;
      console.log('[PWA] App installed');
      self.hideInstallButton();
    });
  },

  // ==================== Show Install Button ====================
  showInstallButton: function() {
    var self = this;

    // Don't show if already installed
    if (this.isInstalled || localStorage.getItem('pwa-dismissed')) return;

    var installBtn = document.createElement('div');
    installBtn.className = 'pwa-install-banner';
    installBtn.innerHTML = '' +
      '<div style="position:fixed;bottom:0;left:0;right:0;background:var(--surface-ink);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.3);gap:12px;flex-wrap:wrap;">' +
      '  <div style="display:flex;align-items:center;gap:12px;">' +
      '    <img src="/assets/logo/logo.jpg" width="40" height="40" style="border-radius:10px;" alt="">' +
      '    <div>' +
      '      <b style="color:#fff;font-size:0.95rem;display:block;">تثبيت تطبيق سما انوار الهدى</b>' +
      '      <small style="color:rgba(255,255,255,0.6);font-size:0.8rem;">user للوصول السريع بدون إنترنت</small>' +
      '    </div>' +
      '  </div>' +
      '  <div style="display:flex;gap:10px;">' +
      '    <button class="pwa-install-btn" style="background:var(--color-red);color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:800;cursor:pointer;">تثبيت</button>' +
      '    <button class="pwa-dismiss-btn" style="background:transparent;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.2);padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer;">لاحقاً</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(installBtn);

    // Install button click
    installBtn.querySelector('.pwa-install-btn').addEventListener('click', function() {
      self.installApp();
    });

    // Dismiss button click
    installBtn.querySelector('.pwa-dismiss-btn').addEventListener('click', function() {
      localStorage.setItem('pwa-dismissed', 'true');
      installBtn.remove();
    });
  },

  // ==================== Hide Install Button ====================
  hideInstallButton: function() {
    var btn = document.querySelector('.pwa-install-banner');
    if (btn) btn.remove();
  },

  // ==================== Install App ====================
  installApp: function() {
    var self = this;

    if (!this.deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return;
    }

    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install');
      } else {
        console.log('[PWA] User dismissed install');
      }
      self.deferredPrompt = null;
    });
  },

  // ==================== Request Notification Permission ====================
  requestNotificationPermission: function() {
    if ('Notification' in window) {
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          console.log('[PWA] Notification permission granted');
        }
      });
    }
  },

  // ==================== Subscribe to Push ====================
  subscribeToPush: function() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_KEY_HERE'
        }).then(function(subscription) {
          console.log('[PWA] Push subscription:', subscription);
        });
      });
    }
  },

  // ==================== Get Cache Status ====================
  getCacheStatus: function() {
    if ('caches' in window) {
      return caches.keys().then(function(cacheNames) {
        return {
          caches: cacheNames,
          count: cacheNames.length
        };
      });
    }
    return Promise.resolve({ caches: [], count: 0 });
  },

  // ==================== Clear Cache ====================
  clearCache: function() {
    if ('caches' in window) {
      return caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }
    return Promise.resolve();
  }
};

// ==================== Initialize PWA ====================
document.addEventListener('DOMContentLoaded', function() {
  PWA.init();
});

// ==================== Add CSS for PWA ====================
var pwaStyles = document.createElement('style');
pwaStyles.textContent = '' +
  '@keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }' +
  '@keyframes slideDown { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(100px); opacity: 0; } }' +
  '.offline .pwa-status { display: block; }' +
  '.pwa-install-banner { animation: slideUp 0.4s ease; }';
document.head.appendChild(pwaStyles);

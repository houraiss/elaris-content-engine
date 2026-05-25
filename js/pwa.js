// ── Progressive Web App (PWA) Logic ──
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[PWA] Service worker registered:', reg.scope))
            .catch(err => console.warn('[PWA] SW registration failed:', err));
    });
}

// Capture the install prompt for a custom "Add to Home Screen" button
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
        <div style="
            position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
            background:linear-gradient(135deg, #1a1510 0%, #2a2015 100%);
            border:1px solid rgba(166,124,82,0.4); border-radius:16px;
            padding:14px 20px; display:flex; align-items:center; gap:14px;
            box-shadow:0 8px 32px rgba(0,0,0,0.6); z-index:99999;
            max-width:420px; width:calc(100% - 40px);
            animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1);
        ">
            <img src="icons/icon-192.png" alt="Elaris" style="width:44px;height:44px;border-radius:10px">
            <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:14px;color:#f5f0eb">${I18n.t('pwa_install_title')}</div>
                <div style="font-size:11px;color:#a67c52;margin-top:2px">${I18n.t('pwa_install_desc')}</div>
            </div>
            <button id="pwa-install-btn" style="
                background:linear-gradient(135deg,#a67c52,#c9a87c);
                color:#0a0a0a;font-weight:700;font-size:12px;
                border:none;padding:8px 18px;border-radius:8px;cursor:pointer;
                white-space:nowrap;
            ">${I18n.t('pwa_install_btn')}</button>
            <button id="pwa-dismiss-btn" style="
                background:none;border:none;color:#666;font-size:18px;
                cursor:pointer;padding:4px;line-height:1;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        banner.remove();
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log('[PWA] Install result:', result.outcome);
        deferredPrompt = null;
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        banner.remove();
    });
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
});

// ── Globals ──
function setLang(lang, btn) {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (window.I18n) window.I18n.setLanguage(lang);
}

// Initialize active state on load
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('elaris-lang') || 'en';
    document.querySelectorAll('.lang-btn').forEach(b => {
        if (b.innerText.toLowerCase() === saved) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
});

// ── iOS Install Prompt ─────────────────────────────
(function() {
  const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                    || window.navigator.standalone === true;
  const isSafari     = /safari/i.test(navigator.userAgent)
                    && !/crios|fxios|opiios|edgios/i.test(navigator.userAgent);
  const dismissed    = localStorage.getItem('elaris_ios_prompt_dismissed');

  if (!isIOS || isStandalone || dismissed) return;

  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.id = 'ios-install-overlay';
    overlay.className = 'ios-overlay';
    
    const sheet = document.createElement('div');
    sheet.id = 'ios-install-sheet';
    sheet.className = 'ios-sheet';
    
    sheet.innerHTML = `
      <div class="ios-handle"></div>
      <div class="ios-sheet-header">
        <div class="ios-brand-mark">
          <div class="ios-brand-icon">◈</div>
          <div>
            <div class="ios-brand-name">Elaris</div>
            <div class="ios-brand-handle">@elaris.925</div>
          </div>
        </div>
        <button id="ios-close-btn" class="ios-close-btn" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a3d30" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ios-title-block">
        <h2 class="ios-title">${window.I18n ? window.I18n.t('ios_title') : 'Add to Home Screen'}</h2>
        <p class="ios-subtitle">${window.I18n ? window.I18n.t('ios_subtitle') : 'Install the Elaris Content Engine for instant access — no App Store needed.'}</p>
      </div>
      
      ${!isSafari ? `
      <div class="ios-safari-warn">
        <div class="ios-warn-icon">⚠</div>
        <div>
          <div class="ios-warn-title">${window.I18n ? window.I18n.t('ios_safari_warn_title') : 'Open in Safari first'}</div>
          <div class="ios-warn-text">${window.I18n ? window.I18n.t('ios_safari_warn_text') : 'iPhone only supports installation from Safari. Chrome and Firefox on iOS do not have this option.'}</div>
          <div class="ios-warn-step">${window.I18n ? window.I18n.t('ios_safari_warn_step') : 'Copy this link and paste it in Safari:'}</div>
          <div class="ios-warn-url">houraiss.github.io/elaris-content-engine</div>
        </div>
      </div>
      ` : `
      <div class="ios-steps">
        <div class="ios-step">
          <div class="ios-step-number">1</div>
          <div class="ios-step-content">
            <div class="ios-step-text">${window.I18n ? window.I18n.t('ios_step1') : 'Tap the <strong class="ios-em">Share</strong> button at the bottom of Safari'}</div>
            <div class="ios-step-visual">
              <span class="ios-share-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                  <polyline points="8 7 12 3 16 7"></polyline>
                  <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path>
                </svg>
              </span>
              <span class="ios-step-visual-label">${window.I18n ? window.I18n.t('ios_share_btn') : 'Share button'}</span>
            </div>
          </div>
        </div>
        <div class="ios-connector"></div>
        <div class="ios-step">
          <div class="ios-step-number">2</div>
          <div class="ios-step-content">
            <div class="ios-step-text">${window.I18n ? window.I18n.t('ios_step2') : 'Scroll down and tap <strong class="ios-em">"Add to Home Screen"</strong>'}</div>
            <div class="ios-step-visual">
              <span class="ios-add-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a67c52" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </span>
              <span class="ios-step-visual-label">${window.I18n ? window.I18n.t('ios_add_home') : 'Add to Home Screen'}</span>
            </div>
          </div>
        </div>
        <div class="ios-connector"></div>
        <div class="ios-step">
          <div class="ios-step-number">3</div>
          <div class="ios-step-content">
            <div class="ios-step-text">${window.I18n ? window.I18n.t('ios_step3') : 'Tap <strong class="ios-em">"Add"</strong> in the top-right corner to confirm'}</div>
            <div class="ios-step-badge">
              <span class="ios-step-badge-text">✓ ${window.I18n ? window.I18n.t('ios_installed_badge') : 'Installed on Home Screen'}</span>
            </div>
          </div>
        </div>
      </div>
      `}
      
      <div class="ios-divider"></div>
      <div class="ios-actions">
        <button id="ios-never-btn" class="ios-dismiss-btn">${window.I18n ? window.I18n.t('ios_never') : "Don't show again"}</button>
        <button id="ios-later-btn" class="ios-later-btn">${window.I18n ? window.I18n.t('ios_later') : "Maybe later"}</button>
      </div>
      <div style="height: 16px"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    const closeSheet = (permanent = false) => {
      sheet.classList.remove('ios-open');
      overlay.classList.remove('ios-open');
      setTimeout(() => {
        sheet.remove();
        overlay.remove();
      }, 420);
      if (permanent) localStorage.setItem('elaris_ios_prompt_dismissed', '1');
    };

    document.getElementById('ios-close-btn').addEventListener('click', () => closeSheet(false));
    document.getElementById('ios-later-btn').addEventListener('click', () => closeSheet(false));
    document.getElementById('ios-never-btn').addEventListener('click', () => closeSheet(true));
    overlay.addEventListener('click', () => closeSheet(false));

    // Animate in
    requestAnimationFrame(() => {
      sheet.classList.add('ios-open');
      overlay.classList.add('ios-open');
    });
  }, 1400);
})();

// Copyright (c) 2026 zoop. See LICENSE.

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.startsWith('android-app://')
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

let deferredPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  const btn = document.querySelector('#install-gate-btn')
  if (btn) btn.hidden = false
})

export function initInstallGate() {
  if (isStandalone()) return false

  const gate = document.createElement('div')
  gate.id = 'install-gate'
  gate.className = 'install-gate'
  gate.innerHTML = `
    <div class="install-gate-glow"></div>
    <div class="install-gate-icon">
      <md-icon class="icon-outline">sunny</md-icon>
    </div>
    <h1 class="install-gate-title">Weather</h1>
    <p class="install-gate-sub">This works best installed on your home screen — full screen, offline-friendly, no browser chrome.</p>
    <button type="button" id="install-gate-btn" class="install-gate-cta" hidden>
      Install app <md-icon>download</md-icon>
    </button>
    <div class="install-gate-steps">
      ${
        isIOS()
          ? `
        <div class="install-gate-step"><md-icon>ios_share</md-icon><span>Tap the <b>Share</b> icon in Safari's toolbar</span></div>
        <div class="install-gate-step"><md-icon>add_box</md-icon><span>Choose <b>Add to Home Screen</b></span></div>
      `
          : `
        <div class="install-gate-step"><md-icon>more_vert</md-icon><span>Open your browser menu (⋮)</span></div>
        <div class="install-gate-step"><md-icon>install_mobile</md-icon><span>Tap <b>Install app</b> or <b>Add to Home screen</b></span></div>
      `
      }
    </div>
  `
  document.body.appendChild(gate)

  document.querySelector('#install-gate-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') reloadIntoApp()
  })

  window.addEventListener('appinstalled', reloadIntoApp)

  function reloadIntoApp() {
    gate.classList.add('leaving')
    setTimeout(() => window.location.reload(), 400)
  }

  return true
}

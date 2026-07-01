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
    <p class="install-gate-sub">works way better installed. full screen, works offline, no browser junk around it.</p>
    <md-filled-button type="button" id="install-gate-btn" class="install-gate-cta" hidden>
      Install app
      <md-icon slot="icon">download</md-icon>
    </md-filled-button>
    <div class="install-gate-steps">
      ${
        isIOS()
          ? `
        <div class="install-gate-step"><md-icon>ios_share</md-icon><span>hit the <b>Share</b> button in safari</span></div>
        <div class="install-gate-step"><md-icon>add_box</md-icon><span>then <b>Add to Home Screen</b></span></div>
      `
          : `
        <div class="install-gate-step"><md-icon>more_vert</md-icon><span>open the browser menu (⋮)</span></div>
        <div class="install-gate-step"><md-icon>install_mobile</md-icon><span>tap <b>Install app</b> (or <b>Add to Home screen</b>)</span></div>
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

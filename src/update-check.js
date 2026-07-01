// Copyright (c) 2026 zoop. See LICENSE.

let registration = null

export function initUpdateCheck() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('/sw.js')
    } catch {
      return
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner()
        }
      })
    })
  })

  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    window.location.reload()
  })
}

export async function checkForUpdate() {
  if (!registration) return false
  await registration.update()
  return !!registration.waiting
}

function showUpdateBanner() {
  if (document.querySelector('#update-banner')) return

  const banner = document.createElement('div')
  banner.id = 'update-banner'
  banner.className = 'update-banner'
  banner.innerHTML = `
    <md-icon>system_update</md-icon>
    <span>new version ready</span>
    <md-text-button id="update-banner-btn">refresh</md-text-button>
  `
  document.body.appendChild(banner)
  requestAnimationFrame(() => banner.classList.add('visible'))

  document.querySelector('#update-banner-btn').addEventListener('click', applyUpdate)
}

function applyUpdate() {
  if (registration?.waiting) {
    registration.waiting.postMessage('SKIP_WAITING')
  }
}

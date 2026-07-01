// Copyright (c) 2026 zoop. See LICENSE.

function isLikelyDesktop() {
  const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0
  const wide = window.innerWidth >= 820
  return noTouch && wide
}

export function initDesktopWarning() {
  if (!isLikelyDesktop()) return
  if (localStorage.getItem('weather:desktop-warning-dismissed')) return

  const banner = document.createElement('div')
  banner.className = 'desktop-warning'
  banner.innerHTML = `
    <md-icon>desktop_windows</md-icon>
    <span>built for phones, this'll look off on desktop</span>
    <md-icon-button id="desktop-warning-close" aria-label="Dismiss">
      <md-icon>close</md-icon>
    </md-icon-button>
  `
  document.body.appendChild(banner)

  document.querySelector('#desktop-warning-close').addEventListener('click', () => {
    localStorage.setItem('weather:desktop-warning-dismissed', '1')
    banner.classList.add('leaving')
    setTimeout(() => banner.remove(), 300)
  })
}

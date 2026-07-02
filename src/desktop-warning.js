// Copyright (c) 2026 zoop. See LICENSE.
import { showBanner } from 'zoop-kit/toast.js'

function isLikelyDesktop() {
  const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0
  const wide = window.innerWidth >= 820
  return noTouch && wide
}

export function initDesktopWarning() {
  if (!isLikelyDesktop()) return
  showBanner("built for phones, this'll look off on desktop", {
    icon: 'desktop_windows',
    iconColor: '#ff9f5a',
    dismissedKey: 'weather:desktop-warning-dismissed',
  })
}

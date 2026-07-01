// Copyright (c) 2026 zoop. See LICENSE.
// Makes the Android back gesture/button close open overlays one at a time
// instead of exiting the installed app, by pushing a history entry per
// overlay and popping it on back.

const stack = []

window.addEventListener('popstate', () => {
  const closeFn = stack.pop()
  if (closeFn) closeFn()
})

export function pushOverlay(closeFn) {
  history.pushState({ overlay: true }, '')
  stack.push(closeFn)
}

export function popOverlay() {
  if (!stack.length) return
  history.back()
}

// swap the current overlay for a different one without a round-trip through
// popstate (avoids a back()+pushState() race when switching overlay -> overlay)
export function replaceOverlay(closeCurrentFn, openNewFn, closeNewFn) {
  if (stack.length) stack.pop()
  closeCurrentFn()
  openNewFn()
  history.replaceState({ overlay: true }, '')
  stack.push(closeNewFn)
}

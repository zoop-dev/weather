

const THRESHOLD = 70
const MAX_PULL = 110

export function initPullToRefresh(scrollEl, onRefresh) {
  const indicator = document.createElement('div')
  indicator.className = 'pull-refresh'
  indicator.innerHTML = `<md-circular-progress value="0"></md-circular-progress>`
  document.body.prepend(indicator)
  const spinner = indicator.querySelector('md-circular-progress')

  let startY = null
  let pulling = false
  let refreshing = false

  scrollEl.addEventListener(
    'touchstart',
    (e) => {
      if (scrollEl.scrollTop > 0 || refreshing) return
      startY = e.touches[0].clientY
      pulling = true
    },
    { passive: true }
  )

  scrollEl.addEventListener(
    'touchmove',
    (e) => {
      if (!pulling || startY == null) return
      const delta = e.touches[0].clientY - startY
      if (delta <= 0) return

      const dist = Math.min(delta * 0.5, MAX_PULL)
      indicator.style.transform = `translateX(-50%) translateY(${dist}px)`
      indicator.style.opacity = Math.min(dist / THRESHOLD, 1)
      spinner.value = Math.min(dist / THRESHOLD, 1)
    },
    { passive: true }
  )

  scrollEl.addEventListener('touchend', () => {
    if (!pulling) return
    pulling = false
    const match = indicator.style.transform.match(/translateY\(([\d.]+)px\)/)
    const dist = match ? parseFloat(match[1]) : 0

    if (dist >= THRESHOLD && !refreshing) {
      refreshing = true
      indicator.style.transform = `translateX(-50%) translateY(${THRESHOLD}px)`
      indicator.classList.add('spinning')
      spinner.removeAttribute('value')

      Promise.resolve(onRefresh()).finally(() => {
        refreshing = false
        indicator.classList.remove('spinning')
        indicator.style.transform = 'translateX(-50%) translateY(0)'
        indicator.style.opacity = '0'
      })
    } else {
      indicator.style.transform = 'translateX(-50%) translateY(0)'
      indicator.style.opacity = '0'
    }
  })
}

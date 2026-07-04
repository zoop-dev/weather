

import './style.css'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/tabs/tabs.js'
import '@material/web/tabs/primary-tab.js'
import '@material/web/elevation/elevation.js'
import '@material/web/icon/icon.js'
import '@material/web/fab/fab.js'
import '@material/web/dialog/dialog.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/button/text-button.js'
import '@material/web/button/filled-button.js'
import '@material/web/progress/circular-progress.js'
import Lenis from 'lenis'
import { describe, THEMES } from './weathercodes.js'
import { weatherIcon } from './icons.js'
import { initBackground, setBackgroundCondition } from './background.js'
import { scallopedClipPath } from './shapes.js'
import { parseLocalDate } from './date-utils.js'
import { initInstallGate } from 'zoop-kit/install-gate.js'
import { initDesktopWarning } from 'zoop-kit/desktop-warning.js'
import { initPullToRefresh } from './pull-refresh.js'
import { initUpdateCheck } from 'zoop-kit/update-check.js'


let detailPageModule = null
function loadDetailPage() {
  return (detailPageModule ??= import('./detail-page.js'))
}
import { APP_VERSION, CHANGELOG } from './changelog.js'
import { pushOverlay, popOverlay, replaceOverlay } from 'zoop-kit/back-nav.js'
import { attachBootLoader, removeBootLoaderImmediately } from 'zoop-kit/boot-loader.js'
import { showToast } from 'zoop-kit/toast.js'
import { initSettingsMenu } from 'zoop-kit/settings-menu.js'
import { maybeShowChangelog } from 'zoop-kit/changelog.js'

const gated = initInstallGate({
  appName: 'Weatherly',
  icon: 'sunny',
  subtitle:
    'works way better installed. full screen, works offline, no browser junk around it. privacy-focused — no location, camera, mic, or notification permissions needed.',
})
if (!gated) {
  initBackground()
  initDesktopWarning('weather:desktop-warning-dismissed')
}

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const LAST_KEY = 'weather:last'
const LOCATIONS_KEY = 'weather:locations'
const ONBOARDED_KEY = 'weather:onboarded'
const VERSION_KEY = 'weather:version'

const mi = (name) => `<md-icon>${name}</md-icon>`

const ICONS = {
  search: mi('search'),
  wind: mi('air'),
  humidity: mi('humidity_percentage'),
  uv: mi('wb_sunny'),
  rain: mi('rainy'),
  pressure: mi('speed'),
  feels: mi('thermostat'),
  eye: mi('visibility'),
  leaf: mi('eco'),
  sun: mi('wb_sunny'),
  calendar: mi('calendar_month'),
  clock: mi('schedule'),
}

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <md-icon-button id="menu-btn" type="button" aria-label="Locations">
        <md-icon>menu</md-icon>
      </md-icon-button>
      <div class="location">
        <span class="name" id="loc-name">Weather</span>
        <span class="updated" id="loc-updated"></span>
      </div>
    </div>
    <div id="content"></div>
  </div>

  <div id="onboarding" class="onboarding">
    <div class="onboarding-glow"></div>
    <div class="onboarding-icon">
      <md-icon class="icon-outline">sunny</md-icon>
    </div>
    <h1 class="onboarding-title">Weatherly</h1>
    <p class="onboarding-sub">made this cause every weather app is sad :(. privacy-focused, no permissions needed — no location, camera, mic, or notifications required.</p>
    <div class="onboarding-steps">
      <div class="onboarding-step"><md-icon>search</md-icon><span>search literally any city</span></div>
      <div class="onboarding-step"><md-icon>bookmark</md-icon><span>save the ones you actually check</span></div>
      <div class="onboarding-step"><md-icon>air</md-icon><span>hourly, daily, wind, air quality, all in one place</span></div>
    </div>
    <md-filled-button type="button" class="onboarding-cta" id="onboarding-cta">
      Get started
      <md-icon slot="icon">arrow_forward</md-icon>
    </md-filled-button>
  </div>

  <div class="search-overlay" id="locations-overlay" data-lenis-prevent>
    <div class="overlay-header">
      <md-icon-button id="locations-back" type="button" aria-label="Back">
        <md-icon>arrow_back</md-icon>
      </md-icon-button>
      <p class="overlay-title centered">Locations</p>
      <span class="overlay-spacer"></span>
    </div>
    <div class="locations-list" id="locations-list"></div>
    <md-fab id="settings-fab" aria-label="Settings">
      <md-icon slot="icon">settings</md-icon>
    </md-fab>
    <md-fab id="add-location-fab" aria-label="Add a location">
      <md-icon slot="icon">add</md-icon>
    </md-fab>
  </div>

  <div class="search-overlay" id="search-overlay" data-lenis-prevent>
    <div class="plain-search-row">
      <md-icon>search</md-icon>
      <input id="search-input" type="text" placeholder="Search for a location…" autocomplete="off" />
      <md-icon-button class="close" id="search-close" type="button" aria-label="Close">
        <md-icon>close</md-icon>
      </md-icon-button>
    </div>
    <div class="plain-search-divider"></div>
    <div class="search-results" id="search-results"></div>
    <p class="search-attribution">Location results by Open-Meteo (CC BY 4.0) · GeoNames</p>
  </div>

`

const contentEl = document.querySelector('#content')
const locName = document.querySelector('#loc-name')
const locUpdated = document.querySelector('#loc-updated')
const overlay = document.querySelector('#search-overlay')
const closeBtn = document.querySelector('#search-close')
const input = document.querySelector('#search-input')
const resultsEl = document.querySelector('#search-results')

const menuBtn = document.querySelector('#menu-btn')
const locationsOverlay = document.querySelector('#locations-overlay')
const locationsBackBtn = document.querySelector('#locations-back')
const locationsListEl = document.querySelector('#locations-list')
const addLocationFab = document.querySelector('#add-location-fab')

const onboardingEl = document.querySelector('#onboarding')
const onboardingCta = document.querySelector('#onboarding-cta')

onboardingCta.addEventListener('click', () => {
  dismissOnboarding()
  openSearchOverlay()
})

function dismissOnboarding() {
  localStorage.setItem(ONBOARDED_KEY, '1')
  onboardingEl.classList.add('leaving')
  setTimeout(() => onboardingEl.remove(), 500)
}

function maybeShowOnboarding() {
  const seen = localStorage.getItem(ONBOARDED_KEY)
  const hasLocations = loadLocations().length > 0 || localStorage.getItem(LAST_KEY)
  if (!seen && !hasLocations) {
    onboardingEl.classList.add('visible')
  } else {
    onboardingEl.remove()
  }
}

let debounceTimer = null

function closeLocationsOverlay() {
  locationsOverlay.classList.remove('open')
}

menuBtn.addEventListener('click', () => {
  renderLocationsList()
  locationsOverlay.classList.add('open')
  pushOverlay(closeLocationsOverlay)
})

locationsBackBtn.addEventListener('click', popOverlay)

const settingsFab = document.querySelector('#settings-fab')

const { dialog: settingsDialog } = initSettingsMenu({
  version: APP_VERSION,
  changelog: CHANGELOG,
  shareData: { title: 'Weatherly', text: 'a weather app with no permissions needed', url: location.origin },
  githubUrl: 'https://github.com/zoop-dev/weather',
  onClearData: () => {
    localStorage.clear()
    window.location.reload()
  },
  clearDataMessage: 'This removes every saved location and resets the app. Can\'t be undone.',
  renderFab: false,
  extraItems: [
    {
      id: 'settings-refresh-all',
      icon: 'sync',
      headline: 'Refresh all weather',
      supportingText: 're-fetch every saved location',
      onClick: async () => {
        const item = document.querySelector('#settings-refresh-all')
        item.classList.add('spinning')
        const locations = loadLocations()

        await Promise.all(
          locations.map(async (loc) => {
            try {
              const data = await fetchForecast(loc.place)
              const payload = { place: loc.place, data, savedAt: Date.now() }
              upsertLocation(payload)
              if (currentPlace && placeKey(currentPlace) === placeKey(loc.place)) {
                localStorage.setItem(LAST_KEY, JSON.stringify(payload))
                render(payload)
              }
            } catch {
              
            }
          })
        )

        item.classList.remove('spinning')
        showToast(`refreshed ${locations.length} location${locations.length === 1 ? '' : 's'}`)
      },
    },
  ],
})

settingsFab.addEventListener('click', () => settingsDialog.show())


addLocationFab.addEventListener('click', () => {
  replaceOverlay(
    () => locationsOverlay.classList.remove('open'),
    () => {
      overlay.classList.add('open')
      setTimeout(() => input.focus(), 50)
    },
    closeOverlay
  )
})

closeBtn.addEventListener('click', popOverlay)

function closeOverlay() {
  overlay.classList.remove('open')
  input.value = ''
  resultsEl.innerHTML = ''
}

function openSearchOverlay() {
  overlay.classList.add('open')
  pushOverlay(closeOverlay)
  setTimeout(() => input.focus(), 50)
}

input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  const q = input.value.trim()
  if (q.length < 2) {
    resultsEl.innerHTML = ''
    return
  }
  debounceTimer = setTimeout(async () => {
    const matches = await geocode(q)
    renderResults(matches)
  }, 300)
})

function renderResults(matches) {
  if (!matches.length) {
    resultsEl.innerHTML = `<div class="empty"><md-icon>location_off</md-icon><span>No matches found</span></div>`
    return
  }
  resultsEl.innerHTML = `
    <md-list>
      ${matches
        .map((m, i) => {
          const sub = [m.admin1, m.country].filter(Boolean).join(', ')
          return `
            <md-list-item type="button" data-i="${i}" style="animation-delay:${i * 0.03}s">
              <md-icon slot="start">location_on</md-icon>
              <div slot="headline">${m.name}</div>
              ${sub ? `<div slot="supporting-text">${sub}</div>` : ''}
            </md-list-item>
          `
        })
        .join('')}
    </md-list>
  `
  resultsEl.querySelectorAll('md-list-item').forEach((item) => {
    item.addEventListener('click', () => {
      const m = matches[Number(item.dataset.i)]
      closeOverlay()
      selectPlace(m)
    })
  })
}

async function geocode(q) {
  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

function placeLabel(p) {
  return [p.name, p.admin1, p.country].filter(Boolean).join(', ')
}

function showSkeleton() {
  contentEl.innerHTML = `
    <div class="skeleton">
      <div class="skel skel-icon"></div>
      <div class="skel skel-temp"></div>
      <div class="skel skel-line" style="width:50%"></div>
      <div class="skel skel-panel"></div>
      <div class="skel skel-panel"></div>
      <div class="skel-grid">
        <div class="skel skel-card"></div>
        <div class="skel skel-card"></div>
        <div class="skel skel-card"></div>
        <div class="skel skel-card"></div>
      </div>
    </div>
  `
}

async function selectPlace(place) {
  locName.textContent = place.name
  locUpdated.textContent = 'Loading…'
  showSkeleton()
  try {
    const data = await fetchForecast(place)
    const payload = { place, data, savedAt: Date.now() }
    localStorage.setItem(LAST_KEY, JSON.stringify(payload))
    localStorage.setItem(ONBOARDED_KEY, '1')
    upsertLocation(payload)
    render(payload)
  } catch {
    const raw = localStorage.getItem(LAST_KEY)
    if (raw) {
      render(JSON.parse(raw), true)
    } else {
      locUpdated.textContent = ''
      showErrorScreen("Couldn't reach the weather service", "Check your connection and try again — it's probably just temporary.", () =>
        selectPlace(place)
      )
    }
  }
}

function loadLocations() {
  try {
    return JSON.parse(localStorage.getItem(LOCATIONS_KEY)) ?? []
  } catch {
    return []
  }
}

function saveLocations(list) {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(list))
}

function placeKey(place) {
  return `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`
}

function upsertLocation(payload) {
  const list = loadLocations()
  const key = placeKey(payload.place)
  const idx = list.findIndex((l) => placeKey(l.place) === key)
  if (idx >= 0) list[idx] = payload
  else list.push(payload)
  saveLocations(list)
}

function removeLocation(place) {
  const key = placeKey(place)
  const list = loadLocations().filter((l) => placeKey(l.place) !== key)
  saveLocations(list)

  const lastRaw = localStorage.getItem(LAST_KEY)
  if (lastRaw && placeKey(JSON.parse(lastRaw).place) === key) {
    if (list.length) {
      localStorage.setItem(LAST_KEY, JSON.stringify(list[0]))
      render(list[0])
    } else {
      localStorage.removeItem(LAST_KEY)
      locName.textContent = 'Weather'
      showStatus('Search a city to get started.')
    }
  }
}

function renderLocationsList() {
  const list = loadLocations()
  const current = currentPlace ? placeKey(currentPlace) : null

  if (!list.length) {
    locationsListEl.innerHTML = `<div class="empty"><md-icon>location_off</md-icon><span>No saved locations yet</span></div>`
    return
  }

  locationsListEl.innerHTML = `
    <md-list>
      ${list
        .map((loc, i) => {
          const cur = loc.data.current
          const { icon, label } = describe(cur.weather_code, cur.is_day)
          const isActive = placeKey(loc.place) === current
          return `
            <md-list-item type="button" class="location-pill${isActive ? ' active' : ''}" data-i="${i}">
              <div slot="start" class="wicon-wrap">${weatherIcon(icon)}</div>
              <div slot="headline">${loc.place.name}</div>
              <div slot="supporting-text">${label}</div>
              <md-icon-button slot="end" class="location-delete" data-i="${i}" aria-label="Remove ${loc.place.name}">
                <md-icon>delete</md-icon>
              </md-icon-button>
            </md-list-item>
          `
        })
        .join('')}
    </md-list>
  `

  locationsListEl.querySelectorAll('.location-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const loc = list[Number(btn.dataset.i)]
      removeLocation(loc.place)
      renderLocationsList()
    })
  })

  locationsListEl.querySelectorAll('.location-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const loc = list[Number(btn.dataset.i)]
      popOverlay()
      locName.textContent = loc.place.name
      locUpdated.textContent = 'Loading…'
      showSkeleton()
      fetchForecast(loc.place)
        .then((data) => {
          const payload = { place: loc.place, data, savedAt: Date.now() }
          localStorage.setItem(LAST_KEY, JSON.stringify(payload))
          upsertLocation(payload)
          render(payload)
        })
        .catch(() => {
          render(loc, true)
        })
    })
  })
}

async function fetchForecast(place) {
  const url =
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,is_day,dew_point_2m` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,visibility,wind_speed_10m,wind_direction_10m,relative_humidity_2m,pressure_msl,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,precipitation_sum,sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`
  const res = await fetch(url)
  if (!res.ok) throw new Error('forecast failed')
  const data = await res.json()

  try {
    const aqiUrl = `${AQI_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=us_aqi&hourly=us_aqi&forecast_days=7`
    const aqiRes = await fetch(aqiUrl)
    if (aqiRes.ok) {
      const aqi = await aqiRes.json()
      data.aqi = aqi.current?.us_aqi ?? null
      data.hourlyAqi = aqi.hourly?.us_aqi ?? null
      data.hourlyAqiTime = aqi.hourly?.time ?? null
    }
  } catch {
    data.aqi = null
  }

  return data
}

function dailyAqiMax(data, dayIndex) {
  if (!data.hourlyAqi || !data.hourlyAqiTime) return null
  const dateStr = data.daily.time[dayIndex]
  let max = null
  for (let i = 0; i < data.hourlyAqiTime.length; i++) {
    if (data.hourlyAqiTime[i].startsWith(dateStr)) {
      const v = data.hourlyAqi[i]
      if (v != null && (max == null || v > max)) max = v
    }
  }
  return max
}

function hourlyAqiAt(data, isoTime) {
  if (!data.hourlyAqi || !data.hourlyAqiTime) return null
  const idx = data.hourlyAqiTime.indexOf(isoTime)
  return idx >= 0 ? data.hourlyAqi[idx] : null
}

function showStatus(msg, isError = false) {
  contentEl.innerHTML = `<div class="status${isError ? ' error' : ''}">${msg}</div>`
}

function showErrorScreen(title, subtitle, onRetry) {
  let el = document.querySelector('#error-screen')
  if (!el) {
    el = document.createElement('div')
    el.id = 'error-screen'
    el.className = 'error-screen'
    el.setAttribute('data-lenis-prevent', '')
    document.body.appendChild(el)
  }
  el.innerHTML = `
    <md-icon class="error-screen-icon">cloud_off</md-icon>
    <p class="error-screen-title">${title}</p>
    <p class="error-screen-sub">${subtitle}</p>
    <md-filled-button type="button" class="error-screen-retry">
      Try again
      <md-icon slot="icon">refresh</md-icon>
    </md-filled-button>
  `
  el.querySelector('.error-screen-retry').addEventListener('click', () => {
    hideErrorScreen()
    onRetry()
  })
  requestAnimationFrame(() => el.classList.add('open'))
}

function hideErrorScreen() {
  document.querySelector('#error-screen')?.classList.remove('open')
}

function applyTheme(iconKey) {
  const [grad, accent] = THEMES[iconKey] ?? THEMES.cloudy
  document.documentElement.style.setProperty('--grad', grad)
  document.documentElement.style.setProperty('--accent', accent)
  setBackgroundCondition(iconKey)
}

function render({ place, data, savedAt }, cached = false) {
  hideErrorScreen()
  const cur = data.current
  const { icon, label } = describe(cur.weather_code, cur.is_day)
  applyTheme(icon)

  locName.textContent = place.name
  locUpdated.innerHTML = cached
    ? `<span class="cached-tag">cached · ${timeAgo(savedAt)}</span>`
    : `Updated ${timeAgo(savedAt)}`

  const todayMax = Math.round(data.daily.temperature_2m_max[0])
  const todayMin = Math.round(data.daily.temperature_2m_min[0])

  const isClear = icon === 'clear-day' || icon === 'clear-night'
  const heroIcon = isClear ? '' : `<div class="wicon-wrap">${weatherIcon(icon)}</div>`

  const targetTemp = Math.round(cur.temperature_2m)
  const hero = `
    <div class="hero">
      ${heroIcon}
      <p class="condition">${label}</p>
      <p class="temp"><span id="temp-num" data-target="${targetTemp}">0</span><sup class="unit">°F</sup></p>
      <p class="hilo">Night: ${todayMin}° &nbsp;·&nbsp; Day: ${todayMax}°</p>
      <p class="feels">Feels like ${Math.round(cur.apparent_temperature)}°</p>
    </div>
  `

  currentData = data
  currentPlace = place
  const details = renderDetails(data)

  contentEl.innerHTML = `
    ${hero}
    <div class="panel" style="margin-bottom:14px">
      <h2>${ICONS.calendar}Daily forecast</h2>
      ${tabsHtml(dailyMode)}
      <div class="daily-click-wrap">
        <div id="daily-body">${renderDaily(data, dailyMode)}</div>
        <div class="daily-click-overlay">
          ${data.daily.time.map((_, i) => `<button type="button" class="daily-click-cell" data-day="${i}" aria-label="Open day details"></button>`).join('')}
        </div>
      </div>
    </div>
    <div class="panel" style="margin-bottom:14px">
      <h2>${ICONS.clock}Hourly forecast</h2>
      ${tabsHtml(hourlyMode)}
      <div class="hourly-scroll" id="hourly-body">${renderHourly(data, hourlyMode)}</div>
    </div>
    <div class="dgrid">${details}</div>
    <p class="app-version">v${APP_VERSION}</p>
  `

  wireTabs()
  animateTempCountUp()
}

function animateTempCountUp() {
  const el = document.querySelector('#temp-num')
  if (!el) return
  const target = Number(el.dataset.target)
  const duration = 700
  const start = performance.now()

  function tick(now) {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = Math.round(target * eased)
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

let currentData = null
let currentPlace = null
let dailyMode = 'conditions'
let hourlyMode = 'conditions'

function wireTabs() {
  contentEl.querySelectorAll('.panel').forEach((panel) => {
    const isDaily = !!panel.querySelector('#daily-body')
    const bodyEl = panel.querySelector('#daily-body, #hourly-body')
    panel.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode
        if (isDaily) {
          dailyMode = mode
          bodyEl.innerHTML = renderDaily(currentData, mode)
        } else {
          hourlyMode = mode
          bodyEl.innerHTML = renderHourly(currentData, mode)
        }
        panel.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === btn))
      })
    })
  })

  contentEl.querySelectorAll('.dgrid [data-metric]').forEach((card) => {
    card.style.cursor = 'pointer'
    card.addEventListener('click', async () => {
      const { openDetailPage } = await loadDetailPage()
      openDetailPage(card.dataset.metric, currentData)
    })
  })

  contentEl.querySelectorAll('.daily-click-cell').forEach((cell) => {
    cell.addEventListener('click', async () => {
      const { openDayOverview } = await loadDetailPage()
      openDayOverview(currentData, Number(cell.dataset.day))
    })
  })
}

function renderHourly(data, mode = 'conditions') {
  const nowIdx = data.hourly.time.findIndex((t) => new Date(t) >= new Date(data.current.time))
  const start = nowIdx === -1 ? 0 : nowIdx
  const slice = data.hourly.time.slice(start, start + 24)

  const maxWind = Math.max(...slice.map((_, i) => data.hourly.wind_speed_10m[start + i]), 1)

  return slice
    .map((t, i) => {
      const idx = start + i
      const d = new Date(t)
      const label = i === 0 ? 'Now' : d.toLocaleTimeString(undefined, { hour: 'numeric' })
      const code = data.hourly.weather_code[idx]
      const isDayHour = d.getHours() >= 6 && d.getHours() < 20 ? 1 : 0
      const { icon } = describe(code, isDayHour)

      if (mode === 'wind') {
        const wind = data.hourly.wind_speed_10m[idx]
        const dir = data.hourly.wind_direction_10m[idx]
        const pct = Math.max(8, Math.round((wind / maxWind) * 100))
        return `
          <div class="hour wind-hour">
            <span class="h">${label}</span>
            ${windArrow(dir, wind >= maxWind * 0.6)}
            <div class="wind-bar"><div class="wind-bar-fill" style="height:${pct}%"></div></div>
            <span class="t">${Math.round(wind)}</span>
          </div>
        `
      }
      if (mode === 'air') {
        const aqi = hourlyAqiAt(data, t)
        const maxAqi = Math.max(...slice.map((tt) => hourlyAqiAt(data, tt) ?? 0), 50)
        const pct = aqi != null ? Math.max((aqi / maxAqi) * 100, 4) : 0
        const color = aqi != null ? aqiBarColor(aqi) : 'rgba(255,255,255,0.15)'
        return `
          <div class="hour wind-hour">
            <span class="h">${label}</span>
            <div class="wind-bar"><div class="wind-bar-fill" style="height:${pct}%;background:${color}"></div></div>
            <span class="t">${aqi != null ? Math.round(aqi) : '—'}</span>
          </div>
        `
      }

      const temp = Math.round(data.hourly.temperature_2m[idx])
      const pop = data.hourly.precipitation_probability[idx]
      return `
        <div class="hour">
          <span class="h">${label}</span>
          <div class="wicon-wrap">${weatherIcon(icon)}</div>
          <span class="pop">${pop > 15 ? pop + '%' : ''}</span>
          <span class="t">${temp}°</span>
        </div>
      `
    })
    .join('')
}

function buildDualLineChart(hiVals, loVals, h = 120) {
  const n = hiVals.length
  const all = loVals ? hiVals.concat(loVals) : hiVals
  const allMax = Math.max(...all)
  const allMin = Math.min(...all)
  const span = Math.max(allMax - allMin, 1)
  const padTop = 22
  const padBottom = 22
  const usableH = h - padTop - padBottom

  const x = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100)
  const yFor = (t) => padTop + (1 - (t - allMin) / span) * usableH

  const hiPts = hiVals.map((t, i) => [x(i), yFor(t)])
  const hiPath = hiPts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px},${py}`).join(' ')

  if (!loVals) {
    return `
      <svg class="daily-chart" viewBox="0 0 100 ${h}" preserveAspectRatio="none">
        <path d="${hiPath}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>
    `
  }

  const loPts = loVals.map((t, i) => [x(i), yFor(t)])
  const loPath = loPts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px},${py}`).join(' ')
  const areaPath =
    hiPath + ' ' + loPts.slice().reverse().map(([px, py]) => `L${px},${py}`).join(' ') + ' Z'

  return `
    <svg class="daily-chart" viewBox="0 0 100 ${h}" preserveAspectRatio="none">
      <path d="${areaPath}" fill="var(--accent)" opacity="0.14" />
      <path d="${hiPath}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      <path d="${loPath}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </svg>
  `
}

function windArrow(deg, strong) {
  return `
    <svg class="wind-arrow${strong ? ' strong' : ''}" viewBox="0 0 24 24" style="transform:rotate(${Math.round(deg)}deg)">
      <path d="M14.337,7.05 L17.453,12.45 Q19.79,16.5 15.116,16.5 L8.884,16.5 Q4.21,16.5 6.547,12.45 L9.663,7.05 Q12,3 14.337,7.05 Z" fill="currentColor"/>
    </svg>
  `
}

function aqiBarColor(v) {
  if (v <= 50) return '#5ee0a0'
  if (v <= 100) return '#ffd76a'
  if (v <= 150) return '#ff9f5a'
  if (v <= 200) return '#ff6a6a'
  if (v <= 300) return '#c084fc'
  return '#8a2942'
}

function aqiBarChart(values) {
  const max = Math.max(...values.filter((v) => v != null), 100)
  const scaleTop = Math.ceil(max / 20) * 20
  const midMark = Math.round(scaleTop * 0.4 / 10) * 10
  const n = values.length
  const bars = values
    .map((v, i) => {
      const h = v == null ? 0 : Math.max((v / scaleTop) * 100, 3)
      const color = v == null ? 'rgba(255,255,255,0.15)' : aqiBarColor(v)
      const x = (i / n) * 100 + 100 / n / 2
      return `<rect x="${(x - 4).toFixed(2)}%" y="${(100 - h).toFixed(2)}%" width="8%" height="${h.toFixed(2)}%" rx="6" fill="${color}" />`
    })
    .join('')
  const gridLines = Array.from({ length: n }, (_, i) => {
    const x = ((i + 0.5) / n) * 100
    return `<line x1="${x}%" y1="0" x2="${x}%" y2="100%" stroke="rgba(255,255,255,0.06)" stroke-width="1" />`
  }).join('')

  return `
    <div class="aqi-bar-chart">
      <div class="aqi-scale-left">
        <span>${scaleTop}</span>
        <span>${midMark}</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        ${gridLines}
        ${bars}
      </svg>
      <div class="aqi-scale-right">
        <span>${aqiLabelShort(scaleTop)}</span>
        <span>${aqiLabelShort(midMark)}</span>
      </div>
    </div>
  `
}

function renderDaily(data, mode = 'conditions') {
  const weekdayRow = data.daily.time
    .map((date, i) => {
      const d = parseLocalDate(date)
      const label = i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })
      return `<span>${label}</span>`
    })
    .join('')

  if (mode === 'wind') {
    const speeds = data.daily.wind_speed_10m_max
    const gusts = data.daily.wind_gusts_10m_max
    const dirs = data.daily.wind_direction_10m_dominant
    const threshold = (Math.max(...speeds) + Math.min(...speeds)) / 2

    const topArrows = speeds
      .map((v, i) => `<div class="wicon-wrap">${windArrow(dirs[i], v >= threshold)}</div>`)
      .join('')
    const bottomArrows = speeds
      .map((v, i) => `<div class="wicon-wrap">${windArrow((dirs[i] + 180) % 360, false)}</div>`)
      .join('')
    const pairs = speeds
      .map((v, i) => {
        const strong = v >= threshold
        return `
          <span class="wind-pair">
            <span class="${strong ? 'gold' : 'green'}">${v.toFixed(1)}<i class="dot ${strong ? 'gold' : 'green'}"></i></span>
            <span class="muted2">${gusts[i].toFixed(1)}<i class="dot muted2"></i></span>
          </span>
        `
      })
      .join('')

    return `
      <div class="daily-grid-row weekday-row">${weekdayRow}</div>
      <div class="daily-grid-row icon-row">${topArrows}</div>
      <div class="daily-grid-row wind-pairs-row">${pairs}</div>
      <div class="daily-grid-row icon-row">${bottomArrows}</div>
    `
  }

  const iconRow = data.daily.time
    .map((date, i) => {
      const { icon } = describe(data.daily.weather_code[i], 1)
      return `<div class="wicon-wrap">${weatherIcon(icon)}</div>`
    })
    .join('')

  if (mode === 'air') {
    const aqi = data.daily.time.map((_, i) => dailyAqiMax(data, i))
    const valueRow = aqi.map((v) => `<span>${v != null ? Math.round(v) : '—'}</span>`).join('')
    return `
      <div class="daily-grid-row weekday-row">${weekdayRow}</div>
      ${aqiBarChart(aqi)}
      <div class="daily-grid-row pop-row">${valueRow}</div>
    `
  }

  let chartSvg, hiRow, loRow, bottomRow

  {
    chartSvg = buildDualLineChart(data.daily.temperature_2m_max, data.daily.temperature_2m_min)
    hiRow = data.daily.temperature_2m_max.map((t) => `<span>${Math.round(t)}°</span>`).join('')
    loRow = data.daily.temperature_2m_min.map((t) => `<span>${Math.round(t)}°</span>`).join('')
    bottomRow = data.daily.precipitation_probability_max
      .map((p) => `<span>${p != null ? p + '%' : '—'}</span>`)
      .join('')
  }

  return `
    <div class="daily-grid-row weekday-row">${weekdayRow}</div>
    <div class="daily-grid-row icon-row">${iconRow}</div>
    <div class="daily-chart-area">
      ${chartSvg}
      <div class="daily-grid-row hi-row">${hiRow}</div>
      <div class="daily-grid-row lo-row">${loRow}</div>
    </div>
    <div class="daily-grid-row pop-row">${bottomRow}</div>
  `
}

const TAB_MODES = ['conditions', 'air', 'wind']
const TAB_LABELS = { conditions: 'Conditions', air: 'Air quality', wind: 'Wind' }

function tabsHtml(activeMode) {
  return `
    <div class="tabs">
      ${TAB_MODES.map(
        (key) =>
          `<button type="button" class="tab${key === activeMode ? ' active' : ''}" data-mode="${key}">${TAB_LABELS[key]}</button>`
      ).join('')}
    </div>
  `
}

function gaugeArc(pct, color, size = 88, stroke = 5) {
  const r = (size - stroke) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, pct)))
  return `
    <svg class="gauge" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${stroke}" />
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
        transform="rotate(-90 ${c} ${c})" />
    </svg>
  `
}

function renderDetails(data) {
  const cur = data.current
  const uv = data.daily.uv_index_max[0]
  const visIdx = data.hourly.time.findIndex((t) => new Date(t) >= new Date(cur.time))
  const visMeters = visIdx >= 0 ? data.hourly.visibility[visIdx] : null
  const visMilesRaw = visMeters != null ? visMeters / 1609.34 : null
  const visMiles = visMilesRaw != null ? (visMilesRaw > 10 ? '10+' : visMilesRaw.toFixed(1)) : null
  const precipIn = data.daily.precipitation_sum?.[0]
  const pressureInHg = (cur.pressure_msl * 0.02953).toFixed(2)
  const aqi = data.aqi
  const aqiColor = aqi == null ? 'var(--muted)' : aqi <= 50 ? '#5ee0a0' : aqi <= 100 ? '#ffd76a' : aqi <= 150 ? '#ff9f5a' : '#ff6a6a'

  const uvLevels = [
    { max: 2, color: '#5ee0a0', name: 'Low' },
    { max: 5, color: '#a9c93c', name: 'Moderate' },
    { max: 7, color: '#ff9f5a', name: 'High' },
    { max: 10, color: '#ff6a6a', name: 'Very high' },
    { max: Infinity, color: '#c084fc', name: 'Extreme' },
  ]
  const uvIdx = uvLevels.findIndex((l) => uv <= l.max)
  const uvDots = uvLevels
    .map((l, i) => `<i class="uv-dot${i === uvIdx ? ' active' : ''}" style="--c:${l.color}"></i>`)
    .join('')

  const sunCard = sunCardMarkup(data)

  return `
    <div class="dcard square" data-metric="precipitation">
      <div class="dlabel">${ICONS.rain}<span>Precipitation</span></div>
      <div class="dvalue">${precipIn != null ? (precipIn === 0 ? '0' : precipIn.toFixed(2)) : '—'}<span class="dunit">in</span></div>
      <div class="dsub">Today's total</div>
    </div>
    <div class="dcard circle" data-metric="wind">
      <div class="wind-bg" style="transform:translate(-50%,-50%) rotate(${Math.round(cur.wind_direction_10m)}deg)">${windArrow(0, false)}</div>
      <div class="dlabel">${ICONS.wind}<span>Wind</span></div>
      <div class="dvalue">${Math.round(cur.wind_speed_10m)}<span class="dunit">mph</span></div>
      <div class="dsub">Gusts: ${Math.round(cur.wind_gusts_10m)} mph</div>
    </div>
    <div class="dcard circle gauge-card" data-metric="air">
      ${gaugeArc(aqi != null ? aqi / 300 : 0, aqiColor)}
      <div class="gauge-content">
        <div class="dlabel">${ICONS.leaf}<span>Air quality</span></div>
        <div class="dvalue">${aqi != null ? Math.round(aqi) : '—'}</div>
        <div class="dsub">${aqi != null ? aqiLabel(aqi) : ''}</div>
      </div>
    </div>
    <div class="dcard square humidity-card" data-metric="humidity">
      <div class="dlabel">${ICONS.humidity}<span>Humidity</span></div>
      <div class="dvalue">${cur.relative_humidity_2m}<span class="dunit">%</span></div>
      <div class="humidity-wave" style="height:${Math.max(cur.relative_humidity_2m, 14)}%">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" class="wave-edge">
          <path d="M0,10 C15,2 35,18 50,10 C65,2 85,18 100,10 L100,20 L0,20 Z" fill="currentColor" />
        </svg>
        <div class="dewpoint-pill">${Math.round(cur.dew_point_2m)}° <span>Dew point</span></div>
      </div>
    </div>
    <div class="dcard circle scalloped" data-metric="uv" style="clip-path:${scallopedClipPath(8, 50, 41)}">
      <div class="dlabel">${ICONS.uv}<span>UV index</span></div>
      <div class="dvalue">${Math.round(uv)}</div>
      <div class="dsub">${uvLevels[uvIdx].name}</div>
      <div class="uv-dots">${uvDots}</div>
    </div>
    <div class="dcard circle scalloped filled" data-metric="visibility" style="clip-path:${scallopedClipPath(8, 50, 41)}">
      <div class="dlabel">${ICONS.eye}<span>Visibility</span></div>
      <div class="dvalue">${visMiles ?? '—'}<span class="dunit">mi</span></div>
      <div class="dsub">${visMilesRaw != null && visMilesRaw > 9 ? 'Perfectly clear' : ''}</div>
    </div>
    <div class="dcard circle gauge-card" data-metric="pressure">
      ${gaugeArc((cur.pressure_msl - 970) / 80, '#8ec9ff')}
      <div class="gauge-content">
        <div class="dlabel">${ICONS.pressure}<span>Pressure</span></div>
        <div class="dvalue">${pressureInHg}</div>
        <div class="dsub">inHg</div>
      </div>
    </div>
    ${sunCard}
  `
}

function aqiLabel(aqi) {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy (sensitive)'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function aqiLabelShort(aqi) {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'USG'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'V. unhealthy'
  return 'Hazardous'
}

function sunCardMarkup(data) {
  const sunrise = new Date(data.daily.sunrise[0])
  const sunset = new Date(data.daily.sunset[0])
  const now = new Date(data.current.time)
  const total = sunset - sunrise
  const elapsed = now - sunrise
  const pct = Math.max(0, Math.min(1, elapsed / total))
  const angle = pct * 180
  const rad = (angle * Math.PI) / 180
  const cx = 100, cy = 90, r = 76
  const sx = cx - r * Math.cos(rad)
  const sy = cy - r * Math.sin(rad)
  const isUp = now >= sunrise && now <= sunset

  const fmt = (d) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return `
    <div class="dcard square sun-card" data-metric="sun">
      <div class="dlabel">${ICONS.sun}<span>Sun</span></div>
      <div class="sun-arc">
        <svg viewBox="0 0 200 100">
          <path d="M 24 90 A 76 76 0 0 1 176 90" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7" opacity="0.7"/>
          ${isUp ? `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="8" fill="var(--accent)" />` : ''}
        </svg>
        <div class="sun-times">
          <div><span class="label">Sunrise</span><span class="value">${fmt(sunrise)}</span></div>
          <div><span class="label">Sunset</span><span class="value">${fmt(sunset)}</span></div>
        </div>
      </div>
    </div>
  `
}

function uvLabel(uv) {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Extreme'
}

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function loadLast() {
  const raw = localStorage.getItem(LAST_KEY)
  if (!raw) {
    locName.textContent = 'Weather'
    showStatus('Search a city to get started.')
    return
  }
  render(JSON.parse(raw), false)
  const { place } = JSON.parse(raw)
  fetchForecast(place)
    .then((data) => {
      const payload = { place, data, savedAt: Date.now() }
      localStorage.setItem(LAST_KEY, JSON.stringify(payload))
      render(payload)
    })
    .catch(() => {})
}

if (gated) {
  removeBootLoaderImmediately()
} else {
  loadLast()
  maybeShowOnboarding()
  maybeShowChangelog({
    appVersion: APP_VERSION,
    changelog: CHANGELOG,
    versionKey: VERSION_KEY,
    isFirstRun: !localStorage.getItem(ONBOARDED_KEY) && loadLocations().length === 0,
  })

  initPullToRefresh(contentEl, async () => {
    if (!currentPlace) return
    try {
      const data = await fetchForecast(currentPlace)
      const payload = { place: currentPlace, data, savedAt: Date.now() }
      localStorage.setItem(LAST_KEY, JSON.stringify(payload))
      upsertLocation(payload)
      render(payload)
    } catch {
      
    }
  })

  attachBootLoader(() => {})

  initUpdateCheck()
  initSmoothScroll()
}







function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.0,
    touchMultiplier: 1.4,
    
    
    syncTouch: true,
    
    
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

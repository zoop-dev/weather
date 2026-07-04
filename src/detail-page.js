

import { pushOverlay, popOverlay } from 'zoop-kit/back-nav.js'
import { describe } from './weathercodes.js'
import { weatherIcon } from './icons.js'

const ORDER = ['conditions', 'wind', 'air', 'uv', 'precipitation', 'humidity', 'pressure', 'visibility', 'sun']

const LABELS = {
  conditions: 'Conditions',
  wind: 'Wind',
  air: 'Air quality',
  uv: 'UV index',
  precipitation: 'Precipitation',
  humidity: 'Humidity',
  pressure: 'Pressure',
  visibility: 'Visibility',
  sun: 'Sun & moon',
}

const EDU = {
  conditions: [
    {
      title: 'About the daily high/low',
      text: `The high and low shown here are the day's forecast extremes — the warmest and coolest the air is expected to get, not what it feels like with wind or humidity factored in. "Feels like" adjusts for wind chill and humidity, which is why it can read noticeably different from the actual air temperature.`,
    },
  ],
  wind: [
    {
      title: 'About wind speed and gusts',
      text: `Wind speed is how fast air is moving near the surface, usually measured about 10 meters up. Gusts are short bursts that blow noticeably faster than the sustained speed around them. Direction is given as where the wind is coming from, not where it's headed.`,
      table: {
        title: 'Beaufort scale',
        rows: [
          ['0', '#5ee0a0', 'Calm', '< 1 mph'],
          ['1–3', '#5ee0a0', 'Light air/breeze', '1–12 mph'],
          ['4–5', '#ffd76a', 'Moderate/fresh breeze', '13–24 mph'],
          ['6–7', '#ff9f5a', 'Strong breeze/near gale', '25–38 mph'],
          ['8–9', '#ff6a6a', 'Gale/strong gale', '39–54 mph'],
          ['10–11', '#c084fc', 'Storm/violent storm', '55–72 mph'],
          ['12', '#8a2942', 'Hurricane-force', '73+ mph'],
        ],
      },
    },
  ],
  air: [
    {
      title: 'About air quality index',
      text: `Air quality index (AQI) summarizes how polluted the air is and what that means for your health, on a scale that runs from 0 up past 300. It's driven mostly by fine particulates and ground-level ozone. Sensitive groups — people with asthma, heart conditions, young kids, older adults — feel effects at lower levels than everyone else.`,
      table: {
        title: 'Air quality index scale',
        rows: [
          ['0–50', '#5ee0a0', 'Good', ''],
          ['51–100', '#ffd76a', 'Moderate', ''],
          ['101–150', '#ff9f5a', 'Unhealthy for sensitive groups', ''],
          ['151–200', '#ff6a6a', 'Unhealthy', ''],
          ['201–300', '#c084fc', 'Very unhealthy', ''],
          ['300+', '#8a2942', 'Hazardous', ''],
        ],
      },
    },
  ],
  uv: [
    {
      title: 'About UV index',
      text: `The UV index estimates the strength of sunburn-causing ultraviolet radiation at solar noon. Higher numbers mean skin damage happens faster, especially at altitude, near reflective surfaces like snow or water, or during midday hours.`,
      table: {
        title: 'UV index scale',
        rows: [
          ['0–2', '#5ee0a0', 'Low', ''],
          ['3–5', '#a9c93c', 'Moderate', ''],
          ['6–7', '#ff9f5a', 'High', ''],
          ['8–10', '#ff6a6a', 'Very high', ''],
          ['11+', '#c084fc', 'Extreme', ''],
        ],
      },
    },
  ],
  precipitation: [
    {
      title: 'About precipitation',
      text: `This shows how much rain or snow is expected, plus the odds of any falling at all. A high percentage with a low amount usually means widespread light rain is likely; a lower percentage with a high amount usually means an isolated but heavier event.`,
    },
  ],
  humidity: [
    {
      title: 'About relative humidity',
      text: `Relative humidity is how much moisture is in the air compared to the maximum it could hold at that temperature. High humidity makes hot days feel hotter, since sweat evaporates more slowly.`,
    },
    {
      title: 'About dew point',
      text: `Dew point is the temperature the air would need to cool to for it to reach 100% relative humidity. It's often a better comfort gauge than humidity percentage alone — anything above the mid-60s (°F) starts to feel muggy.`,
    },
  ],
  pressure: [
    {
      title: 'About pressure',
      text: `Atmospheric pressure is the weight of the air above you. This app uses mean sea level pressure so readings are comparable between places at different altitudes. Falling pressure often signals a storm system moving in; rising pressure usually means clearer, calmer weather is on the way.`,
    },
  ],
  visibility: [
    {
      title: 'About visibility',
      text: `Visibility is roughly how far you can clearly see, limited by fog, haze, heavy rain, or snow.`,
      table: {
        title: 'Visibility scale',
        rows: [
          ['< 0.6 mi', '#8a2942', 'Very poor', ''],
          ['0.6–1.9 mi', '#ff6a6a', 'Poor', ''],
          ['2–5.9 mi', '#ff9f5a', 'Moderate', ''],
          ['6–9.9 mi', '#ffd76a', 'Good', ''],
          ['10 mi', '#a9c93c', 'Clear', ''],
          ['10+ mi', '#5ee0a0', 'Perfectly clear', ''],
        ],
      },
    },
  ],
  sun: [
    {
      title: 'About rise and set times',
      text: `Sunrise/moonrise is when the sun or moon fully appears above the horizon; sunset/moonset is when it completely disappears below it. Civil twilight is the period just before sunrise and after sunset when there's still enough natural light to see clearly outdoors.`,
    },
  ],
}

let currentIndex = 0
let currentDayIndex = 0
let currentData = null
let touchStartX = null
let touchCurrentX = null
let dragging = false

export function openDetailPage(key, data, dayIndex = 0) {
  currentData = data
  currentIndex = ORDER.indexOf(key)
  if (currentIndex === -1) currentIndex = 0
  currentDayIndex = dayIndex
  const isNew = !document.querySelector('#detail-page')
  buildFrame()
  renderPane(currentIndex)
  if (isNew) pushOverlay(closeDetailPage)
  requestAnimationFrame(() => document.querySelector('#detail-page').classList.add('open'))
}

function buildFrame() {
  let el = document.querySelector('#detail-page')
  if (el) return el
  el = document.createElement('div')
  el.id = 'detail-page'
  el.className = 'detail-page'
  
  
  
  el.setAttribute('data-lenis-prevent', '')
  el.innerHTML = `<div class="detail-track"></div>`
  document.body.appendChild(el)

  const track = el.querySelector('.detail-track')

  el.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX
      touchCurrentX = touchStartX
      dragging = true
      track.style.transition = 'none'
    },
    { passive: true }
  )

  el.addEventListener(
    'touchmove',
    (e) => {
      if (!dragging) return
      touchCurrentX = e.touches[0].clientX
      const dx = touchCurrentX - touchStartX
      track.style.transform = `translateX(${dx}px)`
    },
    { passive: true }
  )

  el.addEventListener('touchend', () => {
    if (!dragging) return
    dragging = false
    const dx = touchCurrentX - touchStartX
    track.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'

    const goingNext = dx < -60 && currentIndex < ORDER.length - 1
    const goingPrev = dx > 60 && currentIndex > 0

    if (goingNext || goingPrev) {
      const dir = goingNext ? -1 : 1
      track.style.transform = `translateX(${dir * 100}%)`
      track.addEventListener(
        'transitionend',
        () => {
          currentIndex += goingNext ? 1 : -1
          track.style.transition = 'none'
          track.style.transform = 'translateX(0)'
          renderPane(currentIndex)
        },
        { once: true }
      )
    } else {
      track.style.transform = 'translateX(0)'
    }
  })

  return el
}

function renderPane(index) {
  const key = ORDER[index]
  const track = document.querySelector('#detail-page .detail-track')

  const daily = currentData.daily
  const dayLabels = daily.time.map((d, i) => {
    const date = new Date(d)
    return {
      dow: i === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' }),
      num: date.getDate(),
    }
  })

  const eduBlocks = (EDU[key] || [])
    .map(
      (block) => `
        <div class="edu-block">
          <p class="edu-title">${block.title}</p>
          <p class="edu-text">${block.text}</p>
          ${block.table ? renderTable(block.table) : ''}
        </div>
      `
    )
    .join('')

  track.innerHTML = `
    <div class="detail-header">
      <md-icon-button id="detail-back" aria-label="Back"><md-icon>arrow_back</md-icon></md-icon-button>
      <p class="detail-title">${LABELS[key]}</p>
      <span class="overlay-spacer"></span>
    </div>
    <div class="detail-daytabs">
      ${dayLabels
        .map(
          (d, i) =>
            `<button type="button" class="detail-daytab${i === currentDayIndex ? ' active' : ''}" data-day="${i}">
              <span class="dow">${d.dow}</span><span class="num">${d.num}</span>
            </button>`
        )
        .join('')}
    </div>
    <div id="detail-body"></div>
    ${eduBlocks}
  `

  renderBody(key, currentDayIndex)

  const dayTabsEl = track.querySelector('.detail-daytabs')
  const activeTab = dayTabsEl.querySelector('.detail-daytab.active')
  if (activeTab) activeTab.scrollIntoView({ inline: 'center', block: 'nearest' })

  track.querySelector('#detail-back').addEventListener('click', popOverlay)
  track.querySelectorAll('.detail-daytab').forEach((btn) => {
    btn.addEventListener('click', () => {
      track.querySelectorAll('.detail-daytab').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      currentDayIndex = Number(btn.dataset.day)
      renderBody(key, currentDayIndex)
    })
  })
}

function renderTable(table) {
  return `
    <p class="edu-table-title">${table.title}</p>
    <div class="edu-table">
      ${table.rows
        .map(
          ([range, color, label, sub]) => `
            <div class="edu-table-row">
              <i class="edu-dot" style="background:${color}"></i>
              <span class="edu-table-label">${label}</span>
              <span class="edu-table-range">${range}${sub ? ` · ${sub}` : ''}</span>
            </div>
          `
        )
        .join('')}
    </div>
  `
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
function compassLabel(deg) {
  return COMPASS[Math.round(deg / 22.5) % 16]
}

function aqiCategory(v) {
  if (v == null) return '—'
  if (v <= 50) return 'Good'
  if (v <= 100) return 'Moderate'
  if (v <= 150) return 'Unhealthy for sensitive groups'
  if (v <= 200) return 'Unhealthy'
  if (v <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function uvCategory(v) {
  if (v <= 2) return 'Low'
  if (v <= 5) return 'Moderate'
  if (v <= 7) return 'High'
  if (v <= 10) return 'Very high'
  return 'Extreme'
}

function aqiColor(v) {
  if (v == null) return 'var(--muted)'
  if (v <= 50) return '#5ee0a0'
  if (v <= 100) return '#ffd76a'
  if (v <= 150) return '#ff9f5a'
  if (v <= 200) return '#ff6a6a'
  if (v <= 300) return '#c084fc'
  return '#8a2942'
}

function uvColor(v) {
  if (v <= 2) return '#5ee0a0'
  if (v <= 5) return '#a9c93c'
  if (v <= 7) return '#ff9f5a'
  if (v <= 10) return '#ff6a6a'
  return '#c084fc'
}

const OVERVIEW_COLORS = {
  conditions: '#ffd76a',
  wind: '#8ec9ff',
  precipitation: '#4cc9ff',
  humidity: '#5ee0d8',
  pressure: '#c9a8ff',
  visibility: '#a9c93c',
  sun: '#ffb35a',
}

function computeMetric(data, key, dayIdx) {
  const dayStr = data.daily.time[dayIdx]
  const hourIdxs = data.hourly.time
    .map((t, i) => (t.startsWith(dayStr) ? i : -1))
    .filter((i) => i >= 0)

  let headline = ''
  let values = []
  let stats = []

  if (key === 'wind') {
    values = hourIdxs.map((i) => data.hourly.wind_speed_10m[i])
    headline = `${Math.round(Math.min(...values))}–${Math.round(Math.max(...values))} mph`
    stats = [
      { label: 'Max gust', value: `${Math.round(data.daily.wind_gusts_10m_max[dayIdx])} mph` },
      { label: 'Direction', value: compassLabel(data.daily.wind_direction_10m_dominant[dayIdx]) },
    ]
  } else if (key === 'air') {
    const aqiIdxs = (data.hourlyAqiTime || []).map((t, i) => (t.startsWith(dayStr) ? i : -1)).filter((i) => i >= 0)
    values = aqiIdxs.map((i) => data.hourlyAqi[i]).filter((v) => v != null)
    const dayMax = values.length ? Math.max(...values) : null
    headline = dayMax != null ? `${Math.round(dayMax)} AQI` : '—'
    stats = [{ label: 'Category', value: aqiCategory(dayMax) }]
  } else if (key === 'uv') {
    values = hourIdxs.map((i) => data.hourly.uv_index[i]).filter((v) => v != null)
    const dayMax = data.daily.uv_index_max[dayIdx]
    headline = `${Math.round(dayMax)} peak`
    stats = [{ label: 'Category', value: uvCategory(dayMax) }]
  } else if (key === 'humidity') {
    values = hourIdxs.map((i) => data.hourly.relative_humidity_2m[i])
    headline = `${Math.round(Math.min(...values))}–${Math.round(Math.max(...values))}%`
    stats = [{ label: 'Average', value: `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%` }]
  } else if (key === 'pressure') {
    values = hourIdxs.map((i) => data.hourly.pressure_msl[i])
    const first = values[0]
    const last = values[values.length - 1]
    headline = `${(Math.min(...values) * 0.02953).toFixed(2)}–${(Math.max(...values) * 0.02953).toFixed(2)} inHg`
    stats = [{ label: 'Trend', value: last > first + 1 ? 'Rising' : last < first - 1 ? 'Falling' : 'Steady' }]
  } else if (key === 'visibility') {
    values = hourIdxs.map((i) => data.hourly.visibility[i] / 1609.34)
    const lo = Math.min(...values)
    headline = lo > 9 ? 'Clear all day' : `${lo.toFixed(1)}–${Math.max(...values).toFixed(1)} mi`
    stats = [{ label: 'Lowest', value: `${lo > 9 ? '10+' : lo.toFixed(1)} mi` }]
  } else if (key === 'precipitation') {
    values = hourIdxs.map((i) => data.hourly.precipitation_probability[i])
    headline = `${data.daily.precipitation_probability_max[dayIdx] ?? 0}% chance`
    stats = [{ label: 'Total', value: `${(data.daily.precipitation_sum[dayIdx] ?? 0).toFixed(2)} in` }]
  } else if (key === 'sun') {
    const sunrise = new Date(data.daily.sunrise[dayIdx])
    const sunset = new Date(data.daily.sunset[dayIdx])
    const dayLenMs = sunset - sunrise
    const dayLenH = Math.floor(dayLenMs / 3600000)
    const dayLenM = Math.round((dayLenMs % 3600000) / 60000)
    values = []
    headline = `${dayLenH}h ${dayLenM}m of daylight`
    stats = [
      { label: 'Sunrise', value: sunrise.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) },
      { label: 'Sunset', value: sunset.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) },
    ]
  } else {
    values = hourIdxs.map((i) => data.hourly.temperature_2m[i])
    headline = `${Math.round(data.daily.temperature_2m_max[dayIdx])}° / ${Math.round(data.daily.temperature_2m_min[dayIdx])}°`
    stats = [{ label: 'Feels like', value: `${Math.round(data.current.apparent_temperature)}°` }]
  }

  return { headline, values, stats }
}

function renderBody(key, dayIdx) {
  const body = document.querySelector('#detail-body')
  const { headline, values, stats } = computeMetric(currentData, key, dayIdx)

  const chart = values.length
    ? (() => {
        const max = Math.max(...values, 1)
        const min = Math.min(...values, 0)
        const span = Math.max(max - min, 1)
        const points = values
          .map((v, i) => {
            const x = (i / Math.max(values.length - 1, 1)) * 100
            const y = 90 - ((v - min) / span) * 80
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          })
          .join(' ')
        return `
          <svg class="detail-chart" width="100%" height="160" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="${points}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `
      })()
    : ''

  body.innerHTML = `
    <p class="detail-headline">${headline}</p>
    ${chart}
    <div class="stat-strip">
      ${stats.map((s) => `<div class="card stat-pill"><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>
  `
}

const OVERVIEW_ICONS = {
  conditions: 'device_thermostat',
  wind: 'air',
  air: 'eco',
  uv: 'wb_sunny',
  precipitation: 'rainy',
  humidity: 'humidity_percentage',
  pressure: 'speed',
  visibility: 'visibility',
  sun: 'wb_twilight',
}

export function openDayOverview(data, dayIndex = 0) {
  currentData = data
  currentDayIndex = dayIndex
  const isNew = !document.querySelector('#day-overview')
  buildOverviewFrame()
  renderOverview()
  if (isNew) pushOverlay(closeDayOverview)
  requestAnimationFrame(() => document.querySelector('#day-overview').classList.add('open'))
}

function buildOverviewFrame() {
  let el = document.querySelector('#day-overview')
  if (el) return el
  el = document.createElement('div')
  el.id = 'day-overview'
  el.className = 'detail-page'
  document.body.appendChild(el)
  return el
}

function renderOverview() {
  const el = document.querySelector('#day-overview')
  const daily = currentData.daily
  const dayLabels = daily.time.map((d, i) => {
    const date = new Date(d)
    return {
      dow: i === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' }),
      num: date.getDate(),
    }
  })

  const { icon } = describe(daily.weather_code[currentDayIndex], 1)
  const hi = Math.round(daily.temperature_2m_max[currentDayIndex])
  const lo = Math.round(daily.temperature_2m_min[currentDayIndex])

  el.innerHTML = `
    <div class="detail-track">
      <div class="detail-header">
        <md-icon-button id="overview-back" aria-label="Back"><md-icon>arrow_back</md-icon></md-icon-button>
        <p class="detail-title">${new Date(daily.time[currentDayIndex]).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <span class="overlay-spacer"></span>
      </div>
      <div class="detail-daytabs">
        ${dayLabels
          .map(
            (d, i) =>
              `<button type="button" class="detail-daytab${i === currentDayIndex ? ' active' : ''}" data-day="${i}">
                <span class="dow">${d.dow}</span><span class="num">${d.num}</span>
              </button>`
          )
          .join('')}
      </div>
      <div class="overview-hero">
        <div class="overview-hero-icon">${weatherIcon(icon)}</div>
        <div class="overview-hero-temps">${hi}° <span>/ ${lo}°</span></div>
      </div>
      <div class="tile-grid" id="overview-grid" style="grid-template-columns:repeat(2, 1fr); gap:12px;"></div>
    </div>
  `

  const grid = el.querySelector('#overview-grid')
  grid.innerHTML = ORDER.map((key) => {
    const { headline } = computeMetric(currentData, key, currentDayIndex)
    let color = OVERVIEW_COLORS[key] || 'var(--accent)'
    if (key === 'air') {
      const aqi = computeMetric(currentData, 'air', currentDayIndex)
      color = aqiColor(aqi.headline === '—' ? null : parseFloat(aqi.headline))
    } else if (key === 'uv') {
      color = uvColor(currentData.daily.uv_index_max[currentDayIndex])
    }
    return `
      <div class="card overview-card" data-key="${key}">
        <div class="overview-card-label">
          <div class="overview-card-badge" style="background:${color}22; color:${color};"><md-icon>${OVERVIEW_ICONS[key]}</md-icon></div>
          <span>${LABELS[key]}</span>
        </div>
        <div class="overview-card-value">${headline}</div>
      </div>
    `
  }).join('')

  const activeTab = el.querySelector('.detail-daytab.active')
  if (activeTab) activeTab.scrollIntoView({ inline: 'center', block: 'nearest' })

  el.querySelector('#overview-back').addEventListener('click', popOverlay)
  el.querySelectorAll('.detail-daytab').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentDayIndex = Number(btn.dataset.day)
      renderOverview()
    })
  })
  grid.querySelectorAll('.overview-card').forEach((card) => {
    card.addEventListener('click', () => {
      openDetailPage(card.dataset.key, currentData, currentDayIndex)
    })
  })
}

function closeDayOverview() {
  const el = document.querySelector('#day-overview')
  if (!el) return
  el.classList.remove('open')
  setTimeout(() => el.remove(), 300)
}

function closeDetailPage() {
  const el = document.querySelector('#detail-page')
  if (!el) return
  el.classList.remove('open')
  setTimeout(() => el.remove(), 300)
}

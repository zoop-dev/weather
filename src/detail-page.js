// Copyright (c) 2026 zoop. See LICENSE.

import { pushOverlay, popOverlay } from './back-nav.js'

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
let currentData = null
let touchStartX = null
let touchCurrentX = null
let dragging = false

export function openDetailPage(key, data) {
  currentData = data
  currentIndex = ORDER.indexOf(key)
  if (currentIndex === -1) currentIndex = 0
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
  const dayLabels = daily.time.slice(0, 4).map((d, i) => {
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
            `<button type="button" class="detail-daytab${i === 0 ? ' active' : ''}" data-day="${i}">
              <span class="dow">${d.dow}</span><span class="num">${d.num}</span>
            </button>`
        )
        .join('')}
    </div>
    <div id="detail-body"></div>
    ${eduBlocks}
  `

  renderBody(key, 0)

  track.querySelector('#detail-back').addEventListener('click', popOverlay)
  track.querySelectorAll('.detail-daytab').forEach((btn) => {
    btn.addEventListener('click', () => {
      track.querySelectorAll('.detail-daytab').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      renderBody(key, Number(btn.dataset.day))
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

function renderBody(key, dayIdx) {
  const body = document.querySelector('#detail-body')
  const data = currentData
  const dayStr = data.daily.time[dayIdx]
  const hourIdxs = data.hourly.time
    .map((t, i) => (t.startsWith(dayStr) ? i : -1))
    .filter((i) => i >= 0)

  let headline = ''
  let values = []

  if (key === 'wind') {
    values = hourIdxs.map((i) => data.hourly.wind_speed_10m[i])
    headline = `${Math.round(Math.min(...values))}–${Math.round(Math.max(...values))} mph`
  } else if (key === 'humidity') {
    values = hourIdxs.map(() => data.current.relative_humidity_2m)
    headline = `${data.current.relative_humidity_2m}%`
  } else if (key === 'precipitation') {
    values = hourIdxs.map((i) => data.hourly.precipitation_probability[i])
    headline = `${data.daily.precipitation_probability_max[dayIdx] ?? 0}% chance`
  } else {
    values = hourIdxs.map((i) => data.hourly.temperature_2m[i])
    headline = `${Math.round(data.daily.temperature_2m_max[dayIdx])}° / ${Math.round(data.daily.temperature_2m_min[dayIdx])}°`
  }

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

  body.innerHTML = `
    <p class="detail-headline">${headline}</p>
    <svg class="detail-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="${points}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `
}

function closeDetailPage() {
  const el = document.querySelector('#detail-page')
  if (!el) return
  el.classList.remove('open')
  setTimeout(() => el.remove(), 300)
}

// Copyright (c) 2026 zoop. See LICENSE.

const FILES = {
  'clear-day': 'clear-day.svg',
  'clear-night': 'clear-night.svg',
  cloudy: 'cloudy.svg',
  fog: 'fog.svg',
  'partly-day': 'partly-cloudy-day.svg',
  'partly-night': 'partly-cloudy-night.svg',
  rain: 'rain.svg',
  drizzle: 'drizzle.svg',
  snow: 'snow.svg',
  storm: 'thunderstorms-day.svg',
}

export function weatherIcon(key) {
  const file = FILES[key] ?? 'cloudy.svg'
  return `<img class="wicon wicon-${key}" src="/wicons/${file}" alt="" />`
}

// Copyright (c) 2026 zoop. See LICENSE.

const WMO = {
  0: { icon: 'clear', label: 'Clear sky' },
  1: { icon: 'clear', label: 'Mostly clear' },
  2: { icon: 'partly', label: 'Partly cloudy' },
  3: { icon: 'cloudy', label: 'Overcast' },
  45: { icon: 'fog', label: 'Foggy' },
  48: { icon: 'fog', label: 'Rime fog' },
  51: { icon: 'drizzle', label: 'Light drizzle' },
  53: { icon: 'drizzle', label: 'Drizzle' },
  55: { icon: 'drizzle', label: 'Dense drizzle' },
  56: { icon: 'drizzle', label: 'Freezing drizzle' },
  57: { icon: 'drizzle', label: 'Freezing drizzle' },
  61: { icon: 'rain', label: 'Light rain' },
  63: { icon: 'rain', label: 'Rain' },
  65: { icon: 'rain', label: 'Heavy rain' },
  66: { icon: 'rain', label: 'Freezing rain' },
  67: { icon: 'rain', label: 'Freezing rain' },
  71: { icon: 'snow', label: 'Light snow' },
  73: { icon: 'snow', label: 'Snow' },
  75: { icon: 'snow', label: 'Heavy snow' },
  77: { icon: 'snow', label: 'Snow grains' },
  80: { icon: 'rain', label: 'Rain showers' },
  81: { icon: 'rain', label: 'Rain showers' },
  82: { icon: 'rain', label: 'Violent showers' },
  85: { icon: 'snow', label: 'Snow showers' },
  86: { icon: 'snow', label: 'Snow showers' },
  95: { icon: 'storm', label: 'Thunderstorm' },
  96: { icon: 'storm', label: 'Thunderstorm + hail' },
  99: { icon: 'storm', label: 'Thunderstorm + hail' },
}

export function describe(code, isDay = 1) {
  const entry = WMO[code] ?? { icon: 'cloudy', label: 'Unknown' }
  let icon = entry.icon
  if (icon === 'clear') icon = isDay ? 'clear-day' : 'clear-night'
  if (icon === 'partly') icon = isDay ? 'partly-day' : 'partly-night'
  return { icon, label: entry.label }
}

export const THEMES = {
  'clear-day': ['#1c6fd0 0%, #3f9bea 45%, #fdbc4c 130%', '#fdbc4c'],
  'clear-night': ['#0a0f1c 0%, #141c2c 60%, #233044 100%', '#cfd9ec'],
  'partly-day': ['#1c6fd0 0%, #4a96d6 55%, #00a5d9 130%', '#ffdd9e'],
  'partly-night': ['#0a0f1c 0%, #1a2334 55%, #222d43 100%', '#cfd9ec'],
  cloudy: ['#5b6f86 0%, #9dafc1 100%', '#eef3f8'],
  fog: ['#5c6878 0%, #a3aec2 100%', '#eef1f6'],
  drizzle: ['#1f4068 0%, #4297e7 100%', '#bfe3ff'],
  rain: ['#142c4d 0%, #264e8f 55%, #4297e7 130%', '#8ec9ff'],
  snow: ['#1a5b92 0%, #68baff 60%, #d9eeff 130%', '#ffffff'],
  storm: ['#1a1228 0%, #231739 55%, #b296bd 140%', '#caa8ff'],
}

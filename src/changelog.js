export const APP_VERSION = '0.1.2'

export const CHANGELOG = [
  {
    version: '0.1.2',
    date: '2026-07-01',
    items: [
      'locations menu slides in from the side now instead of fading in',
      'swapped a bunch of custom buttons/lists for real m3 components',
      'storm icon doesnt pulse anymore, was too much',
      'warns you if youre on desktop, this thing is built for phones',
      'smaller/faster build (proper minification)',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-07-01',
    items: [
      'fixed the icon, it was rendering as just a black square lol',
      'added this changelog popup thing',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-07-01',
    items: [
      'search any city, no api key nonsense',
      'save multiple cities and switch between them',
      'daily + hourly forecasts, with tabs for conditions / air quality / wind',
      'detail cards for uv, wind, humidity, feels like, precip, pressure, visibility, air quality, sun',
      'background actually animates based on the weather',
      'app only loads once you install it, not before',
      'works offline once you have loaded it once',
    ],
  },
]

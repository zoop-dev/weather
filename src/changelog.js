export const APP_VERSION = '0.1.13'

export const CHANGELOG = [
  {
    version: '0.1.13',
    date: '2026-07-03',
    items: ['no visible changes — changelog popup now uses the shared zoop-kit system instead of its own local copy'],
  },
  {
    version: '0.1.12',
    date: '2026-07-03',
    items: ['migrating old deps to a new central system'],
  },
  {
    version: '0.1.11',
    date: '2026-07-03',
    items: ['"other apps by me" now opens the zoop apps directory page instead of linking straight to taskly'],
  },
  {
    version: '0.1.10',
    date: '2026-07-02',
    items: [
      'added a share button in settings (opens the real android share sheet)',
      'added "other apps by me" in settings, linking to taskly',
    ],
  },
  {
    version: '0.1.9',
    date: '2026-07-01',
    items: [
      'tapping a day in the 7-day forecast now opens a full day overview — every metric at once',
      'tap any metric card in the overview to drill into its full detail page',
      'fixed air quality, uv, and pressure detail pages showing temperature data instead of their own',
      'added real hourly humidity/pressure/uv data instead of just a current-moment snapshot',
      'detail pages now show supporting stats (max gust, aqi category, pressure trend, etc), not just a chart',
      'added missing "about the daily high/low" explainer to the temperature detail page',
    ],
  },
  {
    version: '0.1.8',
    date: '2026-07-01',
    items: [
      'no visible changes — internal migration to a shared design system (zoop-kit) used across the app-tool family',
    ],
  },
  {
    version: '0.1.7',
    date: '2026-07-01',
    items: [
      'android back gesture now closes menus/search/detail pages instead of exiting the app',
      'swiping between detail pages now actually shows the swipe instead of just switching',
      'fixed a race condition when jumping from locations straight into search',
    ],
  },
  {
    version: '0.1.6',
    date: '2026-07-01',
    items: [
      'renamed the app to weatherly',
      'onboarding + install screen now say its privacy-focused, no permissions needed',
      'changelog button in settings now shows full version history, not just whats new',
      'settings gear button is the same size as the add-location one now, and more purple',
      'fixed the "latest version" toast being hidden behind the settings dialog',
    ],
  },
  {
    version: '0.1.5',
    date: '2026-07-01',
    items: [
      'detail page edu text rewritten, plus reference scales for wind/aqi/uv/visibility',
      'humidity detail page now has separate blocks for humidity and dew point',
      'settings: refresh all locations at once',
      'settings: view source link, clear all data (with confirmation)',
      'sw cache version now bumps itself automatically on every build',
      'fixed a couple more missing fonts in settings/dialogs',
    ],
  },
  {
    version: '0.1.4',
    date: '2026-07-01',
    items: [
      'fixed "updated just now" always showing even when it wasnt just now',
      'pull to refresh has a proper dark background behind the spinner',
      'skeleton loading screen while a new location loads instead of a stale placeholder',
      'whats new popup version check is actually correct now',
    ],
  },
  {
    version: '0.1.3',
    date: '2026-07-01',
    items: [
      'you can delete saved locations now',
      'pull down to refresh the weather',
    ],
  },
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

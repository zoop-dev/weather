# Changelog

## 0.1.3 — 2026-07-01

- Delete saved locations from the Locations menu
- Pull-to-refresh on the weather screen

## 0.1.2 — 2026-07-01

- Locations menu slides in from the left instead of fading in
- Swapped several custom buttons/lists for real M3 components (list items, filled buttons)
- Removed the storm icon pulse animation (too distracting in forecast rows)
- Desktop usage warning banner (app is built for mobile)
- Production build now uses Terser for minification

## 0.1.1 — 2026-07-01

- Fixed broken PNG icon exports (were rendering as solid black)
- Added in-app changelog dialog

## 0.1.0 — 2026-07-01

Initial release.

- Search-based weather lookup (Open-Meteo, no API key)
- Multi-location support: save cities, switch between them
- Daily and hourly forecasts with Conditions / Air quality / Wind tabs
- Detail cards: UV index, wind, humidity, feels like, precipitation, pressure,
  visibility, air quality, sun position
- Animated condition-driven canvas background (rain, snow, clouds, sun, stars)
- Install gate: full app only loads once installed as a PWA
- Onboarding flow for first-time users
- Offline support via service worker
- M3 (Material 3) components and design tokens throughout

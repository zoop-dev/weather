# Changelog

## 0.1.6 — 2026-07-01

- Renamed the app to Weatherly
- Onboarding and install screens now mention it's privacy-focused with no permissions required
- Changelog button in Settings now shows the full version history, not just what's new
- Settings gear button matches the add-location button's size, recolored to purple
- Fixed the "you're on the latest version" toast being hidden behind the still-open Settings dialog

## 0.1.5 — 2026-07-01

- Rewrote detail page explainer text, added reference scales for wind (Beaufort), air quality, UV index, and visibility
- Humidity detail page now has separate "About relative humidity" and "About dew point" sections
- Settings: refresh all saved locations at once
- Settings: view source link, clear all data (with confirmation)
- Service worker cache version now bumps automatically on every build, tied to APP_VERSION
- Fixed a few more missing font declarations in dialogs

## 0.1.4 — 2026-07-01

- Fixed "Updated just now" showing even when data was old
- Pull-to-refresh spinner now has a proper dark background behind it
- Skeleton loading state while a new location's forecast loads
- Fixed changelog version-comparison logic (was naive string comparison)

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

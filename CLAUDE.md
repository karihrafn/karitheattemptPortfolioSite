# Kári the Attempt — Portfolio Site

## What this is
Static portfolio site for Kári the Attempt, an Icelandic singer-songwriter.
Hosted on GitHub Pages at `karitheattempt.com` (CNAME in repo root).

## Stack
- Plain HTML/CSS/JS — no build step, no frameworks
- `css/style.css` — all styles, CSS variables in `:root`
- `js/main.js` — nav toggle, custom cursor, now-playing indicator
- `js/solar.js` — solar system album tracker (canvas animation + audio playback)

## Backend (separate, on VPS)
- API: `https://api.karitheattempt.com/songs`
- Admin panel: `https://api.karitheattempt.com/admin`
- Node/Express + SQLite at `server/songs-api/`
- nginx config at `server/nginx/nginx.conf`
- Audio files served from `/data/audio` on VPS (not in this repo)
- Basic Auth on `/admin` and most API routes; `/upload` and `/audio` are public

## Key design decisions
- Fonts: Playfair Display (headings/nav) + Lora (body), loaded from Google Fonts
- Colors: CSS vars `--blue`, `--pink`, `--bg`, `--surface`, `--border`, `--text`, `--text-dim`
- Custom cursor (`.cursor` div) — hidden on touch devices via `@media (hover: none)`
- Cursor turns white (`.on-dark`) when over `.solar-section` (dark background)
- Audio: track players in `#music` + clickable planets in solar system must not play simultaneously
  - `window._stopPlanetAudio()` called from main.js when a track starts
  - `document.querySelectorAll('audio').forEach(a => a.pause())` in solar.js when planet starts

## Pages
- `index.html` — home: hero → solar system (#album) → music (#music) → photos (#gallery) → contact (#contact)
- `solar-system.html` — full-page solar system (same `solar.js`)
- `portfolio.html` — dev/design portfolio

## Audio files
- Stored in `assets/audio/` as MP3 (WAV originals removed — too large)
- Three EP tracks: track 1, 2, 3

## Preferences
- Ponytail mode is active (lazy/minimal — shortest working diff, no speculative abstractions)
- Don't commit `.claude/` directory

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Kári the Attempt — Portfolio Site

## What this is
Static portfolio site for Kári the Attempt, an Icelandic singer-songwriter.
Hosted on GitHub Pages at `karitheattempt.com` (CNAME in repo root).

## Development
No build step. Open `index.html` directly in a browser to preview the front-end.

For the songs-api locally:
```bash
cd server/songs-api
npm install
node index.js   # runs on port 3000
```

## Stack
- Plain HTML/CSS/JS — no build step, no frameworks
- `css/style.css` — all styles, CSS variables in `:root`
- `js/main.js` — nav toggle, custom cursor, now-playing indicator
- `js/solar.js` — solar system album tracker (canvas animation + audio playback)

## Backend (on VPS, `server/`)
Three services managed by `server/docker-compose.yml`:

| Service | What it does |
|---------|-------------|
| `songs-api` | Node/Express + SQLite (`better-sqlite3`), port 3000. Manages songs for the solar system. |
| `listmonk` | Fan newsletter, port 9000. Proxied at `newsletter.karitheattempt.com`. |
| `postgres` | Database for listmonk only. Password via `.env` → `POSTGRES_PASSWORD`. |
| `nginx` | Reverse proxy for both subdomains + SSL termination. |

- songs-api routes: `GET /songs` (public), `POST /songs`, `PUT /songs/:id`, `DELETE /songs/:id`, `POST /upload`, `GET /audio/*` — all mutating routes protected by nginx Basic Auth except `/upload` and `/audio`
- nginx config: `server/nginx/nginx.conf` — proxies `api.karitheattempt.com` → songs-api, `newsletter.karitheattempt.com` → listmonk
- SSL certs: Let's Encrypt via certbot, stored in `certbot-certs` Docker volume — obtained via `certbot/certbot` Docker image using the `certbot-www` volume as webroot
- Audio files: served from `/data/audio` on VPS (not in this repo)
- Admin UI: `https://api.karitheattempt.com/admin` (Basic Auth)
- Files live at `/opt/karitheattempt/` on the VPS (not a git repo — files were copied manually)

## VPS access
SSH is available: `ssh -i ~/.ssh/id_ed25519_vps root@<ip>`
- Docker Compose project is at `/opt/karitheattempt/`
- Useful commands: `docker compose -f /opt/karitheattempt/docker-compose.yml ps/logs/restart`
- `.env` file at `/opt/karitheattempt/.env` holds `POSTGRES_PASSWORD`

## What's deployed and configured on the VPS
- All four Docker services running (`songs-api`, `postgres`, `listmonk`, `nginx`)
- SSL certs issued for `api.karitheattempt.com` and `newsletter.karitheattempt.com`
- Listmonk v6.2.0 — admin account exists (username: `admin`)
- Listmonk SMTP: Brevo (`smtp-relay.brevo.com:587`), configured directly in the `settings` postgres table
- Listmonk "Fans" mailing list created (list ID: 3, double opt-in, public)
- Listmonk site name: "Kári the Attempt Newsletter", root URL: `https://newsletter.karitheattempt.com`
- **Note:** VPS nginx.conf is the source of truth — it's NOT synced from the git repo. Edit it directly on the server or copy manually.

## Key design decisions
- Fonts: Playfair Display (headings/nav) + Lora (body), loaded from Google Fonts
- Colors: CSS vars `--blue`, `--pink`, `--bg`, `--surface`, `--border`, `--text`, `--text-dim`
- Custom cursor (`.cursor` div) — hidden on touch devices via `@media (hover: none)`
- Cursor turns white (`.on-dark`) when over `.solar-section` (dark background)
- Audio: track players in `#music` + clickable planets in solar system must not play simultaneously
  - `window._stopPlanetAudio` = `stopAll` in solar.js, called from main.js when a track starts
  - `document.querySelectorAll('audio').forEach(a => a.pause())` in solar.js when planet starts
  - Planet audio uses immediate `.pause()` (no async fade-out) to avoid timer races
  - `stopAll()` always called first on every tap — clears state synchronously before starting new audio
  - 150ms `canvasLock` timestamp blocks iOS double-fire events on the canvas

## Pages
- `index.html` — home: hero → solar system (#album) → music (#music) → photos (#gallery) → contact (#contact)
- `solar-system.html` — full-page solar system (same `solar.js`)
- `portfolio.html` — dev/design portfolio

## Audio files
- Stored in `assets/audio/` as MP3 (WAV originals removed — too large)
- Three EP tracks referenced directly in `index.html` `<audio>` tags

## Mobile interaction notes
- Canvas uses `pointerup` (not `click` or `touchend`) — fires once for both touch and mouse
- `e.preventDefault()` on `pointerup` stops iOS generating a synthetic click after touch
- Planet stops orbiting while playing (`_tapState === 'playing'`) so user can tap it to stop
- Tooltip hidden on touch tap (`tooltip.style.display = 'none'` at top of touch path)
- Nav closes on outside tap via `document.addEventListener('click', ...)` guard

## Preferences
- Ponytail mode is active (lazy/minimal — shortest working diff, no speculative abstractions)
- Don't commit `.claude/` directory

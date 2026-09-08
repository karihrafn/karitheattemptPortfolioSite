# Kári the Attempt — site

Plain HTML/CSS/JS, no build step. Open `index.html` directly in a browser to preview.

## Structure

- `index.html` — home page: hero, music, photo gallery, contact
- `portfolio.html` — other projects
- `css/style.css` — all styling
- `js/main.js` — mobile nav + footer year
- `assets/images/` — photos (currently placeholder SVGs)
- `assets/audio/` — songs (currently empty, referenced as `track-1.mp3` etc.)

## Filling in your content

**Bio & name styling** — edit the hero text directly in `index.html`.

**Photos** — replace files in `assets/images/` (e.g. `portrait.svg` → `portrait.jpg`) and update the matching `src` in `index.html`. Any image size works; the CSS crops to a fixed aspect ratio.

**Music** — drop MP3 files into `assets/audio/` named `track-1.mp3`, `track-2.mp3`, `track-3.mp3` (or update the `src` paths in the `<audio>` tags), then update each track's title/description. Add more tracks by duplicating a `.track` block.

**Contact** — replace `your@email.com` (appears once, in the mailto link) with your real email, and update the Instagram/Spotify/YouTube/SoundCloud links in the socials list.

**Portfolio** — duplicate a `.project-card` block in `portfolio.html` for each project; replace the thumbnail placeholder text with an `<img>` if you have artwork for it.

## Deploying

Easiest free options, no server needed:

- **GitHub Pages** — push this folder to a GitHub repo, enable Pages in repo settings.
- **Netlify / Vercel** — drag-and-drop the folder onto their dashboard.

Both serve the site as-is since everything is static.

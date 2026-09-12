const API = 'https://api.karitheattempt.com/songs';

const STAGES = {
  idea:     { color: '#9ca3af', orbit: 70,  speed: 0.28, label: 'Idea' },
  demo:     { color: '#60a5fa', orbit: 130, speed: 0.20, label: 'Demo' },
  tracked:  { color: '#2dd4bf', orbit: 190, speed: 0.14, label: 'Tracked' },
  mixed:    { color: '#c084fc', orbit: 250, speed: 0.10, label: 'Mixed' },
  mastered: { color: '#fb923c', orbit: 310, speed: 0.07, label: 'Mastered' },
  released: { color: '#fbbf24', orbit: 360, speed: 0.05, label: 'Released' },
};

const canvas = document.getElementById('solar');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const cx = canvas.width / 2;
const cy = canvas.height / 2;

let planets = [];
let mouse = { x: -999, y: -999 };
let lastTime = 0;
let currentAudio = null;
let playingPlanet = null;
let fadeInTimer = null;
let fadeOutTimer = null;

function planetRadius(progress) {
  return 6 + (progress / 100) * 14;
}

function doFadeIn(audio, ms = 800) {
  if (fadeInTimer) { clearInterval(fadeInTimer); fadeInTimer = null; }
  audio.volume = 0;
  audio.play();
  const step = 40;
  fadeInTimer = setInterval(() => {
    audio.volume = Math.min(1, audio.volume + step / ms);
    if (audio.volume >= 1) { clearInterval(fadeInTimer); fadeInTimer = null; }
  }, step);
}

function doFadeOut(audio, ms = 500, done) {
  if (fadeInTimer) { clearInterval(fadeInTimer); fadeInTimer = null; }
  if (fadeOutTimer) { clearInterval(fadeOutTimer); fadeOutTimer = null; }
  const step = 40;
  fadeOutTimer = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - step / ms);
    if (audio.volume <= 0) {
      clearInterval(fadeOutTimer); fadeOutTimer = null;
      audio.pause();
      if (done) done();
    }
  }, step);
}

function drawStar(t) {
  const pulse = 1 + 0.06 * Math.sin(t * 0.002);
  ctx.save();
  ctx.shadowBlur = 40 * pulse;
  ctx.shadowColor = '#fef3c7';
  ctx.fillStyle = '#fef9ee';
  ctx.beginPath();
  ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 80 * pulse;
  ctx.shadowColor = '#fde68a';
  ctx.fillStyle = '#fffbf0';
  ctx.beginPath();
  ctx.arc(cx, cy, 7 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOrbits() {
  const seen = new Set(planets.map(p => p.orbit));
  seen.forEach(r => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawPlanets(t) {
  planets.forEach(p => {
    const x = cx + Math.cos(p.angle) * p.orbit;
    const y = cy + Math.sin(p.angle) * p.orbit;
    p._x = x;
    p._y = y;

    if (p === playingPlanet) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003);
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + 0.4 * pulse;
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.radius + 5 + 3 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

let hovered = null;

function checkHover() {
  const rect = canvas.getBoundingClientRect();
  const lx = (mouse.x - rect.left) * (canvas.width / rect.width);
  const ly = (mouse.y - rect.top) * (canvas.height / rect.height);

  const hit = planets.find(p => p._x !== undefined && Math.sqrt((p._x-lx)**2 + (p._y-ly)**2) < p.radius + 16);

  if (hit !== hovered) {
    if (hovered) hovered._paused = false;
    hovered = hit || null;
    if (hovered) hovered._paused = true;
  }

  if (hit) {
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <div class="tooltip-title">${hit.title}</div>
      <span class="tooltip-stage" style="background:${hit.color}22;color:${hit.color}">${STAGES[hit.stage].label}</span>
      <div class="tooltip-bar-bg"><div class="tooltip-bar-fill" style="width:${hit.progress}%;background:${hit.color}"></div></div>
      <div class="tooltip-progress">${hit.progress}%</div>
      ${hit === playingPlanet ? `<div class="tooltip-progress" style="color:#2dd4bf;margin-top:.4rem">◼ Playing — click to stop</div>` : (hit.audio_url ? `<div class="tooltip-progress" style="color:#60a5fa;margin-top:.4rem">▶ Click to play</div>` : '')}
    `;
    const pad = 8;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const left = Math.min(Math.max(mouse.x + 16, pad), window.innerWidth - tw - pad);
    const top = Math.min(Math.max(mouse.y - 10, pad), window.innerHeight - th - pad);
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  } else {
    tooltip.style.display = 'none';
  }
}

function frame(t) {
  const dt = t - lastTime;
  lastTime = t;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOrbits();
  drawStar(t);

  planets.forEach(p => {
    if (!p._paused) p.angle += p.speed * (dt / 1000);
  });

  drawPlanets(t);

  requestAnimationFrame(frame);
}

function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = Object.entries(STAGES).map(([key, s]) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${s.color}"></div>${s.label}</div>`
  ).join('');
}

async function init() {
  const songs = await fetch(API).then(r => r.json());

  if (!songs.length) {
    canvas.insertAdjacentHTML('afterend', '<div class="empty-state">No songs added yet.</div>');
    canvas.style.display = 'none';
    return;
  }

  const counts = {};
  const indices = {};
  songs.forEach(s => { counts[s.stage] = (counts[s.stage] || 0) + 1; });
  songs.forEach(s => { indices[s.stage] = (indices[s.stage] || 0); });

  planets = songs.map(s => {
    const stage = STAGES[s.stage] || STAGES.idea;
    const i = indices[s.stage]++;
    const total = counts[s.stage];
    return {
      ...stage,
      title: s.title,
      stage: s.stage,
      progress: s.progress,
      audio_url: s.audio_url || null,
      radius: planetRadius(s.progress),
      angle: (i / total) * Math.PI * 2,
      _x: 0, _y: 0,
    };
  });

  buildLegend();
  requestAnimationFrame(frame);
}

function onMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  checkHover();
}

canvas.addEventListener('pointermove', onMove);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
  if (hovered) { hovered._paused = false; hovered = null; }
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const lx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const ly = (e.clientY - rect.top) * (canvas.height / rect.height);
  const hit = planets.find(p => p._x !== undefined && Math.sqrt((p._x - lx) ** 2 + (p._y - ly) ** 2) < p.radius + 16);
  if (!hit) return;

  if (hit === playingPlanet || (currentAudio && currentAudio._src === hit.audio_url)) {
    const a = currentAudio;
    currentAudio = null;
    playingPlanet = null;
    if (a) doFadeOut(a, 500);
    return;
  }

  if (currentAudio) { const prev = currentAudio; currentAudio = null; doFadeOut(prev, 300); }
  playingPlanet = null;
  if (!hit.audio_url) return;

  document.querySelectorAll('audio').forEach(a => a.pause());

  const audio = new Audio(hit.audio_url);
  audio._src = hit.audio_url;
  currentAudio = audio;
  playingPlanet = hit;
  audio.addEventListener('ended', () => { if (currentAudio === audio) { playingPlanet = null; currentAudio = null; } });
  doFadeIn(audio, 800);
});

window._stopPlanetAudio = () => {
  if (currentAudio) { doFadeOut(currentAudio, 300); currentAudio = null; }
  playingPlanet = null;
};

init();

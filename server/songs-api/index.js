const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new Database('/data/songs.db');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'idea',
    progress INTEGER NOT NULL DEFAULT 0,
    audio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration for existing installs
try { db.exec('ALTER TABLE songs ADD COLUMN audio_url TEXT'); } catch {}

const audioDir = '/data/audio';
fs.mkdirSync(audioDir, { recursive: true });

const upload = multer({ dest: audioDir });
app.use('/audio', express.static(audioDir));

app.get('/songs', (req, res) => {
  const songs = db.prepare('SELECT * FROM songs ORDER BY created_at DESC').all();
  res.json(songs);
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  const ext = path.extname(req.file.originalname) || '.mp3';
  const dest = path.join(audioDir, req.file.filename + ext);
  fs.renameSync(req.file.path, dest);
  res.json({ url: `https://api.karitheattempt.com/audio/${req.file.filename}${ext}` });
});

app.post('/songs', (req, res) => {
  const { title, stage = 'idea', progress = 0, audio_url = null } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const result = db.prepare('INSERT INTO songs (title, stage, progress, audio_url) VALUES (?, ?, ?, ?)').run(title, stage, progress, audio_url);
  res.json({ id: result.lastInsertRowid, title, stage, progress, audio_url });
});

app.put('/songs/:id', (req, res) => {
  const { title, stage, progress, audio_url } = req.body;
  db.prepare('UPDATE songs SET title = COALESCE(?, title), stage = COALESCE(?, stage), progress = COALESCE(?, progress), audio_url = COALESCE(?, audio_url), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, stage, progress, audio_url, req.params.id);
  res.json({ ok: true });
});

app.delete('/songs/:id', (req, res) => {
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(3000, () => console.log('songs-api running on 3000'));

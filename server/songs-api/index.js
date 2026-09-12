const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get('/songs', (req, res) => {
  const songs = db.prepare('SELECT * FROM songs ORDER BY created_at DESC').all();
  res.json(songs);
});

app.post('/songs', (req, res) => {
  const { title, stage = 'idea', progress = 0 } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const result = db.prepare('INSERT INTO songs (title, stage, progress) VALUES (?, ?, ?)').run(title, stage, progress);
  res.json({ id: result.lastInsertRowid, title, stage, progress });
});

app.put('/songs/:id', (req, res) => {
  const { title, stage, progress } = req.body;
  db.prepare('UPDATE songs SET title = COALESCE(?, title), stage = COALESCE(?, stage), progress = COALESCE(?, progress), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, stage, progress, req.params.id);
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

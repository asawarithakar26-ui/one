const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Tasks table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      completed BOOLEAN DEFAULT 0
    )`);
  }
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // SQLite stores booleans as 0 or 1. Let's convert to boolean for the frontend
    const formattedRows = rows.map(row => ({
      ...row,
      completed: !!row.completed
    }));
    res.json(formattedRows);
  });
});

// POST a new task
app.post('/api/tasks', (req, res) => {
  const { text, time, priority } = req.body;
  
  if (!text || !time) {
    return res.status(400).json({ error: 'Text and time are required' });
  }

  const stmt = db.prepare('INSERT INTO tasks (text, time, priority, completed) VALUES (?, ?, ?, ?)');
  stmt.run([text, time, priority || 'Medium', 0], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      text,
      time,
      priority: priority || 'Medium',
      completed: false
    });
  });
  stmt.finalize();
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Task deleted', changes: this.changes });
  });
});

// PUT (update) a task
app.put('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { text, time, priority, completed } = req.body;
  
  db.run(
    'UPDATE tasks SET text = COALESCE(?, text), time = COALESCE(?, time), priority = COALESCE(?, priority), completed = COALESCE(?, completed) WHERE id = ?',
    [text, time, priority, completed !== undefined ? (completed ? 1 : 0) : null, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Task updated', changes: this.changes });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Cinematic Intelligence backend live at http://localhost:${port}`);
});

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

// Initialize database
const db = new sqlite3.Database('todos.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      priority TEXT DEFAULT 'low',
      isComplete INTEGER DEFAULT 0,
      isFun INTEGER
    )`);
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET all todos
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const todos = rows.map(row => ({
      ...row,
      isComplete: Boolean(row.isComplete),
      isFun: Boolean(row.isFun)
    }));
    res.json(todos);
  });
});

// POST new todo
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun = true } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  db.run(
    'INSERT INTO todos (name, priority, isFun) VALUES (?, ?, ?)',
    [name, priority, isFun ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        priority,
        isComplete: false,
        isFun
      });
    }
  );
});

// DELETE todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  db.run(
    'DELETE FROM todos WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Todo item not found' });
      }
      res.json({ message: `Todo item ${id} deleted.` });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.js
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 3004;

// Initialize SQLite database
const db = new sqlite3.Database("./.data/todos.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create todos table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  priority TEXT DEFAULT 'low',
  isComplete BOOLEAN DEFAULT 0,
  isFun BOOLEAN DEFAULT 1
)`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET /todos - Retrieve all todos
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Mapping the data to match the required format
      const todos = rows.map((row) => ({
        id: row.id,
        name: row.name,
        priority: row.priority,
        isComplete: Boolean(row.isComplete),
        isFun: Boolean(row.isFun),
      }));
      res.json(todos);
    }
  });
});

// POST /todos - Add a new todo
app.post("/todos", (req, res) => {
  const { name, priority = "low", isFun = true } = req.body;
  const stmt = db.prepare(
    "INSERT INTO todos (name, priority, isFun) VALUES (?, ?, ?)"
  );
  stmt.run(name, priority, isFun, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        id: this.lastID,
        name,
        priority,
        isComplete: false,
        isFun,
      });
    }
  });
});

// DELETE /todos/:id - Delete a todo by ID
app.delete("/todos/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
  stmt.run(req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Todo not found" });
    } else {
      res.status(200).json({ message: "Todo deleted" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

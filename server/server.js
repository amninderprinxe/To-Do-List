/**
 * TaskFlow — Express Backend (server.js)
 * REST API for the To-Do Task Manager
 *
 * Endpoints:
 *   GET    /tasks        → Fetch all tasks
 *   POST   /tasks        → Add new task
 *   PUT    /tasks/:id    → Update task status
 *   DELETE /tasks/:id    → Delete task
 */

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
const path    = require('path');

const app  = express();
const PORT = 3000;

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());                           // Enable CORS for all origins
app.use(express.json());                   // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../public'))); // Serve frontend files

/* ==============================
   DATABASE CONNECTION POOL
   ⚙️  Update these credentials to match your MySQL setup
============================== */
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',          // ← your MySQL username
  password: 'Amninder$2026',              // ← your MySQL password (leave '' if none)
  database: 'todo_app',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:          0
});

/* ==============================
   TEST DB CONNECTION ON STARTUP
============================== */
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database: todo_app');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure MySQL is running and credentials in server.js are correct.');
    process.exit(1);
  }
})();

/* ==============================
   ROUTES
============================== */

/**
 * GET /tasks
 * Returns all tasks, newest first
 */
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /tasks error:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * POST /tasks
 * Body: { task_name: string }
 * Creates a new task with status = 'pending'
 */
app.post('/tasks', async (req, res) => {
  const { task_name } = req.body;

  // Basic validation
  if (!task_name || typeof task_name !== 'string' || task_name.trim() === '') {
    return res.status(400).json({ error: 'task_name is required and must be a non-empty string' });
  }

  const name = task_name.trim().substring(0, 255);

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (task_name, status) VALUES (?, ?)',
      [name, 'pending']
    );

    // Fetch the newly created task to return it
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /tasks error:', err.message);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

/**
 * PUT /tasks/:id
 * Body: { status: 'pending' | 'completed' }
 * Updates the status of a task
 */
app.put('/tasks/:id', async (req, res) => {
  const id     = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ error: "status must be 'pending' or 'completed'" });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(`PUT /tasks/${id} error:`, err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /tasks/:id
 * Permanently removes a task from the database
 */
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (err) {
    console.error(`DELETE /tasks/${id} error:`, err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/* ==============================
   CATCH-ALL → serve index.html
============================== */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow server running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});

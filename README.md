# ⬡ TaskFlow — Full-Stack To-Do App

A clean, modern To-Do Task Manager built with **HTML/CSS/Vanilla JS** on the frontend and **Node.js + Express + MySQL** on the backend.

---

## 📁 Project Structure

```
todo-app/
├── public/                 ← Frontend files (served by Express)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   └── server.js           ← Node.js + Express backend
├── package.json
├── database_setup.sql      ← Run this in MySQL first
└── README.md
```

---

## ✅ Prerequisites

Before starting, make sure you have:

| Tool      | Minimum Version | Download Link                          |
|-----------|-----------------|----------------------------------------|
| Node.js   | v16+            | https://nodejs.org/                    |
| MySQL     | v5.7 or v8+     | https://dev.mysql.com/downloads/mysql/ |
| npm       | (comes with Node) | —                                    |

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js

1. Go to https://nodejs.org/ and download the **LTS** version.
2. Run the installer and follow the on-screen instructions.
3. Verify installation by opening a terminal and running:

```bash
node --version    # should print v16.x.x or higher
npm --version     # should print a version number
```

---

### Step 2 — Set Up MySQL Database

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or the terminal):

```bash
mysql -u root -p
```

2. Copy and paste the contents of **`database_setup.sql`** and run it.

   Or run the file directly:
```bash
mysql -u root -p < database_setup.sql
```

3. This will:
   - Create a database called `todo_app`
   - Create the `tasks` table with the correct columns
   - Insert 4 sample tasks

---

### Step 3 — Configure Database Credentials

Open `server/server.js` and find this block (around line 35):

```js
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',      // ← change to your MySQL username
  password: '',          // ← change to your MySQL password
  database: 'todo_app',
  ...
});
```

Update `user` and `password` to match your MySQL credentials.

---

### Step 4 — Install Node.js Dependencies

Open a terminal in the `todo-app/` folder and run:

```bash
npm install
```

This installs:
- **express** — web framework
- **mysql2** — MySQL driver for Node.js
- **cors** — Cross-Origin Resource Sharing middleware
- **nodemon** — auto-restart server on file changes (dev only)

---

### Step 5 — Start the Server

```bash
npm start
```

You should see:

```
✅ Connected to MySQL database: todo_app
🚀 TaskFlow server running at http://localhost:3000
```

---

### Step 6 — Open the App

Open your browser and go to:

```
http://localhost:3000
```

That's it! 🎉

---

## 🔌 REST API Reference

| Method | Endpoint        | Body                      | Description          |
|--------|-----------------|---------------------------|----------------------|
| GET    | `/tasks`        | —                         | Fetch all tasks      |
| POST   | `/tasks`        | `{ "task_name": "..." }`  | Add a new task       |
| PUT    | `/tasks/:id`    | `{ "status": "completed"}`| Update task status   |
| DELETE | `/tasks/:id`    | —                         | Delete a task        |

### Example API Usage (using curl)

```bash
# Get all tasks
curl http://localhost:3000/tasks

# Add a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"task_name": "Finish the project"}'

# Mark task as complete (replace 1 with real task id)
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete a task (replace 1 with real task id)
curl -X DELETE http://localhost:3000/tasks/1
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  task_name   VARCHAR(255) NOT NULL,
  status      ENUM('pending', 'completed') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Development Mode (auto-restart)

If you want the server to automatically restart when you edit files:

```bash
npm run dev
```

This uses **nodemon** to watch for file changes.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot connect to MySQL` | Make sure MySQL service is running. Check username/password in server.js. |
| `Port 3000 already in use` | Change `const PORT = 3000` in server.js to a different port (e.g., 3001), and update `API_BASE` in script.js to match. |
| `npm: command not found` | Node.js is not installed properly. Re-install from https://nodejs.org/ |
| Tasks not loading | Open browser DevTools (F12) → Console tab to see error messages. |
| `Access denied for user` | Your MySQL password is wrong. Update it in server.js. |

---

## 🎨 Features

- ✅ Add tasks with Enter key or button click
- ✅ Mark tasks as completed
- ✅ Delete tasks
- ✅ Filter by All / Pending / Completed
- ✅ Live progress bar and statistics
- ✅ Toast notifications
- ✅ Responsive design (mobile-friendly)
- ✅ Animated UI with smooth transitions
- ✅ XSS-safe HTML rendering

---

## 📦 Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES2020+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2 driver
- **Fonts**: Syne + DM Sans (Google Fonts)

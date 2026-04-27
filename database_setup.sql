-- ============================================================
--  TaskFlow — MySQL Setup Script
--  Run this in your MySQL client BEFORE starting the server
-- ============================================================

-- 1. Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS todo_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Use the database
USE todo_app;

-- 3. Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id          INT           NOT NULL AUTO_INCREMENT,
  task_name   VARCHAR(255)  NOT NULL,
  status      ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. (Optional) Insert some sample tasks to test with
INSERT INTO tasks (task_name, status) VALUES
  ('Buy groceries',          'pending'),
  ('Read a book for 30 mins','pending'),
  ('Review project proposal','completed'),
  ('Call the bank',          'pending');

-- Done! Your database is ready.
SELECT 'Database and table created successfully!' AS message;

/**
 * TaskFlow — Frontend JavaScript
 * Communicates with the Express backend via fetch() API
 */

const API_BASE = 'http://localhost:3000'; // Change port if needed

let allTasks = [];        // local cache of all tasks
let currentFilter = 'all';

/* ==============================
   INIT
============================== */
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();

  // Allow pressing Enter to add a task
  document.getElementById('task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

/* ==============================
   FETCH ALL TASKS  (GET /tasks)
============================== */
async function fetchTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '<div class="spinner">Loading tasks…</div>';

  try {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Server error');
    allTasks = await res.json();
    renderTasks();
    updateStats();
  } catch (err) {
    list.innerHTML = '';
    showToast('⚠️ Could not connect to server. Is it running?', 'error');
    console.error(err);
  }
}

/* ==============================
   ADD TASK  (POST /tasks)
============================== */
async function addTask() {
  const input = document.getElementById('task-input');
  const addBtn = document.getElementById('add-btn');
  const taskName = input.value.trim();

  if (!taskName) {
    showToast('Please enter a task name.', 'error');
    input.focus();
    return;
  }

  addBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_name: taskName })
    });

    if (!res.ok) throw new Error('Failed to add task');

    const newTask = await res.json();
    allTasks.unshift(newTask); // add to top of local cache
    input.value = '';
    renderTasks();
    updateStats();
    showToast('✓ Task added!', 'success');
  } catch (err) {
    showToast('⚠️ Failed to add task.', 'error');
    console.error(err);
  } finally {
    addBtn.disabled = false;
  }
}

/* ==============================
   MARK COMPLETE  (PUT /tasks/:id)
============================== */
async function markComplete(id, btn) {
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });

    if (!res.ok) throw new Error('Failed to update task');

    // Update local cache
    const task = allTasks.find(t => t.id === id);
    if (task) task.status = 'completed';

    renderTasks();
    updateStats();
    showToast('🎉 Task marked as complete!', 'success');
  } catch (err) {
    showToast('⚠️ Failed to update task.', 'error');
    console.error(err);
    btn.disabled = false;
  }
}

/* ==============================
   DELETE TASK  (DELETE /tasks/:id)
============================== */
async function deleteTask(id, itemEl) {
  // Animate out
  itemEl.style.opacity = '0';
  itemEl.style.transform = 'translateX(20px)';
  itemEl.style.transition = 'opacity 0.25s, transform 0.25s';

  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');

    // Remove from local cache
    allTasks = allTasks.filter(t => t.id !== id);

    setTimeout(() => {
      renderTasks();
      updateStats();
    }, 250);

    showToast('🗑️ Task deleted.', 'info');
  } catch (err) {
    // Revert animation if failed
    itemEl.style.opacity = '1';
    itemEl.style.transform = 'translateX(0)';
    showToast('⚠️ Failed to delete task.', 'error');
    console.error(err);
  }
}

/* ==============================
   RENDER TASKS
============================== */
function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');

  // Apply filter
  let filtered = allTasks;
  if (currentFilter === 'pending')   filtered = allTasks.filter(t => t.status === 'pending');
  if (currentFilter === 'completed') filtered = allTasks.filter(t => t.status === 'completed');

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = filtered.map(task => createTaskHTML(task)).join('');
}

/* ==============================
   CREATE TASK HTML
============================== */
function createTaskHTML(task) {
  const isDone = task.status === 'completed';
  const date = new Date(task.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const completeBtn = isDone
    ? `<button class="btn-action btn-complete" disabled title="Already completed">✓ Done</button>`
    : `<button class="btn-action btn-complete" onclick="markCompleteById(${task.id})" title="Mark as complete">✓ Complete</button>`;

  return `
    <div class="task-item ${isDone ? 'completed' : ''}" id="task-${task.id}">
      <div class="task-status-dot"></div>
      <div class="task-info">
        <div class="task-name" title="${escapeHtml(task.task_name)}">${escapeHtml(task.task_name)}</div>
        <div class="task-meta">
          <span class="task-badge ${isDone ? 'badge-completed' : 'badge-pending'}">
            ${isDone ? 'Completed' : 'Pending'}
          </span>
          <span class="task-date">${date}</span>
        </div>
      </div>
      <div class="task-actions">
        ${completeBtn}
        <button class="btn-action btn-delete" onclick="deleteTaskById(${task.id})" title="Delete task">✕ Delete</button>
      </div>
    </div>
  `;
}

/* ==============================
   CONVENIENCE WRAPPERS
   (so onclick attrs don't need DOM ref)
============================== */
function markCompleteById(id) {
  const btn = document.querySelector(`#task-${id} .btn-complete`);
  markComplete(id, btn);
}

function deleteTaskById(id) {
  const itemEl = document.getElementById(`task-${id}`);
  deleteTask(id, itemEl);
}

/* ==============================
   UPDATE STATS
============================== */
function updateStats() {
  const total   = allTasks.length;
  const done    = allTasks.filter(t => t.status === 'completed').length;
  const pending = total - done;
  const pct     = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
}

/* ==============================
   FILTER
============================== */
function setFilter(btn, filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

/* ==============================
   TOAST NOTIFICATION
============================== */
let toastTimer;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ==============================
   UTILITY — XSS PREVENTION
============================== */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

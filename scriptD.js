// scriptD.js — To-Do list logic

// _______________________________state_____________________________ 

(function () {

  let tasks = JSON.parse(localStorage.getItem('sd-tasks') || '[]');

  function saveTasks() {
    localStorage.setItem('sd-tasks', JSON.stringify(tasks));
  }

  // _______________________________add task_____________________________ 

  function addTask() {
    const input    = document.getElementById('task-input');
    const priority = document.getElementById('task-priority');
    const due      = document.getElementById('task-due');
    const subject  = document.getElementById('task-subject');
    const notes    = document.getElementById('task-notes');

    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    tasks.unshift({
      id:        Date.now(),
      text:      text,
      priority:  priority.value,
      due:       due.value       || '',
      subject:   subject.value.trim() || '',
      notes:     notes.value.trim()   || '',
      done:      false,
      createdAt: Date.now(),
    });

    input.value   = '';
    due.value     = '';
    subject.value = '';
    notes.value   = '';
    priority.value = 'medium';

    saveTasks();
    updateSubjectFilter();
    render();
  }

  // _______________________________toggle done_____________________________ 

  function toggleTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (task) { task.done = !task.done; }
    saveTasks();
    render();
  }

  // _______________________________delete task_____________________________ 

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    updateSubjectFilter();
    render();
  }

  // _______________________________clear done_____________________________ 

  function clearDone() {
    tasks = tasks.filter(function (t) { return !t.done; });
    saveTasks();
    updateSubjectFilter();
    render();
  }

  // _______________________________filter + sort_____________________________ 

  function getFiltered() {
    const status   = document.getElementById('filter-status').value;
    const priority = document.getElementById('filter-priority').value;
    const subject  = document.getElementById('filter-subject').value;
    const sortBy   = document.getElementById('sort-by').value;

    let list = tasks.slice();

    // filter
    if (status === 'active') { list = list.filter(function (t) { return !t.done; }); }
    if (status === 'done')   { list = list.filter(function (t) { return t.done;  }); }
    if (priority !== 'all')  { list = list.filter(function (t) { return t.priority === priority; }); }
    if (subject  !== 'all')  { list = list.filter(function (t) { return t.subject === subject;  }); }

    // sort
    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
    if (sortBy === 'newest')   { list.sort(function (a, b) { return b.createdAt - a.createdAt; }); }
    if (sortBy === 'oldest')   { list.sort(function (a, b) { return a.createdAt - b.createdAt; }); }
    if (sortBy === 'priority') { list.sort(function (a, b) { return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; }); }
    if (sortBy === 'due') {
      list.sort(function (a, b) {
        if (!a.due && !b.due) { return 0; }
        if (!a.due) { return 1; }
        if (!b.due) { return -1; }
        return new Date(a.due) - new Date(b.due);
      });
    }

    return list;
  }

  // _______________________________subject filter options_____________________________ 

  function updateSubjectFilter() {
    const sel = document.getElementById('filter-subject');
    if (!sel) { return; }
    const subjects = [...new Set(tasks.map(function (t) { return t.subject; }).filter(Boolean))];
    const current  = sel.value;
    sel.innerHTML  = '<option value="all">All subjects</option>';
    subjects.forEach(function (s) {
      const opt = document.createElement('option');
      opt.value       = s;
      opt.textContent = s;
      if (s === current) { opt.selected = true; }
      sel.appendChild(opt);
    });
  }

  // _______________________________helpers_____________________________ 

  function formatDate(dateStr) {
    if (!dateStr) { return ''; }
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short'
    });
  }

  function isOverdue(dateStr) {
    if (!dateStr) { return false; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(dateStr + 'T00:00:00') < today;
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // _______________________________render_____________________________ 

  function render() {
    const list     = document.getElementById('task-list');
    if (!list) { return; }
    const filtered = getFiltered();

    // empty state
    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">🎉</div><p>No tasks here!</p></div>';
    } else {
      list.innerHTML = filtered.map(function (t) {

        const overdue  = !t.done && isOverdue(t.due);
        const dueLbl   = t.due
          ? '<span class="task-due ' + (overdue ? 'overdue' : '') + '">'
            + (overdue ? '⚠️ ' : '📅 ') + formatDate(t.due) + '</span>'
          : '';
        const tagLbl   = t.subject
          ? '<span class="task-tag">' + escHtml(t.subject) + '</span>'
          : '';
        const notesLbl = t.notes
          ? '<div class="task-notes-text">' + escHtml(t.notes) + '</div>'
          : '';

        return '<div class="task-item ' + (t.done ? 'done' : '') + '">'
          + '<div class="task-check ' + (t.done ? 'checked' : '') + '" data-id="' + t.id + '"></div>'
          + '<div class="task-body">'
          + '<div class="task-text">' + escHtml(t.text) + '</div>'
          + notesLbl
          + '<div class="task-meta">'
          + '<div class="priority-dot ' + t.priority + '"></div>'
          + '<span style="font-size:0.75rem;font-weight:700;color:var(--text2);">' + t.priority + '</span>'
          + tagLbl
          + dueLbl
          + '</div>'
          + '</div>'
          + '<button class="task-delete" data-id="' + t.id + '">✕</button>'
          + '</div>';

      }).join('');

      // attach events
      list.querySelectorAll('.task-check').forEach(function (el) {
        el.addEventListener('click', function () { toggleTask(parseInt(el.dataset.id)); });
      });
      list.querySelectorAll('.task-delete').forEach(function (el) {
        el.addEventListener('click', function () { deleteTask(parseInt(el.dataset.id)); });
      });
    }

    // _______________________________update stats_____________________________ 

    const total  = tasks.length;
    const done   = tasks.filter(function (t) { return t.done; }).length;
    const active = total - done;
    const high   = tasks.filter(function (t) { return t.priority === 'high' && !t.done; }).length;
    const pct    = total === 0 ? 0 : Math.round((done / total) * 100);

    const totalEl  = document.getElementById('stat-total');
    const activeEl = document.getElementById('stat-active');
    const doneEl   = document.getElementById('stat-done');
    const highEl   = document.getElementById('stat-high');
    const pctEl    = document.getElementById('stat-pct');
    const barEl    = document.getElementById('stat-bar');

    if (totalEl)  { totalEl.textContent  = total;  }
    if (activeEl) { activeEl.textContent = active; }
    if (doneEl)   { doneEl.textContent   = done;   }
    if (highEl)   { highEl.textContent   = high;   }
    if (pctEl)    { pctEl.textContent    = pct + '%'; }
    if (barEl)    { barEl.style.width    = pct + '%'; }
  }

  // _______________________________init_____________________________ 

  document.addEventListener('DOMContentLoaded', function () {

    // add task
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) { addBtn.addEventListener('click', addTask); }

    // enter key
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { addTask(); }
      });
    }

    // clear done
    const clearBtn = document.getElementById('clearDoneBtn');
    if (clearBtn) { clearBtn.addEventListener('click', clearDone); }

    // filter + sort changes
    ['filter-status', 'filter-priority', 'filter-subject', 'sort-by'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('change', render); }
    });

    updateSubjectFilter();
    render();

  });

})();
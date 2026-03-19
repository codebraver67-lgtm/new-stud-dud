// scriptF.js — Stopwatch logic

// _______________________________state_____________________________ 

(function () {

  let startTime   = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let isRunning   = false;
  let sessions    = JSON.parse(localStorage.getItem('sd-sessions') || '[]');

  // _______________________________elements_____________________________ 

  function el(id) { return document.getElementById(id); }

  // _______________________________format time_____________________________ 

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const hrs  = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return String(hrs).padStart(2, '0') + ':'
      + String(mins).padStart(2, '0') + ':'
      + String(secs).padStart(2, '0');
  }

  function formatMs(ms) {
    return '.' + String(ms % 1000).padStart(3, '0');
  }

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const hrs  = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0)  { return hrs + 'h ' + mins + 'm'; }
    if (mins > 0) { return mins + 'm ' + secs + 's'; }
    return secs + 's';
  }

  // _______________________________update display_____________________________ 

  function updateDisplay() {
    const now     = isRunning ? elapsedTime + (Date.now() - startTime) : elapsedTime;
    const dispEl  = el('swDisplay');
    const msEl    = el('swMs');
    if (dispEl) { dispEl.textContent = formatTime(now); }
    if (msEl)   { msEl.textContent   = formatMs(now);   }
  }

  // _______________________________start / stop_____________________________ 

  function toggleStartStop() {
    const startBtn = el('swStartBtn');
    const resetBtn = el('swResetBtn');
    const saveBtn  = el('swSaveBtn');
    const dispEl   = el('swDisplay');

    if (!isRunning) {
      // start
      startTime = Date.now();
      isRunning = true;
      timerInterval = setInterval(updateDisplay, 50);
      if (startBtn) { startBtn.textContent = '⏸ Pause'; startBtn.classList.add('running'); }
      if (dispEl)   { dispEl.classList.add('running'); }
      if (resetBtn) { resetBtn.disabled = false; }
      if (saveBtn)  { saveBtn.disabled  = false; }
    } else {
      // pause
      elapsedTime += Date.now() - startTime;
      isRunning = false;
      clearInterval(timerInterval);
      if (startBtn) { startBtn.textContent = '▶ Resume'; startBtn.classList.remove('running'); }
      if (dispEl)   { dispEl.classList.remove('running'); }
    }
  }

  // _______________________________reset_____________________________ 

  function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;

    const startBtn = el('swStartBtn');
    const resetBtn = el('swResetBtn');
    const saveBtn  = el('swSaveBtn');
    const dispEl   = el('swDisplay');
    const msEl     = el('swMs');

    if (startBtn) { startBtn.textContent = '▶ Start'; startBtn.classList.remove('running'); }
    if (dispEl)   { dispEl.textContent = '00:00:00'; dispEl.classList.remove('running'); }
    if (msEl)     { msEl.textContent   = '.000'; }
    if (resetBtn) { resetBtn.disabled  = true; }
    if (saveBtn)  { saveBtn.disabled   = true; }
  }

  // _______________________________save session_____________________________ 

  function saveSession() {
    if (elapsedTime === 0 && !isRunning) { return; }

    // pause first if running
    if (isRunning) { toggleStartStop(); }

    const subject = (el('sw-subject') ? el('sw-subject').value.trim() : '') || 'Study Session';
    const now     = new Date();

    sessions.unshift({
      id:       Date.now(),
      subject:  subject,
      duration: elapsedTime,
      date:     now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time:     now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });

    localStorage.setItem('sd-sessions', JSON.stringify(sessions));

    // clear subject input
    if (el('sw-subject')) { el('sw-subject').value = ''; }

    resetTimer();
    renderHistory();
    renderStats();
  }

  // _______________________________clear history_____________________________ 

  function clearHistory() {
    sessions = [];
    localStorage.setItem('sd-sessions', JSON.stringify(sessions));
    renderHistory();
    renderStats();
  }

  // _______________________________render history_____________________________ 

  function renderHistory() {
    const list = el('swHistory');
    if (!list) { return; }

    if (sessions.length === 0) {
      list.innerHTML = '<p class="sw-history-empty">No sessions saved yet.</p>';
      return;
    }

    list.innerHTML = sessions.map(function (s) {
      return '<div class="sw-session-item">'
        + '<div class="sw-session-icon">⏱️</div>'
        + '<div class="sw-session-body">'
        + '<div class="sw-session-subject">' + s.subject + '</div>'
        + '<div class="sw-session-meta">' + s.date + ' at ' + s.time + '</div>'
        + '</div>'
        + '<div class="sw-session-time">' + formatDuration(s.duration) + '</div>'
        + '</div>';
    }).join('');
  }

  // _______________________________render stats_____________________________ 

  function renderStats() {
    const sessionsEl  = el('stat-sessions');
    const totalTimeEl = el('stat-total-time');
    if (!sessionsEl || !totalTimeEl) { return; }

    // today only
    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const todaySessions = sessions.filter(function (s) { return s.date === todayStr; });
    const totalMs       = todaySessions.reduce(function (sum, s) { return sum + s.duration; }, 0);

    sessionsEl.textContent  = todaySessions.length;
    totalTimeEl.textContent = formatDuration(totalMs) || '0m';
  }

  // _______________________________init_____________________________ 

  document.addEventListener('DOMContentLoaded', function () {

    const startBtn = el('swStartBtn');
    const resetBtn = el('swResetBtn');
    const saveBtn  = el('swSaveBtn');
    const clearBtn = el('swClearBtn');

    if (startBtn) { startBtn.addEventListener('click', toggleStartStop); }
    if (resetBtn) { resetBtn.addEventListener('click', resetTimer);      }
    if (saveBtn)  { saveBtn.addEventListener('click',  saveSession);     }
    if (clearBtn) { clearBtn.addEventListener('click', clearHistory);    }

    renderHistory();
    renderStats();

  });

})();
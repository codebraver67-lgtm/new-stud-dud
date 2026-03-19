// scriptG.js — Countdown timer logic

// _______________________________state_____________________________ 

(function () {

  let totalSeconds  = 0;
  let remainSeconds = 0;
  let timerInterval = null;
  let isRunning     = false;
  let isPaused      = false;
  let history       = JSON.parse(localStorage.getItem('sd-countdowns') || '[]');

  // _______________________________elements_____________________________ 

  function el(id) { return document.getElementById(id); }

  // _______________________________pad number_____________________________ 

  function pad(n) { return String(n).padStart(2, '0'); }

  // _______________________________update display_____________________________ 

  function updateDisplay(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (el('cdHours'))   { el('cdHours').textContent   = pad(h); }
    if (el('cdMinutes')) { el('cdMinutes').textContent = pad(m); }
    if (el('cdSeconds')) { el('cdSeconds').textContent = pad(s); }

    // progress bar
    const pct = totalSeconds > 0 ? (remainSeconds / totalSeconds) * 100 : 100;
    if (el('cdProgressFill')) { el('cdProgressFill').style.width = pct + '%'; }
  }

  // _______________________________get input seconds_____________________________ 

  function getInputSeconds() {
    const h = parseInt(el('cd-hours').value)   || 0;
    const m = parseInt(el('cd-minutes').value) || 0;
    const s = parseInt(el('cd-seconds').value) || 0;
    return (h * 3600) + (m * 60) + s;
  }

  // _______________________________start / pause_____________________________ 

  function startPause() {
    const startBtn = el('cdStartBtn');
    const resetBtn = el('cdResetBtn');
    const card     = el('cdDisplayCard');

    if (!isRunning && !isPaused) {
      // fresh start
      totalSeconds  = getInputSeconds();
      remainSeconds = totalSeconds;

      if (totalSeconds === 0) { return; }

      // set session label
      const labelVal = el('cd-label-input') ? el('cd-label-input').value.trim() : '';
      if (el('cdSessionLabel')) {
        el('cdSessionLabel').textContent = labelVal || '⏳ Countdown';
      }

      updateDisplay(remainSeconds);
      if (card) { card.classList.remove('done'); card.classList.add('running'); }
      if (el('cdDoneMsg')) { el('cdDoneMsg').style.display = 'none'; }

      isRunning = true;
      isPaused  = false;
      if (startBtn) { startBtn.textContent = '⏸ Pause'; startBtn.classList.remove('paused'); }
      if (resetBtn) { resetBtn.disabled = false; }

      timerInterval = setInterval(tick, 1000);

    } else if (isRunning && !isPaused) {
      // pause
      clearInterval(timerInterval);
      isRunning = false;
      isPaused  = true;
      if (startBtn) { startBtn.textContent = '▶ Resume'; startBtn.classList.add('paused'); }

    } else if (!isRunning && isPaused) {
      // resume
      isRunning = true;
      isPaused  = false;
      if (startBtn) { startBtn.textContent = '⏸ Pause'; startBtn.classList.remove('paused'); }
      timerInterval = setInterval(tick, 1000);
    }
  }

  // _______________________________tick_____________________________ 

  function tick() {
    if (remainSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      isPaused  = false;
      onDone();
      return;
    }
    remainSeconds--;
    updateDisplay(remainSeconds);
  }

  // _______________________________done_____________________________ 

  function onDone() {
    const card     = el('cdDisplayCard');
    const startBtn = el('cdStartBtn');

    if (card)     { card.classList.remove('running'); card.classList.add('done'); }
    if (startBtn) { startBtn.textContent = '▶ Start'; startBtn.classList.remove('paused'); }

    // save to history
    const labelVal = el('cdSessionLabel') ? el('cdSessionLabel').textContent : 'Countdown';
    const now      = new Date();

    history.unshift({
      id:      Date.now(),
      label:   labelVal,
      seconds: totalSeconds,
      date:    now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    });

    localStorage.setItem('sd-countdowns', JSON.stringify(history));
    renderHistory();

    isRunning     = false;
    isPaused      = false;
    totalSeconds  = 0;
    remainSeconds = 0;
  }

  // _______________________________reset_____________________________ 

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning     = false;
    isPaused      = false;
    remainSeconds = 0;
    totalSeconds  = 0;

    const startBtn = el('cdStartBtn');
    const resetBtn = el('cdResetBtn');
    const card     = el('cdDisplayCard');

    if (startBtn) { startBtn.textContent = '▶ Start'; startBtn.classList.remove('paused'); resetBtn.disabled = true; }
    if (card)     { card.classList.remove('running', 'done'); }
    if (el('cdDoneMsg')) { el('cdDoneMsg').style.display = 'none'; }
    if (el('cdSessionLabel')) { el('cdSessionLabel').textContent = ''; }

    updateDisplay(0);
    if (el('cdProgressFill')) { el('cdProgressFill').style.width = '100%'; }
  }

  // _______________________________load from history item_____________________________ 

  function loadFromHistory(item) {
    const h = Math.floor(item.seconds / 3600);
    const m = Math.floor((item.seconds % 3600) / 60);
    const s = item.seconds % 60;

    if (el('cd-hours'))   { el('cd-hours').value   = h; }
    if (el('cd-minutes')) { el('cd-minutes').value = m; }
    if (el('cd-seconds')) { el('cd-seconds').value = s; }

    // strip emoji from label
    const cleanLabel = item.label.replace('⏳ ', '');
    if (el('cd-label-input')) { el('cd-label-input').value = cleanLabel; }

    // scroll to setup
    const setup = document.querySelector('.cd-setup-card');
    if (setup) { setup.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

    resetTimer();
  }

  // _______________________________format seconds_____________________________ 

  function formatSecs(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) { return h + 'h ' + m + 'm'; }
    if (m > 0) { return m + 'm ' + s + 's'; }
    return s + 's';
  }

  // _______________________________render history_____________________________ 

  function renderHistory() {
    const list = el('cdHistory');
    if (!list) { return; }

    if (history.length === 0) {
      list.innerHTML = '<p class="cd-history-empty">No recent timers yet.</p>';
      return;
    }

    let html = '<div class="cd-history-grid">';
    history.forEach(function (item) {
      html += '<div class="cd-history-item" data-id="' + item.id + '">'
        + '<div class="cd-history-item-label">' + item.label + '</div>'
        + '<div class="cd-history-item-time">' + formatSecs(item.seconds) + '</div>'
        + '<div class="cd-history-item-date">' + item.date + '</div>'
        + '</div>';
    });
    html += '</div>';
    list.innerHTML = html;

    // click to reload
    list.querySelectorAll('.cd-history-item').forEach(function (card) {
      card.addEventListener('click', function () {
        const id   = parseInt(card.dataset.id);
        const item = history.find(function (h) { return h.id === id; });
        if (item) { loadFromHistory(item); }
      });
    });
  }

  // _______________________________init_____________________________ 

  document.addEventListener('DOMContentLoaded', function () {

    // start / pause button
    const startBtn = el('cdStartBtn');
    const resetBtn = el('cdResetBtn');
    const clearBtn = el('cdClearBtn');

    if (startBtn) { startBtn.addEventListener('click', startPause); }
    if (resetBtn) { resetBtn.addEventListener('click', resetTimer); }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        history = [];
        localStorage.setItem('sd-countdowns', JSON.stringify(history));
        renderHistory();
      });
    }

    // preset buttons
    document.querySelectorAll('.cd-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (el('cd-hours'))   { el('cd-hours').value   = btn.dataset.h; }
        if (el('cd-minutes')) { el('cd-minutes').value = btn.dataset.m; }
        if (el('cd-seconds')) { el('cd-seconds').value = btn.dataset.s; }
        resetTimer();
      });
    });

    // clamp inputs on change
    ['cd-hours', 'cd-minutes', 'cd-seconds'].forEach(function (id) {
      const inp = el(id);
      if (!inp) { return; }
      inp.addEventListener('change', function () {
        let val = parseInt(inp.value) || 0;
        const max = id === 'cd-hours' ? 23 : 59;
        if (val < 0)   { val = 0; }
        if (val > max) { val = max; }
        inp.value = val;
      });
    });

    updateDisplay(0);
    renderHistory();

  });

})();